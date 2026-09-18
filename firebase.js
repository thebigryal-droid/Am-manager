/* =========================================================
   RYAL MANAGEMENT OS — FACILITY EXECUTIVE OS
   FIREBASE ADAPTER & OFFLINE PERSISTENCE ENGINE
   Project: rfth-pro
   ========================================================= */

(function (window) {
    "use strict";

    const firebaseConfig = {
        apiKey: "AIzaSyCCB71JtHMCWCG4kNs6XkcGYwvu-2k8JiQ",
        authDomain: "rfth-pro.firebaseapp.com",
        projectId: "rfth-pro",
        storageBucket: "rfth-pro.firebasestorage.app",
        messagingSenderId: "494901173654",
        appId: "1:494901173654:web:5ab8a4f4435eaf2d60d1b7"
    };

    const FXFirebase = {
        config: firebaseConfig,
        app: null,
        db: null,
        auth: null,
        isInitialized: false,
        isOffline: !navigator.onLine,

        init: function () {
            if (this.isInitialized) return this;

            if (typeof firebase === 'undefined') {
                console.error("Firebase SDK not found. Ensure compat SDKs are loaded in HTML.");
                return this;
            }

            // Initialize App
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(firebaseConfig);
            } else {
                this.app = firebase.app();
            }

            // Initialize Auth and Firestore
            this.auth = firebase.auth();
            this.db = firebase.firestore();

            // Enable Multi-Tab Offline Persistence
            this.db.enablePersistence({ synchronizeTabs: true })
                .then(() => {
                    console.log("Firestore offline persistence enabled successfully.");
                    this.updateSyncBadge("Offline Cache Active", "bg-blue-100 text-blue-700");
                })
                .catch((err) => {
                    if (err.code === 'failed-precondition') {
                        console.warn("Offline persistence failed: Multiple tabs open simultaneously.");
                    } else if (err.code === 'unimplemented') {
                        console.warn("Offline persistence not supported by this browser.");
                    } else {
                        console.error("Firestore persistence error:", err);
                    }
                });

            // Network Connectivity Monitoring
            window.addEventListener('online', () => {
                this.isOffline = false;
                this.updateSyncBadge("Connected (Online)", "bg-green-100 text-green-700");
            });

            window.addEventListener('offline', () => {
                this.isOffline = true;
                this.updateSyncBadge("Offline Mode", "bg-amber-100 text-amber-700");
            });

            this.isInitialized = true;
            return this;
        },

        updateSyncBadge: function (text, colorClasses) {
            const badge = document.getElementById('syncStatus');
            if (badge) {
                badge.innerText = text;
                badge.className = `text-xs px-2 py-1 rounded-full font-medium ${colorClasses}`;
            }
        }
    };

    // Export globally
    window.FXFirebase = FXFirebase.init();
})(window);
