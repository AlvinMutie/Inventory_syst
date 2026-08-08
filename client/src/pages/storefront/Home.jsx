import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, MessageCircle, Heart, ShoppingBag } from 'lucide-react';
import api from '../../services/api';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState({ currency: 'KSh', whatsapp_phone: '254700000000' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, catRes, infoRes] = await Promise.all([
          api.get('/public/products?featured=true'),
          api.get('/public/categories'),
          api.get('/public/store-info')
        ]);
        setFeaturedProducts(prodRes.data.products);
        setCategories(catRes.data.categories);
        setStoreInfo(infoRes.data);
      } catch (err) {
        console.error("Error loading home data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-amber-400 rounded-3xl text-white shadow-xl shadow-rose-200 p-6 sm:p-12 mt-4">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>New Season Children's Arrivals</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Cute, Cozy & Durable Clothing For Your Little Ones
          </h1>

          <p className="text-rose-100 text-sm sm:text-base leading-relaxed">
            Shop fleece hoodies, matching tracksuits, cozy sweaters, and durable sweatpants. View stock availability and order directly via WhatsApp!
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-rose-600 hover:bg-rose-50 font-bold px-6 py-3 rounded-full text-sm shadow-md transition-all scale-100 active:scale-95"
            >
              <span>Explore Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={`https://wa.me/${storeInfo.whatsapp_phone}?text=${encodeURIComponent("Hello! I would like to inquire about available stock for kids clothing.")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 font-bold px-6 py-3 rounded-full text-sm shadow-md transition-all scale-100 active:scale-95 text-white"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">Real-time Stock</h4>
            <p className="text-xs text-slate-500">Live availability per size & colour</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">Premium Quality</h4>
            <p className="text-xs text-slate-500">Soft, durable cotton & fleece fabrics</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">Instant Ordering</h4>
            <p className="text-xs text-slate-500">1-click WhatsApp order message</p>
          </div>
        </div>
      </section>

      {/* Category Pills Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Shop By Category</h2>
          <Link to="/products" className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group bg-white border border-slate-100 hover:border-rose-200 p-4 rounded-2xl text-center shadow-2xs hover:shadow-md transition-all flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white flex items-center justify-center transition-colors">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-800 text-xs group-hover:text-rose-600 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Featured Products</h2>
            <p className="text-xs text-slate-500">Top picked items for boys and girls</p>
          </div>
          <Link to="/products" className="text-sm font-bold text-rose-600 hover:underline flex items-center gap-1">
            <span>See Full Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-200 h-64 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((p) => {
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
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80';
                      }}
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
                          Low Stock ({p.available_quantity} left)
                        </span>
                      ) : (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                          In Stock
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

                    <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                      <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {storeInfo.currency} {p.selling_price.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {p.variants?.length || 0} variants
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
