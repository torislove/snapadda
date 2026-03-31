import SiteSetting from '../models/SiteSetting.js';

// Get a setting by key
export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await SiteSetting.findOne({ key });
    
    if (!setting) {
      // Return 200 with null value so frontend can decide fallback
      return res.status(200).json({ status: 'success', data: null });
    }
    
    res.status(200).json({ status: 'success', data: setting.value });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create or update a setting
export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    // Find setting and update it, or create it if it doesn't exist (upsert)
    const setting = await SiteSetting.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    res.status(200).json({ status: 'success', data: setting.value });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
