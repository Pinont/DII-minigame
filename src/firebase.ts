// Firebase configuration for DII Minigame
// @ts-ignore - CDN imports for browser compatibility
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// @ts-ignore - CDN imports for browser compatibility  
import { get, getDatabase, onValue, ref, remove, set, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
    GameSession,
    GameSettings,
    GameType,
    GameDatabase as IGameDatabase,
    Player
} from './types/index.js';

const firebaseConfig: FirebaseConfig = {
  databaseURL: "https://dii-minigame-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "dii-minigame"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Game Database Helper Class
class GameDatabase implements IGameDatabase {
  private db: Database;

  constructor() {
    this.db = database;
  }

  // Generate a 6-digit join code
  generateJoinCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Create a new game session
  async createGameSession(
    gameType: GameType, 
    settings: GameSettings = {} as GameSettings
  ): Promise<{
    success: boolean;
    joinCode?: string;
    sessionData?: GameSession;
    error?: string;
  }> {
    const joinCode = this.generateJoinCode();
    const now = Date.now();
    const fourHoursInMs = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    
    const sessionData: GameSession = {
      joinCode,
      gameType,
      settings: { ...settings, gameType },
      status: 'waiting',
      players: {},
      createdAt: now,
      startedAt: null,
      finishedAt: null,
      removeAt: now + fourHoursInMs // Auto-remove after 4 hours
    };

    try {
      await set(ref(this.db, `gameSessions/${joinCode}`), sessionData);
      console.log('Game session created with join code:', joinCode);
      return { success: true, joinCode, sessionData };
    } catch (error) {
      console.error('Error creating game session:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Player joins a game
  async joinGame(
    joinCode: string, 
    playerId: string, 
    playerName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if game session exists
      const sessionSnapshot = await get(ref(this.db, `gameSessions/${joinCode}`));
      if (!sessionSnapshot.exists()) {
        return { success: false, error: 'Game session not found' };
      }

      const session = sessionSnapshot.val() as GameSession;
      if (session.status !== 'waiting') {
        return { success: false, error: 'Game has already started' };
      }

      // Add player to the game
      const playerData: Player = {
        playerId,
        playerName,
        joinedAt: Date.now(),
        status: 'connected'
      };

      await set(ref(this.db, `gameSessions/${joinCode}/players/${playerId}`), playerData);
      console.log(`Player ${playerName} joined game ${joinCode}`);
      return { success: true };
    } catch (error) {
      console.error('Error joining game:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Start a game
  async startGame(joinCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      const updates = {
        [`gameSessions/${joinCode}/status`]: 'active',
        [`gameSessions/${joinCode}/startedAt`]: Date.now()
      };
      
      await update(ref(this.db), updates);
      console.log(`Game ${joinCode} started`);
      return { success: true };
    } catch (error) {
      console.error('Error starting game:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Get game session data
  async getGameSession(joinCode: string): Promise<{
    success: boolean;
    session?: GameSession;
    error?: string;
  }> {
    try {
      const snapshot = await get(ref(this.db, `gameSessions/${joinCode}`));
      if (snapshot.exists()) {
        return { success: true, session: snapshot.val() as GameSession };
      } else {
        return { success: false, error: 'Game session not found' };
      }
    } catch (error) {
      console.error('Error getting game session:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Listen to players in a game session
  listenToPlayers(
    joinCode: string, 
    callback: (players: Record<string, Player>) => void
  ): () => void {
    const playersRef = ref(this.db, `gameSessions/${joinCode}/players`);
    
    const unsubscribe = onValue(playersRef, (snapshot: DataSnapshot) => {
      const players = snapshot.val() || {};
      callback(players);
    });

    return unsubscribe;
  }

  // Listen to game session changes
  listenToGameSession(
    joinCode: string, 
    callback: (session: GameSession | null) => void
  ): () => void {
    const sessionRef = ref(this.db, `gameSessions/${joinCode}`);
    
    const unsubscribe = onValue(sessionRef, (snapshot: DataSnapshot) => {
      const session = snapshot.exists() ? snapshot.val() as GameSession : null;
      callback(session);
    });

    return unsubscribe;
  }

  // End a game
  async endGame(
    joinCode: string, 
    results: any = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updates = {
        [`gameSessions/${joinCode}/status`]: 'finished',
        [`gameSessions/${joinCode}/finishedAt`]: Date.now(),
        [`gameSessions/${joinCode}/results`]: results
      };
      
      await update(ref(this.db), updates);
      console.log(`Game ${joinCode} ended`);
      return { success: true };
    } catch (error) {
      console.error('Error ending game:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Remove a player from the game
  async removePlayer(
    joinCode: string, 
    playerId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await remove(ref(this.db, `gameSessions/${joinCode}/players/${playerId}`));
      console.log(`Player ${playerId} removed from game ${joinCode}`);
      return { success: true };
    } catch (error) {
      console.error('Error removing player:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Update player status
  async updatePlayerStatus(
    joinCode: string, 
    playerId: string, 
    status: Player['status']
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await update(ref(this.db), {
        [`gameSessions/${joinCode}/players/${playerId}/status`]: status
      });
      console.log(`Player ${playerId} status updated to ${status}`);
      return { success: true };
    } catch (error) {
      console.error('Error updating player status:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Get all active game sessions
  async getActiveGames(): Promise<{
    success: boolean;
    games?: GameSession[];
    error?: string;
  }> {
    try {
      const snapshot = await get(ref(this.db, 'gameSessions'));
      if (snapshot.exists()) {
        const allGames = snapshot.val() as Record<string, GameSession>;
        const activeGames = Object.values(allGames).filter(
          game => game.status === 'waiting' || game.status === 'active'
        );
        return { success: true, games: activeGames };
      } else {
        return { success: true, games: [] };
      }
    } catch (error) {
      console.error('Error getting active games:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Clean up expired games based on removeAt timestamp
  async cleanupExpiredGames(): Promise<{
    success: boolean;
    removed?: number;
    error?: string;
  }> {
    try {
      const snapshot = await get(ref(this.db, 'gameSessions'));
      if (!snapshot.exists()) {
        return { success: true, removed: 0 };
      }

      const allGames = snapshot.val() as Record<string, GameSession>;
      const currentTime = Date.now();
      let removedCount = 0;

      const updates: Record<string, null> = {};
      
      for (const [joinCode, game] of Object.entries(allGames)) {
        // Remove games that have passed their removeAt timestamp
        if (game.removeAt && currentTime >= game.removeAt) {
          updates[`gameSessions/${joinCode}`] = null;
          removedCount++;
        }
      }

      if (removedCount > 0) {
        await update(ref(this.db), updates);
      }

      console.log(`Cleaned up ${removedCount} expired games`);
      return { success: true, removed: removedCount };
    } catch (error) {
      console.error('Error cleaning up games:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}

// Create global instance
const gameDB = new GameDatabase();

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).gameDB = gameDB;
}

export default gameDB;
export { GameDatabase };
