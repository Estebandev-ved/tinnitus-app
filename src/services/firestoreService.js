import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp, doc, setDoc, getDoc, deleteDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';

// Collection References
const USERS_COLLECTION = 'users';

export const FirestoreService = {

    // Save a new daily log entry
    async saveDailyLog(userId, logData) {
        try {
            const logsRef = collection(db, USERS_COLLECTION, userId, 'daily_logs');
            const docRef = await addDoc(logsRef, {
                ...logData,
                createdAt: Timestamp.now(),
                date: new Date().toISOString().split('T')[0] // YYYY-MM-DD for easier querying
            });
            console.log("Document written with ID: ", docRef.id);
            return docRef.id;
        } catch (e) {
            console.error("Error adding document: ", e);
            throw e;
        }
    },

    // Get logs for the last 7 days for charts
    async getWeeklyLogs(userId) {
        try {
            const logsRef = collection(db, USERS_COLLECTION, userId, 'daily_logs');
            const q = query(logsRef, orderBy('createdAt', 'desc'), limit(7));
            const querySnapshot = await getDocs(q);

            const logs = [];
            querySnapshot.forEach((doc) => {
                logs.push({ id: doc.id, ...doc.data() });
            });
            return logs.reverse(); // Return in chronological order (Oldest -> Newest)
        } catch (e) {
            console.error("Error getting documents: ", e);
            throw e;
        }
    },



    // Save Audiometry Result
    async saveAudiometry(userId, data) {
        try {
            const audioRef = collection(db, USERS_COLLECTION, userId, 'audiometry');
            await addDoc(audioRef, {
                type: data.type || 'pure',
                frequency: data.frequency,
                volume: data.volume || 50,
                ear: data.ear || 'both',
                measuredAt: Timestamp.now()
            });
        } catch (e) {
            console.error("Error saving audiometry: ", e);
            throw e;
        }
    },

    // Get Last Audiometry
    async getLastAudiometry(userId) {
        try {
            const audioRef = collection(db, USERS_COLLECTION, userId, 'audiometry');
            const q = query(audioRef, orderBy('measuredAt', 'desc'), limit(1));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                return querySnapshot.docs[0].data();
            }
            return null;
        } catch (e) {
            console.error("Error getting audiometry:", e);
            return null;
        }
    },

    // --- Soundscapes (Saved Mixes) ---

    async saveSoundscape(userId, name, activeSounds) {
        try {
            const ref = collection(db, USERS_COLLECTION, userId, 'soundscapes');
            await addDoc(ref, {
                name,
                sounds: activeSounds, // { rain: 0.5, fan: 0.2 }
                createdAt: new Date()
            });
            return true;
        } catch (e) {
            console.error("Error saving soundscape:", e);
            throw e;
        }
    },

    async getSoundscapes(userId) {
        try {
            const ref = collection(db, USERS_COLLECTION, userId, 'soundscapes');
            const q = query(ref, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error getting soundscapes:", e);
            return [];
        }
    },

    async deleteSoundscape(userId, mixId) {
        try {
            const ref = doc(db, USERS_COLLECTION, userId, 'soundscapes', mixId);
            await deleteDoc(ref);
            return true;
        } catch (e) {
            console.error("Error deleting soundscape:", e);
            throw e;
        }
    },

    // --- Streak Management ---

    async getStreak(userId) {
        try {
            const ref = doc(db, USERS_COLLECTION, userId, 'meta', 'streak');
            const snap = await getDoc(ref);
            if (snap.exists()) {
                return snap.data(); // { count, lastLogDate, lostAt?, lostCount? }
            }
            return { count: 0, lastLogDate: null };
        } catch (e) {
            console.error("Error getting streak:", e);
            return { count: 0, lastLogDate: null };
        }
    },

    async updateStreak(userId) {
        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const ref = doc(db, USERS_COLLECTION, userId, 'meta', 'streak');
            const snap = await getDoc(ref);
            const data = snap.exists() ? snap.data() : { count: 0, lastLogDate: null };

            if (data.lastLogDate === today) {
                // Already logged today, no change
                return data;
            }

            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            let newData;
            if (data.lastLogDate === yesterday) {
                // Consecutive! Increment
                newData = { count: data.count + 1, lastLogDate: today };
            } else if (data.count > 0) {
                // Streak broken! Save the lost count for recovery
                newData = { count: 1, lastLogDate: today, lostAt: today, lostCount: data.count };
            } else {
                // Fresh start
                newData = { count: 1, lastLogDate: today };
            }

            await setDoc(ref, newData);
            return newData;
        } catch (e) {
            console.error("Error updating streak:", e);
            throw e;
        }
    },

    async recoverStreak(userId) {
        try {
            const ref = doc(db, USERS_COLLECTION, userId, 'meta', 'streak');
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;

            const data = snap.data();
            if (data.lostCount && data.lostCount > 0) {
                // Restore the previous streak
                const recovered = {
                    count: data.lostCount + 1, // +1 for today
                    lastLogDate: new Date().toISOString().split('T')[0],
                    // Remove lost fields
                };
                await setDoc(ref, recovered);
                return recovered;
            }
            return data;
        } catch (e) {
            console.error("Error recovering streak:", e);
            throw e;
        }
    },

    // --- Medical Profile ---

    async saveMedicalProfile(userId, profileData) {
        try {
            const ref = doc(db, USERS_COLLECTION, userId, 'meta', 'medical_profile');
            await setDoc(ref, {
                ...profileData,
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (e) {
            console.error("Error saving medical profile:", e);
            throw e;
        }
    },

    async getMedicalProfile(userId) {
        try {
            const ref = doc(db, USERS_COLLECTION, userId, 'meta', 'medical_profile');
            const snap = await getDoc(ref);
            if (snap.exists()) {
                return snap.data();
            }
            return null;
        } catch (e) {
            console.error("Error getting medical profile:", e);
            return null;
        }
    },

    // --- Community Forum ---

    async getCommunityPosts() {
        try {
            const ref = collection(db, 'community_posts');
            const q = query(ref, orderBy('createdAt', 'desc'), limit(50));
            const snap = await getDocs(q);
            const posts = [];
            snap.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
            return posts;
        } catch (e) {
            console.error('Error getting community posts:', e);
            return [];
        }
    },

    async createCommunityPost(postData) {
        try {
            const ref = collection(db, 'community_posts');
            return await addDoc(ref, {
                ...postData,
                createdAt: Timestamp.now()
            });
        } catch (e) {
            console.error('Error creating post:', e);
            throw e;
        }
    },

    async toggleLike(postId, userId) {
        try {
            const ref = doc(db, 'community_posts', postId);
            const snap = await getDoc(ref);
            if (!snap.exists()) return;
            const data = snap.data();
            const likedBy = data.likedBy || [];
            if (likedBy.includes(userId)) {
                // Unlike
                await updateDoc(ref, {
                    likedBy: likedBy.filter(id => id !== userId),
                    likes: (data.likes || 1) - 1
                });
            } else {
                // Like
                await updateDoc(ref, {
                    likedBy: [...likedBy, userId],
                    likes: (data.likes || 0) + 1
                });
            }
        } catch (e) {
            console.error('Error toggling like:', e);
            throw e;
        }
    },

    async addReply(postId, replyData) {
        try {
            const ref = doc(db, 'community_posts', postId);
            await updateDoc(ref, {
                replies: arrayUnion({
                    ...replyData,
                    createdAt: new Date().toISOString()
                })
            });
        } catch (e) {
            console.error('Error adding reply:', e);
            throw e;
        }
    },

    // --- AI Chat History (Memory) ---

    async saveChatHistory(userId, messages) {
        try {
            const ref = doc(db, USERS_COLLECTION, userId, 'meta', 'chat_history');
            // Keep only the last 50 messages to avoid excessive storage
            const trimmed = messages.slice(-50).map(msg => ({
                sender: msg.sender,
                text: msg.text,
                timestamp: msg.timestamp || new Date().toISOString()
            }));
            await setDoc(ref, {
                messages: trimmed,
                updatedAt: Timestamp.now()
            });
        } catch (e) {
            console.error('Error saving chat history:', e);
        }
    },

    async getChatHistory(userId) {
        try {
            const ref = doc(db, USERS_COLLECTION, userId, 'meta', 'chat_history');
            const snap = await getDoc(ref);
            if (snap.exists()) {
                return snap.data().messages || [];
            }
            return [];
        } catch (e) {
            console.error('Error getting chat history:', e);
            return [];
        }
    },

    // --- Progress Notes (Mini Diary) ---

    async saveProgressNote(userId, noteData) {
        try {
            const notesRef = collection(db, USERS_COLLECTION, userId, 'progress_notes');
            const docRef = await addDoc(notesRef, {
                ...noteData,
                createdAt: Timestamp.now(),
                date: new Date().toISOString()
            });
            return docRef.id;
        } catch (e) {
            console.error("Error saving progress note: ", e);
            throw e;
        }
    },

    async getProgressNotes(userId, limitCount = 20) {
        try {
            const notesRef = collection(db, USERS_COLLECTION, userId, 'progress_notes');
            const q = query(notesRef, orderBy('createdAt', 'desc'), limit(limitCount));
            const querySnapshot = await getDocs(q);

            const notes = [];
            querySnapshot.forEach((doc) => {
                notes.push({ id: doc.id, ...doc.data() });
            });
            return notes;
        } catch (e) {
            console.error("Error getting progress notes: ", e);
            throw e;
        }
    },

    // --- User Profile ---

    async saveUserProfile(userId, profileData) {
        try {
            const ref = doc(db, USERS_COLLECTION, userId, 'meta', 'profile');
            await setDoc(ref, {
                ...profileData,
                updatedAt: Timestamp.now()
            }, { merge: true });
        } catch (e) {
            console.error('Error saving user profile:', e);
            throw e;
        }
    },

    async getUserProfile(userId) {
        try {
            const ref = doc(db, USERS_COLLECTION, userId, 'meta', 'profile');
            const snap = await getDoc(ref);
            if (snap.exists()) {
                return snap.data();
            }
            return null;
        } catch (e) {
            console.error('Error getting user profile:', e);
            return null;
        }
    }
};
