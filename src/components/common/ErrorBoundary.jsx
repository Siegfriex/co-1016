import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="curator-error">
          <div className="curator-error-icon">💥</div>
          <h3 className="curator-error-title">문제가 발생했습니다</h3>
          <p className="curator-error-message">
            차트를 렌더링하는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
