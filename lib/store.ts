import { create } from 'zustand';
import { User, Quest, Submission, FilterOptions } from './types';
import { QuestService } from './services';
import { AuthService } from './api/auth';
import { tokenStorage } from './api/client';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Quests
  quests: Quest[];
  selectedQuest: Quest | null;
  filters: FilterOptions;
  
  // Submissions
  submissions: Submission[];
  
  // UI
  theme: Theme;
  sidebarOpen: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loadCurrentUser: () => Promise<void>;
  setUser: (user: User) => void;
  loadQuests: () => Promise<void>;
  setSelectedQuest: (quest: Quest | null) => void;
  updateFilters: (filters: Partial<FilterOptions>) => void;
  submitQuest: (questId: string, content: any) => Promise<void>;
  loadSubmissions: () => Promise<void>;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
}

type Theme = 'light' | 'dark';

const useStore = create<AppState>((set, get) => ({
  // Initial state - check for token on initialization to prevent login page flash
  user: null,
  isAuthenticated: typeof window !== 'undefined' && 
    (!!localStorage.getItem('auth_token') || 
     !!document.cookie.includes('hq_access_token')),
  isLoading: false,
  quests: [],
  selectedQuest: null,
  filters: {
    categories: [],
    difficulties: [],
    search: '',
    showCompleted: false
  },
  submissions: [],
  theme: 'dark',
  sidebarOpen: false,

  // Auth actions
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      await AuthService.login({ email, password });
      const user = await QuestService.getCurrentUser();
      if (!user) {
        throw new Error('Failed to fetch user data after login');
      }
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (userData: any) => {
    set({ isLoading: true });
    try {
      await AuthService.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword || userData.password
      });
      const user = await QuestService.getCurrentUser();
      if (!user) throw new Error('Failed to fetch user data after registration');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    // Clear token storage immediately
    tokenStorage.clearAll();
    // Clear store state
    set({ user: null, isAuthenticated: false });
    // Try to call API logout (fire and forget)
    QuestService.logout().catch(() => {});
  },

  loadCurrentUser: async () => {
    // Only load if we don't already have a user
    const { user, isAuthenticated, isLoading } = get();
    if (user) {
      console.log('User already loaded, skipping API call');
      return;
    }

    // Prevent multiple concurrent calls
    if (isLoading) {
      console.log('Already loading user, skipping API call');
      return;
    }

    // Check if we have a token before setting loading state
    const hasToken = typeof window !== 'undefined' && 
      (!!localStorage.getItem('auth_token') || 
       !!document.cookie.includes('hq_access_token'));

    if (!hasToken) {
      // No token, no need to make API call or show loading state
      set({ isAuthenticated: false, isLoading: false });
      return;
    }

    // We have a token, so we're authenticated until proven otherwise
    if (!isAuthenticated) {
      set({ isAuthenticated: true });
    }

    set({ isLoading: true });
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('User loading timeout, clearing loading state');
      set({ isLoading: false });
    }, 10000); // 10 second timeout
    
    try {
      const currentUser = await QuestService.getCurrentUser();
      clearTimeout(timeoutId);
      
      if (currentUser) {
        set({ user: currentUser, isAuthenticated: true, isLoading: false });
      } else {
        // Token was invalid, clear it
        tokenStorage.clearAll();
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error loading current user:', error);
      
      // If it's a 401 error, clear the token
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        tokenStorage.clearAll();
        set({ user: null, isAuthenticated: false, isLoading: false });
      } else {
        // Keep authenticated state if we have a token but API failed due to network issues
        set({ isLoading: false });
      }
    }
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true, isLoading: false });
  },

  // Quest actions
  loadQuests: async () => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const quests = await QuestService.getQuests(filters);
      set({ quests, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setSelectedQuest: (quest: Quest | null) => {
    set({ selectedQuest: quest });
  },

  updateFilters: (newFilters: Partial<FilterOptions>) => {
    const { filters, loadQuests } = get();
    const updatedFilters = { ...filters, ...newFilters };
    set({ filters: updatedFilters });
    loadQuests();
  },

  // Submission actions
  submitQuest: async (questId: string, content: any) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');
    
    try {
      await QuestService.submitQuest(questId, String(user.id), content);
      get().loadSubmissions();
    } catch (error) {
      throw error;
    }
  },

  loadSubmissions: async () => {
    const { user } = get();
    if (!user) return;
    
    try {
      const submissions = await QuestService.getSubmissions(undefined, String(user.id));
      set({ submissions });
    } catch (error) {
      throw error;
    }
  },

  // UI actions
  toggleTheme: () => {
    const { theme } = get();
    set({ theme: theme === 'light' ? 'dark' : 'light' });
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  }
}));

export default useStore;