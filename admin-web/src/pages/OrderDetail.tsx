import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrderStore } from '../store/orderStore';
import { OrderStatus, PaymentStatus } from '../types';
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '../utils/constants';
import { format } from 'date-fns';

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedOrder, isLoading, fetchOrderById, updateOrderStatus, updatePaymentStatus, addTrackingNumber, cancelOrder } = useOrderStore();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.PROCESSING);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (id) {
      console.log('🔍 OrderDetail: Loading order:', id);
      
      // Set timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.error('⏰ OrderDetail: Loading timeout');
        alert('Failed to load order. Redirecting...');
        navigate('/admin/orders');
      }, 15000); // 15 seconds

      fetchOrderById(id)
        .then(() => {
          console.log('✅ OrderDetail: Order loaded successfully');
          clearTimeout(timeout);
        })
        .catch((error) => {
          console.error('❌ OrderDetail: Failed to load order:', error);
          clearTimeout(timeout);
          alert('Failed to load order. Redirecting...');
          navigate('/admin/orders');
        });

      return () => clearTimeout(timeout);
    }
  }, [id, fetchOrderById, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-gray-600 text-lg">Order not found</p>
        <button 
          onClick={() => navigate('/admin/orders')}
          className="btn btn-primary"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const order = selectedOrder;

  const handleUpdateStatus = async () => {
    if (!id) return;
    try {
      await updateOrderStatus(id, newStatus);
      setShowStatusModal(false);
      alert('Order status updated successfully!');
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleAddTracking = async () => {
    if (!id || !trackingNumber || !carrierName) return;
    try {
      await addTrackingNumber(id, trackingNumber, carrierName);
      setShowTrackingModal(false);
      setTrackingNumber('');
      setCarrierName('');
      alert('Tracking information added successfully!');
    } catch (error) {
      alert('Failed to add tracking');
    }
  };

  const handleCancelOrder = async () => {
    if (!id || !cancelReason) return;
    try {
      await cancelOrder(id, cancelReason);
      setShowCancelModal(false);
      alert('Order cancelled successfully!');
    } catch (error) {
      alert('Failed to cancel order');
    }
  };

  const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
  label: order.status || 'Unknown',
  bgColor: 'bg-gray-100',
  textColor: 'text-gray-800',
};

const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus] || {
  label: order.paymentStatus || 'Unknown',
  bgColor: 'bg-gray-100',
  textColor: 'text-gray-800',
};

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="btn btn-ghost"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order {order.orderNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy HH:mm')}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowStatusModal(true)}
            className="btn btn-secondary"
          >
            Update Status
          </button>
          {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn btn-danger"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={item.product.images?.[0] || '/placeholder-image.jpg'}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>Size: {item.size || 'N/A'}</span>
                      <span>Color: {item.color || 'N/A'}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${Number(item.total || 0).toFixed(2)}</div>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <div className="text-sm text-gray-500 line-through">
                        ${Number((item.originalPrice || 0) * item.quantity).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
            <div className="space-y-2">
              <p className="font-semibold">{order.shippingAddress.fullName}</p>
              <p className="text-gray-600">{order.shippingAddress.phone}</p>
              <p className="text-gray-600">
                {order.shippingAddress.street}
                {order.shippingAddress.street2 && `, ${order.shippingAddress.street2}`}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p className="text-gray-600">{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Tracking Information */}
          {order.trackingNumber && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tracking Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Carrier:</span>
                  <span className="font-semibold">{order.carrierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking Number:</span>
                  <span className="font-mono font-semibold">{order.trackingNumber}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Notes</h2>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">${Number(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-semibold">${Number(order.shippingFee || order.shipping || 0).toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span className="font-semibold">-${Number(order.discount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-primary-600">${Number(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Status</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Order Status</label>
                <div className="mt-1">
                  <span className={`badge ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Payment Status</label>
                <div className="mt-1">
                  <span className={`badge ${paymentConfig.bgColor} ${paymentConfig.textColor}`}>
                    {paymentConfig.label}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Payment Method</label>
                <div className="mt-1 font-semibold capitalize">
                  {order.paymentMethod.replace('_', ' ')}
                </div>
              </div>
            </div>

            {!order.trackingNumber && order.status !== OrderStatus.CANCELLED && (
              <button
                onClick={() => setShowTrackingModal(true)}
                className="btn btn-primary w-full mt-4"
              >
                Add Tracking Number
              </button>
            )}
          </div>

          {/* Customer Info */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer</h2>
            <div className="space-y-2">
              <p className="font-semibold">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p className="text-gray-600">{order.customer.email}</p>
              {order.customer.phone && (
                <p className="text-gray-600">{order.customer.phone}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals... (same as before) */}
      {showStatusModal && (
        <div className="modal-backdrop" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Update Order Status</h3>
              <button onClick={() => setShowStatusModal(false)}>
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="select"
              >
                <option value={OrderStatus.PENDING}>Pending</option>
                <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                <option value={OrderStatus.PROCESSING}>Processing</option>
                <option value={OrderStatus.SHIPPED}>Shipped</option>
                <option value={OrderStatus.DELIVERED}>Delivered</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowStatusModal(false)} className="btn btn-outline flex-1">
                  Cancel
                </button>
                <button onClick={handleUpdateStatus} className="btn btn-primary flex-1">
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTrackingModal && (
        <div className="modal-backdrop" onClick={() => setShowTrackingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Add Tracking Information</h3>
              <button onClick={() => setShowTrackingModal(false)}>
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Carrier Name</label>
                <input
                  type="text"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  className="input"
                  placeholder="e.g., FedEx, UPS, DHL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="input"
                  placeholder="Enter tracking number"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowTrackingModal(false)} className="btn btn-outline flex-1">
                  Cancel
                </button>
                <button onClick={handleAddTracking} className="btn btn-primary flex-1">
                  Add Tracking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="modal-backdrop" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-600">Cancel Order</h3>
              <button onClick={() => setShowCancelModal(false)}>
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">Are you sure you want to cancel this order? This action cannot be undone.</p>
              <div>
                <label className="block text-sm font-medium mb-2">Cancellation Reason</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="textarea"
                  rows={3}
                  placeholder="Enter reason for cancellation..."
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowCancelModal(false)} className="btn btn-outline flex-1">
                  Keep Order
                </button>
                <button onClick={handleCancelOrder} className="btn btn-danger flex-1">
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ArrowLeftIcon(props: { className?: string }) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function XIcon(props: { className?: string }) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}