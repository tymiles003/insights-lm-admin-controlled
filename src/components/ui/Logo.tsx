
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'light' | 'dark';
}

const Logo = ({ size = 'md', className = '', variant = 'default' }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-14 h-14'
  };

  const iconSizes = {
    sm: '18px',
    md: '24px',
    lg: '32px'
  };

  const getGradient = () => {
    switch (variant) {
      case 'light':
        return 'from-white to-slate-100';
      case 'dark':
        return 'from-slate-800 to-slate-900';
      default:
        return 'from-slate-800 to-slate-900';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'light':
        return '#1e293b';
      case 'dark':
        return '#f8fafc';
      default:
        return '#f8fafc';
    }
  };

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br ${getGradient()} rounded-xl flex items-center justify-center legal-shadow-lg border border-white/10 ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        height={iconSizes[size]} 
        viewBox="0 -960 960 960" 
        width={iconSizes[size]} 
        fill={getIconColor()}
        className="drop-shadow-sm"
      >
        <path d="M200-200v-560 560Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm280-670q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM200-200h560v-560H200v560Z"/>
      </svg>
    </div>
  );
};

export default Logo;
