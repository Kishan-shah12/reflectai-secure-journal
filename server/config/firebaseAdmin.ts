import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || firebaseConfig.projectId || 'gen-lang-client-0094922884';

let adminApp: App;

if (getApps().length === 0) {
  adminApp = initializeApp({
    projectId: projectId,
  });
} else {
  adminApp = getApps()[0];
}

export const adminAuth: Auth = getAuth(adminApp);
export default adminApp;
