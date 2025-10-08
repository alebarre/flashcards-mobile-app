import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { AppState, User, Flashcard } from "../types";

type AppAction =
  | { type: "SET_USER"; payload: User }
  | { type: "SET_FLASHCARDS"; payload: Flashcard[] }
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "LOGOUT" };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Estado inicial
const initialState: AppState = {
  user: null,
  flashcards: [], // Começa com array vazio
  currentCategory: "all",
};

// Reducer para gerenciar estado
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_FLASHCARDS":
      return { ...state, flashcards: action.payload || [] };
    case "SET_CATEGORY":
      return { ...state, currentCategory: action.payload };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        flashcards: [],
        currentCategory: "all",
      };
    default:
      return state;
  }
}

// Provider do Context
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook personalizado para usar o Context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
