import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Inbox, Camera, MapPin, Satellite, ArrowRight, Trash2 } from "lucide-react";
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
        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          paddingBottom: "12px",
          borderBottom: "1px solid var(--b200)",
        }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
          </div>
        )}
      </div>

      {showRespond && selectedAlert && (
        <AuthorityModal
          mode="alert"
          alert={selectedAlert}
          onClose={handleCloseRespond}
        />
      )}
    </div>
  );
}

function FilterButton({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: "8px",
        border: "1.5px solid",
        borderColor: active ? "var(--b400)" : "var(--b200)",
        backgroundColor: active ? "var(--b50)" : "transparent",
        color: active ? "var(--b700)" : "var(--text2)",
        fontWeight: active ? 600 : 400,
        fontSize: "13px",
        fontFamily: "var(--font)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {label}
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "20px",
        height: "20px",
        borderRadius: "4px",
        backgroundColor: active ? "var(--b200)" : "var(--b100)",
        fontSize: "11px",
        fontWeight: "600",
      }}>
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

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        gap: "12px",
        padding: "12px",
        borderRadius: "10px",
        border: "1.5px solid var(--b200)",
        backgroundColor: isResponded ? "var(--b50)" : "white",
        cursor: isResponded ? "default" : "pointer",
        transition: "all 0.15s ease",
        opacity: isResponded ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isResponded) {
          e.currentTarget.style.borderColor = "var(--b300)";
          e.currentTarget.style.backgroundColor = "var(--b75)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isResponded) {
          e.currentTarget.style.borderColor = "var(--b200)";
          e.currentTarget.style.backgroundColor = "white";
        }
      }}
    >
      {/* Preview Image */}
      <div style={{
        width: "60px",
        height: "60px",
        borderRadius: "8px",
        backgroundColor: "var(--b100)",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {alert.photoUrl ? (
          <img
            src={alert.photoUrl}
            alt="Alert preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--n400)"
          }}>
            <Camera size={24} strokeWidth={1.75} />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}>
          <div style={{
            fontWeight: "600",
            color: "var(--text)",
            fontSize: "13px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            Alert #{alert.id.slice(0, 8)}
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            paddingLeft: "8px",
            whiteSpace: "nowrap",
          }}>
            <div style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: statusColor,
            }} />
            <span style={{
              fontSize: "11px",
              fontWeight: "500",
              color: statusColor,
            }}>
              {statusText}
            </span>
          </div>
        </div>

        <div style={{
          fontSize: "12px",
          color: "var(--text2)",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} strokeWidth={2} /> 
            {alert.latitude?.toFixed(4)}, {alert.longitude?.toFixed(4)}
          </span>
        </div>

        <div style={{
          fontSize: "11px",
          color: "var(--text3)",
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}>
          {alertTime} · {alertDate}
          {alert.satellites_locked && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              · <Satellite size={12} strokeWidth={2} /> {alert.satellites_locked} sats
            </span>
          )}
        </div>
      </div>

      {/* Right Arrow & Clear Button */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        flexShrink: 0,
      }}>
        <button
          onClick={onClear}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text3)",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--r50)";
            e.currentTarget.style.color = "var(--r600)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text3)";
          }}
          title="Clear Alert"
        >
          <Trash2 size={16} strokeWidth={2} />
        </button>
        
        {!isResponded && (
          <div style={{
            color: "var(--b500)",
            display: "flex",
            alignItems: "center",
          }}>
            <ArrowRight size={16} strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}
