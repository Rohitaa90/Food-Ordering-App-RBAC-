'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import { Restaurant } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const res = await api.get<Restaurant[]>('/restaurants');
        setRestaurants(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, []);

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'ADMIN'
              ? 'Showing all restaurants (Admin access)'
              : `Showing restaurants in ${user?.country}`}
          </p>
        </div>

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

        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <span className="text-4xl block mb-4">🏪</span>
            No restaurants available in your region
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/menu?restaurantId=${restaurant.id}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center">
                <span className="text-6xl group-hover:scale-110 transition-transform">
                  {restaurant.cuisine === 'Indian' || restaurant.cuisine === 'South Indian'
                    ? '🍛'
                    : restaurant.cuisine === 'American'
                    ? '🍔'
                    : '🍽️'}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{restaurant.cuisine}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {restaurant.country}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{restaurant.address}</p>
                <p className="text-sm text-primary-600 font-medium mt-3">
                  {restaurant._count?.menuItems || 0} items on menu →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </AuthGuard>
  );
}
