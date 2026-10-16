import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a Cart Context
const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cartItems');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);
  
  // Add item to cart
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => String(i.id) === String(item.id));
      if (existingItem) {
        return prevItems.map((i) =>
          String(i.id) === String(item.id)
            ? { ...i, quantity: (Number(i.quantity) || 1) + 1 }
            : i
        );
      }
      return [...prevItems, { ...item, price: Number(item.price) || 0, quantity: 1 }];
    });
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => String(item.id) !== String(id)));
  };

  // Clear all items from cart
  const clearCart = () => setCartItems([]);

  // Update item quantity in the cart
  const updateQuantity = (id, newQuantity) => {
    const safeQuantity = Math.max(1, Number(newQuantity) || 1);
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        String(item.id) === String(id) ? { ...item, quantity: safeQuantity } : item
      )
    );
  };

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalPrice,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
