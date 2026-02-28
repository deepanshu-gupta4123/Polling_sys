import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-white rounded-2xl shadow-md border border-[#0000000D] p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
