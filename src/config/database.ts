import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file (for local development)
// In production (Railway), environment variables are set by the platform
dotenv.config();

// Get MongoDB URI from environment variable
// In production, MONGODB_URI MUST be set (no fallback)
// In development, fallback to localhost for local testing
const getMongoUri = (): string | undefined => {
  const uri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
  
  if (uri) {
    return uri;
  }
  
  // Only use localhost fallback in development
  if (!isProduction) {
    return 'mongodb://localhost:27017/todo-app';
  }
  
  // In production, return undefined to trigger error
  return undefined;
};

const MONGODB_URI = getMongoUri();

export const connectDatabase = async (): Promise<void> => {
  try {
    // Debug: Log environment variable status
    console.log('🔍 Environment check:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   MONGODB_URI set: ${!!process.env.MONGODB_URI}`);
    
    // Log connection attempt (mask password for security)
    const maskedUri = MONGODB_URI
      ? MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')
      : 'not set';
    console.log('🔌 Attempting MongoDB connection...');
    console.log(`   URI: ${maskedUri}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

    // Validate connection string
    if (!MONGODB_URI) {
      console.error('');
      console.error('❌ MONGODB_URI environment variable is missing!');
      console.error('');
      console.error('💡 For Railway deployment:');
      console.error('   1. Go to your Railway project → Variables tab');
      console.error('   2. Add variable: MONGODB_URI');
      console.error('   3. Value: mongodb+srv://username:password@cluster.mongodb.net/Learning-Todo?retryWrites=true&w=majority');
      console.error('   4. Make sure variable name is exactly: MONGODB_URI (case-sensitive)');
      console.error('   5. Redeploy your service after adding the variable');
      console.error('');
      console.error('💡 For local development:');
      console.error('   1. Create a .env file in the project root');
      console.error('   2. Add: MONGODB_URI=your_connection_string');
      throw new Error('MONGODB_URI environment variable is not set. Please set it in Railway variables or .env file.');
    }
    
    if (MONGODB_URI.includes('<') || MONGODB_URI.includes('YOUR_ACTUAL_PASSWORD')) {
      console.error('');
      console.error('❌ MONGODB_URI contains placeholder values!');
      console.error('   Replace <password> or YOUR_ACTUAL_PASSWORD with your real password');
      throw new Error('Invalid MongoDB connection string. Please replace placeholder values with actual credentials.');
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

