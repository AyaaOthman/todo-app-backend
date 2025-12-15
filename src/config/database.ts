import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';

export const connectDatabase = async (): Promise<void> => {
  try {
    // Log connection attempt (mask password for security)
    const maskedUri = MONGODB_URI
      ? MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')
      : 'not set';
    console.log('🔌 Attempting MongoDB connection...');
    console.log(`   URI: ${maskedUri}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

    // Validate connection string
    if (!MONGODB_URI || MONGODB_URI.includes('<') || MONGODB_URI.includes('YOUR_ACTUAL_PASSWORD')) {
      console.error('');
      console.error('❌ MONGODB_URI environment variable is missing or invalid!');
      console.error('');
      console.error('💡 For Railway deployment:');
      console.error('   1. Go to your Railway project → Variables tab');
      console.error('   2. Add variable: MONGODB_URI');
      console.error('   3. Value: mongodb+srv://username:password@cluster.mongodb.net/todo-app?retryWrites=true&w=majority');
      console.error('   4. Redeploy your service');
      throw new Error('Invalid MongoDB connection string. Please check your .env file or Railway environment variables.');
    }

    // Check if using localhost (common mistake)
    if (MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')) {
      console.error('');
      console.error('⚠️  WARNING: Using localhost connection string!');
      console.error('   This will not work in production/deployment.');
      console.error('   Make sure MONGODB_URI is set to your MongoDB Atlas connection string.');
      console.error('');
    }

    const connectionOptions: any = {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    };

    // Handle SSL certificate issues (common with corporate proxies/firewalls)
    // Allow invalid certificates in development and for Railway (which may have proxy issues)
    if (process.env.NODE_ENV === 'development' || process.env.RAILWAY_ENVIRONMENT) {
      connectionOptions.tlsAllowInvalidCertificates = true;
    }

    await mongoose.connect(MONGODB_URI, connectionOptions);
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('');
    
    // Specific error handling
    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('🔍 DNS Resolution Error Detected');
      console.error('');
      console.error('💡 Solutions:');
      console.error('   1. Check your internet connection');
      console.error('   2. Try using a different DNS server (8.8.8.8 or 1.1.1.1)');
      console.error('   3. Disable VPN if you\'re using one');
      console.error('   4. Check firewall settings');
      console.error('   5. Verify your MongoDB Atlas cluster is running');
      console.error('   6. Try the connection string from Atlas again (copy fresh)');
    } else if (error.message.includes('authentication failed')) {
      console.error('🔐 Authentication Error');
      console.error('   Check your username and password in the connection string');
    } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.error('🌐 IP Whitelist Error');
      console.error('   Add your IP address in MongoDB Atlas → Network Access');
      console.error('   For Railway: Add 0.0.0.0/0 (allow all) or Railway\'s IP ranges');
    } else if (error.message.includes('certificate') || error.message.includes('TLS')) {
      console.error('🔒 SSL/TLS Certificate Error Detected');
      console.error('');
      console.error('💡 This usually happens with:');
      console.error('   - Corporate firewalls/proxies');
      console.error('   - Antivirus software intercepting connections');
      console.error('   - Network security tools');
      console.error('');
      console.error('✅ The connection has been configured to handle this in development mode.');
      console.error('   If the error persists, check your network/firewall settings.');
    }
    
    console.error('');
    console.error('📝 Connection string format:');
    console.error('   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});

