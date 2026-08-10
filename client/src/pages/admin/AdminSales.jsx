import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight, X } from 'lucide-react';
import api from '../../services/api';

export default function AdminSales() {
  const [orders, setOrders] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currency, setCurrency] = useState('KSh');

  // New Sale Modal State
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [orderStatus, setOrderStatus] = useState('SOLD');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'ALL' ? `/admin/orders?status=${statusFilter}` : '/admin/orders';
      const [ordRes, invRes, infoRes] = await Promise.all([
        api.get(url),
        api.get('/admin/inventory'),
        api.get('/public/store-info')
      ]);
      setOrders(ordRes.data.orders);
      setVariants(invRes.data.variants);
      setCurrency(infoRes.data.currency);
    } catch (err) {
      console.error("Error loading orders", err);
    } finally {
      setLoading(false);
    }
  };

  const openNewOrderModal = () => {
    setCustomerName('');
    setCustomerContact('');
    setOrderStatus('SOLD');
    setSelectedVariantId(variants.length > 0 ? variants[0].id : '');
    setQuantity(1);
    setNotes('');
    setFormError('');
    setShowModal(true);
  };

  const handleRecordOrder = async (e) => {
    e.preventDefault();
    if (!selectedVariantId) {
      setFormError('Please select a product variant');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      customer_name: customerName.trim() || 'Direct Customer',
      customer_contact: customerContact.trim(),
      status: orderStatus,
      notes,
      items: [
        {
          variant_id: parseInt(selectedVariantId),
          quantity: intValue(quantity)
        }
      ]
    };

    try {
      await api.post('/admin/orders', payload);
      setShowModal(false);
      loadOrders();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to record order');
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToSold = async (orderId, orderNumber) => {
    if (window.confirm(`Convert Reservation #${orderNumber} to SOLD? This will automatically reduce the physical stock quantity.`)) {
      try {
        await api.post(`/admin/orders/${orderId}/convert-to-sold`);
        loadOrders();
      } catch (err) {
        alert(err.response?.data?.error || "Failed to convert reservation");
      }
    }
  };

  const handleCancelOrder = async (orderId, orderNumber) => {
    if (window.confirm(`Cancel Order #${orderNumber}? Reserved or sold stock will be released back to available inventory.`)) {
      try {
        await api.post(`/admin/orders/${orderId}/cancel`);
        loadOrders();
      } catch (err) {
        alert(err.response?.data?.error || "Failed to cancel order");
      }
    }
  };

  const intValue = (val) => Math.max(1, intParse(val) || 1);
  const intParse = (val) => parseInt(val, 10);

  const selectedVariantObj = variants.find(v => v.id === parseInt(selectedVariantId));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales & Reservations Log</h1>
          <p className="text-xs text-slate-500">Record customer orders, manage reservations, and track completed sales</p>
        </div>

        <button
          onClick={openNewOrderModal}
          className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-4 py-2.5 rounded-full text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Sale / Reservation</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs self-start text-xs font-bold w-fit">
        {['ALL', 'RESERVED', 'SOLD', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-1.5 rounded-xl transition-all ${
              statusFilter === st ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white rounded-3xl p-8 animate-pulse h-64 border border-slate-200"></div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Product Variant</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Est. Profit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400 text-xs">
                      No orders found for this status.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{order.order_number}</td>
                        
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{order.customer_name}</span>
                          <span className="text-[10px] text-slate-400">{order.customer_contact || 'No contact'}</span>
                        </td>

                        <td className="py-3 px-4">
                          {firstItem ? (
                            <div>
                              <span className="font-bold text-slate-800 line-clamp-1">{firstItem.product_name}</span>
                              <span className="text-[10px] text-slate-500">
                                {firstItem.colour_name} / Size {firstItem.size_name} (x{firstItem.quantity})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-extrabold text-slate-900">
                          {currency} {order.total_amount.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 font-bold text-emerald-600">
                          +{currency} {order.estimated_profit.toLocaleString()}
                        </td>

                        <td className="py-3 px-4">
                          {order.status === 'SOLD' && (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>SOLD</span>
                            </span>
                          )}
                          {order.status === 'RESERVED' && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                              <Clock className="w-3 h-3" />
                              <span>RESERVED</span>
                            </span>
                          )}
                          {order.status === 'CANCELLED' && (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                              <XCircle className="w-3 h-3" />
                              <span>CANCELLED</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          {order.status === 'RESERVED' && (
                            <button
                              onClick={() => handleConvertToSold(order.id, order.order_number)}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] rounded-lg shadow-2xs transition-all"
                            >
                              Mark as SOLD
                            </button>
                          )}
                          {order.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleCancelOrder(order.id, order.order_number)}
                              className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-semibold text-[10px] rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-900">Record Sale or Reservation</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRecordOrder} className="space-y-4">
              
              {/* Order Status Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Order Status *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderStatus('SOLD')}
                    className={`py-2.5 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-1.5 transition-all ${
                      orderStatus === 'SOLD'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Direct Sale (SOLD)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderStatus('RESERVED')}
                    className={`py-2.5 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-1.5 transition-all ${
                      orderStatus === 'RESERVED'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Create Reservation</span>
                  </button>
                </div>
              </div>

              {/* Customer Name & Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jane W."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    WhatsApp / Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0712345678"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                  />
                </div>
              </div>

              {/* Product Variant Picker */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Select Product Variant *
                </label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-medium"
                >
                  <option value="">-- Choose Variant --</option>
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      Size {v.size_name} / {v.colour_name} | {currency} {v.selling_price} (Available: {v.available_quantity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-bold"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Sale / Customer Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid via M-Pesa direct"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              {/* Order total preview */}
              {selectedVariantObj && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Total Order Selling Value:</span>
                  <span className="text-rose-600 font-extrabold text-sm">
                    {currency} {(selectedVariantObj.selling_price * intValue(quantity)).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {saving ? 'Recording...' : `Confirm ${orderStatus}`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
