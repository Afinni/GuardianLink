import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import EmergencyModal from "../components/EmergencyModal";
import styles from "./AddUser.module.css";

const EMPTY = { firstName:"", lastName:"", dob:"", contact:"", address:"", deviceId:"" };

export default function AddUser() {
  const { users, addUser, removeUser } = useApp();
  const navigate = useNavigate();
  const [form, setForm]       = useState(EMPTY);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(null);
  const atLimit = users.length >= 3;
  const slotsLeft = 3 - users.length;

  function handle(e) { setForm(p => ({...p, [e.target.name]: e.target.value})); setError(""); }

  async function submit(e) {
    e.preventDefault();
    if (atLimit) { setError("Maximum of 3 users reached."); return; }
    const required = [["firstName","First name"],["lastName","Last name"],["contact","Contact number"],["deviceId","Device ID"]];
    for (const [k,l] of required) if (!form[k].trim()) { setError(`Please fill in "${l}".`); return; }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await addUser(form);
      setLoading(false);
      
      if (res.success) { 
        setSuccess(true); 
        setForm(EMPTY); 
        setTimeout(() => { navigate("/dashboard"); }, 1500); 
      } else {
        setError(res.message || "Failed to save user.");
      }
    } catch (err) {
      setLoading(false);
      console.error("Submit error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <div className={styles.page}>
      <EmergencyModal />
      <div className={styles.layout}>
        <Navbar />

        {/* Back button */}
        <button className={styles.back} onClick={() => navigate("/dashboard")}>
          <BackIcon /> Back to dashboard
        </button>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Add a user</h2>
              <p className={styles.cardSub}>Register a new person to monitor. {slotsLeft > 0 ? `${slotsLeft} slot${slotsLeft===1?"":"s"} remaining.` : "All slots used."}</p>
            </div>
            <div className={`${styles.slotBadge} ${atLimit ? styles.full : ""}`}>
              {users.length}/3 slots
            </div>
          </div>

          {atLimit && <div className={styles.banner + " " + styles.bannerWarn}>You've reached the 3-user limit. Remove a user on the dashboard to add a new one.</div>}
          {success && <div className={styles.banner + " " + styles.bannerOk}>User added! Redirecting to dashboard…</div>}

          <form className={styles.form} onSubmit={submit} noValidate>
            <div className={styles.row}>
              <Field label="First name"  name="firstName" placeholder="e.g. Amaka"  value={form.firstName} onChange={handle} disabled={atLimit} />
              <Field label="Last name"   name="lastName"  placeholder="e.g. Obi"    value={form.lastName}  onChange={handle} disabled={atLimit} />
            </div>
            <div className={styles.row}>
              <Field label="Date of birth"        name="dob"     type="date" value={form.dob}     onChange={handle} disabled={atLimit} />
              <Field label="Contact / Next of kin" name="contact" type="tel"  placeholder="+234 800 000 0000" value={form.contact} onChange={handle} disabled={atLimit} />
            </div>
            <Field label="Home address" name="address"  placeholder="Street, City" value={form.address}  onChange={handle} disabled={atLimit} />
            <Field label="Device ID"   name="deviceId" placeholder="e.g. GL-STICK-003"   value={form.deviceId} onChange={handle} disabled={atLimit}
              hint="Find the pairing code on the sticker on the bottom of the smart stick." />

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button className={styles.btnAdd} type="submit" disabled={atLimit||loading||success}>
                {loading && <span className={styles.spinner}/>}
                {loading ? "Saving…" : "Add user"}
              </button>
              <button className={styles.btnCancel} type="button" onClick={() => navigate("/dashboard")}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Current users */}
        {users.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle} style={{marginBottom:16}}>Current users</h3>
            <div className={styles.userList}>
              {users.map(u => (
                <div key={u.id} className={styles.userRow}>
                  <div className={styles.uAvatar}>{u.firstName?.[0]}{u.lastName?.[0]}</div>
                  <div className={styles.uInfo}>
                    <div className={styles.uName}>{u.firstName} {u.lastName}</div>
                    <div className={styles.uMeta}>{u.deviceId} · {u.address}</div>
                  </div>
                  <div className={styles.userActions}>
                    <span className={`${styles.pill} ${u.online ? styles.pillOn : styles.pillOff}`}>
                      {u.online ? "Online" : "Offline"}
                    </span>
                    <button
                      type="button"
                      className={styles.btnRemove}
                      onClick={async () => {
                        if (removing) return;
                        setRemoving(u.id);
                        const res = await removeUser(u.id);
                        setRemoving(null);
                        if (!res.success) setError(res.message);
                      }}
                      disabled={removing !== null}
                    >
                      {removing === u.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, name, type="text", placeholder, value, onChange, disabled, hint }) {
  return (
    <div className={styles.field}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} placeholder={placeholder}
        value={value} onChange={onChange} disabled={disabled} autoComplete="off" />
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}

const BackIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
