import React, { Component } from 'react';

class ErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('UI error:', error, info.componentStack);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-bg-alt">
                <h1 className="text-3xl font-extrabold text-text-main">Something went wrong</h1>
                <p className="text-text-muted mt-3 max-w-md">An unexpected error occurred. Please reload the page.</p>
                <button type="button" className="btn btn-primary mt-8" onClick={() => window.location.assign('/')}>
                    Back to Home
                </button>
            </div>
        );
    }
}

export default ErrorBoundary;
