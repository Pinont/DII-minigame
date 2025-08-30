// Firebase configuration for DII Minigame
const firebaseConfig = {
  databaseURL: "https://dii-minigame-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "dii-minigame"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  onValue, 
  push, 
  update, 
  remove,
  child 
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Game Database Helper Class
class GameDatabase {
  constructor() {
    this.db = database;
  }

  // Generate a 6-digit join code
  generateJoinCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Create a new game session
  async createGameSession(gameType, settings = {}) {
    const joinCode = this.generateJoinCode();
    const sessionData = {
      joinCode,
      gameType,
      settings,
      status: 'waiting', // waiting, active, finished
      players: {},
      createdAt: Date.now(),
      startedAt: null,
      finishedAt: null
    };

    try {
      await set(ref(this.db, `gameSessions/${joinCode}`), sessionData);
      console.log('Game session created with join code:', joinCode);
      return { success: true, joinCode, sessionData };
    } catch (error) {
      console.error('Error creating game session:', error);
      return { success: false, error: error.message };
    }
  }

  // Player joins a game
  async joinGame(joinCode, playerId, playerName) {
    try {
      // Check if session exists
      const sessionSnapshot = await get(ref(this.db, `gameSessions/${joinCode}`));
      
      if (!sessionSnapshot.exists()) {
        return { success: false, error: 'Game session not found' };
      }

      const session = sessionSnapshot.val();
      if (session.status !== 'waiting') {
        return { success: false, error: 'Game has already started' };
      }

      // Add player to session
      const playerData = {
        playerId,
        playerName,
        joinedAt: Date.now(),
        status: 'connected',
        score: 0,
        progress: {}
      };

      await set(ref(this.db, `gameSessions/${joinCode}/players/${playerId}`), playerData);
      console.log('Player joined:', playerName);
      return { success: true, playerData };
    } catch (error) {
      console.error('Error joining game:', error);
      return { success: false, error: error.message };
    }
  }

  // Start the game
  async startGame(joinCode) {
    try {
      const updates = {
        [`gameSessions/${joinCode}/status`]: 'active',
        [`gameSessions/${joinCode}/startedAt`]: Date.now()
      };
      
      await update(ref(this.db), updates);
      console.log('Game started for session:', joinCode);
      return { success: true };
    } catch (error) {
      console.error('Error starting game:', error);
      return { success: false, error: error.message };
    }
  }

  // Update player progress
  async updatePlayerProgress(joinCode, playerId, progress) {
    try {
      await update(ref(this.db, `gameSessions/${joinCode}/players/${playerId}`), {
        progress,
        lastUpdated: Date.now()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating player progress:', error);
      return { success: false, error: error.message };
    }
  }

  // Update player score
  async updatePlayerScore(joinCode, playerId, score) {
    try {
      await update(ref(this.db, `gameSessions/${joinCode}/players/${playerId}`), {
        score,
        lastUpdated: Date.now()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating player score:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen to game session changes
  listenToGameSession(joinCode, callback) {
    const sessionRef = ref(this.db, `gameSessions/${joinCode}`);
    return onValue(sessionRef, (snapshot) => {
      const session = snapshot.val();
      callback(session);
    });
  }

  // Listen to players in a session
  listenToPlayers(joinCode, callback) {
    const playersRef = ref(this.db, `gameSessions/${joinCode}/players`);
    return onValue(playersRef, (snapshot) => {
      const players = snapshot.val() || {};
      callback(players);
    });
  }

  // Get game session data
  async getGameSession(joinCode) {
    try {
      const snapshot = await get(ref(this.db, `gameSessions/${joinCode}`));
      if (snapshot.exists()) {
        return { success: true, session: snapshot.val() };
      } else {
        return { success: false, error: 'Session not found' };
      }
    } catch (error) {
      console.error('Error getting game session:', error);
      return { success: false, error: error.message };
    }
  }

  // End the game
  async endGame(joinCode, results = {}) {
    try {
      const updates = {
        [`gameSessions/${joinCode}/status`]: 'finished',
        [`gameSessions/${joinCode}/finishedAt`]: Date.now(),
        [`gameSessions/${joinCode}/results`]: results
      };
      
      await update(ref(this.db), updates);
      console.log('Game ended for session:', joinCode);
      return { success: true };
    } catch (error) {
      console.error('Error ending game:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove a player from the game
  async removePlayer(joinCode, playerId) {
    try {
      await remove(ref(this.db, `gameSessions/${joinCode}/players/${playerId}`));
      return { success: true };
    } catch (error) {
      console.error('Error removing player:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete entire game session
  async deleteGameSession(joinCode) {
    try {
      await remove(ref(this.db, `gameSessions/${joinCode}`));
      return { success: true };
    } catch (error) {
      console.error('Error deleting game session:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create global instance
window.gameDB = new GameDatabase();

console.log('Firebase Database initialized successfully');
