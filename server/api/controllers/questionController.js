import Question from '../models/Question.js';

// Client sends a question
export const askQuestion = async (req, res) => {
  try {
    const newQuestion = new Question({ ...req.body });
    await newQuestion.save();
    res.status(201).json({ status: 'success', data: newQuestion });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get pending or all questions (Admin)
export const getAllQuestions = async (req, res) => {
  try {
    const { status, propertyId } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (propertyId) filter.propertyId = propertyId;
    
    const questions = await Question.find(filter)
      .populate('propertyId', 'title location type')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get public FAQs (Client viewing PropertyDetails)
export const getPropertyFAQs = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const faqs = await Question.find({ propertyId, status: 'Answered' })
      .select('clientName question answer answeredAt')
      .sort({ answeredAt: -1 });
    res.status(200).json({ status: 'success', data: faqs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin answers or rejects question
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer, status } = req.body;
    
    const question = await Question.findByIdAndUpdate(
      id,
      { answer, status, answeredAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json({ status: 'success', data: question });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json({ status: 'success', message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
