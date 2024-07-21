"use client"
import React, { createContext, useContext, useState } from 'react';


const CartContext = createContext();


export const CartProvider = ({ children }) => {
  const [cartLength, setCartLength] = useState(1);


  const updateCartLength = (length) => {
    console.log("something happend");
    setCartLength(length);
  };

  return (
    <CartContext.Provider value={{ cartLength, updateCartLength }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
