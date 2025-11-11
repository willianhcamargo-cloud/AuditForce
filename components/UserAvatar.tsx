import React from 'react';
import type { User } from '../types';
import { StatusIndicator } from './StatusIndicator';

interface UserAvatarProps {
    user: User;
    size?: 'xs' | 'sm' | 'md';
}

const sizeMap: Record<NonNullable<UserAvatarProps['size']>, string> = {
    xs: 'w-5 h-5',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'sm' }) => {
    if (!user) return null;

    return (
        <div className={`flex-shrink-0 relative ${sizeMap[size]}`}>
            <img className={`rounded-full ${sizeMap[size]}`} src={user.avatarUrl} alt={user.name} />
            <StatusIndicator status={user.status} size={size} />
        </div>
    );
};