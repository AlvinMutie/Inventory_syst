import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Boxes, ShoppingBag, AlertTriangle, TrendingUp, DollarSign, ArrowRight, CheckCircle2, Award, Settings, Globe, X } from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('KSh');
  
  // Website Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, infoRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/public/store-info')
        ]);
        setStats(dashRes.data);
        setCurrency(infoRes.data.currency || 'KSh');
        setBusinessName(infoRes.data.business_name || 'TinyTrends Kids Wear');
        setWhatsappPhone(infoRes.data.whatsapp_phone || '254700000000');
      } catch (err) {
        console.error("Dashboard stats error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/admin/store-info', {
        business_name: businessName,
        whatsapp_phone: whatsappPhone,
        currency
      });
      setShowSettingsModal(false);
      alert("Website name and settings updated successfully!");
      window.location.reload();
    } catch (err) {
      alert("Failed to update website settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 w-48 rounded-lg"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const summary = stats?.summary || {};

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Business Dashboard</h1>
          <p className="text-xs text-slate-500">Real-time overview of clothing inventory, active reservations, and sales</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-full shadow-sm transition-all"
          >
            <Settings className="w-4 h-4 text-rose-400" />
            <span>Edit Website Name</span>
          </button>

          <Link
            to="/admin/sales"
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-full shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>+ Record Sale or Reservation</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <Package className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{summary.total_products || 0}</p>
          <p className="text-[11px] text-slate-400">Active catalog items</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Stock Units</span>
            <Boxes className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{summary.total_units || 0}</p>
          <p className="text-[11px] text-slate-500">
            <span className="text-emerald-600 font-bold">{summary.available_units || 0} avail</span> | <span className="text-amber-600 font-bold">{summary.reserved_units || 0} reserved</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{summary.low_stock_count || 0}</p>
          <p className="text-[11px] text-slate-400">Items at or below threshold</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Units Sold</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{summary.sold_units || 0}</p>
          <p className="text-[11px] text-slate-400">Total items sold to date</p>
        </div>

        {/* Financial KPI Cards */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-sm space-y-2 col-span-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Revenue & Profit</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-extrabold text-white">
              {currency} {(summary.today_revenue || 0).toLocaleString()}
            </p>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              +{currency} {(summary.today_profit || 0).toLocaleString()} profit
            </span>
          </div>
          <p className="text-[11px] text-slate-400">{summary.today_sales_count || 0} sales recorded today</p>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white p-4 rounded-2xl shadow-sm space-y-2 col-span-2">
          <div className="flex items-center justify-between text-rose-100">
            <span className="text-xs font-bold uppercase tracking-wider">This Month's Profit</span>
            <TrendingUp className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-extrabold text-white">
              {currency} {(summary.month_profit || 0).toLocaleString()}
            </p>
            <span className="text-xs font-semibold text-rose-100">
              (Rev: {currency} {(summary.month_revenue || 0).toLocaleString()})
            </span>
          </div>
          <p className="text-[11px] text-rose-100">Est. net profit after stock cost</p>
        </div>

      </div>

      {/* Grid Section: Low Stock Alerts & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Widget */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">Low Stock Alerts</h3>
            </div>
            <Link to="/admin/inventory" className="text-xs font-bold text-rose-600 hover:underline">
              Manage Inventory
            </Link>
          </div>

          {!stats?.low_stock_items || stats.low_stock_items.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">All product variants are well stocked! 🎉</p>
          ) : (
            <div className="space-y-2">
              {stats.low_stock_items.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2.5 bg-amber-50/50 rounded-xl border border-amber-100 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{item.product_name || 'Product'}</span>
                    <span className="text-slate-500 block text-[11px]">Size {item.size_name} / {item.colour_name} (SKU: {item.sku})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      {item.quantity} remaining
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Best Sellers Widget */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <h3 className="font-bold text-slate-900 text-sm">Best Selling Products</h3>
            </div>
            <Link to="/admin/reports" className="text-xs font-bold text-rose-600 hover:underline">
              View Reports
            </Link>
          </div>

          {!stats?.best_sellers || stats.best_sellers.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No sales recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.best_sellers.map((b, idx) => (
                <div key={b.product_id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{b.product_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{b.units_sold} units sold</span>
                    <span className="text-[10px] text-slate-500 block">{currency} {b.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Recent Sales Table */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Recent Confirmed Sales</h3>
          <Link to="/admin/sales" className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!stats?.recent_sales || stats.recent_sales.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No recent sales to display.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Est. Profit</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent_sales.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-800">{order.order_number}</td>
                    <td className="py-3 px-3 text-slate-700">{order.customer_name}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{currency} {order.total_amount.toLocaleString()}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">+{currency} {order.estimated_profit.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-3">
                      <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        SOLD
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Website Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-rose-500" />
                <h3 className="font-extrabold text-slate-900 text-base">Edit Website Name & Info</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Website / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Mama's Kids Apparel"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-hidden font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  This title appears on the sidebar logo, mobile header, and website top bar.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  WhatsApp Phone Number for Customer Orders
                </label>
                <input
                  type="text"
                  required
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="e.g. 254700000000"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="KSh"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-400 outline-hidden font-bold"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-sm transition-all"
                >
                  {savingSettings ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
