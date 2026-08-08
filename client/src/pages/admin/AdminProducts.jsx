import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Eye, EyeOff, X, Image as ImageIcon, Sparkles, Check, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colours, setColours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('KSh');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState(700);
  const [sellingPrice, setSellingPrice] = useState(1200);
  const [threshold, setThreshold] = useState(2);
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingImage(true);
    try {
      const response = await api.post('/admin/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data && response.data.url) {
        setImages(prev => [...prev, { url: response.data.url, is_primary: prev.length === 0 }]);
      }
    } catch (err) {
      alert("Failed to upload image file. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Matrix Builder Selection State
  const [selectedSizeIds, setSelectedSizeIds] = useState([]);
  const [selectedColourIds, setSelectedColourIds] = useState([]);
  const [variantMatrix, setVariantMatrix] = useState([]); // Array of { size_id, colour_id, quantity, cost_price, selling_price }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, attrRes, infoRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/attributes'),
        api.get('/public/store-info')
      ]);
      setProducts(prodRes.data.products);
      setCategories(attrRes.data.categories);
      setSizes(attrRes.data.sizes);
      setColours(attrRes.data.colours);
      setCurrency(infoRes.data.currency);
    } catch (err) {
      console.error("Error loading products", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-generate variant matrix rows when selected sizes/colours change in modal
  const handleSizeToggle = (sizeId) => {
    const updated = selectedSizeIds.includes(sizeId)
      ? selectedSizeIds.filter(id => id !== sizeId)
      : [...selectedSizeIds, sizeId];
    setSelectedSizeIds(updated);
    rebuildMatrix(updated, selectedColourIds);
  };

  const handleColourToggle = (colourId) => {
    const updated = selectedColourIds.includes(colourId)
      ? selectedColourIds.filter(id => id !== colourId)
      : [...selectedColourIds, colourId];
    setSelectedColourIds(updated);
    rebuildMatrix(selectedSizeIds, updated);
  };

  const rebuildMatrix = (sizeIds, colourIds) => {
    const newMatrix = [];
    sizeIds.forEach(sId => {
      colourIds.forEach(cId => {
        const existing = variantMatrix.find(v => v.size_id === sId && v.colour_id === cId);
        newMatrix.push(existing || {
          size_id: sId,
          colour_id: cId,
          quantity: 3,
          cost_price: null,
          selling_price: null
        });
      });
    });
    setVariantMatrix(newMatrix);
  };

  const handleMatrixQuantityChange = (sizeId, colourId, qty) => {
    setVariantMatrix(prev => prev.map(v => {
      if (v.size_id === sizeId && v.colour_id === colourId) {
        return { ...v, quantity: Math.max(0, parseInt(qty) || 0) };
      }
      return v;
    }));
  };

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      setImages(prev => [...prev, { url: imageUrlInput.trim(), is_primary: prev.length === 0 }]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const openCreateModal = () => {
    setEditingProductId(null);
    setName('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setDescription('');
    setCostPrice(700);
    setSellingPrice(1200);
    setThreshold(2);
    setIsPublished(true);
    setIsFeatured(false);
    setImages([{ url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80', is_primary: true }]);
    
    // Default matrix setup with first 2 sizes & 2 colours if available
    const defaultSizes = sizes.slice(0, 2).map(s => s.id);
    const defaultColours = colours.slice(0, 2).map(c => c.id);
    setSelectedSizeIds(defaultSizes);
    setSelectedColourIds(defaultColours);
    rebuildMatrix(defaultSizes, defaultColours);

    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setCategoryId(product.category_id || '');
    setDescription(product.description || '');
    setCostPrice(product.cost_price);
    setSellingPrice(product.selling_price);
    setThreshold(product.low_stock_threshold);
    setIsPublished(product.is_published);
    setIsFeatured(product.is_featured);
    setImages(product.images.map(img => ({ url: img.image_url, public_id: img.public_id, is_primary: img.is_primary })));

    const existingSizes = Array.from(new Set(product.variants.map(v => v.size_id)));
    const existingColours = Array.from(new Set(product.variants.map(v => v.colour_id)));
    setSelectedSizeIds(existingSizes);
    setSelectedColourIds(existingColours);
    setVariantMatrix(product.variants.map(v => ({
      size_id: v.size_id,
      colour_id: v.colour_id,
      quantity: v.quantity,
      cost_price: v.cost_price,
      selling_price: v.selling_price
    })));

    setFormError('');
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Product name is required');
      return;
    }
    if (variantMatrix.length === 0) {
      setFormError('Please select at least 1 size and 1 colour to generate variant stock');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      name,
      category_id: categoryId ? parseInt(categoryId) : null,
      description,
      cost_price: parseFloat(costPrice) || 0,
      selling_price: parseFloat(sellingPrice) || 0,
      low_stock_threshold: parseInt(threshold) || 2,
      is_published: isPublished,
      is_featured: isFeatured,
      images,
      variants: variantMatrix
    };

    try {
      if (editingProductId) {
        await api.put(`/admin/products/${editingProductId}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (productId, currentStatus) => {
    try {
      await api.patch(`/admin/products/${productId}/visibility`, { is_published: !currentStatus });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_published: !currentStatus } : p));
    } catch (err) {
      console.error("Error toggling visibility", err);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"? This will remove all associated variant stock records.`)) {
      try {
        await api.delete(`/admin/products/${productId}`);
        setProducts(prev => prev.filter(p => p.id !== productId));
      } catch (err) {
        alert("Failed to delete product.");
      }
    }
  };

  // Potential Profit Calculations for Modal
  const totalModalUnits = variantMatrix.reduce((sum, v) => sum + (parseInt(v.quantity) || 0), 0);
  const potentialRev = totalModalUnits * parseFloat(sellingPrice || 0);
  const potentialCost = totalModalUnits * parseFloat(costPrice || 0);
  const potentialProfit = potentialRev - potentialCost;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Product & Variant Management</h1>
          <p className="text-xs text-slate-500">Create products, build size/colour matrix variants, and manage public visibility</p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-4 py-2.5 rounded-full text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="bg-white rounded-3xl p-8 animate-pulse h-64 border border-slate-200/80"></div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Cost Price</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Stock Units</th>
                  <th className="py-3 px-4">Pot. Profit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80">
                    
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.primary_image || 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 line-clamp-1">{product.name}</span>
                          <span className="text-[10px] text-slate-400">{product.variants?.length || 0} variants</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">{product.category_name}</td>

                    <td className="py-3 px-4 text-slate-600">{currency} {product.cost_price.toLocaleString()}</td>

                    <td className="py-3 px-4 font-bold text-slate-900">{currency} {product.selling_price.toLocaleString()}</td>

                    <td className="py-3 px-4">
                      <span className={`font-extrabold px-2.5 py-0.5 rounded-full ${
                        product.available_quantity <= 0
                          ? 'bg-rose-100 text-rose-700'
                          : product.is_low_stock
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {product.available_quantity} avail
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-emerald-600">
                      +{currency} {product.potential_profit.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleVisibility(product.id, product.is_published)}
                        className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[10px] transition-colors ${
                          product.is_published
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {product.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{product.is_published ? 'Published' : 'Hidden'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingProductId ? 'Edit Product & Variant Matrix' : 'Create New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6">
              
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kids Fleece Hoodie"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Cost Price ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Selling Price ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-hidden font-extrabold text-rose-600"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Product Description
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe material, warmth, fit..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-hidden"
                ></textarea>
              </div>

              {/* Product Images */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Product Images (Upload Photo or Enter URL)
                </label>
                
                {/* File Upload Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex-1 cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2 rounded-xl text-xs border border-rose-200 flex items-center justify-center gap-2 transition-colors">
                    <ImageIcon className="w-4 h-4" />
                    <span>{uploadingImage ? 'Uploading photo...' : 'Choose Photo from Device'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      placeholder="Or paste image URL..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl border overflow-hidden">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-0 right-0 bg-rose-500 text-white p-0.5 rounded-bl-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* MATRIX VARIANT BUILDER */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Variant Matrix Generator</h3>
                  <span className="text-[10px] text-slate-500">Specify sizes and colours for stock matrix</span>
                </div>

                {/* Size Toggles */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Sizes:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {sizes.map((s) => {
                      const active = selectedSizeIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSizeToggle(s.id)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                            active ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          Size {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Colour Toggles */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Colours:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {colours.map((c) => {
                      const active = selectedColourIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleColourToggle(c.id)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                            active ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Variant Stock Quantity Inputs */}
                {variantMatrix.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Initial Stock Quantities Per Variant:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {variantMatrix.map((v) => {
                        const sObj = sizes.find(s => s.id === v.size_id);
                        const cObj = colours.find(c => c.id === v.colour_id);
                        return (
                          <div key={`${v.size_id}-${v.colour_id}`} className="bg-white p-2 rounded-xl border border-slate-200 text-xs space-y-1">
                            <span className="font-semibold text-slate-800 block text-[11px]">
                              {cObj?.name} / Size {sObj?.name}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400">Qty:</span>
                              <input
                                type="number"
                                min="0"
                                value={v.quantity}
                                onChange={(e) => handleMatrixQuantityChange(v.size_id, v.colour_id, e.target.value)}
                                className="w-full px-2 py-1 bg-slate-50 border rounded-md text-xs font-bold outline-hidden"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* REAL TIME PROFIT CALCULATIONS */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-2xl border border-rose-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Pot. Revenue</span>
                    <span className="font-extrabold text-slate-900">{currency} {potentialRev.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Pot. Cost</span>
                    <span className="font-bold text-slate-600">{currency} {potentialCost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-rose-500 uppercase block">Pot. Profit</span>
                    <span className="font-extrabold text-emerald-600">+{currency} {potentialProfit.toLocaleString()}</span>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProductId ? 'Update Product' : 'Create Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
