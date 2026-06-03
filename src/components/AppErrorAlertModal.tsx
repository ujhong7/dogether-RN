import { router } from 'expo-router';
import { AppAlertModal } from './AppAlertModal';
import type { AppError } from '../models/error';
import { isAuthExpiredError } from '../models/error';
import { useSessionStore } from '../stores/sessionStore';

type Props = {
  visible: boolean;
  error: AppError;
  onClose: () => void;
  onConfirm?: () => void;
};

export function AppErrorAlertModal({ visible, error, onClose, onConfirm }: Props) {
  const logout = useSessionStore((state) => state.logout);

  const handleClose = () => {
    if (isAuthExpiredError(error)) {
      onClose();
      logout();
      router.replace('/onboarding');
      return;
    }

    onClose();
  };

  return (
    <AppAlertModal
      visible={visible}
      error={error}
      onClose={handleClose}
      onConfirm={onConfirm}
    />
  );
}
