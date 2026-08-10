import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
}

interface AppState {
  isAuthenticated: boolean;
  isOffline: boolean;
  activeChatId: string | null;
  pendingEchoes: number;
  settingsRoute: string | null; // null means settings closed. 'hub', 'account', 'sessions', 'blocklist'
  currentUser: User | null;
  authLoading: boolean;
  authError: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleOffline: () => void;
  setActiveChat: (chatId: string | null) => void;
  addEcho: () => void;
  clearEchoes: () => void;
  
  openSettings: () => void;
  closeSettings: () => void;
  navigateSettings: (route: string) => void;
  
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  clearAuthError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  isOffline: false,
  activeChatId: null,
  pendingEchoes: 0,
  settingsRoute: null,
  currentUser: null,
  authLoading: false,
  authError: null,
  
  login: async (email: string, _password: string) => {
    set({ authLoading: true, authError: null });
    // Mock login - in real app this would call API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!email || !email.includes('@')) {
      set({ authLoading: false, authError: 'Invalid email address' });
      return false;
    }
    
    set({
      isAuthenticated: true,
      authLoading: false,
      currentUser: {
        id: 'user_' + Date.now(),
        username: email.split('@')[0],
        email: email,
        displayName: email.split('@')[0],
      },
    });
    return true;
  },
  
  register: async (username: string, email: string, _password: string) => {
    set({ authLoading: true, authError: null });
    // Mock registration - in real app this would call API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!username || username.length < 3) {
      set({ authLoading: false, authError: 'Username must be at least 3 characters' });
      return false;
    }
    
    if (!email || !email.includes('@')) {
      set({ authLoading: false, authError: 'Invalid email address' });
      return false;
    }
    
    set({
      isAuthenticated: true,
      authLoading: false,
      currentUser: {
        id: 'user_' + Date.now(),
        username: username,
        email: email,
        displayName: username,
      },
    });
    return true;
  },
  
  logout: () => set({ 
    isAuthenticated: false, 
    activeChatId: null, 
    pendingEchoes: 0, 
    settingsRoute: null,
    currentUser: null,
    authError: null,
  }),
  toggleOffline: () => set((state) => ({ isOffline: !state.isOffline })),
  
  setActiveChat: (chatId) => set({ activeChatId: chatId }),
  
  addEcho: () => set((state) => ({ pendingEchoes: state.pendingEchoes + 1 })),
  clearEchoes: () => set({ pendingEchoes: 0 }),
  
  openSettings: () => set({ settingsRoute: 'hub' }),
  closeSettings: () => set({ settingsRoute: null }),
  navigateSettings: (route) => set({ settingsRoute: route }),
  
  setAuthLoading: (loading) => set({ authLoading: loading }),
  setAuthError: (error) => set({ authError: error }),
  clearAuthError: () => set({ authError: null }),
}));
