import { useApp } from "../context/AppContext";
import { motion } from "framer-motion";
import { MapPin, Clock, Smartphone } from "lucide-react";
import styles from "./UserCard.module.css";

export default function UserCard({ user }) {
  const { selectedUserId, setSelectedUserId } = useApp();
  const selected = user.id === selectedUserId;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "var(--shadow-md)", borderColor: "var(--b300)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      onClick={() => setSelectedUserId(user.id)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && setSelectedUserId(user.id)}
    >
      <div className={styles.top}>
        <div className={`${styles.avatar} ${!user.online ? styles.offline : ""}`}>
          {user.firstName?.[0]}{user.lastName?.[0]}
        </div>
        <div className={styles.info}>
          <div className={styles.name}>{user.firstName} {user.lastName}</div>
          <div className={styles.status}>
            <span className={`${styles.dot} ${user.online ? styles.online : styles.offDot}`}/>
            <span>{user.online ? "Online" : "Offline"}</span>
          </div>
        </div>
        {selected && <span className={styles.badge}>Viewing</span>}
      </div>

      <div className={styles.meta}>
        <MetaRow icon={<MapPin size={14} strokeWidth={1.75} />} text={user.area || user.address || "—"} />
        <MetaRow icon={<Clock size={14} strokeWidth={1.75} />} text={user.lastUpdate || "—"} />
        <MetaRow icon={<Smartphone size={14} strokeWidth={1.75} />} text={user.deviceId || "—"} />
      </div>
    </motion.div>
  );
}

function MetaRow({ icon, text }) {
  return (
    <div className={styles.metaRow}>
      <span className={styles.metaIcon}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
