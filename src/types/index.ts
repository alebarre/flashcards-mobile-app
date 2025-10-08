export interface User {
    id: string;
    name: string;
    email: string;
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
}