import { create } from 'zustand';

interface AppState {
  isAuthenticated: boolean;
  isOffline: boolean;
  activeChatId: string | null;
  pendingEchoes: number;
  settingsRoute: string | null; // null means settings closed. 'hub', 'account', 'sessions', 'blocklist'
  
  login: () => void;
  logout: () => void;
  toggleOffline: () => void;
  setActiveChat: (chatId: string | null) => void;
  addEcho: () => void;
  clearEchoes: () => void;
  
  openSettings: () => void;
  closeSettings: () => void;
  navigateSettings: (route: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  isOffline: false,
  activeChatId: null,
  pendingEchoes: 0,
  settingsRoute: null,
  
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false, activeChatId: null, pendingEchoes: 0, settingsRoute: null }),
  toggleOffline: () => set((state) => ({ isOffline: !state.isOffline })),
  
  setActiveChat: (chatId) => set({ activeChatId: chatId }),
  
  addEcho: () => set((state) => ({ pendingEchoes: state.pendingEchoes + 1 })),
  clearEchoes: () => set({ pendingEchoes: 0 }),
  
  openSettings: () => set({ settingsRoute: 'hub' }),
  closeSettings: () => set({ settingsRoute: null }),
  navigateSettings: (route) => set({ settingsRoute: route }),
}));
