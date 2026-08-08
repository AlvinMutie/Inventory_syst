import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, RefreshCw, ShoppingBag } from 'lucide-react';
import api from '../../services/api';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState({ currency: 'KSh' });

  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sizeParam = searchParams.get('size') || '';

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, attrRes, infoRes] = await Promise.all([
          api.get('/public/categories'),
          api.get('/public/attributes'),
          api.get('/public/store-info')
        ]);
        setCategories(catRes.data.categories);
        setSizes(attrRes.data.sizes);
        setStoreInfo(infoRes.data);
      } catch (err) {
        console.error("Error fetching metadata", err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryParam) params.append('category', categoryParam);
        if (searchParam) params.append('search', searchParam);
        if (sizeParam) params.append('size', sizeParam);

        const res = await api.get(`/public/products?${params.toString()}`);
        setProducts(res.data.products);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryParam, searchParam, sizeParam]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Children's Clothing Catalogue</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {products.length} {products.length === 1 ? 'item' : 'items'} available for order
          </p>
        </div>

        {/* Clear Filters button */}
        {(categoryParam || searchParam || sizeParam) && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search product name..."
              value={searchParam}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-hidden transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryParam}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-hidden transition-all text-slate-700"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Size Filter Dropdown */}
          <div>
            <select
              value={sizeParam}
              onChange={(e) => updateFilter('size', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-hidden transition-all text-slate-700"
            >
              <option value="">All Sizes</option>
              {sizes.map((s) => (
                <option key={s.id} value={s.name}>Size {s.name}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-slate-200 h-64 rounded-2xl"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, selecting a different category, or resetting size filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-full text-xs shadow-xs transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => {
            const isOutOfStock = p.available_quantity <= 0;
            const isLowStock = p.is_low_stock && !isOutOfStock;

            return (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="group bg-white border border-slate-100 hover:border-rose-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col"
              >
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={p.primary_image || 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Stock Status Badge */}
                  <div className="absolute top-2 left-2">
                    {isOutOfStock ? (
                      <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Sold Out
                      </span>
                    ) : isLowStock ? (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                        Low Stock ({p.available_quantity})
                      </span>
                    ) : (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                        Available
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                      {p.category_name}
                    </span>
                    <h3 className="font-semibold text-slate-800 text-xs sm:text-sm line-clamp-1 group-hover:text-rose-600 transition-colors">
                      {p.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {storeInfo.currency} {p.selling_price.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      View
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
