import React from 'react';

const Button = ({ children }: { children: React.ReactNode }) => {
    return <button style={{ padding: '10px 16px', backgroundColor: '#3366ff', color: '#fff' }}>{children}</button>;
};

export default Button;
