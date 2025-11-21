// admin-web/src/pages/Reviews.tsx
// ✅ FIXED - Using emojis instead of heroicons

import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { format } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminReply?: string;
  helpfulCount: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  product: {
    id: string;
    name: string;
    images: string[] | Array<{ url: string }>;
  };
}

interface Stats {
  total: number;
  averageRating: number;
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');
  const [filterRating, setFilterRating] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    averageRating: 0,
    byStatus: {
      pending: 0,
      approved: 0,
      rejected: 0,
    },
  });

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [filterStatus, filterRating]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      console.log('📊 Fetching reviews...');
      console.log('Filters:', { status: filterStatus, rating: filterRating });

      const response = await apiService.get('/reviews/admin/all', {
        params: {
          status: filterStatus,
          rating: filterRating ? Number(filterRating) : undefined,
        },
      });
      
      console.log('✅ Reviews response:', response.data);

      if (response.data.success) {
        const reviewsData = Array.isArray(response.data.data) 
          ? response.data.data 
          : response.data.data.reviews || [];
        
        setReviews(reviewsData);
        console.log('✅ Set', reviewsData.length, 'reviews');
      }
    } catch (error: any) {
      console.error('❌ Fetch reviews error:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 Fetching stats...');
      
      const response = await apiService.get('/reviews/admin/stats');
      
      console.log('✅ Stats response:', response.data);
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error: any) {
      console.error('❌ Fetch stats error:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      console.log('✅ Approving review:', reviewId);
      
      await apiService.patch(`/reviews/admin/${reviewId}/status`, {
        status: 'APPROVED',
      });
      
      console.log('✅ Review approved');
      await fetchReviews();
      await fetchStats();
      alert('Review approved successfully!');
    } catch (error: any) {
      console.error('❌ Approve error:', error);
      alert('Failed to approve review: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      console.log('❌ Rejecting review:', reviewId);
      
      await apiService.patch(`/reviews/admin/${reviewId}/status`, {
        status: 'REJECTED',
      });
      
      console.log('✅ Review rejected');
      await fetchReviews();
      await fetchStats();
      alert('Review rejected successfully!');
    } catch (error: any) {
      console.error('❌ Reject error:', error);
      alert('Failed to reject review: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting review:', reviewId);
      
      await apiService.delete(`/reviews/admin/${reviewId}`);
      
      console.log('✅ Review deleted');
      await fetchReviews();
      await fetchStats();
      alert('Review deleted successfully!');
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      alert('Failed to delete review: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) {
      alert('Please enter a reply');
      return;
    }

    try {
      console.log('💬 Replying to review:', selectedReview.id);
      
      await apiService.put(`/reviews/admin/${selectedReview.id}/reply`, {
        reply: replyText,
      });
      
      console.log('✅ Reply added');
      setShowReplyModal(false);
      setReplyText('');
      setSelectedReview(null);
      await fetchReviews();
      alert('Reply added successfully!');
    } catch (error: any) {
      console.error('❌ Reply error:', error);
      alert('Failed to add reply: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStarColor = (rating: number) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBadge = (review: Review) => {
    const status = review.status || (review.isApproved ? 'APPROVED' : 'PENDING');
    
    const styles = {
      APPROVED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      REJECTED: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getProductImage = (product: Review['product']) => {
    if (Array.isArray(product.images)) {
      if (typeof product.images[0] === 'string') {
        return product.images[0];
      } else if (product.images[0]?.url) {
        return product.images[0].url;
      }
    }
    return '/placeholder-product.png';
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
        <p className="text-gray-600 mt-1">Manage customer reviews and ratings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              ⭐
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.byStatus.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
              ⏳
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.byStatus.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.averageRating.toFixed(1)} ⭐
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>

          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <button
            onClick={() => {
              setFilterStatus('all');
              setFilterRating('');
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews</h3>
            <p className="mt-1 text-sm text-gray-500">No reviews match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={getProductImage(review.product)}
                          alt={review.product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {review.product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {review.user.firstName} {review.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{review.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-lg font-bold ${getStarColor(review.rating)}`}>
                          {review.rating} ⭐
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {review.comment || 'No comment'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(review)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 text-lg"
                          title="View Details"
                        >
                          👁️
                        </button>

                        {(!review.status || review.status === 'PENDING' || !review.isApproved) && (
                          <>
                            <button
                              onClick={() => handleApprove(review.id)}
                              className="text-green-600 hover:text-green-900 text-lg"
                              title="Approve"
                            >
                              ✅
                            </button>
                            <button
                              onClick={() => handleReject(review.id)}
                              className="text-yellow-600 hover:text-yellow-900 text-lg"
                              title="Reject"
                            >
                              ❌
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setReplyText(review.adminReply || '');
                            setShowReplyModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900 text-lg"
                          title="Reply"
                        >
                          💬
                        </button>

                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-red-600 hover:text-red-900 text-lg"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reply to Review
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Review: {selectedReview.comment}
              </p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your reply..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setSelectedReview(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Review Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <div className="mt-1 flex items-center">
                  <img
                    src={getProductImage(selectedReview.product)}
                    alt={selectedReview.product.name}
                    className="h-16 w-16 rounded object-cover"
                  />
                  <span className="ml-3 text-sm">{selectedReview.product.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <p className="mt-1 text-sm">
                  {selectedReview.user.firstName} {selectedReview.user.lastName} ({selectedReview.user.email})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <div className="mt-1 flex items-center">
                  <span className={`text-2xl font-bold ${getStarColor(selectedReview.rating)}`}>
                    {selectedReview.rating} ⭐
                  </span>
                </div>
              </div>

              {selectedReview.title && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-sm">{selectedReview.title}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Comment</label>
                <p className="mt-1 text-sm whitespace-pre-wrap">{selectedReview.comment || 'No comment'}</p>
              </div>

              {selectedReview.adminReply && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-blue-900">Admin Reply</label>
                  <p className="mt-1 text-sm text-blue-800">{selectedReview.adminReply}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Status: {getStatusBadge(selectedReview)}</span>
                <span>Date: {format(new Date(selectedReview.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                {selectedReview.isVerifiedPurchase && (
                  <span className="text-green-600">✓ Verified Purchase</span>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}