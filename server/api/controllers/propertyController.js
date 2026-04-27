import Property from '../models/Property.js';
import { db } from '../firebase.js';
import SiteSetting from '../models/SiteSetting.js';
import { getCitiesNearby } from '../data/apCoordinates.js';

// Helper to sync to Firebase
const syncToFirebase = async (property) => {
  try {
    if (!property || !db) return;
    const ref = db.ref(`properties/${property._id || property.id}`);
    
    // Mirror all fields needed by client portal cards + detail page
    const syncData = {
      id: (property._id || property.id).toString(),
      title: property.title,
      price: property.price,
      priceDisplay: property.priceDisplay || '',
      pricePerUnit: property.pricePerUnit || 0,
      location: property.location,
      district: property.district || '',
      type: property.type,
      purpose: property.purpose || 'Sale',
      subType: property.subType || '',
      images: property.images || [],
      videos: property.videos || [],
      videoUrl: property.videoUrl || '',
      image: property.image || (property.images?.length > 0 ? property.images[0] : ''),
      status: property.status || 'Active',
      verificationStatus: property.verificationStatus || 'Draft',
      isVerified: property.isVerified || false,
      isFeatured: property.isFeatured || false,
      bhk: property.bhk || 0,
      beds: property.beds || 0,
      baths: property.baths || 0,
      areaSize: property.areaSize || 0,
      measurementUnit: property.measurementUnit || 'SqFt',
      approvalAuthority: property.approvalAuthority || 'N/A',
      facing: property.facing || 'Any',
      furnishing: property.furnishing || 'N/A',
      constructionStatus: property.constructionStatus || 'N/A',
      isGated: property.isGated || false,
      vastuCompliant: property.vastuCompliant || false,
      listerType: property.listerType || 'Individual Owner',
      amenities: property.amenities || [],
      customFeatures: property.customFeatures || [],
      updatedAt: new Date().toISOString()
    };

    await ref.set(syncData);
    console.log(`SYNC_SUCCESS: Property ${syncData.id} pushed to Firebase`);
  } catch (err) {
    console.error('SYNC_ERROR_FIREBASE:', err.message);
  }
};

const removeFromFirebase = async (id) => {
  try {
    if (!id || !db) return;
    await db.ref(`properties/${id}`).remove();
    console.log(`SYNC_DELETE_SUCCESS: Property ${id} removed from Firebase`);
  } catch (err) {
    console.error('SYNC_DELETE_ERROR:', err.message);
  }
};

