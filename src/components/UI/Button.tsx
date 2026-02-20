import React from 'react';
import './Button.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'glass' | 'danger';
  className?: string;
  disabled?: boolean;
}

export const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false, ...props }: ButtonProps) => {
  return (
    <button 
      type={type} 
      className={`aiko-btn btn-${variant} ${className}`} 
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
