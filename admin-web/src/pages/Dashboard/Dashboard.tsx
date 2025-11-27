// admin-web/src/pages/Dashboard/Dashboard.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardApi from '../../services/dashboardApi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    activeCustomers: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        overviewData,
        revenueChartData,
        categoriesData,
      ] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getRevenueChart('month'),
        dashboardApi.getCategoryStats(),
      ]);

      const completedOrders = overviewData.orders.total - overviewData.orders.pending - overviewData.orders.processing;

      setStats({
        totalRevenue: overviewData.revenue.total || 0,
        totalOrders: overviewData.orders.total || 0,
        totalCustomers: overviewData.customers.total || 0,
        totalProducts: overviewData.products.total || 0,
        pendingOrders: overviewData.orders.pending || 0,
        processingOrders: overviewData.orders.processing || 0,
        completedOrders: completedOrders >= 0 ? completedOrders : 0,
        activeCustomers: overviewData.customers.total || 0,
      });

      // Format revenue data for chart
      setRevenueData(revenueChartData.map((item: any) => ({
        month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
        revenue: item.revenue / 1000, // Convert to thousands
      })));

      // Format category data for pie chart
      setCategoryData(categoriesData.map((cat: any) => ({
        name: cat.name,
        value: cat._count?.products || 0,
      })));

    } catch (error) {
      console.error('Fetch dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${(stats.totalRevenue / 1000).toLocaleString()}K
              </p>
              <p className="text-xs text-green-600 mt-2">↑ 0% from last month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              <p className="text-xs text-blue-600 mt-2">
                {stats.pendingOrders} pending
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCustomers}</p>
              <p className="text-xs text-purple-600 mt-2">
                {stats.activeCustomers} active
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
              <p className="text-xs text-orange-600 mt-2">
                <button onClick={() => navigate('/admin/products')} className="hover:underline">
                  View all
                </button>
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <PackageIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Revenue ($K)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No revenue data available
            </div>
          )}
        </div>

        {/* Orders Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { status: 'Pending', count: stats.pendingOrders },
              { status: 'Processing', count: stats.processingOrders },
              { status: 'Completed', count: stats.completedOrders },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10B981" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Products by Category
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No category data available
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/products/new')}
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add New Product
            </button>
            
            <button
              onClick={() => navigate('/admin/orders')}
              className="w-full btn btn-outline flex items-center justify-center gap-2"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              View All Orders
            </button>
            
            <button
              onClick={() => navigate('/admin/customers')}
              className="w-full btn btn-outline flex items-center justify-center gap-2"
            >
              <UsersIcon className="w-5 h-5" />
              View All Customers
            </button>
            
            <button
              onClick={() => navigate('/admin/categories')}
              className="w-full btn btn-outline flex items-center justify-center gap-2"
            >
              <TagIcon className="w-5 h-5" />
              Manage Categories
            </button>
          </div>

          {/* Order Status Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Order Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  {stats.pendingOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Processing</span>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {stats.processingOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  {stats.completedOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                  {stats.totalOrders}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function DollarIcon(props: { className?: string }) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShoppingBagIcon(props: { className?: string }) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function UsersIcon(props: { className?: string }) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function PackageIcon(props: { className?: string }) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function PlusIcon(props: { className?: string }) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function TagIcon(props: { className?: string }) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}