// Get all properties (with optional filters + pagination + sort)
export const getProperties = async (req, res) => {
  try {
    const {
      type, city, facing, approval, minPrice, maxPrice, search,
      verified, bhk, furnishing, constructionStatus, franchiseId,
      purpose, district, vastu, isGated, subType,
      sort = 'newest', page = 1, limit = 100, status
    } = req.query;
    let filter = {};

    // Standardize status filter
    if (status) {
      if (status !== 'all') filter.status = status;
    } else {
      filter.status = 'Active'; 
      // Institutional Privacy: Hide only Rejected properties from public search for now
      filter.verificationStatus = { $nin: ['Rejected'] };
    }

    if (type && type !== 'all') {
      const typeLower = type.toLowerCase();
      if (typeLower.includes('plot') || typeLower === 'gajalu') {
        filter.type = { $in: ['Plot', 'Residential Plot', 'Commercial Plot', 'Gated Community Plot', 'CRDA Approved Plot', 'Open Plot', 'Layout Plot', 'Industrial Plot'] };
      } else if (typeLower.includes('agri') || typeLower.includes('farm')) {
        filter.type = { $in: ['Agricultural Land', 'Farmhouse', 'Farm Villa', 'Acreage', 'Plantation'] };
      } else if (typeLower.includes('villa') || typeLower.includes('house') || typeLower.includes('duplex')) {
        filter.type = { $in: ['Villa', 'Independent House', 'Duplex', 'Penthouse', 'Bungalow'] };
      } else if (typeLower.includes('apartment') || typeLower.includes('flat')) {
        filter.type = { $in: ['Apartment', 'Flat', 'Apartment / Flat', 'Studio Apartment'] };
      } else {
        filter.type = { $regex: type, $options: 'i' };
      }
    }
    if (city) filter.location = { $regex: city, $options: 'i' };
    if (district) filter.district = { $regex: district, $options: 'i' };
    if (facing && facing !== 'Any') filter.facing = facing;
    if (approval && approval !== 'All') filter.approvalAuthority = approval;
    if (verified === 'true') filter.isVerified = true;
    if (bhk) filter.bhk = Number(bhk);
    if (furnishing && furnishing !== 'N/A') filter.furnishing = furnishing;
    if (constructionStatus && constructionStatus !== 'N/A') filter.constructionStatus = constructionStatus;
    if (franchiseId) filter.franchiseId = franchiseId;
    if (purpose) {
      if (purpose.toLowerCase() === 'buy') {
        filter.purpose = { $regex: 'Sale|Buy', $options: 'i' };
      } else {
        filter.purpose = { $regex: purpose, $options: 'i' };
      }
    }
    if (vastu === 'true') filter.vastuCompliant = true;
    if (isGated === 'true') filter.isGated = true;
    if (subType) filter.subType = subType;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      // AP Locality Intelligence: Multi-token fuzzy search across specific regional pivots
      const safeSearch = typeof search === 'string' ? search : String(search);
      const tokens = safeSearch.split(/\s+/).filter(t => t.length > 2);
      const regexes = tokens.map(t => new RegExp(t, 'i'));

      filter.$or = [
        { $text: { $search: safeSearch } },
        { location: { $regex: safeSearch, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];

      if (tokens.length > 0) {
        filter.$or.push({ location: { $in: regexes } });
        filter.$or.push({ district: { $in: regexes } });
      }
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'featured') sortObj = { isFeatured: -1, createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(filter).sort(sortObj).skip(skip).limit(limitNum).populate('cityId'),
      Property.countDocuments(filter)
    ]);

    res.status(200).json({
      status: 'success',
      data: properties,
      meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum), hasNextPage: pageNum < Math.ceil(total / limitNum), hasPrevPage: pageNum > 1 }
    });
  } catch (error) {
    console.error('GET_PROPERTIES_ERROR:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Nearby Properties (using AP coordinate table - no external API)
export const getNearbyProperties = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng are required' });

    // Fetch admin-configurable radius (default 25km)
    let radiusKm = 25;
    try {
      const setting = await SiteSetting.findOne({ key: 'nearby_radius_km' });
      if (setting?.value) radiusKm = Number(setting.value);
    } catch (_) { /* use default */ }

    const nearbyCities = getCitiesNearby(parseFloat(lat), parseFloat(lng), radiusKm);
    if (!nearbyCities.length) {
      return res.status(200).json({ status: 'success', data: [], meta: { total: 0, radiusKm } });
    }

    const cityNames = nearbyCities.map(c => c.name);
    const cityRegexes = cityNames.map(n => new RegExp(n, 'i'));

    const properties = await Property.find({
      status: 'Active',
      $or: [
        { location: { $in: cityRegexes } },
        { district: { $in: nearbyCities.map(c => new RegExp(c.district, 'i')) } }
      ]
    }).sort({ isFeatured: -1, createdAt: -1 }).limit(12);

    // Attach estimated distance based on city
    const enriched = properties.map(p => {
      const matchCity = nearbyCities.find(c =>
        (p.location || '').toLowerCase().includes(c.name.toLowerCase()) ||
        (p.district || '').toLowerCase().includes(c.district.toLowerCase())
      );
      return { ...p.toObject(), _distanceKm: matchCity ? Math.round(matchCity.distance) : null };
    }).sort((a, b) => (a._distanceKm ?? 999) - (b._distanceKm ?? 999));

    res.status(200).json({ status: 'success', data: enriched, meta: { total: enriched.length, radiusKm, nearbyCities: cityNames } });
  } catch (error) {
    console.error('GET_NEARBY_PROPERTIES_ERROR:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create a new property
export const createProperty = async (req, res) => {
  try {
    let propertyData = { ...req.body };

    // 1. CLEANUP: Ensure basic sanitization for incoming data
    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] === null || propertyData[key] === undefined) {
        delete propertyData[key];
      }
    });

    // 2. NUMERIC SANITIZATION: Parse numeric fields from form strings
    const numericFields = ['price', 'pricePerUnit', 'pricePerAcre', 'totalAcres', 'areaSize', 'bhk', 'beds', 'baths', 'totalFloors', 'floorNo', 'carpetArea', 'superBuiltupArea', 'roadWidth'];
    numericFields.forEach(f => {
      if (propertyData[f] !== undefined && propertyData[f] !== null && propertyData[f] !== '') {
        propertyData[f] = Number(propertyData[f]);
        if (isNaN(propertyData[f])) propertyData[f] = 0;
      } else {
        propertyData[f] = 0; // Default to 0 for any missing/empty numeric field
      }
    });

    // 3. BOOLEAN PARSING
    const boolFields = ['isVerified', 'isFeatured', 'vastuCompliant', 'isGated', 'cornerProperty', 'boundaryWall'];
    boolFields.forEach(f => {
      if (propertyData[f] !== undefined) {
        propertyData[f] = propertyData[f] === true || propertyData[f] === 'true';
      } else {
        propertyData[f] = false;
      }
    });

    // 4. ID SANITIZATION: Clean up potential ObjectId fields if they are empty strings
    const idFields = ['cityId', 'franchiseId'];
    idFields.forEach(f => {
      if (propertyData[f] === '' || propertyData[f] === 'null' || propertyData[f] === 'undefined') {
        delete propertyData[f];
      }
    });

    // 4. JSON PARSING for complex fields
    if (typeof propertyData.customFeatures === 'string' && propertyData.customFeatures.trim() !== '') {
      try { propertyData.customFeatures = JSON.parse(propertyData.customFeatures); } catch { propertyData.customFeatures = []; }
    }
    if (typeof propertyData.amenities === 'string' && propertyData.amenities.trim() !== '') {
      try { propertyData.amenities = JSON.parse(propertyData.amenities); } catch { propertyData.amenities = []; }
    }

    // 5. SMART DEFAULTS based on type
    const landTypes = ['Agricultural Land', 'CRDA Approved Plot', 'Open Plot', 'Farmhouse', 'Residential Plot', 'Commercial Plot', 'Open Plot', 'Layout Plot'];
    const industrialTypes = ['Industrial Shed', 'Warehouse', 'Factory / Unit'];
    
    if (landTypes.includes(propertyData.type)) {
      propertyData.measurementUnit = propertyData.measurementUnit || (propertyData.type === 'Agricultural Land' ? 'Acres' : 'Sq.Yards');
      propertyData.bhk = propertyData.bhk || 0;
      propertyData.furnishing = propertyData.furnishing || 'N/A';
    } else if (industrialTypes.includes(propertyData.type)) {
      propertyData.measurementUnit = propertyData.measurementUnit || 'SqFt';
      propertyData.bhk = propertyData.bhk || 0;
    }

    // 6. VERIFICATION SYNC
    if (!propertyData.verificationStatus) {
      propertyData.verificationStatus = propertyData.isVerified ? 'Verified' : 'Under Review';
    }

    // 7. AUTO DESCRIPTION (Institutional Grade)
    if (!propertyData.description || propertyData.description.trim() === '') {
      const { type, purpose, bhk, furnishing, facing, location, district } = propertyData;
      let generatedDesc = `A premium ${type || 'property'} located in ${location || 'Andhra Pradesh'}${district ? ', ' + district : ''}. `;
      if (bhk > 0) generatedDesc += `This ${bhk} BHK asset is optimized for modern living and available for ${purpose || 'Sale'}. `;
      if (furnishing && furnishing !== 'N/A') generatedDesc += `The property is ${furnishing} and maintained to high standards. `;
      if (facing && facing !== 'Any') generatedDesc += `Strategically ${facing}-facing to maximize natural lighting and ventilation. `;
      generatedDesc += `Ideal investment opportunity with high regional liquidity. Contact SnapAdda for a private site visit.`;
      propertyData.description = generatedDesc;
    }

    const newProperty = new Property(propertyData);
    await newProperty.save();
    
    // Sync to Firebase for real-time (Non-blocking)
    syncToFirebase(newProperty).catch(err => console.error('FIREBASE_SYNC_ERR:', err));
    
    res.status(201).json({ status: 'success', data: newProperty });
  } catch (error) {
    console.error('CREATE_PROPERTY_ERROR:', error);
    // Return detailed error if in dev, but always return status 400 for validation issues
    res.status(400).json({ 
      status: 'error', 
      message: 'Property Validation Failed', 
      details: error.message,
      tip: 'Check if all numeric fields (Price, Area) are valid numbers and no special characters are in ID fields.'
    });
  }
};

