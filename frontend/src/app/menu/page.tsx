'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import { Restaurant, MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/permissions';

export default function MenuPage() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');
  const router = useRouter();
  const { user } = useAuth();
  const { addItem, items } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!restaurantId) {
      router.push('/restaurants');
      return;
    }

    async function fetchMenu() {
      try {
        const res = await api.get<Restaurant>(`/restaurants/${restaurantId}`);
        setRestaurant(res.data);
        setMenuItems(res.data.menuItems || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [restaurantId, router]);

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) return;
    addItem(item, restaurant.id, restaurant.name);
    setAddedItems((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 1500);
  };

  const getItemQuantityInCart = (menuItemId: string) => {
    const cartItem = items.find((i) => i.menuItem.id === menuItemId);
    return cartItem?.quantity || 0;
  };

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {restaurant && (
          <>
            {/* Restaurant Header */}
            <div className="mb-8">
              <button
                onClick={() => router.push('/restaurants')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4 inline-flex items-center"
              >
                ← Back to Restaurants
              </button>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {restaurant.name}
                  </h1>
                  <p className="text-gray-600 mt-1">{restaurant.cuisine} · {restaurant.address}</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {restaurant.country}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            {menuItems.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <span className="text-4xl block mb-4">📋</span>
                No menu items available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item) => {
                  const qtyInCart = getItemQuantityInCart(item.id);
                  const justAdded = addedItems.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="h-40 bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
                        <span className="text-5xl">🍽️</span>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          <span className="text-lg font-bold text-primary-600">
                            {formatCurrency(item.price, restaurant.country)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {item.description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center justify-between">
                          <button
                            onClick={() => handleAddToCart(item)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              justAdded
                                ? 'bg-green-500 text-white'
                                : 'bg-primary-500 hover:bg-primary-600 text-white'
                            }`}
                          >
                            {justAdded ? '✓ Added!' : 'Add to Cart'}
                          </button>
                          {qtyInCart > 0 && (
                            <span className="text-sm text-gray-500">
                              {qtyInCart} in cart
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </AuthGuard>
  );
}
