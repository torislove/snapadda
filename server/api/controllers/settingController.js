import SiteSetting from '../models/SiteSetting.js';
import { db as rtdb } from '../firebase.js';

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

    if (value === undefined || value === null) {
      return res.status(400).json({ status: 'error', message: 'Value is required' });
    }

    // Key-specific validation & Normalization
    let normalizedKey = key;
    if (key === 'whatsapp' || key === 'whatsapp_settings') {
      normalizedKey = 'whatsapp_settings';
      if (value.number && !/^\d+$/.test(value.number.replace(/\D/g, ''))) {
        return res.status(400).json({ status: 'error', message: 'WhatsApp number must be numeric' });
      }
    }

    if (key === 'hero_content' && !value.title) {
      return res.status(400).json({ status: 'error', message: 'Hero title is required' });
    }
    
    if (key === 'onboarding_questions' && !Array.isArray(value)) {
      return res.status(400).json({ status: 'error', message: 'Questions must be an array' });
    }

    const setting = await SiteSetting.findOneAndUpdate(
      { key: normalizedKey },
      { value },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Real-time Sync for critical UI/Logic settings
    const rtdbSyncKeys = [
      'whatsapp_settings', 'hero_content', 'onboarding_questions', 
      'site_stats', 'site_appearance', 'seo', 'support_info'
    ];

    if (rtdb && rtdbSyncKeys.includes(normalizedKey)) {
      try {
        await rtdb.ref(`settings/${normalizedKey}`).set(value);
      } catch (err) {
        console.warn('⚠️ RTDB Sync Note:', err.message);
      }
    }
    
    res.status(200).json({ status: 'success', data: setting.value });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
