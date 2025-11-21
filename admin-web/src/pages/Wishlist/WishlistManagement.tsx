// admin-web/src/pages/Wishlist/WishlistManagement.tsx
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
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Grid, 
  IconButton,
  Tooltip,
  TablePagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import apiService from '../../services/api';

interface WishlistStats {
  totalWishlists: number;
  totalUsers: number;
  averageWishlistSize: number;
  mostWishlistedProducts: Array<{
    product: any;
    count: number;
  }>;
}

interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  product: {
    name: string;
    price: number;
    images: Array<{ imageUrl: string }>;
    category: { name: string };
  };
}

const WishlistManagement: React.FC = () => {
  const [stats, setStats] = useState<WishlistStats | null>(null);
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ FIX: Use apiService methods
      const [statsData, wishlistsData] = await Promise.all([
        apiService.getWishlistStats(),
        apiService.getAllWishlists({
          page: page + 1,
          limit: rowsPerPage,
        }),
      ]);

      setStats(statsData.data);
      setWishlists(wishlistsData.data.items);
      setTotal(wishlistsData.data.pagination.total);
    } catch (err: any) {
      console.error('❌ Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = async () => {
    try {
      // TODO: Implement export functionality
      console.log('Export to CSV');
      alert('Export feature coming soon!');
    } catch (error) {
      console.error('❌ Export error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredWishlists = wishlists.filter((item) =>
    searchTerm
      ? item.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  if (loading && !stats) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold">
          Wishlist Management
        </Typography>
        <Tooltip title="Export to CSV">
          <IconButton color="primary" onClick={handleExport}>
            <FileDownloadIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <FavoriteIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalWishlists}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Wishlists
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.averageWishlistSize.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Items/User
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <FavoriteIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.mostWishlistedProducts.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Popular Items
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Top Products */}
      {stats && stats.mostWishlistedProducts.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              🔥 Most Wishlisted Products
            </Typography>
            <Grid container spacing={2}>
              {stats.mostWishlistedProducts.map((item, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" gap={2}>
                        <Avatar
                          src={item.product?.images[0]?.imageUrl}
                          variant="rounded"
                          sx={{ width: 60, height: 60 }}
                        />
                        <Box flex={1}>
                          <Typography variant="body1" fontWeight="bold" noWrap>
                            {item.product?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.product?.category?.name}
                          </Typography>
                          <Chip
                            label={`${item.count} wishlists`}
                            size="small"
                            color="primary"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Wishlist Table */}
      <Card>
        <CardContent>
          <Box mb={2}>
            <TextField
              fullWidth
              placeholder="Search by user email or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell>Added Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : filteredWishlists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No wishlist items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWishlists.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {item.user.fullName?.[0] || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {item.user.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            src={item.product.images[0]?.imageUrl}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          />
                          <Typography variant="body2">
                            {item.product.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.product.category.name}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(item.product.price)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(item.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default WishlistManagement;