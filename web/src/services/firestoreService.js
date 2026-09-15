// Lectura de datos del usuario desde Firestore (mismo proyecto que la app móvil).
// Solo operaciones de lectura necesarias para "Mi perfil" en el sitio web.
import { db } from '../firebase';
import {
    collection, doc, getDoc, getDocs, query, orderBy, limit, setDoc,
} from 'firebase/firestore';
import { PLAN_FREE, TRIAL_PLAN, TRIAL_DAYS } from '../config/plans';

const USERS = 'users';

export const FirestoreService = {
    async ensureSubscription(userId) {
        try {
            const ref = doc(db, USERS, userId, 'meta', 'subscription');
            const snap = await getDoc(ref);
            if (snap.exists()) return snap.data();
            const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
            const data = {
                plan: PLAN_FREE,
                trialPlan: TRIAL_PLAN,
                trialEndsAt: { seconds: Math.floor(trialEndsAt.getTime() / 1000), nanoseconds: 0 },
                trialUsed: true,
            };
            return data;
        } catch (e) {
            console.error('Error asegurando suscripción:', e);
            return { plan: PLAN_FREE, trialEndsAt: null };
        }
    },

    async getSubscription(userId) {
        try {
            const ref = doc(db, USERS, userId, 'meta', 'subscription');
            const snap = await getDoc(ref);
            return snap.exists() ? snap.data() : null;
        } catch (e) {
            console.error('Error obteniendo suscripción:', e);
            return null;
        }
    },

    async setUserPlan(userId, plan) {
        try {
            const ref = doc(db, USERS, userId, 'meta', 'subscription');
            await setDoc(ref, { plan, updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } }, { merge: true });
            return true;
        } catch (e) {
            console.error('Error cambiando plan:', e);
            return false;
        }
    },

    async getTHIHistory(userId, n = 10) {
        try {
            const q = query(collection(db, USERS, userId, 'thi_scores'), orderBy('createdAt', 'desc'), limit(n));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
            return [];
        }
    },

    async getStreak(userId) {
        try {
            const snap = await getDoc(doc(db, USERS, userId, 'meta', 'streak'));
            return snap.exists() ? snap.data() : { count: 0, lastLogDate: null };
        } catch (e) {
            return { count: 0, lastLogDate: null };
        }
    },

    async getLastTHI(userId) {
        try {
            const q = query(collection(db, USERS, userId, 'thi_scores'), orderBy('createdAt', 'desc'), limit(1));
            const snap = await getDocs(q);
            return snap.empty ? null : snap.docs[0].data();
        } catch (e) {
            return null;
        }
    },

    async getWeeklyLogs(userId) {
        try {
            const q = query(collection(db, USERS, userId, 'daily_logs'), orderBy('createdAt', 'desc'), limit(7));
            const snap = await getDocs(q);
            return snap.docs.map(d => d.data());
        } catch (e) {
            return [];
        }
    },

    async getLastAudiometry(userId) {
        try {
            const q = query(collection(db, USERS, userId, 'audiometry'), orderBy('measuredAt', 'desc'), limit(1));
            const snap = await getDocs(q);
            return snap.empty ? null : snap.docs[0].data();
        } catch (e) {
            return null;
        }
    },

    async getSoundscapes(userId) {
        try {
            const q = query(collection(db, USERS, userId, 'soundscapes'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
            return [];
        }
    },

    async getUserAchievements(userId) {
        try {
            const snap = await getDoc(doc(db, USERS, userId, 'meta', 'achievements'));
            if (!snap.exists()) return { unlockedIds: [], unlockedDates: {} };
            const d = snap.data();
            return { unlockedIds: d.unlockedIds || [], unlockedDates: d.unlockedDates || {} };
        } catch (e) {
            return { unlockedIds: [], unlockedDates: {} };
        }
    },

    async getSessionProgress(userId) {
        try {
            const snap = await getDoc(doc(db, USERS, userId, 'meta', 'program_progress'));
            if (snap.exists()) {
                const d = snap.data();
                return { completedDays: d.completedDays || [], totalXp: d.totalXp || 0 };
            }
            return { completedDays: [], totalXp: 0 };
        } catch (e) {
            return { completedDays: [], totalXp: 0 };
        }
    },

    async getVoiceDiary(userId) {
        try {
            const q = query(collection(db, USERS, userId, 'voice_diary'), orderBy('createdAt', 'desc'), limit(10));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
            return [];
        }
    },

    async getUserProfile(userId) {
        try {
            const snap = await getDoc(doc(db, USERS, userId, 'meta', 'profile'));
            return snap.exists() ? snap.data() : null;
        } catch (e) {
            return null;
        }
    },

    async getProgressNotes(userId) {
        try {
            const q = query(collection(db, USERS, userId, 'progress_notes'), orderBy('createdAt', 'desc'), limit(20));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
            return [];
        }
    },

    // --- Historial de chat del asistente IA ---
    async getChatHistory(userId) {
        try {
            const snap = await getDoc(doc(db, USERS, userId, 'meta', 'chat_history'));
            return snap.exists() ? (snap.data().messages || []) : [];
        } catch (e) {
            return [];
        }
    },

    async saveChatHistory(userId, messages) {
        try {
            const trimmed = messages.slice(-50).map(m => ({
                sender: m.sender,
                text: m.text,
                timestamp: m.timestamp || new Date().toISOString(),
            }));
            await setDoc(doc(db, USERS, userId, 'meta', 'chat_history'), {
                messages: trimmed,
                updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
            });
        } catch (e) {
            console.error('Error guardando chat:', e);
        }
    },

    // --- Código para cuidador / familiar ---
    async setCaregiverCode(userId) {
        try {
            const code = Math.random().toString(36).slice(2, 8).toUpperCase();
            const ts = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
            await setDoc(doc(db, USERS, userId, 'meta', 'caregiver'), { code, createdAt: ts });
            await setDoc(doc(db, 'caregiver_codes', code), { uid: userId, createdAt: ts });
            return code;
        } catch (e) {
            console.error('Error generando código:', e);
            return null;
        }
    },

    async getCaregiverCode(userId) {
        try {
            const snap = await getDoc(doc(db, USERS, userId, 'meta', 'caregiver'));
            return snap.exists() ? (snap.data().code || null) : null;
        } catch (e) {
            return null;
        }
    },

    async getCaregiverUid(code) {
        try {
            const snap = await getDoc(doc(db, 'caregiver_codes', String(code).toUpperCase()));
            return snap.exists() ? snap.data().uid : null;
        } catch (e) {
            return null;
        }
    },
};
