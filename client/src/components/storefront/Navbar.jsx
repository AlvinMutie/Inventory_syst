import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Phone, ShieldCheck, Menu, X, Sparkles } from 'lucide-react';
import api from '../../services/api';

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [storeInfo, setStoreInfo] = useState({ business_name: "Kids Wear", whatsapp_phone: "254700000000" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.get('/public/categories').then(res => setCategories(res.data.categories)).catch(() => {});
    api.get('/public/store-info').then(res => setStoreInfo(res.data)).catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
        <span>Quality Children's Clothing: Direct Order via WhatsApp</span>
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none">
                Tiny<span className="text-rose-500">Trends</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Kids Wear Catalogue</span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search hoodies, tracksuits, t-shirts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-rose-300 rounded-full outline-hidden transition-all text-slate-800 placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          </form>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/products"
              className={`hidden sm:inline-flex px-3.5 py-1.5 text-sm font-semibold rounded-full transition-all ${
                location.pathname === '/products' 
                  ? 'bg-rose-100 text-rose-700' 
                  : 'text-slate-700 hover:text-rose-600 hover:bg-slate-100'
              }`}
            >
              Browse Catalogue
            </Link>

            <a
              href={`https://wa.me/${storeInfo.whatsapp_phone}?text=${encodeURIComponent("Hello! I have an inquiry about your kids clothing catalog.")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-full shadow-sm hover:shadow-md transition-all scale-100 active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Us</span>
            </a>

            <Link
              to="/admin"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Admin Portal"
            >
              <ShieldCheck className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-rose-600 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Expanded Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search hoodies, tracksuits, t-shirts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>

            <div className="flex flex-col gap-1 text-xs font-semibold pt-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-800"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-800"
              >
                Browse Catalogue
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          </div>
        )}

        {/* Mobile Search & Categories Pill Bar */}
        <div className="py-2 overflow-x-auto scrollbar-none flex items-center gap-2 border-t border-slate-100 text-xs font-medium">
          <Link
            to="/products"
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              !location.search ? 'bg-rose-500 text-white shadow-xs font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-rose-50'
            }`}
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                location.search.includes(`category=${cat.slug}`)
                  ? 'bg-rose-500 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
