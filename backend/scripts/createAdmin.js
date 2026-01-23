const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get Practitioner model
    const Practitioner = require('../models/Practitioner');

    // Check if admin already exists
    const existingAdmin = await Practitioner.findOne({ email: 'smosina003@gmail.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin with this email already exists');
      console.log('Updating to admin role...');
      
      existingAdmin.role = 'admin';
      existingAdmin.verified = true;
      existingAdmin.authorityLevel = 'Approver';
      await existingAdmin.save();
      
      console.log('✅ Existing account upgraded to admin');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('mosina003', 10);

      // Create admin practitioner
      const admin = await Practitioner.create({
        email: 'smosina003@gmail.com',
        password: hashedPassword,
        role: 'admin',
        verified: true,
        authorityLevel: 'Approver',
        name: 'Admin'
      });

      console.log('✅ Admin created successfully');
      console.log('📧 Email:', admin.email);
      console.log('🔑 Password: mosina003');
      console.log('👑 Role:', admin.role);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
