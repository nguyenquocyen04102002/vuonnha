import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { cartApi } from "../api/cart";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total_items: 0, total_amount: 0 });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cartApi.get();
      setCart(res.data);
    } catch (e) {
      // Giỏ hàng trống lần đầu vẫn coi là bình thường
      setCart({ items: [], total_items: 0, total_amount: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }

  async function addToCart(product, quantity = 1) {
    await cartApi.addItem(product.id, quantity);
    await refreshCart();
    showToast(`Đã thêm "${product.name}" vào giỏ hàng`);
  }

  async function updateQuantity(itemId, quantity) {
    if (quantity < 1) return;
    await cartApi.updateItem(itemId, quantity);
    await refreshCart();
  }

  async function removeItem(itemId) {
    await cartApi.removeItem(itemId);
    await refreshCart();
  }

  async function clearCart() {
    await cartApi.clear();
    await refreshCart();
  }

  return (
    <CartContext.Provider
      value={{ cart, loading, refreshCart, addToCart, updateQuantity, removeItem, clearCart, toast }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải được dùng bên trong CartProvider");
  return ctx;
}
