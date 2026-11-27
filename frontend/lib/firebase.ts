import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  Messaging,
  MessagePayload,
} from "firebase/messaging";

export const firebaseConfig = {
  apiKey: "AIzaSyAw3A6Ke8YGPQBEfwuTkJfCiqAcTxErjRY",
  authDomain: "notification-ca025.firebaseapp.com",
  projectId: "notification-ca025",
  storageBucket: "notification-ca025.firebasestorage.app",
  messagingSenderId: "469518941212",
  appId: "1:469518941212:web:0f6d7784a1f6ea8fecb3d9",
  measurementId: "G-3SH40B29QC",
};

// Initialize Firebase once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get FCM Token for this browser/device
export const requestFCMToken = async (vapidKey?: string): Promise<string | null> => {
  if (typeof window === "undefined" || !("Notification" in window)) return null;

  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("Firebase Messaging is not supported in this browser.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission was denied.");
      return null;
    }

    const messaging = getMessaging(app);
    // Registers with service worker
    const currentToken = await getToken(messaging, vapidKey ? { vapidKey } : undefined);
    return currentToken;
  } catch (error) {
    console.error("Error retrieving FCM registration token:", error);
    return null;
  }
};

// Listen for incoming messages while app is open in foreground
export const onMessageListener = async (
  callback: (payload: MessagePayload) => void
) => {
  if (typeof window === "undefined") return () => { };
  try {
    const supported = await isSupported();
    if (!supported) return () => { };

    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      callback(payload);
    });
  } catch (err) {
    console.error("Error setting up onMessage listener:", err);
    return () => { };
  }
};
