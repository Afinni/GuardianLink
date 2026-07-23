import { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion } from "framer-motion";
import styles from "./AuthorityModal.module.css";

/**
 * AuthorityModal — unified modal for reporting to an authority.
 *
 * Props:
 *   mode        "emergency" | "alert"
 *   emergency   (mode="emergency") the emergency object from AppContext
 *   alert       (mode="alert")     the alert object from the Alerts list
 *   onClose     callback to close the modal
 */
export default function AuthorityModal({ mode, emergency, alert, onClose }) {
  const { respondToAlert, dismissEmergency } = useApp();

  const [authorityName,  setAuthorityName]  = useState("");
  const [authorityEmail, setAuthorityEmail] = useState("");
  const [message,        setMessage]        = useState("");
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [success,        setSuccess]        = useState(false);

  // ── Derive display data from whichever source is active ──────────────────
  const isEmergency = mode === "emergency";

  const displayUser     = isEmergency ? emergency?.user     : null;
  const displayLat      = isEmergency ? emergency?.lat      : alert?.latitude;
  const displayLng      = isEmergency ? emergency?.lng      : alert?.longitude;
  const displayArea     = isEmergency ? emergency?.user?.area : null;
  const displayPhoto    = isEmergency ? emergency?.snapshotUrl : alert?.photoUrl;
  const displayTime     = isEmergency
    ? `${emergency?.time} · ${emergency?.date}`
    : new Date(alert?.timestamp).toLocaleString("en-GB", {
        hour: "2-digit", minute: "2-digit",
        day: "numeric", month: "short", year: "numeric",
      });

  // ── Submit handler ────────────────────────────────────────────────────────
  async function handleSend(e) {
    e.preventDefault();
    setError("");

    if (!authorityName.trim() || !authorityEmail.trim()) {
      setError("Please fill in authority name and email.");
      return;
    }

    setLoading(true);
    try {
      if (isEmergency) {
        await sendEmergencyEmail();
      } else {
        const result = await respondToAlert(
          alert.id, authorityName, authorityEmail, message,
          alert?.photoUrl, alert?.latitude, alert?.longitude
        );
        if (!result.success) {
          setError(result.message || "Failed to respond to alert.");
          setLoading(false);
          return;
        }
      }

      setSuccess(true);
      setTimeout(() => {
        if (isEmergency) dismissEmergency();
        onClose();
      }, 1800);
    } catch (err) {
      console.error("AuthorityModal send error:", err);
      setError("Failed to send. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── EmailJS integration (emergency mode) ─────────────────────────────────
  async function sendEmergencyEmail() {
    const serviceId  = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const publicKey  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      // EmailJS not configured yet — log and continue so Firebase is still updated
      console.warn(
        "EmailJS is not configured. Add REACT_APP_EMAILJS_SERVICE_ID, " +
        "REACT_APP_EMAILJS_TEMPLATE_ID and REACT_APP_EMAILJS_PUBLIC_KEY to your .env file."
      );
      return;
    }

    const { default: emailjs } = await import("@emailjs/browser");

    await emailjs.send(
      serviceId,
      templateId,
      {
        to_name:      authorityName,
        to_email:     authorityEmail,
        user_name:    displayUser ? `${displayUser.firstName} ${displayUser.lastName}` : "Unknown",
        device_id:    displayUser?.deviceId ?? "—",
        location:     displayLat && displayLng ? `${displayLat}°N, ${displayLng}°E` : "Unknown",
        area:         displayArea ?? "—",
        time:         displayTime,
        message:      message || "No additional details provided.",
        snapshot_url: displayPhoto ?? "No image",
      },
      publicKey
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={styles.overlay} 
      role="alertdialog" 
      aria-modal="true"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={{ type: "spring", bounce: 0, duration: 0.2 }}
        className={styles.modal}
      >
        <h2 className={styles.title}>
          {isEmergency ? "Report to Authority" : "Respond to Alert"}
        </h2>
        <p className={styles.sub}>
          {isEmergency
            ? "Send emergency details to the appropriate authority"
            : "Send alert details to the appropriate authority"}
        </p>

        {/* Photo snapshot (if available) */}
        {displayPhoto && (
          <div className={styles.snapshot}>
            <img src={displayPhoto} alt="Snapshot" className={styles.snapImg} />
            <span className={styles.snapBadge}>{displayTime}</span>
          </div>
        )}

        <form onSubmit={handleSend} className={styles.form}>
          {/* Context info box */}
          <div className={styles.infoBox}>
            {isEmergency && displayUser && (
              <InfoRow label="User"
                value={`${displayUser.firstName} ${displayUser.lastName}`} />
            )}
            <InfoRow label="Location"
              value={displayLat && displayLng
                ? `${displayLat}°N, ${displayLng}°E`
                : "N/A"} />
            {isEmergency && displayArea && (
              <InfoRow label="Area" value={displayArea} />
            )}
            <InfoRow label="Time" value={displayTime} />
          </div>

          {/* Authority fields */}
          <div className={styles.field}>
            <label className={styles.label}>Authority Name</label>
            <input
              type="text"
              placeholder="e.g. Police Station, Fire Department"
              value={authorityName}
              onChange={(e) => setAuthorityName(e.target.value)}
              disabled={loading || success}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Authority Email</label>
            <input
              type="email"
              placeholder="authority@example.com"
              value={authorityEmail}
              onChange={(e) => setAuthorityEmail(e.target.value)}
              disabled={loading || success}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Additional Message</label>
            <textarea
              placeholder="Any additional details…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              disabled={loading || success}
            />
          </div>

          {error   && <div className={styles.error}>{error}</div>}
          {success && (
            <div className={styles.success}>
              {isEmergency ? "Report sent successfully!" : "Alert marked as responded!"}
            </div>
          )}

          <div className={styles.actions}>
            <button type="submit" className={styles.btnSend}
              disabled={loading || success}>
              {loading && <span className={styles.spinner} />}
              {loading ? "Sending…" : success ? "Sent!" : "Send Report"}
            </button>
            <button type="button" className={styles.btnCancel}
              onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.label}>{label}:</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
