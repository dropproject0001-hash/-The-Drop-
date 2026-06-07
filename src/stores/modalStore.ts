/**
 * @file src/stores/modalStore.ts
 *
 * FIX H-7 (support): Added typed option interfaces so GlobalModals can
 *           safely forward only known props to EpicModal/ConfirmationModal
 *           without any unsafe `any` spreads.
 */
import React from 'react';
import { create } from 'zustand';

export type ModalType = 'epic' | 'confirmation';

// Typed option bags for each modal type
export interface EpicModalOptions {
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  variant?: 'default' | 'bottom-sheet';
  content?: React.ReactNode;
}

export interface ConfirmationOptions {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

interface ModalState {
  isOpen: boolean;
  modalType: ModalType | null;
  options: EpicModalOptions | ConfirmationOptions | Record<string, never>;
  content: React.ReactNode | null;

  openEpicModal: (options: EpicModalOptions) => void;
  openConfirmation: (props: ConfirmationOptions) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  modalType: null,
  options: {},
  content: null,

  openEpicModal: (options) =>
    set({
      isOpen: true,
      modalType: 'epic',
      options,
      content: options.content ?? null,
    }),

  openConfirmation: (props) =>
    set({ isOpen: true, modalType: 'confirmation', options: props }),

  closeModal: () =>
    set({ isOpen: false, modalType: null, options: {}, content: null }),
}));
