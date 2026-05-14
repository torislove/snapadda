import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Predefined Admin Credentials assigned by User Config
const PREDEFINED_ADMIN_EMAIL = 'admin@snapadda.com';
const PREDEFINED_ADMIN_PASS = 'Snapadda@587487';
const JWT_SECRET = process.env.JWT_SECRET || 'snapadda_super_secret_key_123';

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Seeder mechanism: If the admin user doesn't exist yet, we silently create it on first attempt.
    // Check by both email and the special 'admin_local_account' googleId to prevent collisions.
    let adminUser = await User.findOne({ 
      $or: [
        { email: PREDEFINED_ADMIN_EMAIL },
        { googleId: 'admin_local_account' }
      ]
    });
    
    if (!adminUser) {
      console.log("Admin user not found. Seeding original admin account...");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(PREDEFINED_ADMIN_PASS, salt);
      
      adminUser = new User({
        googleId: 'admin_local_account',
        email: PREDEFINED_ADMIN_EMAIL,
        name: 'SnapAdda Administrator',
        password: hashedPassword,
        role: 'admin',
        onboardingCompleted: true
      });
      await adminUser.save();
      console.log("Admin account seeded successfully.");
    } else {
      // Emergency Reset: If found but password might be old/incorrect from previous turns
      // We force update the password to the latest PREDEFINED_ADMIN_PASS for this specific account
      const salt = await bcrypt.genSalt(10);
      adminUser.password = await bcrypt.hash(PREDEFINED_ADMIN_PASS, salt);
      adminUser.role = 'admin';
      await adminUser.save();
      console.log("Admin account credentials synchronized.");
    }

    // Now proceed with normal login verification
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid Admin Credentials' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Not an Administrator' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Admin Credentials' });
    }

    // Sign JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      status: 'success',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("CRITICAL_ADMIN_LOGIN_ERROR:", {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal Server Error', 
      debug: process.env.NODE_ENV !== 'production' ? error.message : undefined 
    });
  }
};

// Middleware helper
const verifyAdmin = (req) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

// Update profile (name + avatar)
export const updateAdminProfile = async (req, res) => {
  const decoded = verifyAdmin(req);
  if (!decoded) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;

    const updated = await User.findByIdAndUpdate(decoded.id, updates, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ status: 'error', message: 'Admin not found' });

    res.json({
      status: 'success',
      user: { _id: updated._id, name: updated.name, email: updated.email, role: updated.role, avatar: updated.avatar }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Change password
export const changeAdminPassword = async (req, res) => {
  const decoded = verifyAdmin(req);
  if (!decoded) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'Both currentPassword and newPassword are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ status: 'error', message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'Admin not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ status: 'error', message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ status: 'success', message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
