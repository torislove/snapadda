import Property from '../models/Property.js';
import { db } from '../firebase.js';
import SiteSetting from '../models/SiteSetting.js';
import { getCitiesNearby } from '../data/apCoordinates.js';

// Helper to sync to Firebase
const syncToFirebase = async (property) => {
  try {
    if (!property || !db) return;
    const ref = db.ref(`properties/${property._id || property.id}`);
    
    // Only mirror essential data for the client portal to keep RTDB light
    const syncData = {
      id: (property._id || property.id).toString(),
      title: property.title,
      price: property.price,
      location: property.location,
      type: property.type,
      images: property.images || [],
      image: property.image || (property.images?.length > 0 ? property.images[0] : ''),
      status: property.status || 'Active',
      isVerified: property.isVerified || false,
      isFeatured: property.isFeatured || false,
      bhk: property.bhk,
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
      sort = 'newest', page = 1, limit = 100
    } = req.query;
    let filter = { status: 'Active' };

    if (type && type !== 'all') {
      if (type === 'Plot') filter.type = { $in: ['Residential Plot', 'Commercial Plot'] };
      else if (type === 'Agriculture') filter.type = 'Agricultural Land';
      else filter.type = type;
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
    if (purpose) filter.purpose = { $regex: purpose, $options: 'i' };
    if (vastu === 'true') filter.vastuCompliant = true;
    if (isGated === 'true') filter.isGated = true;
    if (subType) filter.subType = subType;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      // Use text index if searching for words, otherwise fallback to indexed field regex
      filter.$or = [
        { $text: { $search: search } },
        { location: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } }
      ];
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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

// Create a new property
export const createProperty = async (req, res) => {
  try {
    let propertyData = { ...req.body };
    
    // Auto-generate about section if empty
    if (!propertyData.description || propertyData.description.trim() === '') {
      const { type, purpose, bhk, furnishing, facing, totalFloors, parking, location, district, constructionStatus } = propertyData;
      
      let generatedDesc = `A premium ${type || 'property'} located in the prime area of ${location || 'Andhra Pradesh'}${district ? ', ' + district : ''}. `;
      if (bhk > 0) generatedDesc += `This ${bhk} BHK property is highly sought-after and available for ${purpose || 'Sale'}. `;
      if (furnishing && furnishing !== 'N/A') generatedDesc += `It comes ${furnishing} and is in ${constructionStatus || 'excellent'} condition. `;
      if (facing && facing !== 'Any') generatedDesc += `As a ${facing}-facing property, it ensures natural light and great ventilation. `;
      if (parking && parking !== 'None' && parking !== 'N/A') generatedDesc += `It includes ${parking} parking space for convenience. `;
      
      generatedDesc += `Ideal for families looking for a modern lifestyle in a well-connected neighborhood. Contact us for more details and a site visit!`;
      
      propertyData.description = generatedDesc;
    }

    const newProperty = new Property(propertyData);
    await newProperty.save();
    
    // Sync to Firebase for real-time (Non-blocking)
    syncToFirebase(newProperty).catch(err => console.error('FIREBASE_SYNC_ERR:', err));
    
    res.status(201).json({ status: 'success', data: newProperty });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Get single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('cityId');
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.status(200).json({ status: 'success', data: property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a property
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    
    // Sync to Firebase for real-time (Non-blocking)
    syncToFirebase(property).catch(err => console.error('FIREBASE_SYNC_ERR:', err));
    
    res.status(200).json({ status: 'success', data: property });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
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
