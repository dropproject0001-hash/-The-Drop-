/**
 * @file src/components/ui/GlobalModals.tsx
 *
 * FIX H-7: No longer spreads all `options` onto <EpicModal> as unknown props.
 *           Only the specific props EpicModal understands are forwarded.
 *           This prevents unknown-prop React warnings and stops arbitrary keys
 *           from accidentally overriding `isOpen` or `onClose`.
 */
import { useModalStore } from '@/stores/modalStore';
import { EpicModal } from './EpicModal';
import { ConfirmationModal } from './ConfirmationModal';
import type { EpicModalOptions, ConfirmationOptions } from '@/stores/modalStore';

export function GlobalModals() {
  const { isOpen, modalType, options, content, closeModal } = useModalStore();

  if (!isOpen) return null;

  if (modalType === 'epic') {
    const epicOpts = options as EpicModalOptions;
    return (
      <EpicModal
        isOpen={isOpen}
        onClose={closeModal}
        title={epicOpts.title}
        size={epicOpts.size}
        showCloseButton={epicOpts.showCloseButton}
        closeOnBackdropClick={epicOpts.closeOnBackdropClick}
        variant={epicOpts.variant}
      >
        {content}
      </EpicModal>
    );
  }

  if (modalType === 'confirmation') {
    return <ConfirmationModal {...(options as ConfirmationOptions)} />;
  }

  return null;
}
