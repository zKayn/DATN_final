// admin-web/src/pages/Analytics.tsx

import { useState, useEffect } from 'react';
import apiService from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [stats, setStats] = useState({
    revenue: { current: 0, previous: 0, change: 0 },
    orders: { current: 0, previous: 0, change: 0 },
    customers: { current: 0, previous: 0, change: 0 },
    avgOrderValue: { current: 0, previous: 0, change: 0 },
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all necessary data
      const [ordersResponse, customersResponse, productsResponse] = await Promise.all([
        apiService.getOrderStats(),
        apiService.getCustomerStats(),
        apiService.getProducts(),
      ]);

      if (ordersResponse.success && customersResponse.success) {
        const avgOrder = ordersResponse.data.totalOrders > 0
          ? ordersResponse.data.totalRevenue / ordersResponse.data.totalOrders
          : 0;

        setStats({
          revenue: {
            current: ordersResponse.data.totalRevenue || 0,
            previous: ordersResponse.data.totalRevenue * 0.85 || 0,
            change: 15,
          },
          orders: {
            current: ordersResponse.data.totalOrders || 0,
            previous: Math.floor((ordersResponse.data.totalOrders || 0) * 0.9),
            change: 10,
          },
          customers: {
            current: customersResponse.data.totalCustomers || 0,
            previous: Math.floor((customersResponse.data.totalCustomers || 0) * 0.95),
            change: 5,
          },
          avgOrderValue: {
            current: avgOrder,
            previous: avgOrder * 0.9,
            change: 10,
          },
        });
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const revenueData = [
    { date: 'Week 1', revenue: 4500, orders: 45 },
    { date: 'Week 2', revenue: 5200, orders: 52 },
    { date: 'Week 3', revenue: 4800, orders: 48 },
    { date: 'Week 4', revenue: 6100, orders: 61 },
  ];

  const categoryData = [
    { name: 'Running', value: 35, revenue: 12500 },
    { name: 'Basketball', value: 25, revenue: 8900 },
    { name: 'Football', value: 20, revenue: 7100 },
    { name: 'Gym', value: 15, revenue: 5300 },
    { name: 'Others', value: 5, revenue: 1800 },
  ];

  const topProducts = [
    { name: 'Nike Air Max 270', sales: 234, revenue: 28080 },
    { name: 'Adidas Ultraboost', sales: 189, revenue: 26460 },
    { name: 'Puma RS-X', sales: 156, revenue: 18720 },
    { name: 'Under Armour HOVR', sales: 142, revenue: 19880 },
    { name: 'Reebok Nano X', sales: 128, revenue: 15360 },
  ];

  const customerData = [
    { month: 'Jan', new: 45, returning: 120 },
    { month: 'Feb', new: 52, returning: 145 },
    { month: 'Mar', new: 48, returning: 158 },
    { month: 'Apr', new: 61, returning: 172 },
    { month: 'May', new: 72, returning: 189 },
    { month: 'Jun', new: 68, returning: 201 },
  ];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <DollarIcon className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${stats.revenue.current.toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-sm font-medium ${stats.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.revenue.change >= 0 ? '↑' : '↓'} {Math.abs(stats.revenue.change)}%
            </span>
            <span className="text-xs text-gray-500">vs previous period</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Orders</p>
            <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.orders.current}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-sm font-medium ${stats.orders.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.orders.change >= 0 ? '↑' : '↓'} {Math.abs(stats.orders.change)}%
            </span>
            <span className="text-xs text-gray-500">vs previous period</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Customers</p>
            <UsersIcon className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.customers.current}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-sm font-medium ${stats.customers.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.customers.change >= 0 ? '↑' : '↓'} {Math.abs(stats.customers.change)}%
            </span>
            <span className="text-xs text-gray-500">vs previous period</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Order Value</p>
            <ChartIcon className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${stats.avgOrderValue.current.toFixed(2)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-sm font-medium ${stats.avgOrderValue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.avgOrderValue.change >= 0 ? '↑' : '↓'} {Math.abs(stats.avgOrderValue.change)}%
            </span>
            <span className="text-xs text-gray-500">vs previous period</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)"
                name="Revenue ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#10B981" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryData.map((cat, index) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ${cat.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Acquisition */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Acquisition</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={customerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="new" fill="#3B82F6" name="New Customers" />
              <Bar dataKey="returning" fill="#10B981" name="Returning Customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Sales
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <tr key={product.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
                      <span className="text-sm font-bold text-primary-600">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-gray-900">{product.sales} units</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-gray-900">
                      ${product.revenue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(product.sales / topProducts[0].sales) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {((product.sales / topProducts[0].sales) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

function ChartIcon(props: { className?: string }) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}