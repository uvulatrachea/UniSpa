import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function FormSlider({ children, activeForm, onFormSwitch }) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [localActiveForm, setLocalActiveForm] = useState(activeForm);

    const handleFormSwitch = (form) => {
        if (!isAnimating && form !== localActiveForm) {
            setIsAnimating(true);
            setLocalActiveForm(form);
            
            // Call parent callback if provided
            if (onFormSwitch) {
                onFormSwitch(form);
            }
            
            // Reset animation state after transition
            setTimeout(() => {
                setIsAnimating(false);
            }, 600);
        }
    };

    return (
        <div className="form-container">
            <div className={`form-slider ${localActiveForm === 'register' ? 'slide-right' : 'slide-left'}`}>
                {React.Children.map(children, (child, index) => (
                    <div className="single-form">
                        {React.cloneElement(child, {
                            handleFormSwitch: handleFormSwitch,
                            isAnimating: isAnimating
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}