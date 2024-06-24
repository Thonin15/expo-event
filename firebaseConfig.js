import { initializeApp, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
	getAuth,
	getReactNativePersistence,
	initializeAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
const firebaseConfig = {
	apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
	databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
	projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MSG_SENDER_ID,
	appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const firebaseAuth = initializeAuth(app, {
	persistence: getReactNativePersistence(AsyncStorage),
});
export { app, firebaseAuth, getApp, getAuth, firestore };
