import { create } from 'zustand'

interface StoreState {
  currentModal: string
  setCurrentModal: (str: string) => void
}

export const useModalStore = create<StoreState>((set) => ({
  currentModal: '',
  setCurrentModal: (str) => set({ currentModal: str }),
}))
