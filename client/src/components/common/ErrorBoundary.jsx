import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Something went wrong loading the app</h2>
          <p className="text-xs text-slate-400 max-w-md">
            {this.state.error?.toString() || "An unexpected error occurred during rendering."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
