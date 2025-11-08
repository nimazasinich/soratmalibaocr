import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizeStyles = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Professional Logo Icon - Abstract Financial Symbol */}
      <div className={`${sizeStyles[size]} flex-shrink-0`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Shield/Document Shape - Security & Finance Symbol */}
          <path
            d="M24 4L8 10V20C8 29.5 14.5 38 24 44C33.5 38 40 29.5 40 20V10L24 4Z"
            fill="url(#logoGradient)"
            opacity="0.1"
          />
          <path
            d="M24 4L8 10V20C8 29.5 14.5 38 24 44C33.5 38 40 29.5 40 20V10L24 4Z"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Financial Chart Lines Inside */}
          <path
            d="M16 28L20 24L24 26L28 20L32 22"
            stroke="url(#logoGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          <circle cx="16" cy="28" r="2" fill="#3b82f6" />
          <circle cx="20" cy="24" r="2" fill="#3b82f6" />
          <circle cx="24" cy="26" r="2" fill="#3b82f6" />
          <circle cx="28" cy="20" r="2" fill="#3b82f6" />
          <circle cx="32" cy="22" r="2" fill="#3b82f6" />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <div>
          <h1 className={`${textSizeStyles[size]} font-bold text-gray-900 leading-tight`}>
            CloudCoder
          </h1>
          <p className="text-xs text-gray-600 leading-tight">
            Financial Analytics
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
