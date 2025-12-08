import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

class LazyLoadErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Check if it's a dynamic import error
    const isChunkError = 
      error.message.includes('dynamically imported module') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Loading CSS chunk');
    
    if (isChunkError) {
      console.warn('Dynamic import failed, will retry on user action:', error.message);
    }
  }

  handleRetry = () => {
    this.setState(prev => ({ 
      hasError: false, 
      error: null, 
      retryCount: prev.retryCount + 1 
    }));
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isNetworkError = 
        this.state.error?.message.includes('dynamically imported module') ||
        this.state.error?.message.includes('Failed to fetch') ||
        this.state.error?.message.includes('Loading chunk');

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <WifiOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {isNetworkError ? 'Connection Issue' : 'Something went wrong'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isNetworkError 
                ? 'The page failed to load. Please check your internet connection and try again.'
                : 'An unexpected error occurred while loading this page.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button 
                onClick={this.handleRetry}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button 
                onClick={this.handleRefresh}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyLoadErrorBoundary;
