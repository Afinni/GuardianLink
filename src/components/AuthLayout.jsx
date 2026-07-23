import { useNavigate } from "react-router-dom";
import styles from "./AuthLayout.module.css";

export default function AuthLayout({ children, mode }) {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftInner}>
          <div className={styles.logo}>
            <ShieldIcon />
          </div>
          <h1 className={styles.brand}>GuardianLink</h1>
          <p className={styles.motto}>Be your eyes.</p>
        </div>
        <div className={styles.circles} aria-hidden />
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          {/* Back link between sign in / sign up */}
          <div className={styles.modeSwitch}>
            {mode === "signin" ? (
              <>New here?{" "}
                <button className={styles.switchBtn} onClick={() => navigate("/signup")}>
                  Create an account →
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button className={styles.switchBtn} onClick={() => navigate("/")}>
                  Sign in →
                </button>
              </>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
