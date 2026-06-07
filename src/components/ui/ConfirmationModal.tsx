import { useModalStore } from '@/stores/modalStore';
import { EpicModal } from './EpicModal';

export function ConfirmationModal({ title, message, onConfirm, confirmText = "Confirm", cancelText = "Cancel", variant = 'default' }: any) {
  const { closeModal } = useModalStore();

  return (
    <EpicModal isOpen={true} onClose={closeModal} title={title} size="sm">
      <div className="space-y-6">
        <p>{message}</p>
        <div className="flex gap-3">
          <button onClick={closeModal} className="flex-1 py-3 rounded-xl border"> {cancelText} </button>
          <button onClick={() => { onConfirm(); closeModal(); }} className={`flex-1 py-3 rounded-xl text-white ${variant === 'danger' ? 'bg-red-600' : 'bg-primary'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </EpicModal>
  );
}
