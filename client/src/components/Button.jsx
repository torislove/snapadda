import React from 'react';

export const Button = ({ children, variant = 'primary', size = 'md', fullWidth = false, className = '', ...props }) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    `size-${size}`,
    fullWidth ? 'btn-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
