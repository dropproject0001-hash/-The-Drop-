import { useToast } from '@/components/ui/ToastContainer';

export const useHandleError = () => {
  const { showToast } = useToast();

  return (error: any, fallbackMessage = 'Something went wrong') => {
    const message = error?.message || fallbackMessage;
    showToast(message, { type: 'error' });
    console.error(error);
  };
};
