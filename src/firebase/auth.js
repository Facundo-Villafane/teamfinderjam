// src/firebase/auth.js
import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut,
    onAuthStateChanged
  } from 'firebase/auth';
  import { auth } from './config';
  
  const googleProvider = new GoogleAuthProvider();
  
  export const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };
  
  export const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };
  
  export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
  };
  
  export { auth };