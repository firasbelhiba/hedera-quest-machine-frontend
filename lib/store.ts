import { create } from 'zustand';
import { User, Quest, Submission, FilterOptions } from './types';
import { QuestService } from './services';

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
  // Initial state
  user: null,
  isAuthenticated: false,
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
      const user = await QuestService.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
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
    // Fire and forget; state clears regardless of API usage
    QuestService.logout().catch(() => {});
    set({ user: null, isAuthenticated: false });
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