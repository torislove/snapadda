import express from 'express';
import Lead from '../models/Lead.js';
import Property from '../models/Property.js';
import { automationService } from '../modules/automationService.js';
import { db } from '../firebase.js';

const router = express.Router();

// ─── POST /api/leads ─── Submit a new lead from the Client UI
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, propertyId, message, franchiseId, source, priority } = req.body;

    // Auto-Routing: Fetch property details
    let district = '';
    let propertyCode = '';
    let propertyTitle = '';
    if (propertyId) {
      const prop = await Property.findById(propertyId).select('district propertyCode title');
      if (prop) {
        district = prop.district || '';
        propertyCode = prop.propertyCode || `SNA-${prop._id.toString().slice(-5).toUpperCase()}`;
        propertyTitle = prop.title || '';
      }
    }

    const newLead = new Lead({
      name, phone, email, propertyId, message, franchiseId,
      district, propertyCode, propertyTitle,
      source: source || 'Website',
      priority: priority || 'Normal',
    });

    await newLead.save();

    // Mirror to Firebase RTDB for Real-Time Analytics
    if (db) {
      db.ref('crm_leads').push({
        ...newLead.toObject(),
        status: 'New',
        createdAt: new Date().toISOString()
      }).catch(e => console.error('Firebase lead sync error:', e));
    }

    // Non-blocking: AI drafts & sends WhatsApp/Email response
    automationService.handleNewLead(newLead).catch(e => console.error('Automation error:', e));

    res.status(201).json({ status: 'success', data: newLead });
  } catch (error) {
    console.error('Lead submission error:', error);
    res.status(500).json({ status: 'error', message: 'Server error saving lead' });
  }
});

// ─── GET /api/leads ─── Get all leads with rich filtering (Admin Portal)
router.get('/', async (req, res) => {
  try {
    const { franchiseId, status, source, priority, district, search, followUp, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (franchiseId) filter.franchiseId = franchiseId;
    if (status && status !== 'all') filter.status = status;
    if (source && source !== 'all') filter.source = source;
    if (priority && priority !== 'all') filter.priority = priority;
    if (district) filter.district = { $regex: district, $options: 'i' };
    if (followUp === 'true') filter.followUpFlag = true;
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { propertyCode: { $regex: search, $options: 'i' } },
        { propertyTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
          .sort({ priority: -1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .populate('propertyId', 'title propertyCode images'),
      Lead.countDocuments(filter)
    ]);

    res.status(200).json({
      status: 'success',
      data: leads,
      meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    console.error('GET leads error:', error);
    res.status(500).json({ status: 'error', message: 'Failed fetching leads' });
  }
});

// ─── PUT /api/leads/:id ─── Update a lead (Admin Portal)
router.put('/:id', async (req, res) => {
  try {
    const { status, followUpFlag, followUpDate, district, assignedTo, priority, source } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (status    !== undefined) lead.status    = status;
    if (followUpFlag !== undefined) lead.followUpFlag = followUpFlag;
    if (followUpDate !== undefined) lead.followUpDate = followUpDate ? new Date(followUpDate) : null;
    if (district  !== undefined) lead.district  = district;
    if (assignedTo!== undefined) lead.assignedTo= assignedTo;
    if (priority  !== undefined) lead.priority  = priority;
    if (source    !== undefined) lead.source    = source;

    await lead.save();
    res.status(200).json({ status: 'success', data: lead });
  } catch (error) {
    console.error('PUT lead error:', error);
    res.status(500).json({ status: 'error', message: 'Failed updating lead' });
  }
});

// ─── POST /api/leads/:id/notes ─── Add admin note to a lead
router.post('/:id/notes', async (req, res) => {
  try {
    const { text, addedBy = 'Admin' } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Note text is required' });

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text: text.trim(), addedBy } } },
      { new: true }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    res.status(200).json({ status: 'success', data: lead });
  } catch (error) {
    console.error('POST lead note error:', error);
    res.status(500).json({ status: 'error', message: 'Failed adding note' });
  }
});

// ─── GET /api/leads/stats ─── Lead funnel stats for admin dashboard
router.get('/stats', async (req, res) => {
  try {
    const { franchiseId } = req.query;
    const matchFilter = franchiseId ? { franchiseId } : {};

    const [statusCounts, sourceCounts, priorityCounts, recentCount] = await Promise.all([
      Lead.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Lead.countDocuments({
        ...matchFilter,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    res.status(200).json({
      status: 'success',
      data: { statusCounts, sourceCounts, priorityCounts, recentCount }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed fetching lead stats' });
  }
});

// ─── DELETE /api/leads/:id ─── Delete a lead (Admin Portal)
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.status(200).json({ status: 'success', message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed deleting lead' });
  }
});

export default router;
