import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Inbox, Camera, MapPin, Satellite, ArrowRight, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import AuthorityModal from "../components/AuthorityModal";
import { toast } from "sonner";
import styles from "./Alerts.module.css";

export default function Alerts() {
  const { alerts, clearAlert } = useApp();
  const [showRespond, setShowRespond] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, responded, pending

  const filteredAlerts = alerts.filter((alert) => {
    if (filterStatus === "responded") return alert.responded === true;
    if (filterStatus === "pending") return alert.responded !== true;
    return true;
  });

  const handleAlertClick = (alert) => {
    if (!alert.responded) {
      setSelectedAlert(alert);
      setShowRespond(true);
    }
  };

  const handleCloseRespond = () => {
    setShowRespond(false);
    setSelectedAlert(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <Navbar />

        {/* Page Header */}
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.welcomeTitle}>Alert History</h1>
            <p className={styles.welcomeSub}>View and respond to all alerts</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className={styles.filterBar}>
          <FilterButton
            label="All"
            active={filterStatus === "all"}
            count={alerts.length}
            onClick={() => setFilterStatus("all")}
          />
          <FilterButton
            label="Pending"
            active={filterStatus === "pending"}
            count={alerts.filter((a) => a.responded !== true).length}
            onClick={() => setFilterStatus("pending")}
          />
          <FilterButton
            label="Responded"
            active={filterStatus === "responded"}
            count={alerts.filter((a) => a.responded === true).length}
            onClick={() => setFilterStatus("responded")}
          />
        </div>

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><Inbox size={32} strokeWidth={1.5} color="var(--n400)" /></div>
            <p className={styles.emptyTitle}>
              {filterStatus === "all" ? "No alerts yet" : `No ${filterStatus} alerts`}
            </p>
            <p className={styles.emptySub}>
              {filterStatus === "all"
                ? "Alert logs will appear here when triggered."
                : filterStatus === "pending"
                ? "All alerts have been responded to."
                : "No pending alerts at this time."}
            </p>
          </div>
        ) : (
          <motion.div layout className={styles.alertList}>
            <AnimatePresence initial={false}>
              {filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onClick={() => handleAlertClick(alert)}
                  isResponded={alert.responded === true}
                  onClear={(e) => {
                    e.stopPropagation();
                    clearAlert(alert.id);
                    toast("Alert cleared", {
                      description: `Alert #${alert.id.slice(0, 8)} removed from view.`,
                      action: {
                        label: "Undo",
                        onClick: () => clearAlert(alert.id, true),
                      },
                    });
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      
      <AnimatePresence>
        {showRespond && selectedAlert && (
          <AuthorityModal
            mode="alert"
            alert={selectedAlert}
            onClose={handleCloseRespond}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterButton({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${styles.filterBtn} ${active ? styles.active : ""}`}
    >
      {label}
      <span className={styles.filterBadge}>
        {count}
      </span>
    </button>
  );
}

function AlertCard({ alert, onClick, isResponded, onClear }) {
  const alertTime = new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const alertDate = new Date(alert.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const statusColor = isResponded ? "var(--g400)" : "var(--r400)";
  const statusText = isResponded ? "Responded" : "Pending";
  
  let imgUrl = alert.photoUrl || alert.snapshotUrl || null;
  if (imgUrl === "null" || imgUrl === "None") imgUrl = null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0, overflow: "hidden" }}
      animate={{ opacity: 1, height: "auto", overflow: "visible" }}
      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
      transition={{ opacity: { duration: 0.2 }, height: { duration: 0.2, ease: "easeInOut" } }}
      whileHover={!isResponded ? { y: -2, boxShadow: "var(--shadow-sm)", borderColor: "var(--b300)" } : {}}
      onClick={onClick}
      className={`${styles.alertCard} ${isResponded ? styles.responded : ""}`}
    >
      {/* Preview Image */}
      <div className={styles.alertImageWrap}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt="Alert preview"
            className={styles.alertImage}
          />
        ) : (
          <Camera size={24} strokeWidth={1.75} />
        )}
      </div>

      {/* Content */}
      <div className={styles.alertContent}>
        <div className={styles.alertHeader}>
          <div className={styles.alertTitle}>
            Alert #{alert.id.slice(0, 8)}
          </div>
          <div className={styles.alertStatus}>
            <div className={styles.statusDot} style={{ backgroundColor: statusColor }} />
            <span className={styles.statusText} style={{ color: statusColor }}>
              {statusText}
            </span>
          </div>
        </div>

        <div className={styles.alertLocation}>
          <span>
            <MapPin size={12} strokeWidth={2} /> 
            {alert.latitude?.toFixed(4)}, {alert.longitude?.toFixed(4)}
          </span>
        </div>

        <div className={styles.alertMeta}>
          {alertTime} · {alertDate}
          {alert.satellites_locked && (
            <span>
              · <Satellite size={12} strokeWidth={2} /> {alert.satellites_locked} sats
            </span>
          )}
        </div>
      </div>

      {/* Right Arrow & Clear Button */}
      <div className={styles.alertActions}>
        <button
          onClick={onClear}
          className={styles.clearBtn}
          title="Clear Alert"
        >
          <Trash2 size={16} strokeWidth={2} />
        </button>
        
        {!isResponded && (
          <div className={styles.arrowIcon}>
            <ArrowRight size={16} strokeWidth={2} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
