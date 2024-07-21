"use client";
import React, { useEffect, useState } from "react";

export default function Ticker() {
  const texts = [
    "10% off on your first order use code 'FIRST10'",
    "Free shipping on orders over ₹300",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(false);

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
        setAnimating(true);
      }, 2000); // Hold text in center for 2 seconds
    }, 4000); // Total duration for each text: 2s animation + 2s hold

    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div className="z-7 flex justify-center bg-green-700 w-full overflow-hidden ">
      <p className={`font-book-antiqua md:text-base text-md leading-5 text-white py-2 md:py-1 ${animating ? 'animate-marquee' : ''}`}>
        {texts[currentIndex]}
      </p>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          25% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(0);
          }
          75% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-marquee {
          animation: marquee 4s linear infinite;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}