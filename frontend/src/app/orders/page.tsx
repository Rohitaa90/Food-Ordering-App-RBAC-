'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import { Order } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { canCheckout, canCancel, formatCurrency, getStatusColor } from '@/lib/permissions';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get<Order[]>('/orders');
      setOrders(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCheckout = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await api.post(`/orders/${orderId}/checkout`);
      await fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to checkout order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setActionLoading(orderId);
    try {
      await api.post(`/orders/${orderId}/cancel`);
      await fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'ADMIN'
              ? 'All orders (Admin access)'
              : user?.role === 'MANAGER'
              ? `Orders in ${user.country}`
              : 'Your orders'}
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

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <span className="text-4xl block mb-4">📦</span>
            No orders found
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Order Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-gray-900">
                      {order.restaurant.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {order.country}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Order #{order.id.slice(0, 8)} · {new Date(order.createdAt).toLocaleString()}
                    {order.user && user?.role !== 'MEMBER' && (
                      <span> · by {order.user.name}</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Checkout button - only for ADMIN and MANAGER */}
                  {user && canCheckout(user.role) && order.status === 'PENDING' && (
                    <button
                      onClick={() => handleCheckout(order.id)}
                      disabled={actionLoading === order.id}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {actionLoading === order.id ? '...' : 'Checkout'}
                    </button>
                  )}

                  {/* Cancel button - only for ADMIN and MANAGER */}
                  {user &&
                    canCancel(user.role) &&
                    order.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={actionLoading === order.id}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {actionLoading === order.id ? '...' : 'Cancel'}
                      </button>
                    )}
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-3">
                <div className="divide-y divide-gray-50">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-2 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.menuItem.name}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          × {item.quantity}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity, order.country)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 mt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(order.totalAmount, order.country)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </AuthGuard>
  );
}
