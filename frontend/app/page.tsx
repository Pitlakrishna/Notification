"use client";

import { useState, useEffect } from "react";
import { requestFCMToken, onMessageListener } from "@/lib/firebase";

interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "success" | "info" | "alert";
}

export default function NotificationDashboard() {
  const [title, setTitle] = useState("Happy New Year! 🎉");
  const [message, setMessage] = useState("Wishing you a joyful and prosperous new year!");
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [fcmToken, setFcmToken] = useState<string>("");
  const [tokenLoading, setTokenLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Play a soft pleasant notification chime using Web Audio API
  const playNotificationSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext blocked or not supported
    }
  };

  // Trigger In-App Notification Popup
  const triggerInAppNotification = (
    notifTitle: string,
    notifMessage: string,
    type: "success" | "info" | "alert" = "info"
  ) => {
    playNotificationSound();

    const newNotif: InAppNotification = {
      id: Date.now().toString(),
      title: notifTitle,
      message: notifMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      type,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Also fire native desktop notification if permission is granted
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(notifTitle, {
        body: notifMessage,
        icon: "/next.svg",
      });
    }

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== newNotif.id));
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  // Listen for real-time Firebase Cloud Messaging (FCM) incoming messages
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    onMessageListener((payload) => {
      const notifTitle = payload.notification?.title || "Firebase Alert";
      const notifBody = payload.notification?.body || "New notification received from Firebase!";
      triggerInAppNotification(notifTitle, notifBody, "info");
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Request FCM Device Registration Token
  const handleGetFCMToken = async () => {
    setTokenLoading(true);
    try {
      const token = await requestFCMToken();
      if (token) {
        setFcmToken(token);
        triggerInAppNotification(
          "FCM Token Generated! 🔑",
          "Your device registration token is ready.",
          "success"
        );
      } else {
        triggerInAppNotification(
          "Permission Required",
          "Please allow notification permissions in your browser.",
          "alert"
        );
      }
    } catch (err) {
      console.error(err);
      triggerInAppNotification("Error", "Failed to retrieve FCM Token.", "alert");
    } finally {
      setTokenLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (!fcmToken) return;
    navigator.clipboard.writeText(fcmToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 flex flex-col items-center justify-start relative">
      {/* Floating In-App Notifications Container (Top-Right) */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-80 max-w-[90vw]">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-start justify-between p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
              notif.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                : notif.type === "alert"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                : "bg-blue-500/10 border-blue-500/30 text-blue-950 dark:text-blue-200"
            }`}
          >
            <div className="flex gap-3">
              <span className="text-xl">
                {notif.type === "success" ? "✅" : notif.type === "alert" ? "⚠️" : "🔔"}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm leading-tight">{notif.title}</h4>
                  <span className="text-[10px] opacity-60">{notif.timestamp}</span>
                </div>
                <p className="text-xs mt-1 opacity-90 leading-relaxed">{notif.message}</p>
              </div>
            </div>

            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-sm opacity-50 hover:opacity-100 transition-opacity ml-2 p-1 cursor-pointer"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg mt-10 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-6">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Firebase In-App Notifications</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Pure Firebase & In-App UI notifications (No SMS / TextBee needed)
              </p>
            </div>
            <span className="text-3xl">🔥</span>
          </div>
        </div>

        {/* Action: Trigger In-App Notification */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Notification Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Notification Message
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={() => triggerInAppNotification(title, message, "info")}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition text-white font-semibold text-sm shadow-md shadow-blue-500/20 cursor-pointer"
          >
            Show In-App Notification 🔔
          </button>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() =>
                triggerInAppNotification(
                  "🎉 Happy New Year 2026!",
                  "Wish you and your family a fantastic year ahead!",
                  "success"
                )
              }
              className="py-2 px-3 text-xs font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              🎉 Preset: New Year
            </button>
            <button
              onClick={() =>
                triggerInAppNotification(
                  "💬 New Chat Message",
                  "Sarah sent you a message: 'Hey, are you free?'",
                  "info"
                )
              }
              className="py-2 px-3 text-xs font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              💬 Preset: Chat Message
            </button>
          </div>
        </div>

        {/* Firebase Cloud Messaging (FCM) Token Section */}
        <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📲</span>
              <h3 className="font-semibold text-sm text-orange-950 dark:text-orange-200">
                Firebase Push Notification (FCM)
              </h3>
            </div>
            <button
              onClick={handleGetFCMToken}
              disabled={tokenLoading}
              className="text-xs px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium cursor-pointer transition disabled:opacity-50"
            >
              {tokenLoading ? "Getting..." : fcmToken ? "Refresh Token" : "Get Device Token"}
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Click to generate your browser’s unique FCM Token to send push notifications from the Firebase Console.
          </p>

          {fcmToken && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase">
                  Your Device Token:
                </span>
                <button
                  onClick={handleCopyToken}
                  className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline"
                >
                  {copied ? "Copied! ✓" : "Copy Token"}
                </button>
              </div>
              <p className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] break-all border border-zinc-200 dark:border-zinc-700 max-h-24 overflow-y-auto">
                {fcmToken}
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] text-zinc-400">
          Firebase Project: <code className="text-orange-500 font-mono">notification-ca025</code>
        </div>
      </div>
    </div>
  );
}
