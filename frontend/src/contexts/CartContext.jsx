import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../api/index.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const getProductId = (item) => item.product?._id || item.product;

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], coupon: null, couponDiscount: 0 });
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[]}');
      setCart(localCart);
      return;
    }
    try {
      setLoading(true);
      const { data } = await cartAPI.getCart();
      setCart(data.cart || { items: [], coupon: null, couponDiscount: 0 });
    } catch (err) {
      console.error('Failed to load cart:', err);
      setCart({ items: [], coupon: null, couponDiscount: 0 });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (productOrId, quantity = 1) => {
    const productId = typeof productOrId === 'string' ? productOrId : productOrId?._id;
    const productData = typeof productOrId === 'string' ? null : productOrId;

    if (!isAuthenticated) {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[]}');
      const existing = localCart.items.find((i) => getProductId(i) === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        const productToStore = productData
          ? {
              _id: productData._id,
              name: productData.name,
              brand: productData.brand,
              images: productData.images,
              slug: productData.slug,
            }
          : { _id: productId };
        const price = productData?.discountPrice || productData?.price || 0;
        localCart.items.push({ product: productToStore, quantity, price });
      }
      localStorage.setItem('guestCart', JSON.stringify(localCart));
      setCart(localCart);
      return { success: true };
    }
    const { data } = await cartAPI.addToCart({ productId, quantity });
    setCart(data.cart);
    return data;
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[]}');
      if (quantity <= 0) {
        localCart.items = localCart.items.filter((i) => getProductId(i) !== productId);
      } else {
        const item = localCart.items.find((i) => getProductId(i) === productId);
        if (item) item.quantity = quantity;
      }
      localStorage.setItem('guestCart', JSON.stringify(localCart));
      setCart(localCart);
      return { success: true };
    }
    const { data } = await cartAPI.updateItem({ productId, quantity });
    setCart(data.cart);
    return data;
  };

  const removeItem = async (productId) => {
    if (!isAuthenticated) {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[]}');
      localCart.items = localCart.items.filter((i) => getProductId(i) !== productId);
      localStorage.setItem('guestCart', JSON.stringify(localCart));
      setCart(localCart);
      return { success: true };
    }
    const { data } = await cartAPI.removeItem(productId);
    setCart(data.cart);
    return data;
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      localStorage.removeItem('guestCart');
      setCart({ items: [], coupon: null, couponDiscount: 0 });
      return { success: true };
    }
    const { data } = await cartAPI.clearCart();
    setCart(data.cart);
    return data;
  };

  const applyCoupon = async (code) => {
    const { data } = await cartAPI.applyCoupon({ code });
    setCart(data.cart);
    return data;
  };

  const removeCoupon = async () => {
    const { data } = await cartAPI.removeCoupon();
    setCart(data.cart);
    return data;
  };

  const itemCount = cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const subtotal = cart.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
