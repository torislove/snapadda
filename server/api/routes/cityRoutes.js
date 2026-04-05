import express from 'express';
import { getCities, createCity, updateCity, deleteCity } from '../controllers/cityController.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 mins
  next();
}, getCities);
router.post('/', createCity);
router.put('/:id', updateCity);
router.delete('/:id', deleteCity);

export default router;
