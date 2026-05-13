import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const checkRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    const roles = {};
    users.forEach(u => {
      const role = u.role || 'user';
      roles[role] = (roles[role] || 0) + 1;
    });
    
    console.log("User Roles:");
    console.table(roles);

    const admins = users.filter(u => u.role === 'admin' || u.isAdmin);
    console.log(`\nPotential Admins in 'users' collection: ${admins.length}`);
    admins.forEach(a => console.log(`- ${a.name} (${a.email}) - role: ${a.role}, isAdmin: ${a.isAdmin}`));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

checkRoles();
