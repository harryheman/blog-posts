// import { create } from 'zustand'
import { create } from '../zustand/react'

const useModal = create((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))

export default useModal
