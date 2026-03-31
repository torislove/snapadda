import City from '../models/City.js';

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
    res.status(200).json({ status: 'success', message: 'City deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
