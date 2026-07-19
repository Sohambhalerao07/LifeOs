import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#ba1a1a', marginBottom: '1rem' }}>Something went wrong</h1>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '8px', 
            overflow: 'auto',
            fontSize: '14px',
            color: '#333'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '1rem', 
              padding: '0.5rem 1rem', 
              background: '#4450b7', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
