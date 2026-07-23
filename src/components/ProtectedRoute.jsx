import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import styles from "./Loader.module.css";

export default function ProtectedRoute({ children }) {
  const { caregiver, authLoading } = useApp();
  if (authLoading) return (
    <div className={styles.page}>
      <div className={styles.spinner} />
      <p className={styles.label}>Loading…</p>
    </div>
  );
  if (!caregiver) return <Navigate to="/" replace />;
  return children;
}
