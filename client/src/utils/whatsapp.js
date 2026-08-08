/**
 * Generates a pre-filled WhatsApp link for product order inquiries.
 * Does NOT handle payments; simply pre-populates item specifications for the customer.
 */
export const createWhatsAppOrderLink = (phone, productName, selectedColour, selectedSize, price, currency = 'KSh') => {
  const cleanPhone = (phone || '254700000000').replace(/[^0-9]/g, '');
  
  let details = `Hello! I'm interested in ordering from your store:\n\n`;
  details += `🛍️ *Product:* ${productName}\n`;
  if (selectedColour) details += `🎨 *Colour:* ${selectedColour}\n`;
  if (selectedSize) details += `📏 *Size:* ${selectedSize}\n`;
  if (price) details += `💰 *Price:* ${currency} ${price.toLocaleString()}\n\n`;
  details += `Is this item currently available?`;

  const encodedText = encodeURIComponent(details);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
};
