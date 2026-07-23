import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Shield, LayoutDashboard, Bell, LogOut, Map, MoreVertical, User, UserPlus } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { caregiver, signOut, alerts } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const pendingAlertsCount = alerts.filter(a => a.responded !== true).length;

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.brand} onClick={() => navigate("/dashboard")}>
          <div className={styles.icon}><Shield size={18} strokeWidth={2} color="white" /></div>
          <span className={styles.name}>GuardianLink</span>
        </div>

        <div className={styles.tabs}>
          <NavTab icon={<LayoutDashboard size={14} strokeWidth={2} />} label="Dashboard" active={pathname === "/dashboard"} onClick={() => navigate("/dashboard")} />
          <NavTab 
            icon={<Map size={14} strokeWidth={2} />} 
            label="Map" 
            active={pathname === "/map"} 
            onClick={() => navigate("/map")}
          />
          <NavTab 
            icon={<Bell size={14} strokeWidth={2} />} 
            label="Alerts" 
            active={pathname === "/alerts"} 
            onClick={() => navigate("/alerts")}
            badge={pendingAlertsCount}
          />
        </div>

        <div className={styles.right}>
          {/* Desktop Right Items */}
          <div className={styles.desktopRight}>
            <div className={styles.userPill} onClick={() => navigate("/profile")} title="View profile">
              <div className={styles.avatar}>{caregiver?.initials || "CG"}</div>
              <span className={styles.userName}>{caregiver?.name}</span>
            </div>
            <button className={styles.signOutBtn} onClick={handleSignOut} title="Sign out">
              <LogOut size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Mobile Right Items (More Menu) */}
          <div className={styles.mobileRight} ref={menuRef}>
            <button 
              className={styles.signOutBtn} 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              title="More"
            >
              <MoreVertical size={20} strokeWidth={2} />
            </button>

            {isMenuOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.avatar}>{caregiver?.initials || "CG"}</div>
                  <div className={styles.dropdownUserInfo}>
                    <span className={styles.dropdownName}>{caregiver?.name}</span>
                    <span className={styles.dropdownRole}>Caregiver</span>
                  </div>
                </div>
                <div className={styles.dropdownDivider}></div>
                <button className={styles.dropdownItem} onClick={() => { setIsMenuOpen(false); navigate("/profile"); }}>
                  <User size={16} strokeWidth={2} />
                  <span>Profile</span>
                </button>
                <button className={styles.dropdownItem} onClick={() => { setIsMenuOpen(false); navigate("/add-user"); }}>
                  <UserPlus size={16} strokeWidth={2} />
                  <span>Add User</span>
                </button>
                <div className={styles.dropdownDivider}></div>
                <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={handleSignOut}>
                  <LogOut size={16} strokeWidth={2} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navbar */}
      <div className={styles.bottomNav}>
        <BottomNavTab icon={<LayoutDashboard size={20} strokeWidth={2} />} label="Dashboard" active={pathname === "/dashboard"} onClick={() => navigate("/dashboard")} />
        <BottomNavTab 
          icon={<Map size={20} strokeWidth={2} />} 
          label="Map" 
          active={pathname === "/map"} 
          onClick={() => navigate("/map")}
        />
        <BottomNavTab 
          icon={<Bell size={20} strokeWidth={2} />} 
          label="Alerts" 
          active={pathname === "/alerts"} 
          onClick={() => navigate("/alerts")}
          badge={pendingAlertsCount}
        />
      </div>
    </>
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
          position: "absolute", top: "-6px", right: "-6px", minWidth: "18px", height: "18px",
          borderRadius: "50%", backgroundColor: "var(--r400)", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "10px", fontWeight: "700", border: "2px solid white",
        }}>
          {badge}
        </div>
      )}
    </button>
  );
}

function BottomNavTab({ icon, label, active, onClick, badge }) {
  return (
    <button className={`${styles.bottomNavTab} ${active ? styles.activeTab : ""}`} onClick={onClick}>
      <div className={styles.bottomNavIconWrapper}>
        {icon}
        {badge > 0 && <span className={styles.bottomNavBadge}>{badge}</span>}
      </div>
      <span className={styles.bottomNavLabel}>{label}</span>
    </button>
  );
}
