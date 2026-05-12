import express from 'express';
import Contact from '../models/Contact.js';
import multer from 'multer';
import Property from '../models/Property.js';
import { formatWhatsAppMessage } from '../utils/whatsappFormatter.js';
import { generatePropertyEmailHTML } from '../utils/emailTemplates.js';
import nodemailer from 'nodemailer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET all contacts (with filters)
router.get('/', async (req, res) => {
  try {
    const { type, starred, search, district, tag, limit = 200, page = 1 } = req.query;
    let filter = {};

    if (type && type !== 'all') filter.type = type;
    if (starred === 'true') filter.isStarred = true;
    if (district) filter.district = { $regex: district, $options: 'i' };
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { name:    { $regex: search, $options: 'i' } },
        { phone:   { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email:   { $regex: search, $options: 'i' } },
        { realtorCode: { $regex: search, $options: 'i' } },
      ];
    }

    const limitNum = Math.min(500, Math.max(1, parseInt(limit)));
    const pageNum  = Math.max(1, parseInt(page));
    const skip     = (pageNum - 1) * limitNum;

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ isStarred: -1, createdAt: -1 }).skip(skip).limit(limitNum),
      Contact.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: contacts, count: total, page: pageNum });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET CRM Stats (for dashboard stats bar)
router.get('/stats', async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [realtors, clients, waTotal, newThisWeek] = await Promise.all([
      Contact.countDocuments({ type: 'Realtor' }),
      Contact.countDocuments({ type: 'Client' }),
      Contact.aggregate([{ $group: { _id: null, total: { $sum: '$whatsappSent.count' } } }]),
      Contact.countDocuments({ createdAt: { $gte: oneWeekAgo } })
    ]);
    res.json({
      status: 'success',
      data: {
        realtors,
        clients,
        whatsappSent: waTotal[0]?.total || 0,
        newThisWeek
      }
    });
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


// POST send multiple properties via WhatsApp and/or Email
router.post('/:id/broadcast', async (req, res) => {
  try {
    const { channel, propertyIds } = req.body; // channel: 'WhatsApp', 'Email', 'Both'
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    let properties = [];
    if (propertyIds && propertyIds.length > 0) {
      properties = await Property.find({ _id: { $in: propertyIds } });
    }

    let whatsappText = '';
    if (channel === 'WhatsApp' || channel === 'Both') {
      whatsappText = formatWhatsAppMessage(contact.name, properties);
      contact.whatsappSent.count = (contact.whatsappSent.count || 0) + 1;
      contact.whatsappSent.lastSent = new Date();
    }

    if ((channel === 'Email' || channel === 'Both') && contact.email) {
      const html = generatePropertyEmailHTML(contact.name, properties);
      // Setup nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or configured SMTP
        auth: {
          user: process.env.SMTP_USER || 'hello@snapadda.com',
          pass: process.env.SMTP_PASS || 'password',
        }
      });
      
      try {
        await transporter.sendMail({
          from: '"SnapAdda Real Estate" <hello@snapadda.com>',
          to: contact.email,
          subject: 'Exclusive Property Matches for You 🏠',
          html: html,
        });
      } catch (e) {
        console.error('Email sending failed:', e.message);
        // We log the error but don't fail the whole request since WhatsApp might have worked
      }
    }

    // Log the communication
    contact.communicationHistory.push({
      channel: channel,
      propertiesSent: propertyIds || [],
      sentAt: new Date(),
      sentBy: 'Admin'
    });
    
    // Also add a note so it shows up in the normal notes thread
    const noteText = `Broadcasted ${properties.length} properties via ${channel}.`;
    contact.notes.push({ text: noteText, addedBy: 'System', addedAt: new Date() });
    contact.lastContactedAt = new Date();

    await contact.save();
    
    res.json({ 
      status: 'success', 
      whatsappText: whatsappText, // Send back so client can open wa.me
      message: 'Broadcast logged successfully' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add note to contact
router.post('/:id/notes', async (req, res) => {
  try {
    const { text, addedBy = 'Admin' } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Note text required' });
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text: text.trim(), addedBy } }, $set: { lastContactedAt: new Date() } },
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
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
