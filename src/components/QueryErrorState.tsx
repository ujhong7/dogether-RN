import { AppErrorAlertModal } from './AppErrorAlertModal';
import { FullScreenErrorState } from './FullScreenErrorState';
import { Screen } from './Screen';
import { toAppError } from '../services/errors/appError';

type Props = {
  error: unknown;
  onRetry: () => void;
  onAlertClose?: () => void;
};

const noop = () => {};

export function QueryErrorState({ error, onRetry, onAlertClose = noop }: Props) {
  const appError = toAppError(error);

  if (appError.variant === 'alert') {
    return (
      <Screen>
        <AppErrorAlertModal
          visible
          error={appError}
          onClose={onAlertClose}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <FullScreenErrorState
        title={appError.title}
        message={appError.message}
        actionLabel={appError.actionLabel}
        onRetry={onRetry}
      />
    </Screen>
  );
}
