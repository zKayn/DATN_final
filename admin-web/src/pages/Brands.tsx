// admin-web/src/pages/Brands.tsx

import { useState, useEffect } from 'react';
import apiService from '../services/api';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function Brands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await apiService.getBrands();
      if (response.success) {
        setBrands(response.data);
      }
    } catch (error) {
      console.error('Fetch brands error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBrand) {
        await apiService.updateBrand(editingBrand.id, formData);
      } else {
        await apiService.createBrand(formData);
      }
      
      setShowModal(false);
      resetForm();
      fetchBrands();
    } catch (error) {
      alert('Failed to save brand');
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || '',
      description: brand.description || '',
      isActive: brand.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) {
      return;
    }

    try {
      await apiService.deleteBrand(id);
      fetchBrands();
    } catch (error) {
      alert('Failed to delete brand');
    }
  };

  const resetForm = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      logo: '',
      description: '',
      isActive: true,
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600 mt-1">Manage product brands</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Brand
        </button>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <div key={brand.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-16 h-16 object-contain rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/64';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-2xl">🏷️</span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                  <p className="text-sm text-gray-500">{brand.slug}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                brand.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {brand.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {brand.description && (
              <p className="text-sm text-gray-600 mb-4">{brand.description}</p>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleEdit(brand)}
                className="btn btn-outline flex-1"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(brand.id)}
                className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({...formData, logo: e.target.value})}
                  className="input"
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo && (
                  <div className="mt-2">
                    <img
                      src={formData.logo}
                      alt="Logo preview"
                      className="w-20 h-20 object-contain rounded border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/80';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input min-h-[80px]"
                  rows={3}
                  placeholder="Brand description..."
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {editingBrand ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PlusIcon(props: { className?: string }) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}