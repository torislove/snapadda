/**
 * SnapAdda Advanced Sharing Utility
 * Generates professional, high-fidelity message templates for various platforms.
 */

export const DOMAIN = 'https://snapadda.com';

/**
 * Format price in Lakhs/Crores for sharing
 */
const formatPrice = (price) => {
  if (!price) return 'Contact for Price';
  if (typeof price === 'string') return price;
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString()}`;
};

/**
 * Generates high-fidelity message content
 */
export const generateShareTemplates = (property, lang = 'en') => {
  const { 
    title, price, location, district, propertyCode, 
    id, _id, type, beds, sqft, areaSize, measurementUnit 
  } = property;
  
  const propId = id || _id;
  const url = `${DOMAIN}/property/${propId}`;
  const displayPrice = formatPrice(price);
  const pCode = propertyCode || `SNA-${propId.toString().slice(-5).toUpperCase()}`;
  const specs = beds ? `${beds} BHK` : (sqft || areaSize ? `${sqft || areaSize} ${measurementUnit || 'Sq.Yds'}` : type);

  if (lang === 'te') {
    return {
      whatsapp: `🏠 *${title}*\n📍 ${location}, ${district}\n✨ రకం: *${type}* | ${specs}\n🏷️ కోడ్: *${pCode}*\n💰 ధర: *${displayPrice}*\n\n🔗 *పూర్తి వివరాలు ఇక్కడ చూడండి:*\n${url}\n\n_SnapAdda ద్వారా షేర్ చేయబడింది – ఆంధ్రా రియల్ ఎస్టేట్ స్టాండర్డ్_`,
      sms: `SnapAdda: ${title} in ${location}. ధర: ${displayPrice}. వివరాలు: ${url}`,
      email: {
        subject: `ప్రీమియం ప్రాపర్టీ అవకాశం: ${title}`,
        body: `నమస్కారం,\n\nSnapAddaలో ఈ అద్భుతమైన ప్రాపర్టీని చూడండి.\n\nప్రాపర్టీ: ${title}\nప్రాంతం: ${location}\nధర: ${displayPrice}\n\nమరిన్ని వివరాల కోసం ఈ లింక్ క్లిక్ చేయండి:\n${url}\n\nధన్యవాదాలు,\nSnapAdda టీమ్`
      }
    };
  }

  return {
    whatsapp: `🏠 *${title.toUpperCase()}*\n📍 ${location}, ${district}\n✨ Type: *${type}* | ${specs}\n🏷️ Code: *${pCode}*\n💰 Price: *${displayPrice}*\n\n🔗 *View Verified Asset Details:* \n${url}\n\n_Shared via SnapAdda – Andhra's Standard for Real Estate_`,
    sms: `Check out this property on SnapAdda: ${title} in ${location}. Price: ${displayPrice}. View: ${url}`,
    email: {
      subject: `Premium Property Opportunity: ${title} in ${location}`,
      body: `Hello,\n\nI thought you might be interested in this premium property on SnapAdda.\n\nAsset: ${title}\nLocation: ${location}, ${district}\nPrice: ${displayPrice}\n\nYou can view the full verified details, images, and videos here:\n${url}\n\n---\nSnapAdda — Verified Asset Discovery`
    }
  };
};

/**
 * Triggers the native Web Share API
 */
export const triggerNativeShare = async (property) => {
  const templates = generateShareTemplates(property);
  const propId = property.id || property._id;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: `SnapAdda: ${property.title}`,
        text: templates.whatsapp,
        url: `${DOMAIN}/property/${propId}`,
      });
      return true;
    } catch (err) {
      console.warn('Native share failed', err);
      return false;
    }
  }
  return false;
};

/**
 * Generates a visual snapshot of the property using HTML5 Canvas
 * Returns a Data URL of the generated image
 */
export const generatePropertySnapshot = (property) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#050a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load Image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const mainImg = (property.images?.[0] || property.image);
    
    // Fallback if no image
    if (!mainImg) {
      drawText();
      return;
    }

    img.onload = () => {
      // Draw Image with overlay
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(5, 10, 20, 0.4)');
      gradient.addColorStop(1, 'rgba(5, 10, 20, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawText();
    };

    img.onerror = () => drawText();
    img.src = mainImg;

    function drawText() {
      // Brand Logo / Text
      ctx.fillStyle = '#e8b84b';
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.fillText('SNAPADDA', 50, 60);

      // Verified Badge
      if (property.isVerified) {
        ctx.fillStyle = 'rgba(16, 217, 140, 0.2)';
        ctx.roundRect ? ctx.roundRect(50, 85, 150, 35, 10) : ctx.fillRect(50, 85, 150, 35);
        ctx.fill();
        ctx.fillStyle = '#10d98c';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillText('✓ VERIFIED ASSET', 65, 108);
      }

      // Title
      ctx.fillStyle = 'white';
      ctx.font = 'bold 64px Inter, sans-serif';
      const title = property.title.toUpperCase();
      ctx.fillText(title.length > 30 ? title.substring(0, 27) + '...' : title, 50, canvas.height - 180);

      // Price
      ctx.fillStyle = '#e8b84b';
      ctx.font = '900 72px Inter, sans-serif';
      ctx.fillText(formatPrice(property.price), 50, canvas.height - 80);

      // Location
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '600 32px Inter, sans-serif';
      ctx.fillText(`📍 ${property.location}, ${property.district || ''}`, 50, canvas.height - 40);

      // QR Code Placeholder (could use a library, but for now just a design element)
      ctx.strokeStyle = '#e8b84b';
      ctx.lineWidth = 2;
      ctx.strokeRect(canvas.width - 150, canvas.height - 150, 100, 100);
      ctx.fillStyle = '#e8b84b';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText('SCAN TO VIEW', canvas.width - 145, canvas.height - 35);

      resolve(canvas.toDataURL('image/png'));
    }
  });
};
