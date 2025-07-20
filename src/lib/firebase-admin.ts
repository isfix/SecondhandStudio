import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let app;
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
  app = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  app = getApp();
}

export const adminAuth = getAuth(app); 