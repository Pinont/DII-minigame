// Firebase configuration for DII Minigame
// @ts-ignore - CDN imports for browser compatibility
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// @ts-ignore - CDN imports for browser compatibility  
import { get, getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

export function createGame(gameType: string, gameCode: string): void {
  const newGameRef = ref(database, "gameSessions/" + gameCode);
  set(newGameRef, {
    gameType: gameType,
    gameCode: gameCode,
    players: [],
  }).then(() => {
    console.log("Game created successfully");
  }).catch((error: any) => {
    console.error("Error creating game:", error);
  });
}

export function getGameType(gameCode: string): Promise<{ gameType: string } | null> {
  const pathRef = ref(database, "gameSessions/" + gameCode);
  return get(pathRef)
    .then((data: { exists: () => any; val: () => any; }) => {
      if (data.exists()) {
        return { gameType: data.val().gameType };
      }
      return null;
    })
    .catch((error: any) => {
      console.error(error);
    });
}

export { app, database };

