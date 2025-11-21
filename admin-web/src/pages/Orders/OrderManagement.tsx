// admin-web/src/pages/Orders/OrderManagement.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  Badge,
} from '@mui/material';
import { 
  Visibility, 
  CheckCircle, 
  Cancel, 
  LocalShipping,
  Notifications, // ← THÊM
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import { useSocket } from '../../hooks/useSocket'; // ← THÊM IMPORT

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [newOrderCount, setNewOrderCount] = useState(0); // ← THÊM: Đếm order mới
  
  const socket = useSocket(); // ← THÊM: Connect socket

  useEffect(() => {
    loadOrders();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // ========================================
  // 🔔 SOCKET.IO REAL-TIME LISTENERS
  // ========================================
  useEffect(() => {
    if (!socket) return;

    console.log('🔌 Setting up socket listeners...');

    // 📢 Listen for new orders from mobile app
    socket.on('order:created', (data) => {
      console.log('🔔 New order received:', data);
      
      // Show toast notification
      toast.info(
        `🛒 New Order: ${data.order.orderNumber}`,
        {
          position: 'top-right',
          autoClose: 5000,
          onClick: () => handleViewDetail(data.order.id),
        }
      );

      // Show browser notification if permitted
      showBrowserNotification(
        'New Order Received',
        `Order #${data.order.orderNumber} - $${Number(data.order.total).toFixed(2)}`
      );

      // Play notification sound
      playNotificationSound();

      // Increment new order count
      setNewOrderCount((prev) => prev + 1);

      // Add order to the top of the list
      setOrders((prevOrders) => [data.order, ...prevOrders]);
    });

    // 📢 Listen for order cancellations
    socket.on('order:cancelled', (data) => {
      console.log('🔔 Order cancelled:', data);
      
      toast.warning(
        `⚠️ Order Cancelled: ${data.orderNumber}`,
        {
          position: 'top-right',
          autoClose: 5000,
        }
      );

      // Update order in list
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === data.orderId
            ? { ...order, status: 'CANCELLED' }
            : order
        )
      );
    });

    // 📢 Listen for order status changes (from other admins)
    socket.on('order:status_changed', (data) => {
      console.log('🔔 Order status changed:', data);
      
      // Update order in list
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === data.orderId
            ? { ...order, status: data.status, paymentStatus: data.paymentStatus }
            : order
        )
      );
    });

    // Cleanup listeners
    return () => {
      console.log('🔌 Cleaning up socket listeners...');
      socket.off('order:created');
      socket.off('order:cancelled');
      socket.off('order:status_changed');
    };
  }, [socket]);

  // ========================================
  // 🔔 NOTIFICATION HELPERS
  // ========================================
  
  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const showBrowserNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo.png', // Your app logo
        badge: '/badge.png',
        tag: 'order-notification',
        requireInteraction: false,
      });
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3'); // Add sound file to public folder
      audio.volume = 0.5;
      audio.play().catch((e) => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Notification sound error:', error);
    }
  };

  const clearNewOrderCount = () => {
    setNewOrderCount(0);
  };

  // ========================================
  // EXISTING FUNCTIONS (No changes)
  // ========================================

  const loadOrders = async () => {
    try {
      const response = await apiService.getOrders();
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Load orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (orderId: string) => {
    try {
      clearNewOrderCount(); // Clear badge when viewing orders
      const response = await apiService.getOrderById(orderId);
      if (response.success) {
        setSelectedOrder(response.data);
        setDetailDialogOpen(true);
      }
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  const handleOpenStatusDialog = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await apiService.updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
      });

      if (response.success) {
        toast.success('Order status updated successfully');
        setStatusDialogOpen(false);
        loadOrders();
        
        // 🔔 Socket will automatically notify the user via backend
        // No need to manually emit here
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      PENDING: 'warning',
      PROCESSING: 'info',
      SHIPPED: 'primary',
      DELIVERED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const parseShippingAddress = (addressString: string) => {
    try {
      return JSON.parse(addressString);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" fontWeight="bold">
            Order Management
          </Typography>
          
          {/* 🔔 New Order Badge */}
          {newOrderCount > 0 && (
            <Badge badgeContent={newOrderCount} color="error">
              <Notifications color="action" />
            </Badge>
          )}
          
          {/* 🔌 Socket Connection Status */}
          <Chip
            label={socket?.connected ? '🟢 Live' : '🔴 Offline'}
            size="small"
            color={socket?.connected ? 'success' : 'default'}
            variant="outlined"
          />
        </Box>

        <Button 
          variant="outlined" 
          onClick={() => {
            clearNewOrderCount();
            loadOrders();
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* 🔔 Connection Status Alert */}
      {socket && !socket.connected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Real-time updates are currently unavailable. Orders will refresh automatically.
        </Alert>
      )}

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => {
                const address = parseShippingAddress(order.shippingAddress);
                return (
                  <TableRow key={order.id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{address?.fullName || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.items?.length || 0} items</TableCell>
                    <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.paymentMethod.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetail(order.id)}
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenStatusDialog(order)}
                        title="Update Status"
                        color="primary"
                      >
                        <LocalShipping />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              {/* Order Info */}
              <Typography variant="h6" gutterBottom>
                Order Information
              </Typography>
              <Box mb={2}>
                <Typography>Status: <Chip label={selectedOrder.status} size="small" /></Typography>
                <Typography>Payment: {selectedOrder.paymentMethod.toUpperCase()}</Typography>
                <Typography>Payment Status: {selectedOrder.paymentStatus}</Typography>
                {selectedOrder.trackingNumber && (
                  <Typography>Tracking: {selectedOrder.trackingNumber}</Typography>
                )}
              </Box>

              {/* Shipping Address */}
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Box mb={2}>
                {(() => {
                  const address = parseShippingAddress(selectedOrder.shippingAddress);
                  return address ? (
                    <>
                      <Typography>{address.fullName}</Typography>
                      <Typography>{address.phone}</Typography>
                      <Typography>{address.address}</Typography>
                      <Typography>
                        {address.city}, {address.postalCode}, {address.country}
                      </Typography>
                    </>
                  ) : (
                    <Typography>No address available</Typography>
                  );
                })()}
              </Box>

              {/* Items */}
              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Size/Color</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ', '}
                          {item.color && `Color: ${item.color}`}
                        </TableCell>
                        <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${(Number(item.price) * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Price Summary */}
              <Box mt={2}>
                <Typography>Subtotal: ${Number(selectedOrder.subtotal).toFixed(2)}</Typography>
                <Typography>Shipping: ${Number(selectedOrder.shippingFee).toFixed(2)}</Typography>
                <Typography variant="h6">
                  Total: ${Number(selectedOrder.total).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            margin="normal"
          >
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="PROCESSING">Processing</MenuItem>
            <MenuItem value="SHIPPED">Shipped</MenuItem>
            <MenuItem value="DELIVERED">Delivered</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </TextField>

          {(newStatus === 'SHIPPED' || newStatus === 'DELIVERED') && (
            <TextField
              fullWidth
              label="Tracking Number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              margin="normal"
              placeholder="Enter tracking number"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderManagement;