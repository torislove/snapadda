import mongoose from 'mongoose';

const mongoUri = 'mongodb+srv://manojkadiyala8_db_user:Manoj587487@cluster0.fjxb0my.mongodb.net/snapadda?retryWrites=true&w=majority&appName=Cluster0';

async function cleanup() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    const Property = mongoose.model('Property', new mongoose.Schema({ 
      image: String, 
      images: [String], 
      status: String 
    }));

    // 1. Mark all as Active (to ensure visibility during testing)
    const result = await Property.updateMany({}, { $set: { status: 'Active' } });
    console.log(`Updated ${result.modifiedCount} properties to Active`);

    // 2. Fix broken blob thumbnails
    const props = await Property.find({ image: { $regex: /^blob:/ } });
    console.log(`Found ${props.length} properties with blob thumbnails`);
    
    for (let p of props) {
      if (p.images && p.images.length > 0) {
        const validImg = p.images.find(img => img.startsWith('http'));
        if (validImg) {
          p.image = validImg;
          await p.save();
          console.log(`Fixed blob thumbnail for: ${p._id}`);
        }
      }
    }

    console.log('Cleanup finished');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

cleanup();
