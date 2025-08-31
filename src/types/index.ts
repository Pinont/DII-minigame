// Global type definitions for DII Minigame project

export interface Player {
  playerId: string;
  playerName: string;
  joinedAt: number;
  status: 'connected' | 'disconnected' | 'playing';
}

export interface GameSession {
  joinCode: string;
  gameType: GameType;
  settings: GameSettings;
  status: GameStatus;
  players: Record<string, Player>;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
  removeAt?: number; // Auto-removal timestamp
}

export type GameType = 'debug_challenge' | 'code_typing' | 'logic';

export type GameStatus = 'waiting' | 'active' | 'finished';

export interface GameSettings {
  gameType: GameType;
  selectedQuizzes?: number[];
  selectedQuizNames?: string[];
  totalQuestions?: number;
  timeLimit?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface DebugChallengeQuestion {
  id: number;
  question: string;
  description: string;
  code: string;
  codepath: string;
  language: string;
  functionName: string;
  expected_output: any;
  testcases: TestCase[];
  hints?: string[];
}

export interface TestCase {
  input: any;
  expected: any;
  description: string;
}

export interface QuizData {
  debug_challenge: {
    questions: DebugChallengeQuestion[];
  };
}

export interface GameDatabase {
  generateJoinCode(): string;
  createGameSession(gameType: GameType, settings?: GameSettings): Promise<{
    success: boolean;
    joinCode?: string;
    sessionData?: GameSession;
    error?: string;
  }>;
  joinGame(joinCode: string, playerId: string, playerName: string): Promise<{
    success: boolean;
    error?: string;
  }>;
  getGameSession(joinCode: string): Promise<{
    success: boolean;
    session?: GameSession;
    error?: string;
  }>;
  listenToPlayers(joinCode: string, callback: (players: Record<string, Player>) => void): () => void;
  listenToGameSession(joinCode: string, callback: (session: GameSession | null) => void): () => void;
  startGame(joinCode: string): Promise<{ success: boolean; error?: string }>;
  endGame(joinCode: string, results?: any): Promise<{ success: boolean; error?: string }>;
  removePlayer(joinCode: string, playerId: string): Promise<{ success: boolean; error?: string }>;
  updatePlayerStatus(joinCode: string, playerId: string, status: Player['status']): Promise<{ success: boolean; error?: string }>;
  getActiveGames(): Promise<{ success: boolean; games?: GameSession[]; error?: string }>;
  cleanupExpiredGames(): Promise<{ success: boolean; removed?: number; error?: string }>;
}

// Global window object extensions
declare global {
  interface Window {
    gameDB: GameDatabase;
  }
}

// Firebase types
export interface FirebaseConfig {
  databaseURL: string;
  projectId: string;
}

// UI Event types
export interface UIEvents {
  onGameSelect: (gameType: GameType) => void;
  onQuizSelect: (quizIds: number[]) => void;
  onGameStart: () => void;
  onGameEnd: () => void;
  onPlayerJoin: (player: Player) => void;
  onPlayerLeave: (playerId: string) => void;
}

// Debug Challenge specific types
export interface DebugChallengeState {
  editor: monaco.editor.IStandaloneCodeEditor | null;
  startTime: number | null;
  timerInterval: NodeJS.Timeout | null;
  currentChallenge: DebugChallengeQuestion | null;
}

export interface DebugChallengeResult {
  passedTests: number;
  totalTests: number;
  percentage: number;
  allPassed: boolean;
  errors: string[];
}

export interface TerminalMessage {
  type: 'log' | 'success' | 'error' | 'hint';
  content: string;
  timestamp?: string;
}

// Monaco Editor types (for debug challenge)
declare global {
  namespace monaco {
    namespace editor {
      interface IStandaloneCodeEditor {
        getValue(): string;
        setValue(value: string): void;
        updateOptions(options: any): void;
        addCommand(keybinding: number, handler: () => void): void;
        onDidChangeModelContent(listener: () => void): void;
      }
      
      function create(
        domElement: HTMLElement,
        options: any
      ): IStandaloneCodeEditor;
    }
    
    namespace languages {
      function setMonarchTokensProvider(languageId: string, language: any): void;
    }
    
    enum KeyMod {
      CtrlCmd = 2048,
      Shift = 1024,
      Alt = 512,
      WinCtrl = 256
    }
    
    enum KeyCode {
      Enter = 3,
      KeyS = 49,
      KeyC = 33
    }
  }
  
  interface Window {
    eval(code: string): any;
  }
}

export { };

