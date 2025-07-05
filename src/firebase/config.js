// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Tu configuración de Firebase (reemplaza con la tuya)
const firebaseConfig = {
    apiKey: "AIzaSyBGSy9dFwuK-BvLdpQ0KwhQw4WOdPjK9Jw",
    authDomain: "teamfinder-480ef.firebaseapp.com",
    projectId: "teamfinder-480ef",
    storageBucket: "teamfinder-480ef.firebasestorage.app",
    messagingSenderId: "86107381844",
    appId: "1:86107381844:web:886a1b617bb45ad0764dc1"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;