import { useState } from "react";
import { useApp } from "../context/AppContext";
import { AlertTriangle, Camera } from "lucide-react";
import AuthorityModal from "./AuthorityModal";
import styles from "./EmergencyModal.module.css";

export default function EmergencyModal() {
  const { emergency, dismissEmergency } = useApp();
  const [showRespond, setShowRespond] = useState(false);
  if (!emergency) return null;

  const { user, time, date, lat, lng, snapshotUrl } = emergency;
  const hasLocation = lat !== null && lng !== null;

  return (
    <div className={styles.overlay} role="alertdialog" aria-modal="true" aria-label="Emergency alert">
      <div className={styles.modal}>
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
      </div>
      {showRespond && (
        <AuthorityModal
          mode="emergency"
          emergency={emergency}
          onClose={() => { setShowRespond(false); dismissEmergency(); }}
        />
      )}
    </div>
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
