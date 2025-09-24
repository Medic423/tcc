import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: error?.message || 'Render error' };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('Render error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="bg-white shadow rounded p-6 max-w-xl text-center">
            <h2 className="text-lg font-semibold text-red-700">Something went wrong</h2>
            <p className="mt-2 text-sm text-gray-600">{this.state.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}


