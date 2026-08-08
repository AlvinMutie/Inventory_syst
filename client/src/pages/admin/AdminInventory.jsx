import React, { useState, useEffect } from 'react';
import { Boxes, Plus, Minus, History, Tag, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import api from '../../services/api';

export default function AdminInventory() {
  const [inventoryData, setInventoryData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock', 'history', 'attributes'

  // Attributes master state
  const [attributes, setAttributes] = useState({ sizes: [], colours: [], categories: [] });
  const [newSize, setNewSize] = useState('');
  const [newColourName, setNewColourName] = useState('');
  const [newColourHex, setNewColourHex] = useState('#000000');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Inline adjustment state
  const [adjustingVariantId, setAdjustingVariantId] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState(1);
  const [adjustNotes, setAdjustNotes] = useState('Stock Arrival');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [invRes, txRes, attrRes] = await Promise.all([
        api.get('/admin/inventory'),
        api.get('/admin/inventory/transactions'),
        api.get('/admin/attributes')
      ]);
      setInventoryData(invRes.data);
      setTransactions(txRes.data.transactions);
      setAttributes(attrRes.data);
    } catch (err) {
      console.error("Error loading inventory", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (variantId, delta) => {
    const reason = prompt(`Enter reason for adjusting stock (${delta > 0 ? '+' : ''}${delta}):`, delta > 0 ? 'Stock Arrival' : 'Damaged / Removed Stock');
    if (reason === null) return; // Cancelled

    try {
      await api.post('/admin/inventory/adjust', {
        variant_id: variantId,
        quantity_change: delta,
        notes: reason || 'Manual Stock Adjustment'
      });
      loadInventory();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to adjust stock");
    }
  };

  const handleCreateSize = async (e) => {
    e.preventDefault();
    if (!newSize.trim()) return;
    try {
      await api.post('/admin/attributes/size', { name: newSize.trim() });
      setNewSize('');
      loadInventory();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create size");
    }
  };

  const handleCreateColour = async (e) => {
    e.preventDefault();
    if (!newColourName.trim()) return;
    try {
      await api.post('/admin/attributes/colour', { name: newColourName.trim(), hex_code: newColourHex });
      setNewColourName('');
      loadInventory();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create colour");
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await api.post('/admin/categories', { name: newCategoryName.trim() });
      setNewCategoryName('');
      loadInventory();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create category");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Stock & Inventory Control</h1>
          <p className="text-xs text-slate-500">Track variant stock counts, view transaction audit logs, and manage attributes</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'stock' ? 'bg-rose-500 text-white shadow-2xs' : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Variant Stock Table
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'history' ? 'bg-rose-500 text-white shadow-2xs' : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('attributes')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'attributes' ? 'bg-rose-500 text-white shadow-2xs' : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Sizes & Colours
          </button>
        </div>
      </div>

      {/* TAB 1: VARIANT STOCK TABLE */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          
          {/* Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">Total Physical Units</span>
              <span className="text-xl font-extrabold text-slate-900">{inventoryData?.total_units || 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs">
              <span className="text-emerald-600 font-bold uppercase text-[10px] block">Available Units</span>
              <span className="text-xl font-extrabold text-emerald-600">{inventoryData?.available_units || 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs">
              <span className="text-amber-600 font-bold uppercase text-[10px] block">Reserved Units</span>
              <span className="text-xl font-extrabold text-amber-600">{inventoryData?.reserved_units || 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs">
              <span className="text-rose-600 font-bold uppercase text-[10px] block">Low Stock Alert Count</span>
              <span className="text-xl font-extrabold text-rose-600">{inventoryData?.low_stock_count || 0}</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Colour</th>
                    <th className="py-3 px-4">Total Qty</th>
                    <th className="py-3 px-4">Reserved</th>
                    <th className="py-3 px-4">Available</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventoryData?.variants?.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{v.sku}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">Size {v.size_name}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: v.colour_hex || '#000' }}></span>
                          {v.colour_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{v.quantity}</td>
                      <td className="py-3 px-4 font-bold text-amber-600">{v.reserved_quantity}</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-600">{v.available_quantity}</td>
                      <td className="py-3 px-4">
                        {v.is_out_of_stock ? (
                          <span className="bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full text-[10px]">
                            OUT OF STOCK
                          </span>
                        ) : v.is_low_stock ? (
                          <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            AVAILABLE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleAdjustStock(v.id, 1)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-colors"
                          title="Add Stock (+1)"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleAdjustStock(v.id, 5)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-colors"
                          title="Add Stock (+5)"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleAdjustStock(v.id, -1)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors"
                          title="Deduct Stock (-1)"
                        >
                          -1
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-5">
          <h3 className="font-bold text-slate-900 text-sm">Inventory Transaction History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Variant</th>
                  <th className="py-2.5 px-3">Transaction Type</th>
                  <th className="py-2.5 px-3">Change</th>
                  <th className="py-2.5 px-3">Previous Qty</th>
                  <th className="py-2.5 px-3">New Qty</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{tx.product_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{tx.colour_name} / Size {tx.size_name}</td>
                    <td className="py-2.5 px-3 font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        tx.transaction_type === 'SALE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : tx.transaction_type.includes('RESERVATION')
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className={`py-2.5 px-3 font-extrabold ${tx.quantity_change < 0 ? 'text-rose-600' : tx.quantity_change > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {tx.quantity_change > 0 ? `+${tx.quantity_change}` : tx.quantity_change}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{tx.previous_quantity}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{tx.new_quantity}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{tx.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MASTER ATTRIBUTES */}
      {activeTab === 'attributes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Sizes Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Master Sizes</h3>
            <div className="flex flex-wrap gap-2">
              {attributes.sizes.map((s) => (
                <span key={s.id} className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-lg">
                  Size {s.name}
                </span>
              ))}
            </div>
            <form onSubmit={handleCreateSize} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="New size e.g. 13-14"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border rounded-xl"
              />
              <button type="submit" className="px-3 py-1.5 bg-rose-500 text-white font-bold text-xs rounded-xl">
                Add Size
              </button>
            </form>
          </div>

          {/* Colours Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Master Colours</h3>
            <div className="flex flex-wrap gap-2">
              {attributes.colours.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: c.hex_code }}></span>
                  {c.name}
                </span>
              ))}
            </div>
            <form onSubmit={handleCreateColour} className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Colour name e.g. Purple"
                  value={newColourName}
                  onChange={(e) => setNewColourName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border rounded-xl"
                />
                <input
                  type="color"
                  value={newColourHex}
                  onChange={(e) => setNewColourHex(e.target.value)}
                  className="w-9 h-8 p-0 border rounded-xl cursor-pointer"
                />
              </div>
              <button type="submit" className="w-full py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl">
                Add Colour
              </button>
            </form>
          </div>

          {/* Categories Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Product Categories</h3>
            <div className="space-y-1">
              {attributes.categories.map((cat) => (
                <div key={cat.id} className="p-2 bg-slate-50 rounded-xl text-xs flex justify-between">
                  <span className="font-bold text-slate-800">{cat.name}</span>
                  <span className="text-slate-400">{cat.product_count} products</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleCreateCategory} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border rounded-xl"
              />
              <button type="submit" className="px-3 py-1.5 bg-rose-500 text-white font-bold text-xs rounded-xl">
                Add Category
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
