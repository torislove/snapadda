import Property from '../models/Property.js';
import { db } from '../firebase.js';
import SiteSetting from '../models/SiteSetting.js';
import { getCitiesNearby } from '../data/apCoordinates.js';
import { getCached, setCached, invalidateCache, buildCacheKey } from '../cache/propertyCache.js';
import { cleanPropertyData } from '../utils/propertyCleaner.js';

// Lean projection for card list views (avoids fetching 50+ unused fields)
const CARD_FIELDS = 'title price priceDisplay pricePerUnit pricePerAcre totalAcres location district type purpose subType images image status isVerified isFeatured bhk beds baths areaSize measurementUnit facing furnishing constructionStatus approvalAuthority isGated vastuCompliant listerType propertyCode googleMapsLink createdAt likeCount';

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
      googleMapsLink: property.googleMapsLink || '',
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
    // ── Cache check ──
    const cacheKey = buildCacheKey(req.query);
    const cached = getCached(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=300');
      return res.status(200).json(cached);
    }

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
    
    const amenitiesArr = req.query.amenities?.split(',').filter(Boolean);
    if (amenitiesArr?.length > 0) filter.amenities = { $all: amenitiesArr };
    
    if (franchiseId) filter.franchiseId = franchiseId;
    if (purpose) {
      filter.purpose = purpose.toLowerCase() === 'buy'
        ? { $regex: 'Sale|Buy', $options: 'i' }
        : { $regex: purpose, $options: 'i' };
    }
    if (vastu === 'true') filter.vastuCompliant = true;
    if (isGated === 'true') filter.isGated = true;
    if (subType) filter.subType = subType;

    const excludeId = req.query.exclude;
    if (excludeId) {
      try {
        const mongoose = await import('mongoose');
        filter._id = { $ne: new mongoose.default.Types.ObjectId(excludeId) };
      } catch (_) { /* invalid id, skip */ }
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let projection = {};
    if (search) {
      filter.$text = { $search: search };
      projection = { score: { $meta: 'textScore' } };
    }

    let sortObj = search 
      ? { score: { $meta: 'textScore' }, isFeatured: -1, isVerified: -1 }
      : { isFeatured: -1, isVerified: -1, createdAt: -1 };
    
    if (sort === 'price_asc') sortObj = { price: 1, isFeatured: -1 };
    else if (sort === 'price_desc') sortObj = { price: -1, isFeatured: -1 };
    else if (sort === 'featured') sortObj = { isFeatured: -1, isVerified: -1, createdAt: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1, isFeatured: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // ── Use .lean() for plain JS objects (30-40% faster Mongoose reads) ──
    // ── Always select card fields — even text search only needs card data ──
    const selectFields = CARD_FIELDS;

    const [properties, total] = await Promise.all([
      Property.find(filter, projection)
        .select(selectFields)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Property.countDocuments(filter)
    ]);

    const result = {
      status: 'success',
      data: properties,
      meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum), hasNextPage: pageNum < Math.ceil(total / limitNum), hasPrevPage: pageNum > 1 }
    };

    // ── Cache the result ──
    setCached(cacheKey, result);
    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=300');
    res.status(200).json(result);
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
    const propertyData = cleanPropertyData(req.body, false);
    
    const newProperty = new Property(propertyData);
    await newProperty.save();
    
    // Invalidate property list cache so new listing appears immediately
    invalidateCache();
    
    // Sync to Firebase for real-time (Non-blocking)
    syncToFirebase(newProperty).catch(err => console.error('FIREBASE_SYNC_ERR:', err));
    
    res.status(201).json({ status: 'success', data: newProperty });
  } catch (error) {
    console.error('CREATE_PROPERTY_ERROR:', error);
    res.status(400).json({ 
      status: 'error', 
      message: 'Property Validation Failed', 
      details: error.message 
    });
  }
};

// Get single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const { userId } = req.query; // Optional: passed by client to get isLiked state

    // Atomically increment view count (non-blocking, fire-and-forget)
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('cityId');

    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Compute isLiked for the requesting user
    let isLiked = false;
    if (userId) {
      isLiked = property.likeLogs.some(
        log => log.userId?.toString() === userId.toString()
      );
    }

    const data = property.toObject();
    data.isLiked = isLiked;

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    console.error('GET_PROPERTY_BY_ID_ERROR:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update a property
export const updateProperty = async (req, res) => {
  try {
    const updateData = cleanPropertyData(req.body, false);

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
    // Support both JWT middleware (req.user) and direct body (for lightweight auth)
    const userId = (req.user?.id || req.user?._id || req.body.userId)?.toString();
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // String comparison — works for both MongoDB ObjectId AND Google Auth string UIDs
    const likeIndex = property.likeLogs.findIndex(
      log => log.userId?.toString() === userId
    );
    
    let liked;
    if (likeIndex > -1) {
      // Unlike: remove the log entry
      property.likeLogs.splice(likeIndex, 1);
      property.likeCount = Math.max(0, property.likeCount - 1);
      liked = false;
    } else {
      // Like: store userId as string
      property.likeLogs.push({ userId: userId.toString() });
      property.likeCount += 1;
      liked = true;
    }

    await property.save();
    res.status(200).json({ status: 'success', data: { liked, likeCount: property.likeCount } });
  } catch (error) {
    console.error('LIKE_PROPERTY_ERROR:', error);
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

export const publicSubmitProperty = async (req, res) => {
  try {
    const propertyData = cleanPropertyData(req.body, true);
    
    const property = new Property(propertyData);
    property.propertyCode = `SNA-${property._id.toString().slice(-5).toUpperCase()}`;
    await property.save();
    
    // Invalidate cache since a new (though pending) record exists
    invalidateCache();

    res.status(201).json({
      status: 'success',
      message: 'Property submitted successfully. It will be live after admin review.',
      data: { id: property._id, propertyCode: property.propertyCode }
    });
  } catch (err) {
    console.error('PUBLIC_SUBMIT_ERROR:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getMyProperties = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const properties = await Property.find({ submittedBy: userId })
      .select(CARD_FIELDS)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      status: 'success',
      data: properties
    });
  } catch (error) {
    console.error('GET_MY_PROPERTIES_ERROR:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
