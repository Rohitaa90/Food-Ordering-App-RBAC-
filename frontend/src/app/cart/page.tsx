'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatCurrency, canCheckout } from '@/lib/permissions';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalAmount, restaurantId } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState('');

  const country = items.length > 0 ? undefined : user?.country;

  const handleCreateOrder = async () => {
    if (!restaurantId || items.length === 0) return;

    setIsOrdering(true);
    setError('');

    try {
      const orderData = {
        restaurantId,
        items: items.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
        })),
      };

      await api.post('/orders', orderData);
      clearCart();
      setOrderSuccess(true);

      setTimeout(() => {
        router.push('/orders');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

        {orderSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-6">
            <p className="font-semibold">Order placed successfully! 🎉</p>
            <p className="text-sm mt-1">Redirecting to orders...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {items.length === 0 && !orderSuccess ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">🛒</span>
            <p className="text-gray-500 text-lg">Your cart is empty</p>
            <button
              onClick={() => router.push('/restaurants')}
              className="mt-4 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          !orderSuccess && (
            <>
              {/* Restaurant Name */}
              {items.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
                  Ordering from: <strong>{items[0].restaurantName}</strong>
                </div>
              )}

              {/* Cart Items */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
                {items.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="p-5 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.menuItem.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.menuItem.price, country)} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                      >
                        +
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="ml-6 text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.menuItem.price * item.quantity, country)}
                      </p>
                      <button
                        onClick={() => removeItem(item.menuItem.id)}
                        className="text-xs text-red-500 hover:text-red-700 mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(totalAmount, country)}
                  </span>
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleCreateOrder}
                    disabled={isOrdering}
                    className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    {isOrdering ? 'Placing Order...' : 'Place Order'}
                  </button>

                  {user && !canCheckout(user.role) && (
                    <p className="text-xs text-amber-600 text-center">
                      ⚠️ As a {user.role}, you can place orders but cannot checkout. A Manager or Admin must checkout your order.
                    </p>
                  )}

                  <button
                    onClick={clearCart}
                    className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-medium transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </>
          )
        )}
      </main>
    </AuthGuard>
  );
}
