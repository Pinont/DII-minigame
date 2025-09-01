// Firebase configuration for DII Minigame
// @ts-ignore - CDN imports for browser compatibility
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// @ts-ignore - CDN imports for browser compatibility  
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Type declarations for Firebase (since we're using CDN imports)
declare global {
    interface Database {}
    interface DataSnapshot {
        val(): any;
        exists(): boolean;
        key: string | null;
        forEach(action: (a: DataSnapshot) => boolean | void): boolean;
    }
}

import type {
  FirebaseConfig,
} from './types/index.js';

const firebaseConfig: FirebaseConfig = {
  databaseURL: "https://dii-minigame-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "dii-minigame"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
