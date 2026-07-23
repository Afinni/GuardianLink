import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { rtdb } from "../firebase";
import { MapPin, Satellite, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import styles from "./MapView.module.css";

const createIcon = () => {
  const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="var(--b500)" stroke="white" stroke-width="2"/>
    <circle cx="12" cy="12" r="4" fill="white"/>
  </svg>`;
  
  return L.divIcon({
    html: svg,
    className: styles.customMarker,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

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

  return (
    <div className={styles.wrap}>
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={styles.mapContainer}
        >
          {loading ? (
            <div className={styles.statusText}>
              Loading live location...
            </div>
          ) : currentLocation ? (
            <MapContainer 
              center={[currentLocation.latitude, currentLocation.longitude]} 
              zoom={15} 
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker 
                position={[currentLocation.latitude, currentLocation.longitude]}
                icon={createIcon()}
              >
                <Popup>
                  <div>
                    <strong>Selected User Location</strong><br/>
                    Lat: {currentLocation.latitude.toFixed(6)}<br/>
                    Lng: {currentLocation.longitude.toFixed(6)}
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className={styles.statusText}>
              No GPS data — connect a device
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className={styles.badge}>
        <span className={styles.dot} /> GPS Live
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={styles.refreshBtn}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
        {currentLocation && (
          <button
            onClick={() => window.location.href = '/tracker'}
            className={styles.refreshBtn}
            style={{ backgroundColor: 'var(--b700)' }}
          >
            Open Tracker
          </button>
        )}
        {lastUpdate && (
          <span className={styles.timeText}>
            {lastUpdate}
          </span>
        )}
      </div>
    </div>
  );
}
