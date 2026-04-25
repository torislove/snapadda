const fs = require('fs');
const path = 'client/src/App.css';
let css = fs.readFileSync(path, 'utf8');

const glassStyles = `
/* --- ELITE GLASSMORPHISM - PROPERTY CARDS --- */
.glass-elite {
  background: rgba(10, 10, 20, 0.4) !important;
  backdrop-filter: blur(20px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 20px !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3) !important;
}

.property-card.glass-elite {
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease !important;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  background-clip: padding-box !important;
}

.property-card.glass-elite:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 15px rgba(232, 184, 75, 0.15);
  border-color: rgba(232, 184, 75, 0.4) !important;
  z-index: 10;
}

.property-card.glass-elite::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent);
  pointer-events: none;
  border-radius: inherit;
}

.property-image-container {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16/10;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.property-card:hover .property-image {
  transform: scale(1.1);
}

.pc-floating-price {
  position: absolute;
  bottom: 0px !important;
  left: 0px !important;
  right: 0px !important;
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent) !important;
  padding: 1.5rem 1rem 0.75rem !important;
  z-index: 5;
  display: flex;
  flex-direction: column;
}

.price-main {
  font-size: 1.3rem !important;
  font-weight: 900 !important;
  color: var(--gold) !important;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.property-content {
  padding: 1.25rem !important;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background: rgba(0,0,0,0.2);
}

.pc-title-elite {
  font-size: 1.05rem !important;
  font-weight: 700 !important;
  color: #fff !important;
  margin: 0.25rem 0 0.75rem !important;
  line-height: 1.4 !important;
  height: 2.8rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.pc-location-elite {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  font-size: 0.82rem !important;
  color: rgba(255,255,255,0.6) !important;
  margin-bottom: 1.25rem !important;
}

.pc-specs-grid {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 12px 16px !important;
  margin-bottom: 1.5rem !important;
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 1rem;
}

.spec-item {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  font-size: 0.78rem !important;
  color: rgba(255,255,255,0.9) !important;
}

.spec-item svg {
  color: var(--gold);
  opacity: 0.8;
}

.pc-elite-actions {
  margin-top: auto !important;
  padding-top: 1rem !important;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.pc-btn-view {
  background: linear-gradient(135deg, var(--gold), #b9933a) !important;
  color: #000 !important;
  border: none !important;
  font-weight: 900 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 15px rgba(232, 184, 75, 0.2);
}

.pc-btn-view:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(232, 184, 75, 0.3);
}

.pc-entity-type {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.05);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--gold);
  margin-bottom: 0.5rem;
}
`;

css += '\n' + glassStyles;
fs.writeFileSync(path, css, 'utf8');
console.log('Premium Property Card styles applied.');
