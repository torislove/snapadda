import express from 'express';
import Inquiry from '../models/Inquiry.js';

const router = express.Router();

// @route   POST /api/inquiries
// @desc    Submit a question from the Client UI
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { propertyId, clientName, clientContact, question } = req.body;
    if (!propertyId || !clientName || !question) {
      return res.status(400).json({ status: 'fail', message: 'Missing required fields' });
    }
    
    const newInquiry = new Inquiry({ propertyId, clientName, clientContact, question });
    await newInquiry.save();
    
    res.status(201).json({ status: 'success', data: newInquiry });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error saving inquiry' });
  }
});

// @route   GET /api/inquiries/property/:propertyId
// @desc    Get all answered questions for a property (Client UI)
// @access  Public
router.get('/property/:propertyId', async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ 
      propertyId: req.params.propertyId,
      status: 'Answered'
    }).sort('-answeredAt');
    
    res.status(200).json({ status: 'success', data: inquiries });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed fetching inquiries' });
  }
});

// @route   GET /api/inquiries
// @desc    Get all inquiries for management (Admin Portal)
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const { franchiseId } = req.query;
    let filter = {};
    if (franchiseId) filter.franchiseId = franchiseId;

    const inquiries = await Inquiry.find(filter).sort('-createdAt').populate('propertyId', 'title');
    res.status(200).json({ status: 'success', data: inquiries });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed fetching inquiries' });
  }
});

// @route   PUT /api/inquiries/:id
// @desc    Answer or update an inquiry (Admin Portal)
// @access  Admin
router.put('/:id', async (req, res) => {
  try {
    const { answer, status } = req.body;
    
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    
    if (answer !== undefined) inquiry.answer = answer;
    if (status !== undefined) inquiry.status = status;
    
    if (answer && inquiry.status !== 'Archived') {
      inquiry.status = 'Answered';
      inquiry.answeredAt = Date.now();
    }
    
    await inquiry.save();
    res.status(200).json({ status: 'success', data: inquiry });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed updating inquiry' });
  }
});

export default router;
