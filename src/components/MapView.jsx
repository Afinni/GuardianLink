import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { rtdb } from "../firebase";
import { MapPin, Satellite, ExternalLink } from "lucide-react";
import styles from "./MapView.module.css";

export default function MapView({ users, selectedId }) {
  const [liveLocations, setLiveLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch live location data from Firebase Realtime Database
  const fetchLocation = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      // Try to fetch specific user's location first
      const specificRef = ref(rtdb, `LiveLocation/${selectedId}`);
      const specificSnap = await get(specificRef);
      
      let data = null;
      if (specificSnap.exists()) {
        data = specificSnap.val();
      } else {
        // Fallback to global LiveLocation in case schema is flat
        const globalRef = ref(rtdb, "LiveLocation");
        const globalSnap = await get(globalRef);
        if (globalSnap.exists()) {
          const globalData = globalSnap.val();
          if (globalData[selectedId]) {
            data = globalData[selectedId];
          } else if (globalData.latitude !== undefined) {
            data = globalData; // Flat schema
          }
        }
      }

      if (data) {
        setLiveLocations([{
          id: selectedId,
          latitude: data.latitude,
          longitude: data.longitude,
          satellites_locked: data.satellites_locked,
          last_updated: data.last_updated,
        }]);
        setLastUpdate(new Date().toLocaleTimeString());
      } else {
        setLiveLocations([]);
      }
    } catch (error) {
      console.error("Error fetching live location:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, [selectedId]);

  const handleRefresh = () => {
    fetchLocation();
  };

  const currentLocation = liveLocations[0];
  const googleMapsUrl = currentLocation
    ? `https://www.google.com/maps/?q=${currentLocation.latitude},${currentLocation.longitude}`
    : null;

  return (
    <div className={styles.wrap}>
      <div style={{
        width: "100%",
        height: "220px",
        borderRadius: "14px",
        overflow: "hidden",
        backgroundColor: "#EFF6FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "20px",
        boxSizing: "border-box",
        fontFamily: "Sora, sans-serif",
      }}>
        {loading ? (
          <div style={{ color: "#60A5FA", fontSize: "14px" }}>
            Loading live location...
          </div>
        ) : currentLocation ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "var(--b700)",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}>
              <MapPin size={20} strokeWidth={2} /> Current Location
            </div>
            <div style={{
              fontSize: "13px",
              color: "var(--b500)",
              marginBottom: "8px",
              fontFamily: "var(--font-mono)",
            }}>
              <div>Latitude: {currentLocation.latitude.toFixed(6)}</div>
              <div>Longitude: {currentLocation.longitude.toFixed(6)}</div>
              {currentLocation.satellites_locked && (
                <div style={{ marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Satellite size={14} strokeWidth={1.75} /> Satellites: {currentLocation.satellites_locked}
                </div>
              )}
            </div>
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "12px",
                  padding: "8px 16px",
                  backgroundColor: "#3B82F6",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "var(--b700)"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "var(--b600)"}
              >
                Open in Google Maps <ExternalLink size={12} strokeWidth={2} style={{marginLeft: 4, verticalAlign: 'middle'}} />
              </a>
            )}
          </div>
        ) : (
          <div style={{ color: "#60A5FA", fontSize: "14px" }}>
            No GPS data — connect a device
          </div>
        )}
      </div>

      <div className={styles.badge}>
        <span className={styles.dot} /> GPS Live
        {liveLocations.length > 0 && (
          <span style={{ fontSize: "10px", marginLeft: "8px", opacity: 0.7 }}>
            {liveLocations.length} location{liveLocations.length !== 1 ? "s" : ""}
          </span>
        )}
        <button
          onClick={handleRefresh}
          disabled={loading}
          style={{
            marginLeft: "12px",
            padding: "4px 8px",
            fontSize: "11px",
            backgroundColor: loading ? "#BFDBFE" : "#3B82F6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            transition: "all 0.2s ease",
          }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
        {lastUpdate && (
          <span style={{ fontSize: "9px", marginLeft: "8px", opacity: 0.6 }}>
            {lastUpdate}
          </span>
        )}
      </div>
    </div>
  );
}
