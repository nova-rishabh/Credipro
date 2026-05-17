import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ToastOptions {
  title?: string;
  description?: string;
  status?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  isClosable?: boolean;
  position?: string;
}

interface Toast extends ToastOptions {
  id: string;
}

interface ToastContextType {
  notify: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      duration: options.duration ?? 6000,
      status: options.status ?? 'info',
      ...options,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const statusColors = {
            success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-emerald-500/10',
            error: 'border-error/50 bg-error/10 text-error shadow-error/10',
            warning: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300 shadow-yellow-500/10',
            info: 'border-primary/50 bg-primary/10 text-primary shadow-primary/10',
          };

          const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info',
          };

          const colorClass = statusColors[toast.status ?? 'info'];
          const iconName = icons[toast.status ?? 'info'];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-lg transition-all duration-300 ${colorClass}`}
            >
              <span className="material-symbols-outlined shrink-0 text-xl mt-0.5">{iconName}</span>
              <div className="flex-1 min-w-0">
                {toast.title && <h5 className="font-bold text-sm mb-1 text-white">{toast.title}</h5>}
                {toast.description && <p className="text-xs opacity-90 leading-relaxed">{toast.description}</p>}
              </div>
              {toast.isClosable !== false && (
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
