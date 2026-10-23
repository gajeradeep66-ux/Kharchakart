require('dotenv').config();

const connectDB = require('./config/db');
const seedDatabase = require('./utils/seedData');

const runSeed = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Demo data seeding is disabled in production.');
    }

    await connectDB();
    await seedDatabase();
    console.log('Seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

runSeed();
