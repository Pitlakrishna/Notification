// Scripts for Firebase Messaging Service Worker
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAw3A6Ke8YGPQBEfwuTkJfCiqAcTxErjRY",
  authDomain: "notification-ca025.firebaseapp.com",
  projectId: "notification-ca025",
  storageBucket: "notification-ca025.firebasestorage.app",
  messagingSenderId: "469518941212",
  appId: "1:469518941212:web:0f6d7784a1f6ea8fecb3d9",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message: ", payload);
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new update.",
    icon: "/next.svg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
