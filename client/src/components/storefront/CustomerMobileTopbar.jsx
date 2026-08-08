import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingBag, Phone } from 'lucide-react';

export default function CustomerMobileTopbar({ onOpenMenu, storeInfo }) {
  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
      
      {/* Left: Hamburger Button */}
      <button
        onClick={onOpenMenu}
        className="p-2 text-slate-700 hover:text-rose-600 rounded-xl bg-slate-100/80 active:bg-slate-200 transition-colors"
        aria-label="Open sidebar menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Center: Brand Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-xs">
          <ShoppingBag className="w-4 h-4" />
        </div>
        <span className="font-extrabold text-base text-slate-900 tracking-tight">
          Tiny<span className="text-rose-500">Trends</span>
        </span>
      </Link>

      {/* Right: WhatsApp Shortcut */}
      <a
        href={`https://wa.me/${storeInfo?.whatsapp_phone || '254700000000'}?text=${encodeURIComponent("Hello! I have an inquiry about your kids clothing catalog.")}`}
        target="_blank"
        rel="noreferrer"
        className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs active:scale-95 transition-transform"
        aria-label="Contact via WhatsApp"
      >
        <Phone className="w-4 h-4 fill-white" />
      </a>

    </header>
  );
}
