import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import AuthLayout from "../components/AuthLayout";
import s from "../components/AuthForm.module.css";

export default function SignUp() {
  const { signUp } = useApp();
  const navigate   = useNavigate();
  const [fullName, setFullName]     = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) { setError("Please enter your full name."); return; }
    if (!email)           { setError("Please enter your email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const res = await signUp(fullName.trim(), email, password);
    if (res.success) navigate("/dashboard");
    else { setError(res.message); setLoading(false); }
  }

  return (
    <AuthLayout mode="signup">
      <div>
        <h2 className={s.heading}>Create your account</h2>
        <p className={s.sub}>Start monitoring in minutes</p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div className={s.field}>
          <label className={s.label}>Full name</label>
          <div className={s.inputWrap}>
            <PersonIcon />
            <input className={s.input} type="text" placeholder="e.g. Ada Nwosu"
              value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" />
          </div>
        </div>

        <div className={s.field}>
          <label className={s.label}>Email address</label>
          <div className={s.inputWrap}>
            <MailIcon />
            <input className={s.input} type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>
        </div>

        <div className={s.field}>
          <label className={s.label}>Password</label>
          <div className={s.inputWrap}>
            <LockIcon />
            <input className={s.input} type="password" placeholder="At least 6 characters"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </div>

        <div className={s.field}>
          <label className={s.label}>Confirm password</label>
          <div className={s.inputWrap}>
            <LockIcon />
            <input className={s.input} type="password" placeholder="Repeat your password"
              value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
        </div>

        {error && <div className={s.error}><AlertIcon />{error}</div>}

        <button className={s.btn} type="submit" disabled={loading} style={{ marginTop: 4 }}>
          {loading && <span className={s.spinner} />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className={s.terms}>
        By signing up you agree to our Terms of Service.<br />
        Already have an account?{" "}
        <button style={{ background:"none", border:"none", color:"var(--b600)", fontWeight:600, cursor:"pointer", fontSize:13 }}
          onClick={() => navigate("/")}>
          Sign in →
        </button>
      </p>
    </AuthLayout>
  );
}

const PersonIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const LockIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const AlertIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
