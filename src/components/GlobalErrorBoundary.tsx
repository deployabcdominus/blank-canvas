import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Global Error Boundary caught:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-md w-full text-center space-y-6">

            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center bg-destructive/10 border border-destructive/25">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-foreground">
                Algo salió mal
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Ha ocurrido un error inesperado. Tu información está segura.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="rounded-lg p-3 text-left text-xs font-mono break-all bg-muted border border-border text-destructive">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleGoHome}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors bg-muted text-muted-foreground border border-border hover:bg-muted/80"
              >
                Ir al inicio
              </button>
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar
              </button>
            </div>

            <p className="text-xs text-muted-foreground/60">
              Si el problema persiste, contacta a soporte.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}