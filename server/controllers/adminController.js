import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Predefined Admin Credentials assigned by User Config
const PREDEFINED_ADMIN_EMAIL = 'admin@snapadda.com';
const PREDEFINED_ADMIN_PASS = 'Manoj587487';
const JWT_SECRET = process.env.JWT_SECRET || 'snapadda_super_secret_key_123';

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Seeder mechanism: If the admin user doesn't exist yet, we silently create it on first attempt.
    let adminUser = await User.findOne({ email: PREDEFINED_ADMIN_EMAIL });
    
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
    console.error("Admin Login Error:", error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
