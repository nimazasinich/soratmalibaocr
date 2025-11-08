import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  shimmer?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  shimmer = false,
}) => {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '1rem' : '40px'),
  };

  return (
    <div
      className={`${shimmer ? 'skeleton-shimmer' : 'skeleton'} ${
        variantStyles[variant]
      } ${className}`}
      style={style}
    />
  );
};

export interface SkeletonGroupProps {
  count?: number;
  spacing?: string;
  children?: React.ReactNode;
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  count = 3,
  spacing = 'space-y-3',
  children,
}) => {
  if (children) {
    return <div className={spacing}>{children}</div>;
  }

  return (
    <div className={spacing}>
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  );
};

export default Skeleton;
