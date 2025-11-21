import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductStore } from '../store/productStore';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const { createProduct, updateProduct, loading, categories, brands, fetchCategories, fetchBrands } = useProductStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    sku: '',
    categoryId: '',
    brandId: '',
    stock: '',
    sizes: [] as string[],
    colors: [] as string[],
    isActive: true,
    isFeatured: false,
  });

  const [images, setImages] = useState<string[]>([]);
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');

  // Fetch categories and brands on mount
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [fetchCategories, fetchBrands]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        sku: formData.sku,
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        stock: parseInt(formData.stock),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        images: images.length > 0 ? images : undefined,
        variants: formData.sizes.length > 0 ? formData.sizes.map((size, idx) => ({
          size,
          color: formData.colors[idx] || formData.colors[0] || 'Default',
          stock: Math.floor(parseInt(formData.stock) / formData.sizes.length),
          sku: `${formData.sku}-${size}`,
        })) : undefined,
      };

      if (isEditMode && id) {
        await updateProduct(id, productData);
      } else {
        await createProduct(productData);
      }

      alert(isEditMode ? 'Product updated successfully!' : 'Product created successfully!');
      navigate('/admin/products');
    } catch (error: any) {
      alert('Failed to save product: ' + (error.response?.data?.message || error.message));
      console.error('Save product error:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Mock image upload - In production, upload to Cloudinary/S3
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize]
      }));
      setNewSize('');
    }
  };

  const removeSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size)
    }));
  };

  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
      setNewColor('');
    }
  };

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="btn btn-ghost"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? 'Update product information' : 'Fill in the details to create a new product'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input"
                placeholder="e.g., Air Max 270 React"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input min-h-[100px]"
                rows={4}
                placeholder="Product description..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="input"
                placeholder="e.g., NIKE-AM270-BLK"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({...formData, brandId: e.target.value})}
                className="input"
                required
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                className="input"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="input"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="input pl-8"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                  className="input pl-8"
                  step="0.01"
                  min="0"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">For showing discounts</p>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Product Images</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">Upload up to 5 images. First image will be the main image.</p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Variants */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Variants</h2>
          
          <div className="space-y-6">
            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sizes
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  className="input"
                  placeholder="e.g., 7, 8, 9..."
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.sizes.map((size) => (
                  <span key={size} className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Colors
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  className="input"
                  placeholder="e.g., Black, White, Red..."
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.colors.map((color) => (
                  <span key={color} className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                    {color}
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Status & Visibility</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">Active</div>
                <div className="text-sm text-gray-500">Product is visible and available for purchase</div>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">Featured</div>
                <div className="text-sm text-gray-500">Show in featured section on homepage</div>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
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