// Get single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('cityId');
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.status(200).json({ status: 'success', data: property });
  } catch (error) {
    console.error('GET_PROPERTY_BY_ID_ERROR:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update a property
export const updateProperty = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // 1. CLEANUP: Ensure no empty strings for enum fields
    const enumFields = [
      'condition', 'furnishing', 'constructionStatus', 'propertyAge', 
      'transactionType', 'parking', 'waterSupply', 'electricityStatus', 
      'ownershipType', 'overlooking', 'status', 'verificationStatus'
    ];
    enumFields.forEach(f => {
      if (updateData[f] === '' || updateData[f] === null) {
        delete updateData[f];
      }
    });

    // 2. NUMERIC SANITIZATION
    const numericFields = ['price', 'pricePerUnit', 'pricePerAcre', 'totalAcres', 'areaSize', 'bhk', 'beds', 'baths', 'totalFloors', 'floorNo', 'carpetArea', 'superBuiltupArea', 'roadWidth'];
    numericFields.forEach(f => {
      if (updateData[f] !== undefined && updateData[f] !== null && updateData[f] !== '') {
        updateData[f] = Number(updateData[f]);
        if (isNaN(updateData[f])) delete updateData[f];
      }
    });

    // 3. BOOLEAN PARSING
    const boolFields = ['isVerified', 'isFeatured', 'vastuCompliant', 'isGated', 'cornerProperty', 'boundaryWall'];
    boolFields.forEach(f => {
      if (updateData[f] !== undefined) {
        updateData[f] = updateData[f] === true || updateData[f] === 'true';
      }
    });

    // 4. JSON PARSING
    if (typeof updateData.customFeatures === 'string' && updateData.customFeatures.trim() !== '') {
      try { updateData.customFeatures = JSON.parse(updateData.customFeatures); } catch { delete updateData.customFeatures; }
    }
    if (typeof updateData.amenities === 'string' && updateData.amenities.trim() !== '') {
      try { updateData.amenities = JSON.parse(updateData.amenities); } catch { delete updateData.amenities; }
    }

    const property = await Property.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    
    // Sync to Firebase for real-time (Non-blocking)
    syncToFirebase(property).catch(err => console.error('FIREBASE_SYNC_ERR:', err));
    
    res.status(200).json({ status: 'success', data: property });
  } catch (error) {
    console.error('UPDATE_PROPERTY_ERROR:', error);
    res.status(400).json({ 
      status: 'error', 
      message: 'Failed to update property asset',
      details: error.message 
    });
  }
};

