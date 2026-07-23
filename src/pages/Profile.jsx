import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import EmergencyModal from "../components/EmergencyModal";
import styles from "./Profile.module.css";

export default function Profile() {
  const { caregiver, signOut, users } = useApp();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <div className={styles.page}>
      <EmergencyModal />
      <div className={styles.layout}>
        <Navbar />

        <button className={styles.back} onClick={() => navigate("/dashboard")}>
          <BackIcon /> Back to dashboard
        </button>

        {/* Profile hero */}
        <div className={styles.hero}>
          <div className={styles.heroAvatar}>{caregiver?.initials}</div>
          <div className={styles.heroInfo}>
            <h1 className={styles.heroName}>{caregiver?.name}</h1>
            <p className={styles.heroEmail}>{caregiver?.email}</p>
            <span className={styles.heroBadge}>Caregiver</span>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.stat}><div className={styles.statVal}>{users.length}</div><div className={styles.statLbl}>Users monitored</div></div>
          <div className={styles.stat}><div className={styles.statVal}>{users.filter(u=>u.online).length}</div><div className={styles.statLbl}>Currently online</div></div>
          <div className={styles.stat}><div className={styles.statVal}>{3 - users.length}</div><div className={styles.statLbl}>Slots remaining</div></div>
        </div>

        {/* Account info card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Account details</h2>
          <div className={styles.infoList}>
            <InfoRow label="Full name" value={caregiver?.name} />
            <InfoRow label="Email" value={caregiver?.email} />
            <InfoRow label="Role" value="Caregiver" />
            <InfoRow label="Max users" value="3" />
          </div>
        </div>

        {/* Sign out */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Session</h2>
          <p className={styles.cardSub}>You are currently signed in as <strong>{caregiver?.email}</strong>.</p>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            <SignOutIcon /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}

const BackIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const SignOutIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
