import { useState } from "react";
import { useApp } from "../context/AppContext";
import { AlertTriangle, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthorityModal from "./AuthorityModal";
import styles from "./EmergencyModal.module.css";

export default function EmergencyModal() {
  const { emergency, dismissEmergency } = useApp();
  const [showRespond, setShowRespond] = useState(false);
  
  const user = emergency?.user;
  const time = emergency?.time;
  const date = emergency?.date;
  const lat = emergency?.lat;
  const lng = emergency?.lng;
  const snapshotUrl = emergency?.snapshotUrl;
  
  const hasLocation = lat !== undefined && lat !== null && lng !== null;

  return (
    <AnimatePresence>
      {emergency && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={styles.overlay} 
          role="alertdialog" 
          aria-modal="true" 
          aria-label="Emergency alert"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0, duration: 0.2 }}
            className={styles.modal}
          >
            {/* Header */}
        <div className={styles.header}>
          <div className={styles.pulse}><AlertTriangle size={24} strokeWidth={2} color="var(--r500)" /></div>
          <div>
            <h2 className={styles.title}>Emergency Alert</h2>
            <p className={styles.sub}>SOS triggered from smart stick</p>
          </div>
        </div>

        {/* Camera snapshot — only shown if hardware sends one */}
        <div className={styles.snapshot}>
          {snapshotUrl ? (
            <img src={snapshotUrl} alt="Camera snapshot at time of alert" className={styles.snapImg} />
          ) : (
            <div className={styles.snapPlaceholder}>
              <Camera size={28} strokeWidth={1.5} color="var(--n500)" />
              <span>Snapshot captured at time of alert</span>
              <span className={styles.snapNote}>No image received from device</span>
            </div>
          )}
          <div className={styles.snapBadge}>{time} · {date}</div>
        </div>

        {/* Details */}
        <div className={styles.detail}>
          <Row label="User"   value={`${user.firstName} ${user.lastName}`} />
          <Row label="Device" value={user.deviceId} />
          {hasLocation ? (
            <Row label="Location" value={`${lat}°N, ${lng}°E`} highlight />
          ) : (
            <Row label="Location" value="Fetching GPS…" />
          )}
          <Row label="Area" value={user.area || "—"} />
        </div>

        {/* Live location indicator */}
        {hasLocation && (
          <div className={styles.liveLocation}>
            <span className={styles.liveDot} />
            <span>Live GPS: <strong>{lat}°N, {lng}°E</strong> — updates in real time</span>
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.btnAck} onClick={() => setShowRespond(true)}>Acknowledge & Respond</button>
          <button className={styles.btnDismiss} onClick={dismissEmergency}>Dismiss</button>
        </div>
        </motion.div>
        
        <AnimatePresence>
          {showRespond && (
            <AuthorityModal
              mode="emergency"
              emergency={emergency}
              onClose={() => { setShowRespond(false); dismissEmergency(); }}
            />
          )}
        </AnimatePresence>
      </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={`${styles.rowValue} ${highlight ? styles.highlight : ""}`}>{value}</span>
    </div>
  );
}
