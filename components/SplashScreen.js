"use client";
import React, { useRef, useEffect, useState } from 'react';

const SplashScreen = ({ onVideoEnd }) => {
    const videoRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const handleVideoEnd = () => {
            onVideoEnd();
            setIsFading(true);
            setTimeout(() => {
                setIsVisible(false);
            }, 1000); // Adjust the duration to match the transition duration
        };

        const videoElement = videoRef.current;
        videoElement.addEventListener('ended', handleVideoEnd);

        const timeoutId = setTimeout(() => {
            setIsFading(true);
            setTimeout(() => {
                setIsVisible(false);
            }, 1000); // Adjust the duration to match the transition duration
        }, 5000); // Adjust the timeout duration as needed

        return () => {
            videoElement.removeEventListener('ended', handleVideoEnd);
            clearTimeout(timeoutId);
        };
    }, [onVideoEnd]);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-1000 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            <video ref={videoRef} src="splash.mp4" autoPlay muted className="w-full h-full object-cover" />
        </div>
    );
};

export default SplashScreen;
