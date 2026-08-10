import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Layers, Package, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export default function AdminReports() {
  const [report, setReport] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('KSh');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const [repRes, infoRes, catRes] = await Promise.all([
          api.get('/admin/reports/financial'),
          api.get('/public/store-info'),
          api.get('/public/categories')
        ]);
        setReport(repRes.data);
        setCurrency(infoRes.data.currency);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error("Financial report error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 w-48 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-slate-200 rounded-3xl"></div>
          <div className="h-48 bg-slate-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const val = report?.inventory_valuation || {};
  const fin = report?.realized_financials || {};
  const categorySales = report?.category_performance || [];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial & Inventory Asset Report</h1>
        <p className="text-xs text-slate-500">Live valuation of physical stock assets and realized sales profit</p>
      </div>

      {/* Primary Cards: Inventory Asset Valuation vs Realized Sales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Inventory Asset Valuation Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-rose-400" />
              <h3 className="font-extrabold text-base tracking-tight">Physical Inventory Valuation</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full border border-rose-500/30">
              Live Stock
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Potential Retail Revenue</span>
              <p className="text-3xl font-extrabold text-white mt-0.5">
                {currency} {(val.total_selling_value || 0).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-xs text-center">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Stock Units</span>
                <span className="font-extrabold text-white text-sm">{val.total_units_in_stock || 0}</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Cost Value</span>
                <span className="font-bold text-slate-300 text-xs">{currency} {(val.total_cost_value || 0).toLocaleString()}</span>
              </div>
              <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30">
                <span className="text-[10px] font-bold text-emerald-400 block uppercase">Pot. Profit</span>
                <span className="font-extrabold text-emerald-400 text-xs">+{currency} {(val.potential_profit || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Realized Sales Financials Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="font-extrabold text-base tracking-tight text-slate-900">Realized Sales Revenue</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
              Completed Orders
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirmed Revenue</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-0.5">
                {currency} {(fin.total_revenue || 0).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-500 block">Total Goods Cost</span>
                <span className="font-bold text-slate-800">{currency} {(fin.total_cost || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-emerald-600 font-bold block">Net Profit Realized</span>
                <span className="font-extrabold text-emerald-600 text-sm">+{currency} {(fin.total_net_profit || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Category Breakdown (Live Inventory) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-500" />
            <h3 className="font-extrabold text-base text-slate-900">Inventory Category Summary</h3>
          </div>
          <span className="text-xs font-bold text-slate-500">2 Core Categories</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Listed Products</th>
                <th className="py-3 px-4">Sales Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => {
                const salesRecord = categorySales.find(s => s.category_name === cat.name);
                return (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{cat.name}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{cat.product_count || 0} active items</td>
                    <td className="py-3 px-4">
                      {salesRecord ? (
                        <span className="font-extrabold text-emerald-600">
                          {salesRecord.units_sold} sold ({currency} {salesRecord.revenue.toLocaleString()})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">All items available in stock</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
