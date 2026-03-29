import express from 'express';
import { AP_DISTRICTS, ALL_AP_CITIES, ALL_AP_DISTRICT_NAMES } from '../data/apDistricts.js';

const router = express.Router();

// GET all districts with cities
router.get('/', (req, res) => {
  res.json({ status: 'success', data: AP_DISTRICTS });
});

// GET all district names (flat list)
router.get('/names', (req, res) => {
  res.json({ status: 'success', data: ALL_AP_DISTRICT_NAMES });
});

// GET all cities (flat list)
router.get('/cities', (req, res) => {
  res.json({ status: 'success', data: ALL_AP_CITIES });
});

// GET cities for a specific district
router.get('/:district', (req, res) => {
  const district = AP_DISTRICTS.find(d => 
    d.district.toLowerCase().includes(req.params.district.toLowerCase())
  );
  if (!district) return res.status(404).json({ message: 'District not found' });
  res.json({ status: 'success', data: district });
});

export default router;
