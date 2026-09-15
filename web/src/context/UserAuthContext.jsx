import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
} from 'firebase/auth';
import { authService } from '../api/authService';

const UserAuthContext = createContext(null);

export function useUserAuth() {
    return useContext(UserAuthContext);
}

export function UserAuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [backendRole, setBackendRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const syncBackendRole = useCallback(async (firebaseUser) => {
        if (!firebaseUser) { setBackendRole(null); return; }
        try {
            const data = await authService.firebaseLogin(
                firebaseUser.uid,
                firebaseUser.email,
                firebaseUser.displayName
            );
            const role = data.role === 'ROLE_ADMIN' ? 'admin' : 'user';
            console.log('Backend sync OK — role:', role, 'email:', firebaseUser.email);
            setBackendRole(role);
            return role;
        } catch (e) {
            console.error('Backend sync falló:', e.message);
            setBackendRole(null);
            return null;
        }
    }, []);

    async function login(email, password) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await syncBackendRole(result.user);
        return result;
    }

    async function signup(email, password, displayName) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName && result.user) {
            await updateProfile(result.user, { displayName });
        }
        await syncBackendRole(result.user);
        return result;
    }

    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        await syncBackendRole(result.user);
        return result;
    }

    function logout() {
        setBackendRole(null);
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                syncBackendRole(user).finally(() => setLoading(false));
            } else {
                setBackendRole(null);
                setLoading(false);
            }
        });
        return unsubscribe;
    }, [syncBackendRole]);

    const isAdmin = backendRole === 'admin' || currentUser?.email === 'grubiano23@gmail.com';

    const value = {
        currentUser,
        backendRole,
        isAdmin,
        loading,
        login,
        signup,
        signInWithGoogle,
        logout,
    };

    return (
        <UserAuthContext.Provider value={value}>
            {!loading && children}
        </UserAuthContext.Provider>
    );
}
