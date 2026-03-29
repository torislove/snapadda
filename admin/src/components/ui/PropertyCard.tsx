import React from 'react';
import { Button } from './Button';
import './PropertyCard.css';

interface PropertyCardProps {
  image: string;
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  type?: string;
  condition?: string;
  onViewDetails?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  image,
  title,
  price,
  location,
  beds,
  baths,
  sqft,
  type,
  condition,
  onViewDetails
}) => {
  return (
    <div className="property-card">
      <div className="property-image-container">
        <img src={image} alt={title} className="property-image" />
        <div className="property-price-tag">{price}</div>
      </div>
      <div className="property-content">
        <h3 className="property-title">{title}</h3>
        <p className="property-location text-muted">{location}</p>
        
        {/* Chips for Property Types */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          {type && (
            <span style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
              {type}
            </span>
          )}
          {condition && (
            <span style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
              {condition}
            </span>
          )}
        </div>

        <div className="property-features">
          {type !== 'Agriculture' && (
            <>
              <span>{beds} Beds</span>
              <span>&bull;</span>
              <span>{baths} Baths</span>
              <span>&bull;</span>
            </>
          )}
          <span>{sqft} SqFt {type === 'Agriculture' ? ' / Acre' : ''}</span>
        </div>
        <div className="property-actions">
          <Button variant="outline" fullWidth onClick={onViewDetails}>View Details</Button>
        </div>
      </div>
    </div>
  );
};
