/**
 * @file src/components/ui/ConfirmationModal.tsx
 *
 * FIX M-2: Props now fully typed — no `any`. Matches ConfirmationOptions
 *           from the modal store.
 */
import { useModalStore } from '@/stores/modalStore';
import type { ConfirmationOptions } from '@/stores/modalStore';
import { EpicModal } from './EpicModal';

export function ConfirmationModal({
  title,
  message,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmationOptions) {
  const { closeModal } = useModalStore();

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  return (
    <EpicModal isOpen={true} onClose={closeModal} title={title} size="sm">
      <div className="space-y-6">
        <p className="text-slate-300">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={closeModal}
            className="flex-1 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition text-slate-200"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 py-3 rounded-xl text-white transition ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </EpicModal>
  );
}
