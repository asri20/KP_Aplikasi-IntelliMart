import { Component } from 'react';

import PropTypes from 'prop-types';

import { Button } from '@shared/components/atoms';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6 text-red-500">
              <svg className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Oops! Terjadi Kesalahan</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">Maaf, aplikasi mengalami kesalahan yang tidak terduga. Silakan coba refresh halaman.</p>
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-900">
                <summary className="cursor-pointer text-sm font-medium text-red-900 dark:text-red-400 mb-2">Error Details</summary>
                <pre className="text-xs text-red-800 dark:text-red-300 overflow-auto">{this.state.error.toString()}{'\n\n'}{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" onClick={() => window.location.reload()}>Refresh Halaman</Button>
              <Button variant="outline" onClick={this.handleReset}>Coba Lagi</Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
