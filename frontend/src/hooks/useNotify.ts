import { useToast, UseToastOptions } from '@chakra-ui/react';

export function useNotify() {
  const toast = useToast();

  function notify(options: UseToastOptions) {
    toast({
      duration: options.duration ?? 6000,
      isClosable: options.isClosable ?? true,
      position: options.position ?? 'top-right',
      ...options,
    });
  }

  return notify;
}
