import Testimonial from '../models/Testimonial.js';
import { db } from '../firebase.js';

// Helper to sync to Firebase for real-time client updates
const syncTestimonialsToFirebase = async () => {
  try {
    if (!db) return;
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    const ref = db.ref('testimonials');
    
    // Convert array to object for RTDB
    const syncMap = {};
    testimonials.forEach(t => {
      syncMap[t._id.toString()] = {
        id: t._id.toString(),
        name: t.name,
        location: t.location || '',
        text: t.text,
        rating: t.rating || 5,
        image: t.image || '',
        color: t.color || '#6b4226',
        createdAt: t.createdAt.toISOString()
      };
    });

    await ref.set(syncMap);
    console.log('SYNC_SUCCESS: Testimonials pushed to Firebase');
  } catch (err) {
    console.error('SYNC_ERROR_TESTIMONIALS:', err.message);
  }
};

export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: testimonials });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    
    // Sync to Firebase
    syncTestimonialsToFirebase().catch(err => console.error('FIREBASE_SYNC_ERR:', err));
    
    res.status(201).json({ status: 'success', data: testimonial });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndUpdate(id, req.body, { new: true });
    if (!testimonial) return res.status(404).json({ status: 'error', message: 'Testimonial not found' });
    
    // Sync to Firebase
    syncTestimonialsToFirebase().catch(err => console.error('FIREBASE_SYNC_ERR:', err));
    
    res.status(200).json({ status: 'success', data: testimonial });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) return res.status(404).json({ status: 'error', message: 'Testimonial not found' });
    
    // Sync to Firebase
    syncTestimonialsToFirebase().catch(err => console.error('FIREBASE_SYNC_ERR:', err));
    
    res.status(200).json({ status: 'success', message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
