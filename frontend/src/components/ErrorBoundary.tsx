import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Credipro] Render error:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="p-8 bg-[#0f131d] min-h-screen text-white flex flex-col items-center justify-center">
          <div className="max-w-xl w-full glass-panel p-8 rounded-2xl border border-red-500/30 bg-red-500/5 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <span className="material-symbols-outlined text-3xl">error</span>
              <h1 className="text-2xl font-bold">Something went wrong</h1>
            </div>
            <p className="mb-6 text-gray-300 text-sm leading-relaxed">
              The app crashed while loading. Check the details below or open the browser console (F12).
            </p>
            <pre className="block whitespace-pre-wrap p-4 rounded-lg bg-black/50 border border-white/10 text-red-300 text-xs font-mono mb-6 overflow-x-auto">
              {this.state.error.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
