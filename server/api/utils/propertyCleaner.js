/**
 * Unified Property Data Cleaner
 * Ensures consistent sanitization, numeric parsing, and smart defaults 
 * across both Admin and Public property submissions.
 */

export const cleanPropertyData = (rawData, isPublicSubmission = false) => {
  let propertyData = { ...rawData };

  // 1. Basic Sanitization: Remove null/undefined
  Object.keys(propertyData).forEach(key => {
    if (propertyData[key] === null || propertyData[key] === undefined) {
      delete propertyData[key];
    }
  });

  // 2. Numeric Parsing
  const numericFields = [
    'price', 'pricePerUnit', 'areaSize', 
    'bhk', 'beds', 'baths', 'totalFloors', 'floorNo', 'carpetArea', 
    'superBuiltupArea', 'roadWidth', 'powerKVA', 'ceilingHeight', 'loadingDocks'
  ];
  numericFields.forEach(f => {
    if (propertyData[f] !== undefined && propertyData[f] !== null && propertyData[f] !== '') {
      propertyData[f] = Number(propertyData[f]);
      if (isNaN(propertyData[f])) propertyData[f] = 0;
    } else if (propertyData[f] === undefined) {
      // Don't set default for missing fields to avoid resetting during partial updates
    } else {
      propertyData[f] = 0; 
    }
  });

  // 3. Boolean Parsing
  const boolFields = [
    'isVerified', 'isFeatured', 'isElite', 'isTrustVerified', 'vastuCompliant', 'isGated', 
    'cornerProperty', 'boundaryWall', 'fireSafety'
  ];
  boolFields.forEach(f => {
    if (propertyData[f] !== undefined) {
      propertyData[f] = propertyData[f] === true || propertyData[f] === 'true';
    }
  });

  // 4. JSON Parsing for complex fields (handling both strings and objects)
  const jsonFields = ['customFeatures', 'amenities', 'realtor', 'mediaSettings', 'videos'];
  jsonFields.forEach(f => {
    if (typeof propertyData[f] === 'string' && propertyData[f].trim() !== '') {
      try { propertyData[f] = JSON.parse(propertyData[f]); } catch { propertyData[f] = (f === 'realtor' ? {} : []); }
    } else if (f === 'realtor') {
      propertyData[f] = propertyData[f] || {};
    } else if (!Array.isArray(propertyData[f]) && f !== 'realtor') {
      propertyData[f] = [];
    }
  });


  // 5. Smart Defaults & Conditional Logic
  const landTypes = [
    'Agricultural Land', 'CRDA Approved Plot', 'Open Plot', 'Farmhouse', 
    'Residential Plot', 'Commercial Plot', 'Layout Plot',
    'Industrial Shed', 'Warehouse', 'Factory'
  ];
  
  if (landTypes.includes(propertyData.type)) {
    propertyData.measurementUnit = propertyData.measurementUnit || 
      (propertyData.type === 'Agricultural Land' ? 'Acres' : 'Sq.Yards');
    propertyData.bhk = propertyData.bhk || 0;
    propertyData.furnishing = propertyData.furnishing || 'N/A';
  }

  // 6. Security & Status Enforcement
  if (isPublicSubmission) {
    propertyData.status = 'Pending';
    propertyData.verificationStatus = 'Draft';
    propertyData.isVerified = false;
    propertyData.isFeatured = false;
    propertyData.isElite = false;
    propertyData.isTrustVerified = false;
    propertyData.submissionMetadata = {
      submittedAt: new Date(),
      source: 'Public Portal',
      posterName: propertyData.posterName || 'Unknown',
      posterPhone: propertyData.posterPhone || 'Unknown',
      ip: propertyData._ip || '0.0.0.0'
    };
  } else {
    // Admin submissions
    if (!propertyData.verificationStatus) {
      propertyData.verificationStatus = propertyData.isVerified ? 'Verified' : 'Under Review';
    }
  }

  // 7. Auto-Description Generator (If empty)
  if (!propertyData.description || propertyData.description.trim() === '') {
    const { type, purpose, bhk, furnishing, facing, location, district } = propertyData;
    let generatedDesc = `A premium ${type || 'property'} located in ${location || 'Andhra Pradesh'}${district ? ', ' + district : ''}. `;
    if (bhk > 0) generatedDesc += `This ${bhk} BHK asset is optimized for modern living and available for ${purpose || 'Sale'}. `;
    if (furnishing && furnishing !== 'N/A') generatedDesc += `The property is ${furnishing} and maintained to high standards. `;
    if (facing && facing !== 'Any') generatedDesc += `Strategically ${facing}-facing to maximize natural lighting and ventilation. `;
    generatedDesc += `Ideal investment opportunity. Contact for a private site visit.`;
    propertyData.description = generatedDesc;
  }

  return propertyData;
};
