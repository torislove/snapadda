import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('Manoj587487', salt);
        const User = mongoose.connection.collection('users');
        const res = await User.updateOne(
            { email: 'admin@snapadda.com' }, 
            { $set: { password: hash, role: 'admin' } }
        );
        console.log('Update Success:', res);
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
});
