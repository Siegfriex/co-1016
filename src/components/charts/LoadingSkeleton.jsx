import React from 'react';

const LoadingSkeleton = ({ type = 'chart' }) => {
  if (type === 'chart') {
    return (
      <div className="curator-loading">
        <div className="curator-spinner"></div>
        <div className="curator-loading-text">Loading Chart Data...</div>
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className="curator-chart-container">
        <div className="curator-skeleton curator-skeleton--title"></div>
        <div className="curator-skeleton curator-skeleton--chart"></div>
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
