import express from 'express';
import Lead from '../models/Lead.js';
import { automationService } from '../modules/automationService.js';

const router = express.Router();

// @route   POST /api/leads
// @desc    Submit a lead from the Client UI
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, propertyId, message, franchiseId } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ status: 'fail', message: 'Name and phone are required' });
    }
    
    const newLead = new Lead({
      name,
      phone,
      email,
      propertyId,
      message,
      franchiseId
    });
    
    await newLead.save();

    // Non-blocking: AI drafts & sends WhatsApp/Email response
    automationService.handleNewLead(newLead).catch(e => console.error('Automation error:', e));

    res.status(201).json({ status: 'success', data: newLead });
  } catch (error) {
    console.error('Lead submission error:', error);
    res.status(500).json({ status: 'error', message: 'Server error saving lead' });
  }
});

// @route   GET /api/leads
// @desc    Get all leads for management (Admin Portal)
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const { franchiseId } = req.query;
    let filter = {};
    if (franchiseId) filter.franchiseId = franchiseId;

    const leads = await Lead.find(filter).sort('-createdAt').populate('propertyId', 'title');
    res.status(200).json({ status: 'success', data: leads });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed fetching leads' });
  }
});

// @route   PUT /api/leads/:id
// @desc    Update a lead (Admin Portal)
// @access  Admin
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    if (status !== undefined) lead.status = status;
    
    await lead.save();
    res.status(200).json({ status: 'success', data: lead });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed updating lead' });
  }
});

// @route   DELETE /api/leads/:id
// @desc    Delete a lead (Admin Portal)
// @access  Admin
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
