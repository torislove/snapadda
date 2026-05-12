export const formatWhatsAppMessage = (contactName, properties) => {
  if (!properties || properties.length === 0) {
    return `Hi ${contactName || 'there'}, this is SnapAdda Real Estate. We have excellent listings matching your profile. Would you like details?`;
  }

  let msg = `✨ *Exclusive Properties for You, ${contactName || 'Valued Client'}!* ✨\n\n`;

  properties.forEach((p, index) => {
    const propTitle = p.title || 'Premium Property';
    const propCode = p.propertyCode || `SNA-${(p._id || '').toString().slice(-5).toUpperCase()}`;
    const propPrice = p.price >= 10000000 
      ? `₹${(p.price / 10000000).toFixed(2)} Cr` 
      : p.price >= 100000 
        ? `₹${(p.price / 100000).toFixed(1)} L` 
        : `₹${p.price?.toLocaleString('en-IN') || 'Price on Request'}`;
    const propLocation = p.location || 'Prime Location';
    const propLink = `https://snapadda-7a6e6.web.app/property/${p._id || p.id}`;

    msg += `🏠 *${propTitle}*\n`;
    msg += `📍 ${propLocation} | 💰 *${propPrice}*\n`;
    msg += `🏷️ Ref: ${propCode}\n`;
    msg += `🔗 View Details: ${propLink}\n`;
    if (index < properties.length - 1) {
      msg += `\n───────────────\n\n`;
    }
  });

  msg += `\n_SnapAdda – Andhra's Leading Property Platform_`;
  return msg;
};
