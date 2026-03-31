import Promotion from '../models/Promotion.js';

// Get promotions — supports ?all=true for admin view (all), default = active only for client
export const getPromotions = async (req, res) => {
  try {
    const query = req.query.all === 'true' ? {} : { isActive: true };
    const promotions = await Promotion.find(query).sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({ status: 'success', data: promotions });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create a new promotion
export const createPromotion = async (req, res) => {
  try {
    // Auto-assign displayOrder = count of existing docs
    const count = await Promotion.countDocuments();
    const promotion = new Promotion({ ...req.body, displayOrder: count });
    await promotion.save();
    res.status(201).json({ status: 'success', data: promotion });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Update a promotion (toggle active, edit fields)
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Promotion.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ status: 'error', message: 'Promotion not found' });
    res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Bulk reorder — accepts { orderedIds: ['id1','id2',...] }
export const reorderPromotions = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ status: 'error', message: 'orderedIds must be an array' });
    }
    const updateOps = orderedIds.map((id, index) =>
      Promotion.findByIdAndUpdate(id, { displayOrder: index })
    );
    await Promise.all(updateOps);
    res.status(200).json({ status: 'success', message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete a promotion
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Promotion.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ status: 'error', message: 'Promotion not found' });
    res.status(200).json({ status: 'success', message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
