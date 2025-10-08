import axios from 'axios';
import { Flashcard } from '../types';

// Interfaces para as respostas da API JSONPlaceholder
interface Post {
    id: number;
    title: string;
    body: string;
    userId: number;
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
            throw new Error('CORS_ERROR');
        }

        return Promise.reject(error);
    }
);

// Dados mock para fallback - AUMENTADOS para mais variedade
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
        question: 'Qual é a fórmula de Bhaskara?',
        answer: 'x = [-b ± √(b² - 4ac)] / 2a',
        category: 'math',
        difficulty: 'hard'
    },
    {
        id: '4',
        question: 'Qual é a capital do Brasil?',
        answer: 'Brasília',
        category: 'geography',
        difficulty: 'medium'
    },
    {
        id: '5',
        question: 'Qual o maior país do mundo em área territorial?',
        answer: 'Rússia',
        category: 'geography',
        difficulty: 'medium'
    },
    {
        id: '6',
        question: 'Quem escreveu "Dom Casmurro"?',
        answer: 'Machado de Assis',
        category: 'literature',
        difficulty: 'medium'
    },
    {
        id: '7',
        question: 'Qual é o elemento químico O?',
        answer: 'Oxigênio',
        category: 'science',
        difficulty: 'easy'
    },
    {
        id: '8',
        question: 'O que é fotossíntese?',
        answer: 'Processo pelo qual plantas convertem luz solar em energia',
        category: 'science',
        difficulty: 'medium'
    },
    {
        id: '9',
        question: 'Em que ano o homem pisou na Lua?',
        answer: '1969',
        category: 'history',
        difficulty: 'hard'
    },
    {
        id: '10',
        question: 'Quem foi o primeiro presidente do Brasil?',
        answer: 'Marechal Deodoro da Fonseca',
        category: 'history',
        difficulty: 'medium'
    },
    {
        id: '11',
        question: 'Qual é o plural de "cidadão"?',
        answer: 'Cidadãos',
        category: 'literature',
        difficulty: 'easy'
    },
    {
        id: '12',
        question: 'O que é uma metáfora?',
        answer: 'Figura de linguagem que compara duas coisas sem usar "como" ou "tal qual"',
        category: 'literature',
        difficulty: 'hard'
    }
];

// Função auxiliar para converter Posts da API em Flashcards
function convertToFlashcards(posts: Post[]): Flashcard[] {
    const categories = ['math', 'science', 'history', 'geography', 'literature'];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];

    return posts.slice(0, 12).map((post, index) => ({
        id: (post.id + 100).toString(), // +100 para não conflitar com IDs dos mocks
        question: `[API] ${post.title}`,
        answer: `[API] ${post.body.substring(0, 60)}...`,
        category: categories[index % categories.length],
        difficulty: difficulties[index % difficulties.length]
    }));
}

// Função para detectar se estamos no ambiente web
const isWeb = (): boolean => {
    return typeof document !== 'undefined';
};

// Serviço para flashcards - AGORA APENAS FLASHCARDS
export const flashcardService = {
    async getFlashcards(): Promise<Flashcard[]> {
        // No ambiente web, sempre use mock data para evitar CORS
        if (isWeb()) {
            console.log('Ambiente web detectado, usando dados mock...');
            await new Promise(resolve => setTimeout(resolve, 800));
            return mockFlashcards;
        }

        // No mobile, tente a API real
        try {
            console.log('Tentando API real no mobile...');

            // ESPECIFICANDO O TIPO DA RESPOSTA
            const response = await api.get<Post[]>('/posts');

            // Agora response.data é do tipo Post[] (não mais unknown)
            const convertedFlashcards = convertToFlashcards(response.data);
            console.log('Dados convertidos da API:', convertedFlashcards.length, 'flashcards');

            // Combinar dados da API com mocks para ter mais variedade
            const allFlashcards = [...mockFlashcards, ...convertedFlashcards];
            return allFlashcards;
        } catch (error: any) {
            if (error.message === 'CORS_ERROR') {
                console.log('CORS bloqueado, usando dados mock...');
            } else {
                console.log('Erro na API, usando dados mock:', error.message);
            }

            // Fallback para dados mock
            await new Promise(resolve => setTimeout(resolve, 800));
            return mockFlashcards;
        }
    },

    async getFlashcardsByCategory(category: string): Promise<Flashcard[]> {
        try {
            const allFlashcards = await flashcardService.getFlashcards();
            const filtered = allFlashcards.filter(card =>
                category === 'all' || card.category === category
            );
            console.log(`Filtrados ${filtered.length} flashcards para categoria: ${category}`);
            return filtered;
        } catch (error) {
            console.log('Erro ao filtrar por categoria, usando mock...');
            await new Promise(resolve => setTimeout(resolve, 500));
            return mockFlashcards.filter(card =>
                category === 'all' || card.category === category
            );
        }
    },

    // NOVO: Buscar flashcards por dificuldade
    async getFlashcardsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<Flashcard[]> {
        const allFlashcards = await flashcardService.getFlashcards();
        return allFlashcards.filter(card => card.difficulty === difficulty);
    },

    // NOVO: Buscar estatísticas
    async getFlashcardsStats() {
        const allFlashcards = await flashcardService.getFlashcards();

        const total = allFlashcards.length;
        const byCategory = allFlashcards.reduce((acc, card) => {
            acc[card.category] = (acc[card.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const byDifficulty = allFlashcards.reduce((acc, card) => {
            acc[card.difficulty] = (acc[card.difficulty] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total,
            byCategory,
            byDifficulty,
        };
    },
};

// O serviço de autenticação está em src/services/authService.ts

export default api;