import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { FirestoreService } from '../services/firestoreService';
import { describeSubscription, PLANS } from '../config/plans';
import Reveal from '../components/Reveal';
import DailyChart from '../components/DailyChart';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential,
} from 'firebase/auth';
import {
  User as UserIcon, Mail, BadgeCheck, Flame, Activity, CalendarDays,
  Volume2, Music, Award, Sparkles, Mic, FileText, LogOut, ChevronRight, Loader2,
  Pencil, Check, X, ShieldCheck, KeyRound, FileDown, Share2, Copy, Play,
} from 'lucide-react';

function ini(name, email) {
  const s = (name || email || '?').trim();
  return s.charAt(0).toUpperCase();
}

function fmt(ts) {
  let d = null;
  if (!ts) return '—';
  if (typeof ts.toDate === 'function') d = ts.toDate();
  else if (ts.seconds) d = new Date(ts.seconds * 1000);
  else if (typeof ts === 'string') d = new Date(ts);
  else d = new Date(ts);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="profile-stat">
      <span className="profile-stat-icon"><Icon size={18} /></span>
      <div>
        <div className="profile-stat-value">{value}</div>
        <div className="profile-stat-label">{label}</div>
        {sub && <div className="profile-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function Profile() {
  const { currentUser, logout } = useUserAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [planBusy, setPlanBusy] = useState(false);
  const [planMsg, setPlanMsg] = useState('');

  const [hasPassword, setHasPassword] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  const [code, setCode] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setHasPassword(currentUser.providerData.some((p) => p.providerId === 'password'));
    let active = true;
    async function load() {
      const uid = currentUser.uid;
      const [sub, streak, thi, logs, audio, mixes, ach, prog, voice, notes, thiHistory, caregiver] = await Promise.all([
        FirestoreService.getSubscription(uid),
        FirestoreService.getStreak(uid),
        FirestoreService.getLastTHI(uid),
        FirestoreService.getWeeklyLogs(uid),
        FirestoreService.getLastAudiometry(uid),
        FirestoreService.getSoundscapes(uid),
        FirestoreService.getUserAchievements(uid),
        FirestoreService.getSessionProgress(uid),
        FirestoreService.getVoiceDiary(uid),
        FirestoreService.getProgressNotes(uid),
        FirestoreService.getTHIHistory(uid, 8),
        FirestoreService.getCaregiverCode(uid),
      ]);
      if (!active) return;
      setData({ sub, streak, thi, logs, audio, mixes, ach, prog, voice, notes, thiHistory });
      setCode(caregiver);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [currentUser]);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim(), photoURL: photo.trim() || null });
      await setDoc(doc(db, 'users', currentUser.uid, 'meta', 'profile'), {
        displayName: name.trim(),
        photoURL: photo.trim() || null,
      }, { merge: true });
      await auth.currentUser.reload();
      setProfileMsg('Perfil actualizado');
      setEditing(false);
    } catch (err) {
      setProfileMsg('No se pudo guardar el perfil.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePlan(id) {
    setPlanBusy(true);
    setPlanMsg('');
    const ok = await FirestoreService.setUserPlan(currentUser.uid, id);
    if (ok) {
      const sub = await FirestoreService.getSubscription(currentUser.uid);
      setData((d) => ({ ...d, sub }));
      setPlanMsg('Plan actualizado');
    } else {
      setPlanMsg('No se pudo actualizar el plan.');
    }
    setPlanBusy(false);
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwBusy(true);
    setPwError('');
    setPwMsg('');
    try {
      const cred = EmailAuthProvider.credential(currentUser.email, currentPw);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPw);
      setPwMsg('Contraseña actualizada.');
      setCurrentPw('');
      setNewPw('');
    } catch (err) {
      setPwError(traducirPw(err));
    } finally {
      setPwBusy(false);
    }
  }

  function exportData() {
    const payload = {
      exportado: new Date().toISOString(),
      cuenta: { email: currentUser.email, nombre: name || currentUser.displayName },
      suscripcion: data.sub,
      racha: data.streak,
      thiHistorial: data.thiHistory,
      registrosDiarios: data.logs,
      notas: data.notes,
      diarioVoz: data.voice,
      logros: data.ach,
    };
    const json = JSON.stringify(payload, (k, v) => (v && typeof v.toDate === 'function' ? v.toDate().toISOString() : v), 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tinnitoff-mis-datos.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function generateCode() {
    const c = await FirestoreService.setCaregiverCode(currentUser.uid);
    if (c) setCode(c);
  }

  async function copyLink() {
    const link = `${window.location.origin}/cuidador?c=${code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (!currentUser) return null;

  const email = currentUser.email || '';
  const display = name || currentUser.displayName || '';
  const plan = data ? describeSubscription(data.sub) : null;
  const thiGrade = data?.thi?.grade ? String(data.thi.grade).charAt(0).toUpperCase() + String(data.thi.grade).slice(1) : null;
  const planOptions = Object.values(PLANS);

  return (
    <section className="section profile-section">
      <div className="container narrow">
        <Reveal>
          <div className="profile-account">
            <span className="profile-avatar">{ini(display, email)}</span>
            <div className="profile-account-info">
              <h1>{display || 'Mi cuenta'}</h1>
              <p className="profile-email"><Mail size={14} /> {email}</p>
              {currentUser.emailVerified && (
                <span className="profile-verified"><BadgeCheck size={14} /> Correo verificado</span>
              )}
            </div>
            {!editing && (
              <button className="profile-edit-btn" onClick={() => { setName(display); setPhoto(currentUser.photoURL || ''); setEditing(true); setProfileMsg(''); }}>
                <Pencil size={15} /> Editar
              </button>
            )}
          </div>
        </Reveal>

        {editing && (
          <Reveal>
            <form className="profile-edit-form" onSubmit={saveProfile}>
              <label className="field">
                <span className="field-label"><UserIcon size={15} /> Nombre</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
              </label>
              <label className="field">
                <span className="field-label">URL de foto (opcional)</span>
                <input value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://…" />
              </label>
              <div className="profile-edit-actions">
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? <><Loader2 size={16} className="spin" /> Guardando…</> : <><Check size={16} /> Guardar</>}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                  <X size={16} /> Cancelar
                </button>
              </div>
              {profileMsg && <p className="profile-msg">{profileMsg}</p>}
            </form>
          </Reveal>
        )}

        {loading && (
          <div className="profile-loading"><Loader2 size={22} className="spin" /> Cargando tu información…</div>
        )}

        {!loading && data && (
          <>
            {plan && (
              <Reveal delay={0.05}>
                <div className="profile-block">
                  <div className="profile-sub" style={{ '--plan-color': plan.planColor }}>
                    <div className="profile-sub-left">
                      <span className="profile-sub-dot" />
                      <div>
                        <div className="profile-sub-name">{plan.planName}</div>
                        <div className="profile-sub-status">{plan.statusLabel}</div>
                      </div>
                    </div>
                    <Link to="/planes" className="profile-sub-link">
                      {plan.effectivePlan === 'free' ? 'Mejorar plan' : 'Ver planes'} <ChevronRight size={16} />
                    </Link>
                  </div>
                  <p className="profile-block-title"><ShieldCheck size={15} /> Gestionar suscripción</p>
                  <div className="plan-chips">
                    {planOptions.map((p) => (
                      <button
                        key={p.id}
                        className={`plan-chip ${p.id === plan.effectivePlan ? 'active' : ''}`}
                        style={{ '--c': p.color }}
                        onClick={() => changePlan(p.id)}
                        disabled={planBusy}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                  {planMsg && <p className="profile-msg">{planMsg}</p>}
                </div>
              </Reveal>
            )}

            <Reveal delay={0.1}>
              <h2 className="profile-h2">Tus datos en Tinnitoff</h2>
              <div className="profile-grid">
                <Stat icon={Flame} label="Racha de días" value={data.streak?.count ?? 0} sub="registro continuo" />
                <Stat icon={Activity} label="Último test THI" value={data.thi?.total ?? '—'} sub={thiGrade ? `Nivel ${thiGrade}` : 'sin test'} />
                <Stat icon={CalendarDays} label="Registros diarios" value={data.logs?.length ?? 0} sub="últimos 7 días" />
                <Stat icon={Volume2} label="Audiometría" value={data.audio?.frequency ? `${data.audio.frequency} Hz` : '—'} sub={data.audio ? `vol. ${data.audio.volume ?? '—'}` : 'sin datos'} />
                <Stat icon={Music} label="Mezclas guardadas" value={data.mixes?.length ?? 0} />
                <Stat icon={Award} label="Logros" value={data.ach?.unlockedIds?.length ?? 0} />
                <Stat icon={Sparkles} label="Sesiones completadas" value={data.prog?.completedDays?.length ?? 0} />
                <Stat icon={Mic} label="Diario de voz" value={data.voice?.length ?? 0} />
                <Stat icon={FileText} label="Notas de progreso" value={data.notes?.length ?? 0} />
              </div>
            </Reveal>

            <Reveal delay={0.11}>
              <div className="profile-block">
                <p className="profile-block-title"><CalendarDays size={15} /> Evolución diaria</p>
                <DailyChart logs={data.logs} />
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="profile-block">
                <p className="profile-block-title"><Activity size={15} /> Historial de test THI</p>
                {data.thiHistory?.length ? (
                  <div className="thi-history">
                    {data.thiHistory.map((h) => (
                      <div className="thi-row" key={h.id}>
                        <span className="thi-date">{fmt(h.createdAt)}</span>
                        <div className="thi-bar"><span style={{ width: `${Math.min(100, h.total || 0)}%` }} /></div>
                        <span className="thi-total">{h.total ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="profile-empty">Aún no has realizado el test THI. Hazlo desde la app para ver tu evolución.</p>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.13}>
              <div className="profile-block">
                <p className="profile-block-title"><FileText size={15} /> Notas de progreso</p>
                {data.notes?.length ? (
                  <ul className="notes-list">
                    {data.notes.map((n) => (
                      <li key={n.id}>
                        <div className="note-top"><span className="note-mood">{n.mood || '—'}</span><span className="note-date">{fmt(n.createdAt)}</span></div>
                        <p>{n.text}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="profile-empty">Sin notas todavía.</p>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="profile-block">
                <p className="profile-block-title"><Mic size={15} /> Diario de voz</p>
                {data.voice?.length ? (
                  <ul className="voice-list">
                    {data.voice.map((v) => (
                      <li key={v.id}>
                        <span className="voice-date">{fmt(v.createdAt)}</span>
                        {v.url ? (
                          <audio controls src={v.url} className="voice-audio" />
                        ) : (
                          <span className="profile-empty">{v.note || 'Audio registrado'}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="profile-empty">Sin entradas de voz todavía.</p>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="profile-block">
                <p className="profile-block-title"><Share2 size={15} /> Compartir con mi cuidador</p>
                <p className="profile-empty" style={{ marginTop: 0 }}>
                  Genera un código para que un familiar o profesional vea tu progreso en <code>/cuidador</code>.
                </p>
                {code ? (
                  <div className="caregiver-box">
                    <div className="caregiver-code">Código: <strong>{code}</strong></div>
                    <button className="btn btn-ghost btn-sm" onClick={copyLink}>
                      {copied ? <><Check size={15} /> ¡Copiado!</> : <><Copy size={15} /> Copiar enlace</>}
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={generateCode}>
                    <Share2 size={15} /> Generar código
                  </button>
                )}
              </div>
            </Reveal>

            {hasPassword && (
              <Reveal delay={0.16}>
                <div className="profile-block">
                  <p className="profile-block-title"><KeyRound size={15} /> Cambiar contraseña</p>
                  <form className="profile-pw-form" onSubmit={changePassword}>
                    <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Contraseña actual" required />
                    <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Nueva contraseña (mín. 6)" required minLength={6} />
                    <button type="submit" className="btn btn-ghost" disabled={pwBusy}>
                      {pwBusy ? <><Loader2 size={16} className="spin" /> Actualizando…</> : 'Actualizar'}
                    </button>
                  </form>
                  {pwMsg && <p className="profile-msg ok">{pwMsg}</p>}
                  {pwError && <p className="profile-msg err">{pwError}</p>}
                </div>
              </Reveal>
            )}

            <Reveal delay={0.18}>
              <div className="profile-actions">
                <button className="btn btn-ghost" onClick={exportData}>
                  <FileDown size={16} /> Exportar mis datos
                </button>
                <button className="btn btn-ghost" onClick={handleLogout}>
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </section>
  );
}

function traducirPw(err) {
  const code = err?.code || '';
  if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'La contraseña actual no es correcta.';
  if (code.includes('weak-password')) return 'La nueva contraseña es muy débil (mínimo 6 caracteres).';
  if (code.includes('requires-recent-login')) return 'Por seguridad, vuelve a iniciar sesión e intenta de nuevo.';
  if (code.includes('network')) return 'Sin conexión con el servidor.';
  return err?.message || 'No se pudo cambiar la contraseña.';
}
