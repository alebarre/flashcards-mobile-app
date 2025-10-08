import axios from 'axios';
import { Flashcard, User } from '../types';

// Interfaces para as respostas da API JSONPlaceholder
interface Post {
    id: number;
    title: string;
    body: string;
    userId: number;
}

interface ApiUser {
    id: number;
    name: string;
    email: string;
    phone: string;
    website: string;
}

// Configuração base do axios
const api = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar headers CORS quando necessário
api.interceptors.request.use(
    (config) => {
        // Para desenvolvimento web, adicionar headers que podem ajudar com CORS
        if (__DEV__) {
            config.headers = {
                ...config.headers,
                'Accept': 'application/json',
                'Access-Control-Allow-Origin': '*',
            };
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);

        // Se for erro de CORS, usar mock data
        if (error.code === 'NETWORK_ERROR' || error.message.includes('CORS')) {
            console.log('Erro de CORS detectado, usando dados mock...');
            // Retornamos um objeto simulado que será tratado nos serviços
            throw new Error('CORS_ERROR');
        }

        return Promise.reject(error);
    }
);

// Dados mock para fallback
const mockFlashcards: Flashcard[] = [
    {
        id: '1',
        question: 'Quanto é 2 + 2?',
        answer: '4',
        category: 'math',
        difficulty: 'easy'
    },
    {
        id: '2',
        question: 'Quanto é 5 × 3?',
        answer: '15',
        category: 'math',
        difficulty: 'easy'
    },
    {
        id: '3',
        question: 'Qual é a capital do Brasil?',
        answer: 'Brasília',
        category: 'geography',
        difficulty: 'medium'
    },
    {
        id: '4',
        question: 'Quem escreveu "Dom Casmurro"?',
        answer: 'Machado de Assis',
        category: 'literature',
        difficulty: 'medium'
    },
    {
        id: '5',
        question: 'Qual é o elemento químico O?',
        answer: 'Oxigênio',
        category: 'science',
        difficulty: 'easy'
    },
    {
        id: '6',
        question: 'Em que ano o homem pisou na Lua?',
        answer: '1969',
        category: 'history',
        difficulty: 'hard'
    }
];

const mockUser: User = {
    id: '1',
    name: 'João Silva',
    email: 'joao@exemplo.com'
};

// Função auxiliar para converter Posts da API em Flashcards
function convertToFlashcards(posts: Post[]): Flashcard[] {
    const categories = ['math', 'science', 'history', 'geography', 'literature'];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];

    return posts.slice(0, 6).map((post, index) => ({
        id: post.id.toString(),
        question: post.title,
        answer: post.body.substring(0, 50) + '...',
        category: categories[index % categories.length],
        difficulty: difficulties[index % difficulties.length]
    }));
}

// Função auxiliar para converter ApiUser em User
function convertToUser(apiUser: ApiUser): User {
    return {
        id: apiUser.id.toString(),
        name: apiUser.name,
        email: apiUser.email
    };
}

// Função para detectar se estamos no ambiente web
const isWeb = (): boolean => {
    return typeof document !== 'undefined';
};

// Serviço para flashcards
export const flashcardService = {
    async getFlashcards(): Promise<Flashcard[]> {
        // No ambiente web, sempre use mock data para evitar CORS
        if (isWeb()) {
            console.log('Ambiente web detectado, usando dados mock...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return mockFlashcards;
        }

        // No mobile, tente a API real
        try {
            console.log('Tentando API real no mobile...');

            // ESPECIFICANDO O TIPO DA RESPOSTA - Isso resolve o erro TypeScript!
            const response = await api.get<Post[]>('/posts');

            // Agora response.data é do tipo Post[] (não mais unknown)
            const convertedFlashcards = convertToFlashcards(response.data);
            console.log('Dados convertidos da API:', convertedFlashcards.length, 'flashcards');

            return convertedFlashcards;
        } catch (error: any) {
            if (error.message === 'CORS_ERROR') {
                console.log('CORS bloqueado, usando dados mock...');
            } else {
                console.log('Erro na API, usando dados mock:', error.message);
            }

            // Fallback para dados mock
            await new Promise(resolve => setTimeout(resolve, 1000));
            return mockFlashcards;
        }
    },

    async getFlashcardsByCategory(category: string): Promise<Flashcard[]> {
        try {
            const allFlashcards = await flashcardService.getFlashcards();
            return allFlashcards.filter(card => card.category === category);
        } catch (error) {
            console.log('Erro ao filtrar por categoria, usando mock...');
            await new Promise(resolve => setTimeout(resolve, 500));
            return mockFlashcards.filter(card => card.category === category);
        }
    },
};

// Serviço para autenticação
export const authService = {
    async login(email: string, password: string): Promise<User> {
        try {
            // JSONPlaceholder não tem autenticação real, então simulamos
            console.log('Tentando autenticar via API...');

            // Primeiro teste de conexão - ESPECIFICANDO O TIPO
            await api.get<Post[]>('/posts');

            // Buscar usuário da API - ESPECIFICANDO O TIPO
            const response = await api.get<ApiUser>('/users/1');

            // Agora response.data é do tipo ApiUser (não mais unknown)
            const convertedUser = convertToUser(response.data);
            console.log('Usuário da API:', convertedUser);

            return convertedUser;
        } catch (error: any) {
            if (error.message === 'CORS_ERROR') {
                console.log('CORS bloqueado na autenticação, usando mock...');
            } else {
                console.log('Erro na autenticação, usando mock:', error.message);
            }

            // Fallback para mock
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (email && password) {
                return mockUser;
            }

            throw new Error('Email ou senha inválidos');
        }
    },
};

export default api;