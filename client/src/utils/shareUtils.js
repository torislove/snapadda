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
 * Generates high-fidelity message content tailored to property types
 */
export const generateShareTemplates = (property, lang = 'en') => {
  const { 
    title, price, location, district, propertyCode, 
    id, _id, type, beds, sqft, areaSize, measurementUnit,
    facing, approvalAuthority, roadWidth, constructionStatus,
    pricePerAcre, totalAcres, isElite, isTrustVerified, isVerified,
    realtor, displayContactType, supportPhone: defaultPhone = '+919346793364'
  } = property;
  
  const propId = id || _id;
  const url = `${DOMAIN}/property/${propId}`;
  const displayPrice = formatPrice(price);
  const pCode = propertyCode || `SNA-${propId.toString().slice(-5).toUpperCase()}`;

  const phone = (displayContactType === 'Lister' && realtor?.phone) ? realtor.phone : defaultPhone;

  // --- Advanced Specification Block Construction ---
  let specBlock = '';
  const lowType = (type || '').toLowerCase();
  const isAgri = lowType.includes('agri') || lowType.includes('farm');
  const isPlot = lowType.includes('plot') || lowType.includes('crda') || lowType.includes('layout');
  const isRes = lowType.includes('apartment') || lowType.includes('villa') || lowType.includes('house');

  if (isAgri) {
    const acres = areaSize || totalAcres;
    specBlock = `🌾 Land Size: *${acres} Acres*\n💰 Per Acre: *${formatPrice(pricePerAcre || 0)}*\n📍 Proximity: *${location}*`;
  } else if (isPlot) {
    specBlock = `📐 Area: *${areaSize} ${measurementUnit || 'Sq.Yds'}*\n🧭 Facing: *${facing || 'East'}*\n🛡️ Approval: *${approvalAuthority || 'Verified'}*\n🛣️ Road: *${roadWidth || '33ft'} Wide*`;
  } else if (isRes) {
    specBlock = `🏠 Config: *${beds ? beds + ' BHK' : type}*\n🏗️ Status: *${constructionStatus || 'Ready'}*\n🧭 Facing: *${facing || 'East'}*\n🏢 Floor: *Verified*`;
  } else {
    specBlock = `✨ Type: *${type}*\n📐 Size: *${areaSize || sqft} ${measurementUnit || 'Sq.Ft'}*`;
  }

  const primaryImg = property.images?.[0] || property.image;
  const absImage = primaryImg 
    ? (primaryImg.startsWith('http') ? primaryImg : `https://snapadda-7a6e6.web.app${primaryImg}`) 
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6';

  const logoUrl = 'https://snapadda-7a6e6.web.app/logo.svg';

  // --- Trust Badges Block ---
  let trustBlock = '';
  if (isElite) trustBlock += '💎 *ELITE ASSET* ';
  if (isVerified) trustBlock += '✅ *VERIFIED* ';
  if (isTrustVerified) trustBlock += '🛡️ *TRUST SEAL*';
  
  if (lang === 'te') {
    return {
      whatsapp: `🌟 *స్నాప్‌అడ్డా రియల్ ఎస్టేట్* 🌟\n🏛️ *ప్రీమియం ఇన్స్టిట్యూషనల్ అసెట్ లిస్టింగ్* 🏛️\n\n🏢 *బ్రాండ్ లోగో:* ${logoUrl}\n\n🏘️ *${title.toUpperCase()}*\n📍 *ప్రాంతం:* ${location}, ${district} (ఆంధ్రప్రదేశ్)\n\n📊 *సాంకేతిక వివరాలు:*\n${specBlock}\n\n📸 *ప్రాపర్టీ చిత్రం:* ${absImage}\n\n🏷️ *అసెట్ కోడ్:* *${pCode}*\n💰 *ధర:* *${displayPrice}*\n\n${trustBlock}\n\n🔗 *పూర్తి వివరాలు & గ్యాలరీ ఇక్కడ చూడండి:*\n${url}\n\n📞 *ఏజెంట్ సంప్రదింపు సంఖ్య:* ${phone}\n\n🚀 _స్నాప్‌అడ్డా ద్వారా షేర్ చేయబడింది – ఆంధ్రా రియల్ ఎస్టేట్ స్టాండర్డ్_`,
      sms: `SnapAdda: ${title} in ${location}. ధర: ${displayPrice}. ఫోటో: ${absImage}. వివరాలు: ${url}`,
      email: {
        subject: `ప్రీమియం ప్రాపర్టీ అవకాశం: ${title}`,
        body: `నమస్కారం,\n\nSnapAddaలో ఈ అద్భుతమైన ప్రాపర్టీని చూడండి.\n\nప్రాపర్టీ: ${title}\nప్రాంతం: ${location}\nధర: ${displayPrice}\n\nసాంకేతిక వివరాలు:\n${specBlock.replace(/\*/g, '')}\n\nప్రాపర్టీ చిత్రం:\n${absImage}\n\nమరిన్ని వివరాల కోసం ఈ లింక్ క్లిక్ చేయండి:\n${url}\n\nధన్యవాదాలు,\nSnapAdda టీమ్`
      }
    };
  }

  return {
    whatsapp: `🌟 *SNAPADDA REAL ESTATE* 🌟\n🏛️ *PREMIUM INSTITUTIONAL ASSET LISTING* 🏛️\n\n🏢 *BRAND LOGO:* ${logoUrl}\n\n🏠 *${title.toUpperCase()}*\n📍 *Location:* ${location}, ${district} (Andhra Pradesh)\n\n📊 *TECHNICAL SPECIFICATIONS:*\n${specBlock}\n\n📸 *PROPERTY IMAGE:* ${absImage}\n\n🏷️ *Asset Code:* *${pCode}*\n💰 *Total Price:* *${displayPrice}*\n\n${trustBlock}\n\n🔗 *View High-Res Images & Docs:* \n${url}\n\n📞 *Direct Agent HotLine:* ${phone}\n\n🚀 _Shared via SnapAdda – Andhra's Standard for Real Estate_`,
    sms: `Check out this property on SnapAdda: ${title} in ${location}. Price: ${displayPrice}. Image: ${absImage}. View: ${url}`,
    email: {
      subject: `Premium Property Opportunity: ${title} in ${location}`,
      body: `Hello,\n\nI thought you might be interested in this premium property listing on SnapAdda.\n\nAsset: ${title}\nLocation: ${location}, ${district}\nPrice: ${displayPrice}\n\nTechnical Specifications:\n${specBlock.replace(/\*/g, '')}\n\nProperty Image:\n${absImage}\n\nYou can view the full verified details, high-res images, and legal documents here:\n${url}\n\n---\nSnapAdda — Institutional Grade Asset Discovery`
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
 * Generates an advanced visual snapshot with branding and trust badges
 */
export const generatePropertySnapshot = (property) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    // Background Base
    ctx.fillStyle = '#050a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load Main Image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const mainImg = (property.images?.[0] || property.image);
    
    if (!mainImg) {
      drawText();
      return;
    }

    img.onload = () => {
      // Draw Image with Elite Overlay
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(5, 10, 20, 0.3)');
      gradient.addColorStop(0.6, 'rgba(5, 10, 20, 0.6)');
      gradient.addColorStop(1, 'rgba(5, 10, 20, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add Side Accent
      ctx.fillStyle = 'rgba(232, 184, 75, 0.05)';
      ctx.fillRect(0, 0, 10, canvas.height);

      drawText();
    };

    img.onerror = () => drawText();
    img.src = mainImg;

    function drawText() {
      // Logo & Branding
      ctx.fillStyle = '#e8b84b';
      ctx.font = '900 38px "Outfit", sans-serif';
      ctx.fillText('SNAPADDA', 60, 70);
      
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '800 12px "Outfit", sans-serif';
      ctx.fillText('INSTITUTIONAL REAL ESTATE', 60, 90);

      // Status Badges
      let badgeX = 60;
      if (property.isVerified) {
        ctx.fillStyle = 'rgba(16, 217, 140, 0.15)';
        ctx.beginPath();
        ctx.roundRect(badgeX, 110, 160, 35, 8);
        ctx.fill();
        ctx.fillStyle = '#10d98c';
        ctx.font = '900 14px "Outfit", sans-serif';
        ctx.fillText('✓ VERIFIED ASSET', badgeX + 15, 132);
        badgeX += 175;
      }
      
      if (property.isElite) {
        ctx.fillStyle = 'rgba(232, 184, 75, 0.15)';
        ctx.beginPath();
        ctx.roundRect(badgeX, 110, 150, 35, 8);
        ctx.fill();
        ctx.fillStyle = '#e8b84b';
        ctx.font = '900 14px "Outfit", sans-serif';
        ctx.fillText('💎 ELITE GRADE', badgeX + 15, 132);
      }

      // Main Property Details (Bottom-Up)
      const pCode = property.propertyCode || `SNA-${(property.id || property._id || '').toString().slice(-5).toUpperCase()}`;
      
      // Property Code Tag
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.roundRect(60, canvas.height - 240, 140, 30, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '900 12px "Outfit", sans-serif';
      ctx.fillText(pCode, 75, canvas.height - 220);

      // Title
      ctx.fillStyle = 'white';
      ctx.font = '900 68px "Outfit", sans-serif';
      const title = property.title.toUpperCase();
      ctx.fillText(title.length > 30 ? title.substring(0, 27) + '...' : title, 60, canvas.height - 150);

      // Price
      ctx.fillStyle = '#e8b84b';
      ctx.font = '900 84px "Outfit", sans-serif';
      ctx.fillText(formatPrice(property.price), 60, canvas.height - 60);

      // Location Info
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '800 32px "Outfit", sans-serif';
      ctx.fillText(`📍 ${property.location}, ${property.district || ''}`, 60, canvas.height - 20);

      // QR / Scan CTA
      ctx.strokeStyle = 'rgba(232, 184, 75, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(canvas.width - 160, canvas.height - 160, 110, 110);
      
      ctx.fillStyle = '#e8b84b';
      ctx.font = '900 12px "Outfit", sans-serif';
      ctx.fillText('SCAN FOR GALLERY', canvas.width - 160, canvas.height - 30);

      resolve(canvas.toDataURL('image/png'));
    }
  });
};
