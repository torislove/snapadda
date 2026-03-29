import Property from '../models/Property.js';

// Get all properties (with optional filters)
export const getProperties = async (req, res) => {
  try {
    const { type, city, facing, approval, minPrice, maxPrice, search, verified } = req.query;
    let filter = {};

    if (type && type !== 'all') filter.type = type;
    if (city) filter.location = { $regex: city, $options: 'i' };
    if (facing && facing !== 'Any') filter.facing = facing;
    if (approval) filter.approvalAuthority = approval;
    if (verified === 'true') filter.isVerified = true;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
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
