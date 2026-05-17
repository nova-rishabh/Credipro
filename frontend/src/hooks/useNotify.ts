import { useToastContext } from '../context/ToastContext';

export function useNotify() {
  const { notify } = useToastContext();
  return notify;
}
