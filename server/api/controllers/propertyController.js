import Property from '../models/Property.js';

// Get all properties (with optional filters)
export const getProperties = async (req, res) => {
  try {
    const { type, city, facing, approval, minPrice, maxPrice, search, verified, bhk, furnishing, constructionStatus, franchiseId } = req.query;
    let filter = {};

    if (type && type !== 'all') filter.type = type;
    if (city) filter.location = { $regex: city, $options: 'i' };
    if (facing && facing !== 'Any') filter.facing = facing;
    if (approval) filter.approvalAuthority = approval;
    if (verified === 'true') filter.isVerified = true;
    if (bhk) filter.bhk = Number(bhk);
    if (furnishing && furnishing !== 'N/A') filter.furnishing = furnishing;
    if (constructionStatus && constructionStatus !== 'N/A') filter.constructionStatus = constructionStatus;
    if (franchiseId) filter.franchiseId = franchiseId;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      // Free Typo-Tolerant Fuzzy Engine
      const cleanSearch = search.replace(/\s+/g, '');
      const fuzzyRegex = cleanSearch.split('').join('.*?'); 
      
      filter.$or = [
        { title: { $regex: fuzzyRegex, $options: 'i' } },
        { location: { $regex: fuzzyRegex, $options: 'i' } },
        { type: { $regex: fuzzyRegex, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } } // keep district strict or fuzzy too
      ];
    }

    const properties = await Property.find(filter).sort({ createdAt: -1 }).populate('cityId');
    res.status(200).json({ status: 'success', data: properties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new property
export const createProperty = async (req, res) => {
  try {
    const newProperty = new Property({ ...req.body });
    await newProperty.save();
    res.status(201).json({ status: 'success', data: newProperty });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
