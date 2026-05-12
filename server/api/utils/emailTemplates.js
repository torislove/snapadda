export const generatePropertyEmailHTML = (contactName, properties) => {
  if (!properties || properties.length === 0) {
    return `<p>Hi ${contactName}, we have excellent listings for you. Please contact us.</p>`;
  }

  let cardsHtml = '';
  properties.forEach((p) => {
    const propTitle = p.title || 'Premium Property';
    const propPrice = p.price >= 10000000 
      ? `₹${(p.price / 10000000).toFixed(2)} Cr` 
      : p.price >= 100000 
        ? `₹${(p.price / 100000).toFixed(1)} L` 
        : `₹${p.price?.toLocaleString('en-IN') || 'Price on Request'}`;
    const propLocation = p.location || 'Prime Location';
    const propLink = `https://snapadda-7a6e6.web.app/property/${p._id || p.id}`;
    const imageUrl = p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';

    cardsHtml += `
      <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 24px; border: 1px solid #eaeaea;">
        <img src="${imageUrl}" alt="${propTitle}" style="width: 100%; height: 200px; object-fit: cover; display: block;" />
        <div style="padding: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #1a1a2e; font-size: 20px; font-weight: 800; font-family: sans-serif;">${propTitle}</h3>
          <p style="margin: 0 0 16px 0; color: #666; font-size: 14px; font-family: sans-serif;">📍 ${propLocation}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f0f0; padding-top: 16px;">
            <div style="font-size: 20px; font-weight: 900; color: #2ecc71; font-family: sans-serif;">${propPrice}</div>
            <a href="${propLink}" style="background-color: #1a1a2e; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; font-family: sans-serif;">View Details</a>
          </div>
        </div>
      </div>
    `;
  });

  return `
    <div style="background-color: #f8f9fa; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #1a1a2e; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; color: #e8b84b; font-size: 28px; font-weight: 900; letter-spacing: 1px;">SNAPADDA</h1>
          <p style="margin: 10px 0 0 0; color: #ffffff; opacity: 0.8; font-size: 14px;">Exclusive Property Matches</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 30px;">
            Hi <strong>${contactName || 'Valued Client'}</strong>,<br/><br/>
            Based on your requirements, our experts have handpicked these premium properties for your consideration.
          </p>

          ${cardsHtml}

          <p style="font-size: 15px; color: #555; line-height: 1.6; margin-top: 30px; text-align: center;">
            Interested in any of these? Reply directly to this email or contact your agent to schedule a private viewing.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 20px; text-align: center; color: #888; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} SnapAdda Real Estate. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
};
