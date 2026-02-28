import React from 'react';

const Input = ({ label, className = '', ...props }) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && <label className="text-sm font-medium text-dark">{label}</label>}
            <input
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-dark placeholder:text-muted ${className}`}
                {...props}
            />
        </div>
    );
};

export default Input;
