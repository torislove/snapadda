import React from 'react';

interface Props {
  editingProperty: any;
  setLiveData: (val: any) => void;
  priceUnit: string;
  setPriceUnit: (val: any) => void;
}

export const ClassificationFields: React.FC<Props> = ({
  editingProperty, setLiveData, priceUnit, setPriceUnit
}) => {
  return (
    <section>
      <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '20px', height: '1px', background: 'var(--violet)' }} /> STEP 1: CLASSIFICATION
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label className="admin-label">Property Type</label>
          <select name="type" defaultValue={editingProperty?.type || 'Apartment'} className="admin-select"
            onChange={(e) => setLiveData((p: any) => ({ ...p, type: e.target.value }))}
          >
            <optgroup label="Residential">
              <option value="Apartment">Apartment / Flat</option>
              <option value="Independent House">Independent House</option>
              <option value="Villa">Villa / Duplex</option>
              <option value="Gated Community Plot">Gated Community Plot</option>
              <option value="Residential Plot">Residential Plot</option>
            </optgroup>
            <optgroup label="Special / CRDA">
              <option value="CRDA Approved Plot">CRDA Approved Plot</option>
              <option value="Open Plot">Open Plot</option>
              <option value="Layout Plot">Layout Plot</option>
            </optgroup>
            <optgroup label="Commercial">
              <option value="Commercial Plot">Commercial Plot</option>
              <option value="Commercial Space">Commercial Space</option>
              <option value="Office Space">Office Space</option>
              <option value="Showroom">Showroom / Retail</option>
            </optgroup>
            <optgroup label="Agricultural">
              <option value="Agricultural Land">Agricultural Land (Farm)</option>
              <option value="Farmhouse">Farmhouse / Farm Villa</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label className="admin-label">City / Area</label>
          <input name="location" defaultValue={editingProperty?.location || ''} className="admin-input" placeholder="e.g. Mangalagiri, Vijayawada" />
        </div>
        <div>
          <label className="admin-label">District (AP)</label>
          <select name="district" defaultValue={editingProperty?.district || ''} className="admin-select">
            <option value="">Select District</option>
            {['Anantapur','Bapatla','Chittoor','East Godavari','Eluru','Guntur','Kadapa','Kakinada','Krishna','Kurnool','Nandyal','Nellore','Palnadu','Parvathipuram Manyam','Prakasam','Rajahmundry','Srikakulam','Sri Potti Sriramulu Nellore','Tirupati','Visakhapatnam','Vizianagaram','West Godavari'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="admin-label">Price</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              name="price" 
              type="number" 
              step="0.01"
              defaultValue={editingProperty?.price ? (editingProperty.price >= 10000000 ? editingProperty.price / 10000000 : (editingProperty.price >= 100000 ? editingProperty.price / 100000 : editingProperty.price)) : ''} 
              className="admin-input" 
              placeholder="Amount"
              style={{ flex: 1 }}
            />
            <select 
              className="admin-select" 
              style={{ width: '80px' }}
              value={priceUnit}
              onChange={(e) => setPriceUnit(e.target.value as any)}
            >
              <option value="Total">Rs</option>
              <option value="Lakhs">L</option>
              <option value="Cr">Cr</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};
