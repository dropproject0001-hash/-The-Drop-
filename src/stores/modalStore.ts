import React from 'react';
import { create } from 'zustand';

export type ModalType = 'epic' | 'confirmation';

interface ModalState {
  isOpen: boolean;
  modalType: ModalType | null;
  options: any;
  content: React.ReactNode | null;

  openEpicModal: (options: any) => void;
  openConfirmation: (props: any) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  modalType: null,
  options: {},
  content: null,

  openEpicModal: (options) =>
    set({ isOpen: true, modalType: 'epic', options, content: options.content }),

  openConfirmation: (props) =>
    set({ isOpen: true, modalType: 'confirmation', options: props }),

  closeModal: () =>
    set({ isOpen: false, modalType: null, options: {}, content: null }),
}));
