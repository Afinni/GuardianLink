import { useApp } from "../context/AppContext";
import styles from "./UserCard.module.css";

export default function UserCard({ user }) {
  const { selectedUserId, setSelectedUserId } = useApp();
  const selected = user.id === selectedUserId;

  return (
    <div
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
        <MetaRow icon="" text={user.area || user.address || "—"} />
        <MetaRow icon="" text={user.lastUpdate || "—"} />
        <MetaRow icon="" text={user.deviceId || "—"} />
      </div>
    </div>
  );
}

function MetaRow({ icon, text }) {
  return (
    <div className={styles.metaRow}>
      <span style={{ fontSize: 11 }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
