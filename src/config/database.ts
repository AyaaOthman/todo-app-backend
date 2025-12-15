import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';

export const connectDatabase = async (): Promise<void> => {
  try {
    // Validate connection string
    if (!MONGODB_URI || MONGODB_URI.includes('<') || MONGODB_URI.includes('YOUR_ACTUAL_PASSWORD')) {
      throw new Error('Invalid MongoDB connection string. Please check your .env file.');
    }

    const connectionOptions: any = {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    };

    // Handle SSL certificate issues (common with corporate proxies/firewalls)
    // Only allow invalid certificates in development
    if (process.env.NODE_ENV === 'development') {
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
    } else if (error.message.includes('IP')) {
      console.error('🌐 IP Whitelist Error');
      console.error('   Add your IP address in MongoDB Atlas → Network Access');
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

