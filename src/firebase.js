import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Boolean(firebaseConfig.apiKey);

function getFirebaseApp() {
  if (!hasFirebaseConfig) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables."
    );
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirebaseStorage() {
  return getStorage(getFirebaseApp());
}

/** Lazy proxies so importing this module during `next build` does not init Firebase. */
export const auth = new Proxy(
  {},
  {
    get(_target, prop) {
      const instance = getFirebaseAuth();
      const value = instance[prop];
      return typeof value === "function" ? value.bind(instance) : value;
    },
  }
);

export const storage = new Proxy(
  {},
  {
    get(_target, prop) {
      const instance = getFirebaseStorage();
      const value = instance[prop];
      return typeof value === "function" ? value.bind(instance) : value;
    },
  }
);
