import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';
import { Logo } from './ui/Logo';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorInfo: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorInfo: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Admin Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020205] flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[120px]" />
          </div>

          <div className="w-full max-w-lg bg-[#07070f]/90 backdrop-blur-xl border border-red-500/20 rounded-3xl p-10 text-center relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex justify-center mb-6">
              <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl">
                <ShieldAlert size={48} className="text-red-400" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">System Fault Detected</h1>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              A module within the SnapAdda Administration Panel encountered an unexpected state. This incident has been logged for engineering review.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
            >
              <RefreshCcw size={18} /> Reinitialize Dashboard
            </button>

            <div className="mt-8 flex justify-center opacity-50">
              <Logo size={20} />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
