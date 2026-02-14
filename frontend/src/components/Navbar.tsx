'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/restaurants" className="flex items-center space-x-2">
            <span className="text-2xl">🍔</span>
            <span className="text-xl font-bold text-gray-900">FoodApp</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/restaurants"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Restaurants
            </Link>
            <Link
              href="/orders"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Orders
            </Link>
            <Link
              href="/cart"
              className="relative text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-4 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">
                {user.role}{user.country ? ` · ${user.country}` : ' · GLOBAL'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-4 pb-3">
          <Link
            href="/restaurants"
            className="text-gray-600 hover:text-primary-600 text-sm font-medium"
          >
            Restaurants
          </Link>
          <Link
            href="/orders"
            className="text-gray-600 hover:text-primary-600 text-sm font-medium"
          >
            Orders
          </Link>
          <Link
            href="/cart"
            className="relative text-gray-600 hover:text-primary-600 text-sm font-medium"
          >
            Cart
            {totalItems > 0 && (
              <span className="ml-1 bg-primary-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
