import express from 'express';
import { AP_DISTRICTS, ALL_AP_CITIES, ALL_AP_DISTRICT_NAMES } from '../data/apDistricts.js';

import { getCities, createCity, updateCity, deleteCity } from '../controllers/cityController.js';

const router = express.Router();

// GET all districts (still from static data if needed for UI dropdowns)
router.get('/', (req, res) => {
  res.json({ status: 'success', data: AP_DISTRICTS });
});

// GET all district names
router.get('/names', (req, res) => {
  res.json({ status: 'success', data: ALL_AP_DISTRICT_NAMES });
});

// City Management (Dynamic from MongoDB)
router.get('/cities', getCities);
router.post('/cities', createCity);
router.put('/cities/:id', updateCity);
router.delete('/cities/:id', deleteCity);

// GET cities for a specific district (still from static data for filters)
router.get('/:district', (req, res) => {
  const district = AP_DISTRICTS.find(d => 
    d.district.toLowerCase().includes(req.params.district.toLowerCase())
  );
  if (!district) return res.status(404).json({ message: 'District not found' });
  res.json({ status: 'success', data: district });
});

export default router;
