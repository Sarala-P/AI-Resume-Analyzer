import React, { useEffect, useState } from 'react';

const CircularProgress = ({ score }) => {
  const [offset, setOffset] = useState(282.7);
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // 282.74

  useEffect(() => {
    // Animate progress ring on load
    const progressOffset = circumference - (score / 100) * circumference;
    const timer = setTimeout(() => {
      setOffset(progressOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  // Determine color based on score threshold
  const getProgressColor = (val) => {
    if (val >= 75) return 'var(--success)';
    if (val >= 40) return '#fbbf24'; // Yellow
    return 'var(--error)';
  };

  const color = getProgressColor(score);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg className="progress-svg">
        <circle
          className="progress-bg"
          cx="80"
          cy="80"
          r={radius}
        />
        <circle
          className="progress-bar"
          cx="80"
          cy="80"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 6px ${color}80)`
          }}
        />
      </svg>
      <div className="score-number">{score}%</div>
    </div>
  );
};

export default CircularProgress;
