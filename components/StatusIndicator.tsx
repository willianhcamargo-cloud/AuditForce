import React from 'react';
import type { User } from '../types';

interface StatusIndicatorProps {
  status: User['status'];
  size?: 'xs' | 'sm' | 'md';
}

const sizeClasses: Record<NonNullable<StatusIndicatorProps['size']>, string> = {
  xs: 'w-2 h-2 bottom-0 -right-0.5',
  sm: 'w-3 h-3 bottom-0 right-0',
  md: 'w-3.5 h-3.5 bottom-0 right-0',
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, size = 'sm' }) => {
    const baseClasses = 'absolute rounded-full border-2 border-surface dark:border-dark-surface';
    const statusClasses = status === 'Online' ? 'bg-green-500' : 'bg-red-500';
    
    return <div className={`${baseClasses} ${statusClasses} ${sizeClasses[size]}`} />;
};