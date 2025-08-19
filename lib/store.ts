import { create } from 'zustand';
import { User, Quest, Submission, FilterOptions } from './types';
import { QuestService } from './services';
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
      const result = await QuestService.login(email, password);
      set({ user: result.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (userData: any) => {
    set({ isLoading: true });
    try {
      const user = await QuestService.register(userData);
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
    const { user, isAuthenticated } = get();
    if (user) {
      console.log('User already loaded, skipping API call');
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
    try {
      const currentUser = await QuestService.getCurrentUser();
      if (currentUser) {
        set({ user: currentUser, isAuthenticated: true, isLoading: false });
      } else {
        // Token was invalid
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      // Keep authenticated state if we have a token but API failed
      set({ isLoading: false });
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
      await QuestService.submitQuest(questId, user.id, content);
      get().loadSubmissions();
    } catch (error) {
      throw error;
    }
  },

  loadSubmissions: async () => {
    const { user } = get();
    if (!user) return;
    
    try {
      const submissions = await QuestService.getSubmissions(undefined, user.id);
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