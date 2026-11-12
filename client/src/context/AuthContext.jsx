import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateProfile as updateFirebaseProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { api, setTokenProvider } from '../services/api';
import { setCurrentUser as setApiCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleView, setRoleView] = useState(localStorage.getItem('ev_role_view') || 'seeker');

  const switchRoleView = (view) => {
    setRoleView(view);
    localStorage.setItem('ev_role_view', view);
  };

  // Configure api token provider dynamically to retrieve fresh Firebase ID token
  useEffect(() => {
    setTokenProvider(async () => {
      if (auth && auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
      return null;
    });
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentFirebaseUser) => {
        setFirebaseUser(currentFirebaseUser);

        if (currentFirebaseUser) {
          try {
            // Get fresh ID token
            const idToken = await currentFirebaseUser.getIdToken();
            localStorage.setItem('ev_token', idToken);

            // Track identity in api.js for localStorage scoping
            setApiCurrentUser(currentFirebaseUser.uid, currentFirebaseUser.email || '');

            // Retrieve or sync MongoDB user record
            const res = await api.getMe();
            if (res.success && res.user) {
              setUser(res.user);
            } else {
              // First time sync if MongoDB record didn't exist yet
              const syncRes = await api.syncUser({
                name: currentFirebaseUser.displayName || 'EV User',
                email: currentFirebaseUser.email,
                phone: currentFirebaseUser.phoneNumber || ''
              });
              if (syncRes.success) setUser(syncRes.user);
            }
          } catch (err) {
            console.warn('[AuthContext] Error retrieving MongoDB profile:', err.message);
            setUser({
              firebaseUid: currentFirebaseUser.uid,
              name: currentFirebaseUser.displayName || 'EV User',
              email: currentFirebaseUser.email || '',
              phone: currentFirebaseUser.phoneNumber || '',
              avatar: currentFirebaseUser.photoURL || '',
              isEmailVerified: currentFirebaseUser.emailVerified,
              vehicles: []
            });
          }
        } else {
          localStorage.removeItem('ev_token');
          setApiCurrentUser(null, null); // Clear per-user localStorage scoping
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.warn('[AuthContext] Auth observer warning:', error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 1. Email & Password Registration
  const registerWithEmail = async ({ name, email, password, phone, vehicles }) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        'Firebase is not yet configured with production API keys. Please set VITE_FIREBASE_API_KEY in your environment variables.'
      );
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;

    // Update Firebase display name
    if (name) {
      await updateFirebaseProfile(fbUser, { displayName: name });
    }

    // Send verification email
    try {
      await sendEmailVerification(fbUser);
    } catch (e) {
      console.warn('Failed to send verification email automatically:', e.message);
    }

    // Sync with MongoDB backend
    const idToken = await fbUser.getIdToken();
    localStorage.setItem('ev_token', idToken);

    try {
      const syncRes = await api.register({
        idToken,
        name,
        email: fbUser.email,
        phone: phone || '',
        vehicles: vehicles || []
      });
      if (syncRes.success && syncRes.user) {
        setUser(syncRes.user);
        return syncRes.user;
      }
    } catch (err) {
      console.error('[AuthContext] Registration sync error:', err.message);
    }

    const fallbackUser = {
      firebaseUid: fbUser.uid,
      name: name || 'EV User',
      email: fbUser.email,
      phone: phone || '',
      vehicles: vehicles || []
    };
    setUser(fallbackUser);
    return fallbackUser;
  };

  // 2. Email & Password Login
  const loginWithEmail = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        'Firebase is not yet configured with production API keys. Please set VITE_FIREBASE_API_KEY in your environment variables.'
      );
    }
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;
    const idToken = await fbUser.getIdToken();
    localStorage.setItem('ev_token', idToken);

    try {
      const res = await api.login({ idToken });
      if (res.success && res.user) {
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      console.error('[AuthContext] Backend login error:', err.message);
    }

    const basicUser = {
      firebaseUid: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'EV User',
      email: fbUser.email,
      phone: fbUser.phoneNumber || ''
    };
    setUser(basicUser);
    return basicUser;
  };

  // 3. Setup ReCAPTCHA for Phone Authentication
  const setupRecaptcha = (containerId) => {
    if (!auth) {
      throw new Error('Firebase authentication is not initialized');
    }
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        }
      });
    }
    return window.recaptchaVerifier;
  };

  // 4. Send Phone OTP
  const sendPhoneOtp = async (phoneNumber, containerId = 'recaptcha-container') => {
    const verifier = setupRecaptcha(containerId);
    return await signInWithPhoneNumber(auth, phoneNumber, verifier);
  };

  // 5. Verify Phone OTP
  const verifyPhoneOtp = async (confirmationResult, otpCode, additionalData = {}) => {
    const userCredential = await confirmationResult.confirm(otpCode);
    const fbUser = userCredential.user;

    const idToken = await fbUser.getIdToken();
    localStorage.setItem('ev_token', idToken);

    try {
      const syncRes = await api.syncUser({
        name: additionalData.name || fbUser.displayName || 'EV Driver',
        phone: fbUser.phoneNumber,
        vehicles: additionalData.vehicles || []
      });
      if (syncRes.success && syncRes.user) {
        setUser(syncRes.user);
        return syncRes.user;
      }
    } catch (err) {
      console.error('[AuthContext] Phone sync error:', err.message);
    }

    const basicUser = {
      firebaseUid: fbUser.uid,
      name: additionalData.name || 'EV Driver',
      phone: fbUser.phoneNumber,
      email: fbUser.email || ''
    };
    setUser(basicUser);
    return basicUser;
  };

  // 6. Google Sign-In
  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        'Firebase is not yet configured with production API keys. Please check your Firebase configuration.'
      );
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    const fbUser = userCredential.user;
    const idToken = await fbUser.getIdToken();
    localStorage.setItem('ev_token', idToken);

    try {
      const syncRes = await api.syncUser({
        name: fbUser.displayName || 'EV User',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        avatar: fbUser.photoURL || ''
      });
      if (syncRes.success && syncRes.user) {
        setUser(syncRes.user);
        return syncRes.user;
      }
    } catch (err) {
      console.warn('[AuthContext] Google sync backend warning:', err.message);
    }

    const basicUser = {
      firebaseUid: fbUser.uid,
      name: fbUser.displayName || 'EV User',
      email: fbUser.email || '',
      phone: fbUser.phoneNumber || '',
      avatar: fbUser.photoURL || '',
      isEmailVerified: fbUser.emailVerified
    };
    setUser(basicUser);
    return basicUser;
  };

  // 7. Sign Out
  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      localStorage.removeItem('ev_token');
      setApiCurrentUser(null, null); // Clear per-user scoping
      setFirebaseUser(null);
      setUser(null);
    }
  };

  // 7. Update Profile
  const updateProfile = async (data) => {
    const res = await api.updateProfile(data);
    if (res.success && res.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Profile update failed');
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        loading,
        isAuthenticated: !!firebaseUser || !!user,
        roleView,
        switchRoleView,
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
