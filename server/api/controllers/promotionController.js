import Promotion from '../models/Promotion.js';
import { db } from '../firebase.js';

// Helper to sync to Firebase for real-time client updates
const syncPromotionToFirebase = async (promotion) => {
  try {
    if (!promotion || !db) return;
    const ref = db.ref(`promotions/${promotion._id || promotion.id}`);
    
    // Flatten data for RTDB
    const syncData = {
      id: (promotion._id || promotion.id).toString(),
      type: promotion.type || 'ad',
      title: promotion.title || promotion.headline || '',
      subtitle: promotion.subtitle || promotion.subheadline || '',
      image: promotion.image || '',
      actionText: promotion.actionText || promotion.ctaText || '',
      actionUrl: promotion.actionUrl || promotion.ctaUrl || '',
      cardColor: promotion.cardColor || 'dark',
      countdownActive: !!promotion.countdownActive,
      expiryDate: promotion.endDate || promotion.expiryDate || null,
      isActive: promotion.isActive !== false,
      displayOrder: promotion.displayOrder || 0,
      updatedAt: new Date().toISOString()
    };

    await ref.set(syncData);
    console.log(`SYNC_SUCCESS: Promotion ${syncData.title} pushed to Firebase`);
  } catch (err) {
    console.error('SYNC_ERROR_FIREBASE_PROMO:', err.message);
  }
};

const syncAllPromotionsToFirebase = async () => {
  try {
    if (!db) return;
    const promotions = await Promotion.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
    const ref = db.ref('promotions');
    
    // Overwrite the entire promotions node to maintain order
    const syncMap = {};
    promotions.forEach((p, index) => {
       const id = (p._id || p.id).toString();
       syncMap[id] = {
         id,
         type: p.type || 'ad',
         title: p.title || p.headline || '',
         subtitle: p.subtitle || p.subheadline || '',
         image: p.image || '',
         actionText: p.actionText || p.ctaText || '',
         actionUrl: p.actionUrl || p.ctaUrl || '',
         cardColor: p.cardColor || 'dark',
         countdownActive: !!p.countdownActive,
         expiryDate: p.endDate || p.expiryDate || null,
         isActive: true,
         displayOrder: index,
         updatedAt: new Date().toISOString()
       };
    });
    
    await ref.set(syncMap);
    console.log(`SYNC_BULK_SUCCESS: All active promotions synced`);
  } catch (err) {
    console.error('SYNC_BULK_ERROR_PROMO:', err.message);
  }
};

const removePromotionFromFirebase = async (id) => {
  try {
    if (!id || !db) return;
    await db.ref(`promotions/${id}`).remove();
    console.log(`SYNC_DELETE_SUCCESS: Promotion ${id} removed from Firebase`);
  } catch (err) {
    console.error('SYNC_DELETE_ERROR_PROMO:', err.message);
  }
};

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
    
    // Sync to Firebase (Non-blocking)
    syncPromotionToFirebase(promotion).catch(err => console.error('FIREBASE_SYNC_ERR:', err));
    
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
    
    // Sync to Firebase (Non-blocking)
    if (req.body.isActive === false) {
      removePromotionFromFirebase(id).catch(err => console.error('FIREBASE_REMOVE_ERR:', err));
    } else {
      syncPromotionToFirebase(updated).catch(err => console.error('FIREBASE_SYNC_ERR:', err));
    }
    
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
    
    // Bulk sync to maintain order in Firebase
    syncAllPromotionsToFirebase().catch(err => console.error('FIREBASE_BULK_SYNC_ERR:', err));
    
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
    
    // Remove from Firebase (Non-blocking)
    removePromotionFromFirebase(id).catch(err => console.error('FIREBASE_DELETE_ERR:', err));
    
    res.status(200).json({ status: 'success', message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
