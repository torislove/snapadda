import React from 'react';
import { X, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import './FilterSidebar.css';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  setFilters: (filters: any) => void;
  onApply: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  onApply
}) => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  const updateFilter = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleClear = () => {
    setFilters({
      bhk: '',
      minPrice: '',
      maxPrice: '',
      facing: 'Any',
      furnishing: 'N/A',
      constructionStatus: 'N/A',
      verified: false,
      approval: 'All',
      propertyType: 'All',
      keyword: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`filter-sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="filter-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="filter-header">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="mobile-only text-gold hover:scale-110 transition-transform mr-2">
              <ArrowLeft size={24} />
            </button>
            <SlidersHorizontal size={22} className="text-gold" />
            <h3 className="font-serif text-xl tracking-tight">Advanced Filters</h3>
          </div>
          <button onClick={onClose} className="desktop-only close-btn p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={26} className="text-white/40" />
          </button>
        </div>

        <div className="filter-content" ref={contentRef}>
          {/* Keyword Search */}
          <div className="filter-group">
            <label>Search Keyword</label>
            <input 
              type="text" 
              placeholder="e.g. 'Pool', 'Gated', 'Benz Circle'" 
              value={filters.keyword || ''} 
              onChange={(e) => updateFilter('keyword', e.target.value)} 
            />
          </div>

          {/* Property Type */}
          <div className="filter-group">
            <label>Property Type</label>
            <select 
              value={filters.propertyType || 'All'} 
              onChange={(e) => updateFilter('propertyType', e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Apartment">Apartment / Flats</option>
              <option value="Villa">Villas & Independent Houses</option>
              <option value="Agriculture">Agriculture & Farms</option>
              <option value="Commercial">Commercial</option>
              <option value="Plot">Open Plots</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <label>Budget Range (₹)</label>
            <div className="price-inputs">
              <input 
                type="number" 
                placeholder="Min" 
                value={filters.minPrice} 
                onChange={(e) => updateFilter('minPrice', e.target.value)} 
              />
              <span className="separator">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={filters.maxPrice} 
                onChange={(e) => updateFilter('maxPrice', e.target.value)} 
              />
            </div>
          </div>

          {/* BHK Config */}
          <div className="filter-group">
            <label>BHK Configuration</label>
            <div className="bhk-grid">
              {[1, 2, 3, 4].map((num) => (
                <button 
                  key={num}
                  className={`bhk-btn ${filters.bhk === num ? 'active' : ''}`}
                  onClick={() => updateFilter('bhk', filters.bhk === num ? '' : num)}
                >
                  {num} BHK
                </button>
              ))}
            </div>
          </div>

          {/* Facing */}
          <div className="filter-group">
            <label>Vastu / Facing</label>
            <select 
              value={filters.facing} 
              onChange={(e) => updateFilter('facing', e.target.value)}
            >
              <option value="Any">Any Facing</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="North-East">North-East</option>
            </select>
          </div>

          {/* Approval Authority */}
          <div className="filter-group">
            <label>Approval Authority</label>
            <select 
              value={filters.approval || 'All'} 
              onChange={(e) => updateFilter('approval', e.target.value)}
            >
              <option value="All">All Approvals</option>
              <option value="AP CRDA">AP CRDA</option>
              <option value="AP RERA">AP RERA</option>
              <option value="VMRDA">VMRDA (Vizag)</option>
              <option value="DTCP">DTCP</option>
              <option value="Panchayat">Grama Panchayat</option>
            </select>
          </div>

          {/* Construction Status */}
          <div className="filter-group">
            <label>Construction Status</label>
            <div className="status-pills">
              {['Ready to Move', 'Under Construction', 'New Launch'].map((status) => (
                <button 
                  key={status}
                  className={`pill-btn ${filters.constructionStatus === status ? 'active' : ''}`}
                  onClick={() => updateFilter('constructionStatus', filters.constructionStatus === status ? 'N/A' : status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Furnishing */}
          <div className="filter-group">
            <label>Furnishing</label>
            <div className="status-pills">
              {['Furnished', 'Semi-Furnished', 'Unfurnished'].map((f) => (
                <button 
                  key={f}
                  className={`pill-btn ${filters.furnishing === f ? 'active' : ''}`}
                  onClick={() => updateFilter('furnishing', filters.furnishing === f ? 'N/A' : f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Verification Toggle */}
          <div className="filter-group flex-row">
            <label>Verified Properties Only</label>
            <button 
              className={`toggle-btn ${filters.verified ? 'active' : ''}`}
              onClick={() => updateFilter('verified', !filters.verified)}
            >
              <div className="toggle-slider"></div>
            </button>
          </div>
        </div>

        <div className="filter-footer flex gap-4 p-6 bg-white/[0.02] border-t border-white/5">
          <Button variant="ghost" className="btn-3d-orange px-8" onClick={handleClear}>Clear All</Button>
          <Button variant="primary" className="btn-3d-emerald flex-1" onClick={onApply}>Show Results</Button>
        </div>
      </div>
    </div>
  );
};
