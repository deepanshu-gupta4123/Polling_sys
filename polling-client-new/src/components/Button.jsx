import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-6 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer";

    const variants = {
        primary: "bg-primary text-white hover:bg-secondary",
        secondary: "border border-primary text-primary hover:bg-primary/5",
        brand: "bg-brand text-white hover:opacity-90 shadow-lg hover:shadow-xl",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
