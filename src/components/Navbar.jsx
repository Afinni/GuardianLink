import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Shield, LayoutDashboard, Bell, LogOut } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { caregiver, signOut, alerts } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const pendingAlertsCount = alerts.filter(a => a.responded !== true).length;

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.brand} onClick={() => navigate("/dashboard")}>
        <div className={styles.icon}><Shield size={18} strokeWidth={2} color="white" /></div>
        <span className={styles.name}>GuardianLink</span>
      </div>

      <div className={styles.tabs}>
        <NavTab icon={<LayoutDashboard size={14} strokeWidth={2} />} label="Dashboard" active={pathname === "/dashboard"} onClick={() => navigate("/dashboard")} />
        <NavTab 
          icon={<Bell size={14} strokeWidth={2} />} 
          label="Alerts" 
          active={pathname === "/alerts"} 
          onClick={() => navigate("/alerts")}
          badge={pendingAlertsCount}
        />
      </div>

      <div className={styles.right}>
        <div className={styles.userPill} onClick={() => navigate("/profile")} title="View profile">
          <div className={styles.avatar}>{caregiver?.initials || "CG"}</div>
          <span className={styles.userName}>{caregiver?.name}</span>
        </div>
        <button className={styles.signOutBtn} onClick={handleSignOut} title="Sign out">
          <LogOut size={16} strokeWidth={2} />
        </button>
      </div>
    </nav>
  );
}

function NavTab({ icon, label, active, onClick, badge }) {
  return (
    <button
      style={{
        display:"flex", alignItems:"center", gap:6,
        fontSize:13, padding:"7px 14px",
        borderRadius:8, border:"1.5px solid",
        borderColor: active ? "var(--b200)" : "transparent",
        background: active ? "var(--b50)" : "transparent",
        color: active ? "var(--b700)" : "var(--text2)",
        fontWeight: active ? 600 : 400,
        cursor:"pointer", transition:"all .15s",
        fontFamily:"var(--font)",
        position: "relative",
      }}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      {badge > 0 && (
        <div style={{
          position: "absolute",
          top: "-6px",
          right: "-6px",
          minWidth: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "var(--r400)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          fontWeight: "700",
          border: "2px solid white",
        }}>
          {badge}
        </div>
      )}
    </button>
  );
}
