/**
 * Generates a pre-filled WhatsApp link for product order inquiries.
 * Pre-populates exact item specifications (Product Name, Size, Colour, Price, SKU) for the customer cleanly.
 */
export const createWhatsAppOrderLink = (phone, productName, selectedColour, selectedSize, price, currency = 'KSh', sku = '') => {
  const cleanPhone = (phone || '254700000000').replace(/[^0-9]/g, '');
  
  let details = `Hello! I would like to order this item:\n\n`;
  details += `*Product:* ${productName}\n`;
  if (selectedColour) details += `*Colour:* ${selectedColour}\n`;
  if (selectedSize) details += `*Size:* ${selectedSize}\n`;
  if (price) details += `*Price:* ${currency} ${price.toLocaleString()}\n`;
  if (sku) details += `*SKU:* ${sku}\n`;
  details += `\nIs this item available for delivery?`;

  const encodedText = encodeURIComponent(details);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
};