// Delete a property
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    
    // Remove from Firebase (Non-blocking)
    removeFromFirebase(req.params.id).catch(err => console.error('FIREBASE_DELETE_ERR:', err));
    
    res.status(200).json({ status: 'success', message: 'Property deleted successfully' });
  } catch (error) {
    console.error('DELETE_PROPERTY_ERROR:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get similar properties (same type, exclude current)
export const getSimilarProperties = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const similar = await Property.find({
      type: property.type,
      _id: { $ne: property._id },
      status: 'Active'
    }).limit(4).sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', data: similar });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Like
export const likeProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.body.userId;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const likeIndex = property.likeLogs.findIndex(log => log.userId.toString() === userId.toString());
    
    if (likeIndex > -1) {
      // Unlike
      property.likeLogs.splice(likeIndex, 1);
      property.likeCount = Math.max(0, property.likeCount - 1);
    } else {
      // Like
      property.likeLogs.push({ userId });
      property.likeCount += 1;
    }

    await property.save();
    res.status(200).json({ status: 'success', data: { liked: likeIndex === -1, likeCount: property.likeCount } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Log Share
export const shareProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, userId } = req.body;
    
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    property.shareCount += 1;
    if (userId) {
      property.shareLogs.push({ userId, platform, timestamp: new Date() });
    }
    
    await property.save();
    res.status(200).json({ status: 'success', shareCount: property.shareCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Validate multiple properties (for Jump Back In)
export const validateProperties = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid IDs' });

    const validProperties = await Property.find({ 
      _id: { $in: ids },
      status: 'Active' 
    }).select('_id title price location images type');

    res.status(200).json({ status: 'success', data: validProperties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Engagement Stats
export const getEngagementStats = async (req, res) => {
  try {
    const properties = await Property.find({
      $or: [
        { likeCount: { $gt: 0 } },
        { shareCount: { $gt: 0 } }
      ]
    })
    .select('title likeCount shareCount likeLogs shareLogs')
    .populate('likeLogs.userId', 'name email')
    .populate('shareLogs.userId', 'name email')
    .sort({ likeCount: -1, shareCount: -1 });

    res.status(200).json({ status: 'success', data: properties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
