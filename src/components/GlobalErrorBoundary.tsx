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
        <div className="min-h-screen flex items-center justify-center p-6"
          style={{ background: "hsl(0 0% 2%)" }}>
          <div className="max-w-md w-full text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "hsl(25 95% 53% / 0.12)", border: "1px solid hsl(25 95% 53% / 0.25)" }}>
              <AlertTriangle className="w-8 h-8" style={{ color: "hsl(25 95% 53%)" }} />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-xl font-bold" style={{ color: "hsl(0 0% 95%)" }}>
                Algo salió mal
              </h1>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "hsl(0 0% 55%)" }}>
                Ha ocurrido un error inesperado. Tu información está segura.
              </p>
            </div>

            {/* Error detail (dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="rounded-lg p-3 text-left text-xs font-mono break-all"
                style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 100% / 0.06)", color: "hsl(0 72% 51%)" }}>
                {this.state.error.message}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleGoHome}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: "hsl(0 0% 10%)",
                  color: "hsl(0 0% 80%)",
                  border: "1px solid hsl(0 0% 100% / 0.08)",
                }}
              >
                Ir al inicio
              </button>
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                style={{
                  background: "hsl(25 95% 53%)",
                  color: "white",
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Recargar
              </button>
            </div>

            <p className="text-xs" style={{ color: "hsl(0 0% 35%)" }}>
              Si el problema persiste, contacta a soporte.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
