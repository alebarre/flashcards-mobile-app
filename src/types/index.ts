export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Adicionar campo de senha (não mostrar no front)
    createdAt: Date;
}

export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface AppState {
    user: User | null;
    flashcards: Flashcard[];
    currentCategory: string;
    users: User[]; // Lista de usuários cadastrados
}

// Tipo para dados de cadastro
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}