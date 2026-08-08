import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, PieChart, Layers, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';

export default function AdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('KSh');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const [repRes, infoRes] = await Promise.all([
          api.get('/admin/reports/financial'),
          api.get('/public/store-info')
        ]);
        setReport(repRes.data);
        setCurrency(infoRes.data.currency);
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
  const categories = report?.category_performance || [];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Business Financial Reports</h1>
        <p className="text-xs text-slate-500">Analyze current stock asset valuation, realized sales revenue, and profit margins</p>
      </div>

      {/* Grid Cards: Inventory Valuation vs Realized Sales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Realized Financials Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-base tracking-tight">Realized Sales Financials</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
              Confirmed Orders
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales Revenue</span>
              <p className="text-3xl font-extrabold text-white mt-0.5">
                {currency} {(fin.total_revenue || 0).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Total Goods Cost</span>
                <span className="font-bold text-slate-300">{currency} {(fin.total_cost || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-emerald-400 font-bold block">Net Profit Realized</span>
                <span className="font-extrabold text-emerald-400 text-sm">+{currency} {(fin.total_net_profit || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Valuation Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-rose-500" />
              <h3 className="font-extrabold text-base tracking-tight text-slate-900">Current Inventory Asset Value</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 px-3 py-1 rounded-full border border-rose-100">
              Physical Stock
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potential Total Retail Value</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-0.5">
                {currency} {(val.total_selling_value || 0).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs text-center">
              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Stock Units</span>
                <span className="font-extrabold text-slate-900">{val.total_units_in_stock || 0}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Cost Value</span>
                <span className="font-bold text-slate-700">{currency} {(val.total_cost_value || 0).toLocaleString()}</span>
              </div>
              <div className="bg-rose-50 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-rose-500 block uppercase">Pot. Profit</span>
                <span className="font-extrabold text-rose-600">+{currency} {(val.potential_profit || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Category Performance Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-rose-500" />
          <h3 className="font-extrabold text-base text-slate-900">Category Performance Breakdown</h3>
        </div>

        {categories.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No sales data recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Units Sold</th>
                  <th className="py-3 px-4">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">{cat.category_name}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{cat.units_sold} units</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">{currency} {cat.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
