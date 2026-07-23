import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Users, Wifi, AlertTriangle, Radio, Plus, Camera } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import UserCard from "../components/UserCard";
import MapView from "../components/MapView";
import EmergencyModal from "../components/EmergencyModal";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { caregiver, users, selectedUser, triggerEmergency, systemStatus, alerts } = useApp();
  const navigate = useNavigate();
  const onlineCount = users.filter(u => u.online).length;
  const pendingAlerts = alerts.filter(a => a.responded !== true).length;
  const gpsActiveCount = users.filter(u => u.lat).length;

  // Format last boot time
  const formatLastBoot = (bootTime) => {
    if (!bootTime) return "N/A";
    try {
      const date = new Date(bootTime);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    } catch {
      return "N/A";
    }
  };

  // First name only for greeting
  const firstName = caregiver?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className={styles.page}>
      <EmergencyModal />
      <div className={styles.layout}>
        <Navbar />

        {/* Personalised welcome */}
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.welcomeTitle}>{greeting}, {firstName}</h1>
            <p className={styles.welcomeSub}>Here's a live overview of your monitored users.</p>
          </div>
        </div>

        {/* Stats row */}
        <div className={styles.statsRow}>
          <StatCard icon={<Users size={20} strokeWidth={1.75} />} value={users.length} label="Monitored" color="blue" />
          <StatCard icon={<Wifi size={20} strokeWidth={1.75} />} value={onlineCount} label="Online now" color="green" sub={systemStatus?.status} />
          <StatCard icon={<AlertTriangle size={20} strokeWidth={1.75} />} value={pendingAlerts} label="Alerts" color={pendingAlerts > 0 ? "red" : "gray"} />
          <StatCard icon={<Radio size={20} strokeWidth={1.75} />} value={gpsActiveCount} label="GPS active" color="blue" sub={`Last boot: ${formatLastBoot(systemStatus?.last_boot)}`} />
        </div>

        {/* Users */}
        <SectionHeader title="Monitored Users" count={`${users.length}/3`} action={{ label: <><Plus size={14} strokeWidth={2} style={{marginRight: 4, verticalAlign: 'text-bottom'}} />Add</>, onClick: () => navigate("/add-user") }} />
        {users.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><Users size={32} strokeWidth={1.5} color="var(--n400)" /></div>
            <p className={styles.emptyTitle}>No users added yet</p>
            <p className={styles.emptySub}>Tap "Add user" to register someone to monitor.</p>
            <button className={styles.emptyBtn} onClick={() => navigate("/add-user")}>Add first user</button>
          </div>
        ) : (
          <div className={styles.userGrid}>
            {users.map(u => <UserCard key={u.id} user={u} />)}
          </div>
        )}

        {selectedUser && (
          <>
            {/* Map */}
            <SectionHeader
              title="Live Location"
              sub={selectedUser.lat ? `${selectedUser.lat}°N, ${selectedUser.lng}°E · ${selectedUser.area}` : "Awaiting GPS signal…"}
            />
            <MapView users={users} selectedId={selectedUser.id} />

            {/* No camera live — just a note */}
            <SectionHeader title="Camera" sub={`${selectedUser.firstName} ${selectedUser.lastName} · Smart Stick`} />
            <div className={styles.camNote}>
              <div className={styles.camNoteIcon}><Camera size={22} strokeWidth={1.75} color="var(--b500)" /></div>
              <div>
                <p className={styles.camNoteTitle}>Snapshot on emergency only</p>
                <p className={styles.camNoteSub}>
                  A photo is automatically captured and attached when an SOS alert is triggered. No live stream is shown for privacy.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color, sub }) {
  return (
    <motion.div 
      whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
      transition={{ duration: 0.2 }}
      className={`${styles.stat} ${styles[color]}`}
    >
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statVal}>{value}</div>
      <div className={styles.statLbl}>{label}</div>
      {sub && <div style={{ fontSize: "10px", marginTop: "4px", opacity: 0.8, color: "currentColor" }}>{sub}</div>}
    </motion.div>
  );
}

function SectionHeader({ title, sub, count, action }) {
  return (
    <div className={styles.secHeader}>
      <div>
        <span className={styles.secTitle}>{title}</span>
        {count && <span className={styles.secCount}>{count}</span>}
        {sub && <span className={styles.secSub}>{sub}</span>}
      </div>
      {action && (
        <button className={styles.secAction} onClick={action.onClick}>{action.label}</button>
      )}
    </div>
  );
}
