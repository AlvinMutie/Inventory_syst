import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Phone, ShieldCheck, Menu, X, Sparkles, Home as HomeIcon, Layers, ChevronRight } from 'lucide-react';
import api from '../../services/api';

export default function CustomerSidebar({ mobileOpen, setMobileOpen }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [storeInfo, setStoreInfo] = useState({ business_name: "Kids Wear", whatsapp_phone: "254700000000", currency: "KSh" });
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
      setMobileOpen(false);
    } else {
      navigate('/products');
      setMobileOpen(false);
    }
  };

  const closeMobile = () => setMobileOpen(false);

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-5 space-y-6">
      
      <div className="space-y-6">
        
        {/* Brand Logo & Banner */}
        <div className="space-y-3">
          <Link to="/" onClick={closeMobile} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shadow-md shadow-rose-200 group-hover:scale-105 transition-transform shrink-0">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-tight">
                {storeInfo.business_name || "TinyTrends Kids Wear"}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block mt-0.5">
                Kids Wear Store
              </span>
            </div>
          </Link>

          <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 p-2.5 rounded-2xl text-[11px] text-rose-700 font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
            <span>Direct WhatsApp Order — No Online Payment Needed</span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search hoodies, tracksuits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-hidden transition-all text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        {/* Navigation Sections */}
        <div className="space-y-4">
          
          {/* Main Pages */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-2">
              Menu
            </span>
            <nav className="space-y-1">
              <Link
                to="/"
                onClick={closeMobile}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  location.pathname === '/' 
                    ? 'bg-rose-500 text-white shadow-xs' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-rose-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HomeIcon className="w-4 h-4" />
                  <span>Home</span>
                </div>
              </Link>

              <Link
                to="/products"
                onClick={closeMobile}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  location.pathname === '/products' && !location.search
                    ? 'bg-rose-500 text-white shadow-xs' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-rose-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse All Products</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </nav>
          </div>

          {/* Categories Submenu */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-2">
              Clothing Categories
            </span>
            <nav className="space-y-1">
              {categories.map((cat) => {
                const isActive = location.search.includes(`category=${cat.slug}`);
                return (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    onClick={closeMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-rose-100 text-rose-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-3.5 h-3.5 text-rose-400" />
                      <span>{cat.name}</span>
                    </div>
                    {cat.product_count > 0 && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        {cat.product_count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

        </div>
      </div>

      {/* Footer Contact & Admin Action */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <a
          href={`https://wa.me/${storeInfo.whatsapp_phone}?text=${encodeURIComponent("Hello! I would like to inquire about your kids clothing catalog.")}`}
          target="_blank"
          rel="noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-all scale-100 active:scale-95"
        >
          <Phone className="w-4 h-4 fill-white" />
          <span>Contact via WhatsApp</span>
        </a>

        <Link
          to="/admin"
          onClick={closeMobile}
          className="w-full inline-flex items-center justify-center gap-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 py-2 rounded-xl text-xs font-semibold transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-rose-500" />
          <span>Owner Admin Portal</span>
        </Link>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Left Panel) */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200/80 fixed left-0 top-0 bottom-0 z-30 flex-col overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Off-Canvas Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Mobile Off-Canvas Drawer (Slides from Left) */}
      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={closeMobile}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
