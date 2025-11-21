// admin-web/src/pages/Reviews/ReviewManagement.tsx
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
  Typography,
  CircularProgress,
  Alert,
  Rating,
  Avatar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import apiService from '../../services/api';

interface Review {
  id: string;
  rating: number;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface ReviewStats {
  total: number;
  averageRating: number;
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch reviews and stats
  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, []);

  const fetchReviews = async () => {
    try {
      console.log('📊 Fetching reviews...');
      setLoading(true);
      setError(null);
      
      // ✅ ĐÚNG: /api/reviews/admin/all (không phải /api/admin/reviews/all)
      const response = await apiService.get('/reviews/admin/all');
      
      console.log('✅ Reviews fetched:', response.data);
      
      if (response.data.success) {
        setReviews(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch reviews');
      }
    } catch (err: any) {
      console.error('❌ Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 Fetching review stats...');
      
      // ✅ ĐÚNG: /api/reviews/admin/stats (không phải /api/admin/reviews/stats)
      const response = await apiService.get('/reviews/admin/stats');
      
      console.log('✅ Stats fetched:', response.data);
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err: any) {
      console.error('❌ Error fetching stats:', err);
      // Không hiển thị error cho stats vì không quan trọng lắm
    }
  };

  const handleUpdateStatus = async (reviewId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      console.log(`🔄 Updating review ${reviewId} to ${status}...`);
      
      // ✅ ĐÚNG: /api/reviews/admin/:id/status
      const response = await apiService.patch(`/reviews/admin/${reviewId}/status`, {
        status,
      });
      
      console.log('✅ Status updated:', response.data);
      
      if (response.data.success) {
        // Refresh reviews
        await fetchReviews();
        await fetchStats();
        setOpenDialog(false);
        setSelectedReview(null);
      }
    } catch (err: any) {
      console.error('❌ Error updating status:', err);
      setError(err.response?.data?.message || 'Failed to update review status');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      console.log(`🗑️ Deleting review ${reviewId}...`);
      
      // ✅ ĐÚNG: /api/reviews/admin/:id
      const response = await apiService.delete(`/reviews/admin/${reviewId}`);
      
      console.log('✅ Review deleted:', response.data);
      
      if (response.data.success) {
        // Refresh reviews
        await fetchReviews();
        await fetchStats();
      }
    } catch (err: any) {
      console.error('❌ Error deleting review:', err);
      setError(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
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
      <Typography variant="h4" gutterBottom>
        Review Management
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Box display="flex" gap={2} mb={3}>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography variant="h6">Total Reviews</Typography>
            <Typography variant="h4">{stats.total}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography variant="h6">Average Rating</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h4">{stats.averageRating.toFixed(1)}</Typography>
              <Rating value={stats.averageRating} readOnly precision={0.1} />
            </Box>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography variant="h6">Pending</Typography>
            <Typography variant="h4" color="warning.main">
              {stats.byStatus.pending}
            </Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography variant="h6">Approved</Typography>
            <Typography variant="h4" color="success.main">
              {stats.byStatus.approved}
            </Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography variant="h6">Rejected</Typography>
            <Typography variant="h4" color="error.main">
              {stats.byStatus.rejected}
            </Typography>
          </Card>
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Reviews Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          src={review.product.images[0]}
                          variant="rounded"
                          sx={{ width: 40, height: 40 }}
                        />
                        <Typography variant="body2">{review.product.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar src={review.user.avatar} sx={{ width: 32, height: 32 }} />
                        <Box>
                          <Typography variant="body2">
                            {review.user.firstName} {review.user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {review.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Rating value={review.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {review.comment}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={review.status}
                        color={getStatusColor(review.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedReview(review);
                          setOpenDialog(true);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                      {review.status === 'PENDING' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleUpdateStatus(review.id, 'APPROVED')}
                          >
                            <ApproveIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleUpdateStatus(review.id, 'REJECTED')}
                          >
                            <RejectIcon />
                          </IconButton>
                        </>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(review.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Review Detail Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedReview && (
          <>
            <DialogTitle>Review Details</DialogTitle>
            <DialogContent>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Product
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Avatar
                    src={selectedReview.product.images[0]}
                    variant="rounded"
                    sx={{ width: 60, height: 60 }}
                  />
                  <Typography variant="h6">{selectedReview.product.name}</Typography>
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  User
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Avatar src={selectedReview.user.avatar} />
                  <Box>
                    <Typography>
                      {selectedReview.user.firstName} {selectedReview.user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedReview.user.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Rating
                </Typography>
                <Rating value={selectedReview.rating} readOnly sx={{ mt: 1 }} />
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Comment
                </Typography>
                <Typography sx={{ mt: 1 }}>{selectedReview.comment}</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedReview.status}
                  color={getStatusColor(selectedReview.status)}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  {new Date(selectedReview.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              {selectedReview.status === 'PENDING' && (
                <>
                  <Button
                    onClick={() => handleUpdateStatus(selectedReview.id, 'APPROVED')}
                    color="success"
                    variant="contained"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedReview.id, 'REJECTED')}
                    color="error"
                    variant="contained"
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ReviewManagement;