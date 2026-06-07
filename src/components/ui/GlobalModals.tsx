import { useModalStore } from '@/stores/modalStore';
import { EpicModal } from './EpicModal';
import { ConfirmationModal } from './ConfirmationModal';

export function GlobalModals() {
  const { isOpen, modalType, options, content, closeModal } = useModalStore();

  if (!isOpen) return null;

  if (modalType === 'epic') {
    return (
      <EpicModal isOpen={isOpen} onClose={closeModal} {...options}>
        {content}
      </EpicModal>
    );
  }

  if (modalType === 'confirmation') {
    return <ConfirmationModal {...options} />;
  }

  return null;
}
