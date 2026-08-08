import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, CheckCircle2, XCircle, AlertCircle, Share2, Sparkles } from 'lucide-react';
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
    storeInfo.currency
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
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Link Copied!' : 'Share Product'}</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden relative shadow-inner">
            <img
              src={selectedImage || product.primary_image || 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80'}
              alt={product.name}
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
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
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
              {product.description || "High quality children's clothing crafted for comfort and durability."}
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
                    return (
                      <button
                        key={colour}
                        onClick={() => setSelectedColour(colour)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-rose-300'
                        }`}
                      >
                        {colour}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Size: <span className="text-rose-600 font-extrabold">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    // Check stock status for this specific size with currently selected colour
                    const sizeVariant = product.variants.find(v => v.colour_name === selectedColour && v.size_name === size);
                    const sizeAvail = sizeVariant ? sizeVariant.available_quantity > 0 : false;

                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : sizeAvail
                              ? 'bg-white text-slate-800 border-slate-200 hover:border-rose-300'
                              : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-70'
                        }`}
                      >
                        <span>Size {size}</span>
                        {!sizeAvail && <span className="text-[9px] font-normal text-rose-500">(Sold Out)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variant Availability Card */}
            <div className="p-4 rounded-2xl border bg-slate-50/50 mt-4 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Availability ({selectedColour || ''} / Size {selectedSize || ''}):</span>
                {isVariantAvailable ? (
                  isVariantLowStock ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-full">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Low Stock ({variantStockCount} left)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Available ({variantStockCount} in stock)</span>
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Sold Out</span>
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Main Action CTA: Order via WhatsApp */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            {isVariantAvailable ? (
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-extrabold px-6 py-4 rounded-2xl text-base shadow-lg shadow-emerald-100 hover:shadow-xl transition-all scale-100 active:scale-98"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Order via WhatsApp</span>
              </a>
            ) : (
              <button
                disabled
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-200 text-slate-400 font-bold px-6 py-4 rounded-2xl text-sm cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                <span>Selected Variant Sold Out</span>
              </button>
            )}

            <p className="text-[11px] text-slate-400 text-center">
              🔒 No online payment required. Tap to send product details directly to the business owner on WhatsApp.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
