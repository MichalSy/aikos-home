import React from 'react';
import './Button.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'glass';
  className?: string;
}

export const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', ...props }: ButtonProps) => {
  return (
    <button 
      type={type} 
      className={`aiko-btn btn-${variant} ${className}`} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
