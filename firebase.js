/* Facility Executive OS — Firebase adapter and authentication foundation (Phase 1, Step 5C) */
(function () {
  "use strict";

  const config = {
    apiKey: "AIzaSyCQpOgjjwsWRjLrckZxBtVgdFTYdjoPJBA",
    authDomain: "client-perspective.firebaseapp.com",
    projectId: "client-perspective",
    storageBucket: "client-perspective.firebasestorage.app",
    messagingSenderId: "389142464497",
    appId: "1:389142464497:web:4e9663528a11ae3908a650"
  };

  const state = {
    status: "not-initialized",
    app: null,
    db: null,
    auth: null,
    modules: null,
    authModule: null,
    error: null,
    user: null,
    lastTest: null
  };

  const firebase = (window.FXFirebase = window.FXFirebase || {});
  firebase.config = Object.assign({}, config);
  firebase.state = state;

  function emit(eventName, detail) {
    window.dispatchEvent(new CustomEvent("fx:firebase:" + eventName, { detail: detail || {} }));
  }

  function setStatus(status, error) {
    state.status = status;
    state.error = error || null;
    emit("status", firebase.getStatus());
  }

  firebase.isConfigured = function () {
    return Boolean(config.apiKey && config.projectId && config.appId);
  };

  firebase.getStatus = function () {
    return Object.assign({}, state);
  };

  firebase.getFirestore = function () {
    return state.db;
  };

  firebase.getAuth = function () {
    return state.auth;
  };

  firebase.getCurrentUser = function () {
    return state.user;
  };

  firebase.initialize = async function () {
    if (state.status === "ready" || state.status === "loading") return state;
    if (!firebase.isConfigured()) {
      setStatus("not-configured");
      return state;
    }

    setStatus("loading");

    try {
      const appModule = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js");
      const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js");
      const authModule = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js");

      state.modules = firestoreModule;
      state.authModule = authModule;
      state.app = appModule.initializeApp(config);
      state.db = firestoreModule.getFirestore(state.app);
      state.auth = authModule.getAuth(state.app);

      authModule.onAuthStateChanged(state.auth, function (user) {
        state.user = user || null;
        emit("auth", { user: state.user });
      });

      setStatus("ready");
      emit("ready", { app: state.app, db: state.db, auth: state.auth });
    } catch (error) {
      setStatus("error", error);
      emit("error", { error: error });
      console.error("Facility OS Firebase initialization failed:", error);
    }

    return state;
  };

  firebase.signInWithEmailAndPassword = async function (email, password) {
    if (state.status !== "ready") await firebase.initialize();
    if (!state.auth || !state.authModule) throw new Error("Firebase Authentication is not ready.");
    if (!email || !password) throw new Error("Email and password are required.");
    const result = await state.authModule.signInWithEmailAndPassword(state.auth, email, password);
    state.user = result.user || null;
    emit("auth", { user: state.user });
    return result;
  };

  firebase.onAuthStateChanged = function (callback) {
    if (typeof callback !== "function") return function () {};
    const handler = function (event) { callback(event.detail && event.detail.user ? event.detail.user : null); };
    window.addEventListener("fx:firebase:auth", handler);
    callback(state.user);
    return function () { window.removeEventListener("fx:firebase:auth", handler); };
  };

  firebase.signOut = async function () {
    if (!state.auth || !state.authModule) return;
    await state.authModule.signOut(state.auth);
    state.user = null;
    emit("auth", { user: null });
  };

  firebase.testConnection = async function () {
    if (state.status !== "ready") await firebase.initialize();
    if (state.status !== "ready" || !state.db || !state.modules) {
      const error = new Error("Firebase is not ready.");
      state.lastTest = { ok: false, timestamp: new Date().toISOString(), error: error.message };
      emit("test", state.lastTest);
      return state.lastTest;
    }

    try {
      const testRef = state.modules.doc(state.db, "_fx_system", "connectivity");
      await state.modules.setDoc(testRef, {
        application: "Facility Executive OS",
        purpose: "connectivity-test",
        testedAt: new Date().toISOString()
      }, { merge: true });
      const snapshot = await state.modules.getDoc(testRef);
      state.lastTest = {
        ok: snapshot.exists(),
        timestamp: new Date().toISOString(),
        path: "_fx_system/connectivity"
      };
    } catch (error) {
      state.lastTest = { ok: false, timestamp: new Date().toISOString(), error: error.message };
    }

    emit("test", state.lastTest);
    return state.lastTest;
  };

  firebase.initialize();
})();
