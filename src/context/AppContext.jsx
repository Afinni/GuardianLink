import { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { collection, addDoc, onSnapshot, query as fsQuery, where, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { ref, onValue, update, set, push, remove, query as dbQuery, orderByChild, equalTo } from "firebase/database";
import { toast } from "sonner";
import { auth, db, rtdb } from "../firebase";

const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [caregiver, setCaregiver]           = useState(null);
  const [authLoading, setAuthLoading]       = useState(true);
  const [users, setUsers]                   = useState([]);
  const [emergency, setEmergency]           = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [alerts, setAlerts]                 = useState([]);
  const [systemStatus, setSystemStatus]     = useState(null);
  const [waypoints, setWaypoints]           = useState({});
  const waypointsRef = useRef({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fu) => {
      if (fu) {
        const raw  = fu.displayName || fu.email.split("@")[0];
        const name = raw.charAt(0).toUpperCase() + raw.slice(1);
        setCaregiver({
          uid: fu.uid, email: fu.email, name,
          initials: name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
        });
      } else {
        setCaregiver(null); setUsers([]); setSelectedUserId(null); setAlerts([]);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!caregiver) return;
    const usersRef = ref(rtdb, "Users");
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loaded = Object.keys(data)
          .filter(key => data[key].caregiverId === caregiver.uid)
          .map(key => ({ id: key, ...data[key] }));
        setUsers(loaded);
        if (loaded.length > 0 && !selectedUserId) setSelectedUserId(loaded[0].id);
      } else {
        setUsers([]);
      }
    }, (error) => {
      console.error("Error fetching users:", error);
    });
    return unsubscribe;
  }, [caregiver]);

  // Listen for SOS — includes snapshotUrl from hardware
  useEffect(() => {
    if (!caregiver) return;
    const q = fsQuery(
      collection(db, "emergencies"),
      where("caregiverId", "==", caregiver.uid),
      where("acknowledged", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const docs = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
        docs.sort((a, b) => {
          const ta = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp || 0).getTime();
          const tb = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp || 0).getTime();
          return tb - ta;
        });
        const data = docs[0];

        const user = users.find(u => u.id === data.userId);
        // Extract image URL from either property and handle string "null" or "None"
        let imgUrl = data.snapshotUrl || data.photoUrl || null;
        if (imgUrl === "null" || imgUrl === "None") imgUrl = null;
        
        setEmergency({
          docId: data.docId, user: user || { firstName: "Unknown", lastName: "", deviceId: "—", area: "—" },
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          lat: data.lat ?? null, lng: data.lng ?? null,
          snapshotUrl: imgUrl, // camera snapshot from hardware
        });
      } else {
        setEmergency(null);
      }
    });
    return unsub;
  }, [caregiver, users]);

  // Listen for alerts from Realtime Database
  const lastAlertIdRef = useRef(null);
  
  useEffect(() => {
    if (!caregiver || !selectedUserId) {
      setAlerts([]);
      return;
    }
    
    // Subscribe to alerts specific to the selected user
    const alertsRef = ref(rtdb, "Alerts");
    let isInitialLoad = true;
    
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const alertsList = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          // Strictly filter for selected user
          .filter(a => !a.cleared && (a.userId === selectedUserId || a.user === selectedUserId))
          .sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeB - timeA; // Newest first
          });
        setAlerts(alertsList);

        const newest = alertsList[0];
        // Only toast if it's a new alert we haven't toasted for this session, and it's not the initial load dump
        if (newest && !newest.responded && !newest.cleared) {
          if (!isInitialLoad && newest.id !== lastAlertIdRef.current) {
            toast(`User pressed the emergency button`, {
              description: `Alert for ${newest.userName || newest.user || "Unknown user"}`,
            });
            lastAlertIdRef.current = newest.id;
          } else if (isInitialLoad) {
            // Track the newest ID on initial load so we don't toast it later if it hasn't changed
            lastAlertIdRef.current = newest.id;
          }
        }
      } else {
        setAlerts([]);
      }
      isInitialLoad = false;
    });

    return () => unsubscribe();
  }, [caregiver, selectedUserId]);

  // Listen for SystemStatus from Realtime Database
  useEffect(() => {
    const statusRef = ref(rtdb, "SystemStatus");
    
    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setSystemStatus(snapshot.val());
      } else {
        setSystemStatus(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Background LiveLocation Tracker for Waypoints
  useEffect(() => {
    if (!caregiver) return;
    const globalRef = ref(rtdb, "LiveLocation");
    const unsubscribe = onValue(globalRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let newWaypoints = { ...waypointsRef.current };
        
        Object.keys(data).forEach(key => {
          if (typeof data[key] === 'object' && data[key].latitude) {
            const id = key;
            const pt = [data[key].latitude, data[key].longitude];
            if (!newWaypoints[id]) newWaypoints[id] = [];
            const last = newWaypoints[id][newWaypoints[id].length - 1];
            if (!last || last[0] !== pt[0] || last[1] !== pt[1]) {
              newWaypoints[id] = [...newWaypoints[id], pt];
            }
          }
        });
        
        if (data.latitude) {
          const pt = [data.latitude, data.longitude];
          users.forEach(u => {
            if (!newWaypoints[u.id]) newWaypoints[u.id] = [];
            const last = newWaypoints[u.id][newWaypoints[u.id].length - 1];
            if (!last || last[0] !== pt[0] || last[1] !== pt[1]) {
              newWaypoints[u.id] = [...newWaypoints[u.id], pt];
            }
          });
        }
        
        waypointsRef.current = newWaypoints;
        setWaypoints(newWaypoints);
      }
    });
    return () => unsubscribe();
  }, [caregiver, users]);

  async function respondToAlert(alertId, authorityName, authorityEmail, message, photoUrl, lat, lng) {
    try {
      const alertRef = ref(rtdb, `Alerts/${alertId}`);
      await update(alertRef, {
        responded: true,
        respondedAt: new Date().toISOString(),
        respondedBy: caregiver?.uid,
        authorityName,
        authorityEmail,
        message,
      });
      return { success: true };
    } catch (error) {
      console.error("Error responding to alert:", error);
      return { success: false, message: "Failed to respond to alert" };
    }
  }

  async function clearAlert(alertId, isUndo = false) {
    // Optimistic update
    setAlerts(prev => prev.filter(a => a.id !== alertId)); // Or we re-fetch via onValue soon, but this is instant.
    if (isUndo) {
      // If we undo, it will just come back naturally via onValue when db updates
    }
    
    try {
      const alertRef = ref(rtdb, `Alerts/${alertId}`);
      await update(alertRef, {
        cleared: !isUndo,
        clearedAt: isUndo ? null : new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error clearing alert:", error);
      return { success: false, message: "Failed to clear alert" };
    }
  }

  async function signUp(fullName, email, password) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: fullName });
      // Refresh caregiver state with display name
      const name = fullName.charAt(0).toUpperCase() + fullName.slice(1);
      setCaregiver({
        uid: cred.user.uid, email: cred.user.email, name,
        initials: name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
      });
      return { success: true };
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": "An account with this email already exists. Please sign in.",
        "auth/invalid-email":        "Please enter a valid email address.",
        "auth/weak-password":        "Password must be at least 6 characters.",
      };
      return { success: false, message: msgs[err.code] || "Sign up failed. Please try again." };
    }
  }

  async function signIn(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      const msgs = {
        "auth/user-not-found":     "No account found with this email.",
        "auth/wrong-password":     "Incorrect password. Please try again.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/invalid-email":      "Please enter a valid email address.",
        "auth/too-many-requests":  "Too many attempts. Please wait and try again.",
      };
      return { success: false, message: msgs[err.code] || "Sign in failed. Please try again." };
    }
  }

  async function signOut() {
    await fbSignOut(auth);
    setEmergency(null); setUsers([]); setSelectedUserId(null); setAlerts([]);
  }

  async function addUser(data) {
    if (!caregiver) return { success: false, message: "Not signed in." };
    if (users.length >= 3) return { success: false, message: "Maximum of 3 users reached." };
    
    try {
      const newUserRef = push(ref(rtdb, "Users"));
      await set(newUserRef, {
        ...data,
        caregiverId: caregiver.uid,
        online: false,
        lat: null,
        lng: null,
        area: data.address,
        lastUpdate: "Just added",
        createdAt: new Date().toISOString(),
      });
      
      console.log("User added successfully with ID:", newUserRef.key);
      return { success: true };
    } catch (error) {
      console.error("Error adding user:", error);
      
      const messages = {
        "permission-denied": "You don't have permission to add users. Check your Realtime Database rules.",
        "network-error": "Network error. Check your connection.",
        "unavailable": "Service temporarily unavailable. Please try again.",
      };
      return { 
        success: false, 
        message: messages[error.code] || `Failed to save: ${error.message}`
      };
    }
  }

  async function removeUser(userId) {
    if (!caregiver) return { success: false, message: "Not signed in." };
    try {
      await remove(ref(rtdb, `Users/${userId}`));
      if (selectedUserId === userId) {
        setSelectedUserId(null);
      }
      return { success: true };
    } catch (error) {
      console.error("Error removing user:", error);
      return { success: false, message: "Failed to remove user. Please try again." };
    }
  }

  // Manual SOS test trigger (also accepts optional snapshotUrl)
  function triggerEmergency(userId, snapshotUrl = null) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    setEmergency({
      docId: null, user,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      lat: user.lat ?? null, lng: user.lng ?? null,
      snapshotUrl,
    });
  }

  function dismissEmergency() { setEmergency(null); }

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0] || null;

  return (
    <Ctx.Provider value={{
      caregiver, authLoading, signUp, signIn, signOut,
      users, addUser,
      emergency, triggerEmergency, dismissEmergency,
      selectedUserId, setSelectedUserId, selectedUser,
      alerts, respondToAlert, clearAlert, systemStatus,
      removeUser, waypoints
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => useContext(Ctx);
