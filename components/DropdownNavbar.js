"use client";
import React, { useState } from "react";
import Link from "next/link";



const DropNavbar = ({ isVisible, onClose }) => {
  return (
    <div className={`absolute w-11/12 z-50 transform transition-all duration-300 ease-in-out ${isVisible ? "opacity-100 visible top-[60px]" : "opacity-0 invisible"}`}>
      <div className="flex sm:hidden px-4 py-4 h-auto bg-cream">
        <div className="flex flex-col  w-full pb-2 text-[#A18168] font-book-antiqua">
          <Link href="/" className="text-left py-2 px-4 w-full" onClick={onClose}>
            New Arrivals
          </Link>
          <Link href="" className="text-left py-2 px-4 w-full " onClick={onClose}>
            Clothing
          </Link>
          <Link href="/collections" className="text-left py-2 px-4 w-full " onClick={onClose}>
            Collections
          </Link>
          <Link href="" className="text-left py-2 px-4 w-full" onClick={onClose}>
            Gift Card
          </Link>
          <Link href="" className="text-left py-2 px-4 w-full" rel="noopener noreferrer">
            Customization
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DropNavbar;

