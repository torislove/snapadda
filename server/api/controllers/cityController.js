import City from '../models/City.js';
import { db } from '../firebase.js';

// Helper to sync to Firebase
const syncCityToFirebase = async (city) => {
  try {
    if (!city || !db) return;
    const ref = db.ref(`cities/${city._id || city.id}`);
    
    const syncData = {
      id: (city._id || city.id).toString(),
      name: city.name,
      image: city.image || '',
      status: city.status || 'Active',
      updatedAt: new Date().toISOString()
    };

    await ref.set(syncData);
    console.log(`SYNC_SUCCESS: City ${syncData.name} pushed to Firebase`);
  } catch (err) {
    console.error('SYNC_ERROR_FIREBASE_CITY:', err.message);
  }
};

const removeCityFromFirebase = async (id) => {
  try {
    if (!id || !db) return;
    await db.ref(`cities/${id}`).remove();
    console.log(`SYNC_DELETE_SUCCESS: City ${id} removed from Firebase`);
  } catch (err) {
    console.error('SYNC_DELETE_ERROR_CITY:', err.message);
  }
};

// GET all cities
export const getCities = async (req, res) => {
  try {
    const cities = await City.find().sort({ name: 1 });
    res.status(200).json({ status: 'success', data: cities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE a city
export const createCity = async (req, res) => {
  try {
    const newCity = new City({ ...req.body });
    await newCity.save();
    
    // Sync to Firebase (Non-blocking)
    syncCityToFirebase(newCity).catch(err => console.error('FIREBASE_SYNC_ERR:', err));
    
    res.status(201).json({ status: 'success', data: newCity });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// UPDATE a city
export const updateCity = async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!city) return res.status(404).json({ message: 'City not found' });
    
    // Sync to Firebase (Non-blocking)
    syncCityToFirebase(city).catch(err => console.error('FIREBASE_SYNC_ERR:', err));
    
    res.status(200).json({ status: 'success', data: city });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE a city
export const deleteCity = async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) return res.status(404).json({ message: 'City not found' });
    
    // Remove from Firebase (Non-blocking)
    removeCityFromFirebase(req.params.id).catch(err => console.error('FIREBASE_DELETE_ERR:', err));
    
    res.status(200).json({ status: 'success', message: 'City deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

