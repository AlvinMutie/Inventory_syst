import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">Kids Wear Store</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              Quality, stylish, and comfortable children's clothing in Kenya. Browse our latest collection of hoodies and sweatpants.
            </p>
            <p className="text-xs text-rose-400 font-medium">
              Direct order via WhatsApp: Payment external on delivery or pickup.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Quick Browse</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?category=hoodies" className="hover:text-white transition-colors">Hoodies & Sweaters</Link></li>
              <li><Link to="/products?category=sweatpants" className="hover:text-white transition-colors">Sweatpants & Joggers</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Children's Clothing Store. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for small social-commerce businesses</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
