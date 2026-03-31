import Testimonial from '../models/Testimonial.js';

export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: testimonials });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    res.status(201).json({ status: 'success', data: testimonial });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
