import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { AppState, User, Flashcard } from "../types";
import { authService } from "../services/authService";

type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_FLASHCARDS"; payload: Flashcard[] }
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SET_USERS"; payload: User[] };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  user: null,
  flashcards: [],
  currentCategory: "all",
  users: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_FLASHCARDS":
      return { ...state, flashcards: action.payload || [] };
    case "SET_CATEGORY":
      return { ...state, currentCategory: action.payload };
    case "SET_USERS":
      return { ...state, users: action.payload };
    case "LOGOUT":
      return initialState;
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Verificar se usuário já está logado ao iniciar o app
  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          dispatch({ type: "SET_USER", payload: user });
        }
      } catch (error) {
        console.error("Erro ao verificar usuário logado:", error);
      }
    };

    checkLoggedInUser();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
