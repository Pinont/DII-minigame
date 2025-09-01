export interface DebugChallengeQuestion {
  id: number;
  question: string;
  description: string;
  code: string;
  codepath: string;
  language: string;
  functionName: string;
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

// Firebase types
export interface FirebaseConfig {
  databaseURL: string;
  projectId: string;
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

