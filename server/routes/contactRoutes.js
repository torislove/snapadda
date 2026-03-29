import express from 'express';
import Contact from '../models/Contact.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET all contacts (with filters)
router.get('/', async (req, res) => {
  try {
    const { type, starred, search, district, tag } = req.query;
    let filter = {};

    if (type && type !== 'all') filter.type = type;
    if (starred === 'true') filter.isStarred = true;
    if (district) filter.district = district;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(filter).sort({ isStarred: -1, createdAt: -1 });
    res.json({ status: 'success', data: contacts, count: contacts.length });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET single contact
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).populate('propertyInterests');
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ status: 'success', data: contact });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create single contact
router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ status: 'success', data: contact });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST bulk upload from Excel
router.post('/bulk', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Dynamic import xlsx
    let XLSX;
    try {
      XLSX = await import('xlsx');
    } catch (e) {
      return res.status(500).json({ message: 'Excel import feature requires "xlsx" package to be installed on the server. Please wait for npm install to finish.' });
    }
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty or unreadable' });
    }

    // Auto-detect columns (case-insensitive matching)
    const detectColumn = (row, possibleNames) => {
      for (const key of Object.keys(row)) {
        const lower = key.toLowerCase().trim();
        if (possibleNames.some(n => lower.includes(n))) return key;
      }
      return null;
    };

    const firstRow = rows[0];
    const nameCol = detectColumn(firstRow, ['name', 'contact name', 'full name', 'realtor name', 'client name']);
    const phoneCol = detectColumn(firstRow, ['phone', 'mobile', 'contact', 'number', 'whatsapp']);
    const emailCol = detectColumn(firstRow, ['email', 'e-mail', 'mail']);
    const typeCol = detectColumn(firstRow, ['type', 'category', 'role']);
    const companyCol = detectColumn(firstRow, ['company', 'firm', 'agency', 'organization']);
    const locationCol = detectColumn(firstRow, ['location', 'city', 'area', 'place']);
    const districtCol = detectColumn(firstRow, ['district']);

    if (!nameCol || !phoneCol) {
      return res.status(400).json({ 
        message: 'Could not detect Name and Phone columns. Make sure your Excel has columns with headers like "Name" and "Phone".',
        detectedColumns: Object.keys(firstRow)
      });
    }

    const contacts = rows.map(row => ({
      name: String(row[nameCol] || '').trim(),
      phone: String(row[phoneCol] || '').trim(),
      email: emailCol ? String(row[emailCol] || '').trim() : '',
      type: typeCol ? (String(row[typeCol] || '').toLowerCase().includes('realtor') ? 'Realtor' : 'Client') : (req.body.defaultType || 'Client'),
      company: companyCol ? String(row[companyCol] || '').trim() : '',
      location: locationCol ? String(row[locationCol] || '').trim() : '',
      district: districtCol ? String(row[districtCol] || '').trim() : '',
      source: 'Excel',
    })).filter(c => c.name && c.phone);

    const result = await Contact.insertMany(contacts, { ordered: false });

    res.status(201).json({
      status: 'success',
      message: `Successfully imported ${result.length} contacts`,
      imported: result.length,
      total: rows.length,
      detectedColumns: { name: nameCol, phone: phoneCol, email: emailCol, type: typeCol }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ status: 'partial', message: 'Some contacts were duplicates and skipped' });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT update contact
router.put('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ status: 'success', data: contact });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT toggle star
router.put('/:id/star', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    contact.isStarred = !contact.isStarred;
    await contact.save();
    res.json({ status: 'success', data: contact });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST log WhatsApp message sent
router.post('/:id/whatsapp', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    contact.whatsappSent.count = (contact.whatsappSent.count || 0) + 1;
    contact.whatsappSent.lastSent = new Date();
    await contact.save();
    res.json({ status: 'success', data: contact });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE contact
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ status: 'success', message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
