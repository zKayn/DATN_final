// admin-web/src/pages/Dashboard/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Grid, // ✅ FIX: Use normal Grid, not Grid2
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  People,
  Inventory,
  AttachMoney,
  HourglassEmpty,
  LocalShipping,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dashboardApi, {
  OverviewStats,
  RevenueChartData,
  TopProduct,
  TopCustomer,
  CategoryStat,
  RecentOrder,
} from '../../services/dashboardApi';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  // State
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        overviewData,
        revenueChartData,
        productsData,
        customersData,
        categoriesData,
        ordersData,
      ] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getRevenueChart(period),
        dashboardApi.getTopProducts(5),
        dashboardApi.getTopCustomers(5),
        dashboardApi.getCategoryStats(),
        dashboardApi.getRecentOrders(5),
      ]);

      setOverview(overviewData);
      setRevenueData(revenueChartData);
      setTopProducts(productsData);
      setTopCustomers(customersData);
      setCategoryStats(categoriesData);
      setRecentOrders(ordersData);
    } catch (err: any) {
      console.error('❌ Fetch dashboard error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'success' | 'warning' | 'error' } = {
      PENDING: 'warning',
      PROCESSING: 'primary',
      SHIPPING: 'primary',
      DELIVERED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!overview) {
    return null;
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back! Here's what's happening with your store today.
        </Typography>
      </Box>

      {/* Overview Cards */}
      {/* ✅ FIX: Use 'item xs' instead of Grid2 syntax */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Revenue Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <AttachMoney fontSize="large" />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(overview.revenue.total)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                    {overview.revenue.growth >= 0 ? (
                      <TrendingUp fontSize="small" color="success" />
                    ) : (
                      <TrendingDown fontSize="small" color="error" />
                    )}
                    <Typography
                      variant="caption"
                      color={overview.revenue.growth >= 0 ? 'success.main' : 'error.main'}
                    >
                      {Math.abs(overview.revenue.growth).toFixed(1)}% vs last month
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Orders Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <ShoppingCart fontSize="large" />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatNumber(overview.orders.total)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                    {overview.orders.growth >= 0 ? (
                      <TrendingUp fontSize="small" color="success" />
                    ) : (
                      <TrendingDown fontSize="small" color="error" />
                    )}
                    <Typography
                      variant="caption"
                      color={overview.orders.growth >= 0 ? 'success.main' : 'error.main'}
                    >
                      {Math.abs(overview.orders.growth).toFixed(1)}% vs last month
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Customers Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <People fontSize="large" />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Total Customers
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatNumber(overview.customers.total)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" mt={0.5}>
                    Active users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Products Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <Inventory fontSize="large" />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Total Products
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatNumber(overview.products.total)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" mt={0.5}>
                    In catalog
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Order Status Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.light', width: 48, height: 48 }}>
                  <HourglassEmpty />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatNumber(overview.orders.pending)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'info.light', width: 48, height: 48 }}>
                  <LocalShipping />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatNumber(overview.orders.processing)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Processing Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Revenue Overview
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                onChange={(e) => setPeriod(e.target.value as any)}
              >
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
              />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <ChartTooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={formatDate}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                🏆 Top Selling Products
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Sold</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              src={item.product?.images[0]?.imageUrl}
                              variant="rounded"
                              sx={{ width: 40, height: 40 }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {item.product?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.product?.category.name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatNumber(item.totalSold)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            {formatCurrency(item.totalRevenue)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                👥 Top Customers
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell align="right">Orders</TableCell>
                      <TableCell align="right">Spent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topCustomers.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              src={item.user?.avatar}
                              sx={{ width: 32, height: 32 }}
                            >
                              {item.user?.firstName?.[0] || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {item.user?.firstName} {item.user?.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.user?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {item.totalOrders}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            {formatCurrency(item.totalSpent)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Stats */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            📊 Revenue by Category
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryStats}
                dataKey="revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => entry.name}
              >
                {categoryStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            📦 Recent Orders
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        #{order.id.slice(0, 8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.user.firstName} {order.user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.items.length} items
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(order.total)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        size="small"
                        color={getStatusColor(order.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;