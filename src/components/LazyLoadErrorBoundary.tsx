import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff, Download } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  countdown: number | null;
}

class LazyLoadErrorBoundary extends Component<Props, State> {
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0, countdown: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    const isChunkError = this.isChunkLoadError(error);
    
    if (isChunkError) {
      console.warn('Dynamic import failed:', error.message);
      
      // Start auto-reload countdown for stale chunks
      if (this.isStaleChunkError(error)) {
        this.startAutoReloadCountdown();
      }
    }
  }

  componentWillUnmount() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  isChunkLoadError = (error: Error | null): boolean => {
    if (!error) return false;
    const message = error.message.toLowerCase();
    return (
      message.includes('dynamically imported module') ||
      message.includes('failed to fetch') ||
      message.includes('loading chunk') ||
      message.includes('loading css chunk')
    );
  };

  isStaleChunkError = (error: Error | null): boolean => {
    if (!error) return false;
    // Stale chunk errors typically mention module not found or failed to fetch dynamically imported module
    return error.message.includes('dynamically imported module');
  };

  startAutoReloadCountdown = () => {
    this.setState({ countdown: 5 });
    
    this.countdownInterval = setInterval(() => {
      this.setState(prev => {
        if (prev.countdown === null || prev.countdown <= 1) {
          if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
          }
          window.location.reload();
          return prev;
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
  };

  handleRetry = () => {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.setState(prev => ({ 
      hasError: false, 
      error: null, 
      retryCount: prev.retryCount + 1,
      countdown: null
    }));
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isStaleChunk = this.isStaleChunkError(this.state.error);
      const isNetworkError = this.isChunkLoadError(this.state.error) && !isStaleChunk;

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              {isStaleChunk ? (
                <Download className="w-8 h-8 text-muted-foreground" />
              ) : (
                <WifiOff className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {isStaleChunk ? 'App Updated' : isNetworkError ? 'Connection Issue' : 'Something went wrong'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isStaleChunk 
                ? 'A new version is available. The page will reload automatically.'
                : isNetworkError 
                  ? 'The page failed to load. Please check your internet connection and try again.'
                  : 'An unexpected error occurred while loading this page.'}
            </p>
            {this.state.countdown !== null && (
              <p className="text-sm text-primary font-medium">
                Reloading in {this.state.countdown} seconds...
              </p>
            )}
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
                Reload Now
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
