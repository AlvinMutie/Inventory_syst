import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, CheckCircle2, XCircle, AlertCircle, Share2, Sparkles, Ruler, X, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { createWhatsAppOrderLink } from '../../utils/whatsapp';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedColour, setSelectedColour] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [storeInfo, setStoreInfo] = useState({ currency: 'KSh', whatsapp_phone: '254700000000' });
  const [copied, setCopied] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodRes, infoRes] = await Promise.all([
          api.get(`/public/products/${slug}`),
          api.get('/public/store-info')
        ]);
        const p = prodRes.data.product;
        setProduct(p);
        setStoreInfo(infoRes.data);
        if (p.images && p.images.length > 0) {
          setSelectedImage(p.images[0].image_url);
        } else if (p.primary_image) {
          setSelectedImage(p.primary_image);
        }

        // Auto-select first available variant colour & size
        if (p.variants && p.variants.length > 0) {
          const firstAvail = p.variants.find(v => v.available_quantity > 0) || p.variants[0];
          setSelectedColour(firstAvail.colour_name);
          setSelectedSize(firstAvail.size_name);
        }
      } catch (err) {
        console.error("Error fetching product detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-200 aspect-square rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded-lg w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded-lg w-1/3"></div>
            <div className="h-24 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-100">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500">This product listing may have been moved or archived.</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xs">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </Link>
      </div>
    );
  }

  // Get list of unique available colours & sizes for this product
  const availableColours = Array.from(new Set(product.variants.map(v => v.colour_name))).filter(Boolean);
  const availableSizes = Array.from(new Set(product.variants.map(v => v.size_name))).filter(Boolean);

  // Find active variant matching selectedColour and selectedSize
  const currentVariant = product.variants.find(
    v => v.colour_name === selectedColour && v.size_name === selectedSize
  );

  const isVariantAvailable = currentVariant && currentVariant.available_quantity > 0;
  const variantStockCount = currentVariant ? currentVariant.available_quantity : 0;
  const isVariantLowStock = currentVariant && currentVariant.is_low_stock && isVariantAvailable;

  const currentPrice = currentVariant?.selling_price || product.selling_price;

  // Build WhatsApp order link
  const whatsAppUrl = createWhatsAppOrderLink(
    storeInfo.whatsapp_phone,
    product.name,
    selectedColour,
    selectedSize,
    currentPrice,
    storeInfo.currency,
    currentVariant?.sku || ''
  );

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Back button */}
      <div className="flex items-center justify-between mt-2">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full transition-all"
        >
          <Share2 className="w-3.5 h-3.5 text-rose-500" />
          <span>{copied ? 'Link Copied!' : 'Share Item'}</span>
        </button>
      </div>

      {/* Main Product Layout */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 relative">
            <img
              src={selectedImage || product.primary_image || 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80'}
              alt={product.name}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80';
              }}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img.image_url ? 'border-rose-500 scale-95 shadow-xs' : 'border-slate-100 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Metadata & Variant Selectors */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            
            <div>
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full">
                {product.category_name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {storeInfo.currency} {currentPrice.toLocaleString()}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
              {product.description || "High quality children's fleece clothing crafted for comfort and durability."}
            </p>

            {/* Colour Selector */}
            {availableColours.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Colour: <span className="text-rose-600 font-extrabold">{selectedColour}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColours.map((colour) => {
                    const isSelected = selectedColour === colour;
                    const matchVariant = product.variants.find(v => v.colour_name === colour);
                    const hexCode = matchVariant?.colour_hex || '#cbd5e1';

                    return (
                      <button
                        key={colour}
                        onClick={() => setSelectedColour(colour)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-rose-500 text-white border-rose-500 shadow-xs font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-rose-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                          style={{ backgroundColor: hexCode }}
                        />
                        <span>{colour}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector + Size Guide Link */}
            {availableSizes.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Select Size: <span className="text-rose-600 font-extrabold">{selectedSize}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>View Size & Age Guide</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    const sizeVariant = product.variants.find(v => v.colour_name === selectedColour && v.size_name === size);
                    const isAvailable = sizeVariant && sizeVariant.available_quantity > 0;

                    return (
                      <button
                        key={size}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : isAvailable
                              ? 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-400'
                              : 'bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed opacity-60'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Availability Indicator */}
            <div className="pt-2">
              {isVariantAvailable ? (
                <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>In Stock — Single piece available ({variantStockCount} item)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 text-rose-600 font-bold text-xs bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                  <XCircle className="w-4 h-4" />
                  <span>Item Currently Reserved / Sold</span>
                </div>
              )}
            </div>

          </div>

          {/* Action Buttons: WhatsApp Order CTA */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <a
              href={isVariantAvailable ? whatsAppUrl : '#'}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => !isVariantAvailable && e.preventDefault()}
              className={`w-full flex items-center justify-center gap-2 text-white font-extrabold py-3.5 px-6 rounded-2xl text-sm shadow-md transition-all ${
                isVariantAvailable
                  ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 shadow-emerald-200 scale-100 hover:scale-[1.01]'
                  : 'bg-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>{isVariantAvailable ? 'Order via WhatsApp' : 'Currently Out of Stock'}</span>
            </a>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
              <span>💳 Zero Online Payment — Pay on delivery / pickup</span>
              <span>⚡ Direct WhatsApp Chat</span>
            </div>
          </div>

        </div>

      </div>

      {/* Size & Age Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-rose-500" />
                <h3 className="font-extrabold text-slate-900 text-base">Kids Size & Age Guide</h3>
              </div>
              <button onClick={() => setShowSizeGuide(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Use this standard sizing table to pick the correct fleece fit for your child:
            </p>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">Size Label</th>
                    <th className="py-2.5 px-3">Age Range</th>
                    <th className="py-2.5 px-3">Height (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  <tr>
                    <td className="py-2 px-3 font-bold text-rose-600">2-3</td>
                    <td className="py-2 px-3">2 - 3 Years</td>
                    <td className="py-2 px-3">92 - 98 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-rose-600">4-5</td>
                    <td className="py-2 px-3">4 - 5 Years</td>
                    <td className="py-2 px-3">104 - 110 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-rose-600">6-7</td>
                    <td className="py-2 px-3">6 - 7 Years</td>
                    <td className="py-2 px-3">116 - 122 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-rose-600">8-10</td>
                    <td className="py-2 px-3">8 - 10 Years</td>
                    <td className="py-2 px-3">128 - 140 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-rose-600">11-12</td>
                    <td className="py-2 px-3">11 - 12 Years</td>
                    <td className="py-2 px-3">146 - 152 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowSizeGuide(false)}
              className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Close Size Guide
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
