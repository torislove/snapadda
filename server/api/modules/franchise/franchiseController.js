import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import FranchiseAdmin from '../../models/FranchiseAdmin.js';

export const loginFranchise = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await FranchiseAdmin.findOne({ email });
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Invalid credentials or account inactive' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, role: 'franchise', regions: admin.regions, permissions: admin.permissions },
      process.env.JWT_SECRET || 'snapadda-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      status: 'success',
      data: {
        token,
        admin: { _id: admin._id, name: admin.name, email: admin.email, regions: admin.regions, permissions: admin.permissions }
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFranchiseAdmins = async (req, res) => {
  try {
    const admins = await FranchiseAdmin.find().select('-password').sort({ createdAt: -1 });
    res.json({ status: 'success', data: admins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createFranchiseAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, regions, permissions } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new FranchiseAdmin({
      name, email, password: hashedPassword, phone, regions, permissions
    });
    await admin.save();

    const { password: _, ...adminData } = admin.toObject();
    res.status(201).json({ status: 'success', data: adminData });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Email already exists' });
    res.status(400).json({ message: err.message });
  }
};

export const updateFranchiseAdmin = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }
    const admin = await FranchiseAdmin.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!admin) return res.status(404).json({ message: 'Not found' });
    res.json({ status: 'success', data: admin });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteFranchiseAdmin = async (req, res) => {
  try {
    await FranchiseAdmin.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Franchise admin removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
