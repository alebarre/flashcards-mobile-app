import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, RegisterData } from '../types';

const USERS_STORAGE_KEY = '@flashcards_users';
const CURRENT_USER_KEY = '@flashcards_current_user';

export const authService = {
    // Buscar usuários do storage
    async getUsers(): Promise<User[]> {
        try {
            const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY);
            return usersJson ? JSON.parse(usersJson) : [];
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            return [];
        }
    },

    // Salvar usuários no storage
    async saveUsers(users: User[]): Promise<void> {
        try {
            await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } catch (error) {
            console.error('Erro ao salvar usuários:', error);
            throw new Error('Erro ao salvar dados do usuário');
        }
    },

    // Cadastrar novo usuário
    async register(userData: RegisterData): Promise<User> {
        const { name, email, password, confirmPassword } = userData;

        // Validações
        if (!name || !email || !password) {
            throw new Error('Todos os campos são obrigatórios');
        }

        if (password !== confirmPassword) {
            throw new Error('As senhas não coincidem');
        }

        if (password.length < 6) {
            throw new Error('A senha deve ter pelo menos 6 caracteres');
        }

        const users = await authService.getUsers();

        // Verificar se email já existe
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            throw new Error('Este email já está cadastrado');
        }

        // Criar novo usuário
        const newUser: User = {
            id: Date.now().toString(),
            name,
            email,
            password, // Em app real, isso seria hasheado
            createdAt: new Date(),
        };

        // Adicionar à lista e salvar
        users.push(newUser);
        await authService.saveUsers(users);

        // Retornar usuário sem a senha
        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword as User;
    },

    // Login
    async login(email: string, password: string): Promise<User> {
        if (!email || !password) {
            throw new Error('Email e senha são obrigatórios');
        }

        const users = await authService.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            throw new Error('Email ou senha inválidos');
        }

        // Salvar usuário atual
        const { password: _, ...userWithoutPassword } = user;
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

        return userWithoutPassword as User;
    },

    // Logout
    async logout(): Promise<void> {
        try {
            await AsyncStorage.removeItem(CURRENT_USER_KEY);
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    },

    // Verificar se usuário está logado
    async getCurrentUser(): Promise<User | null> {
        try {
            const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
            return userJson ? JSON.parse(userJson) : null;
        } catch (error) {
            console.error('Erro ao buscar usuário atual:', error);
            return null;
        }
    },

    // Buscar usuário por ID (para perfil)
    async getUserById(id: string): Promise<User | null> {
        const users = await authService.getUsers();
        const user = users.find(u => u.id === id);
        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        }
        return null;
    },
};