const { Client } = require('pg');

async function testSSLConnection() {
  // Test with different SSL configurations
  const connectionStrings = [
    // Original connection string
    'postgresql://tcc_production_db_user:kduvfSGb4YrhCQGBR0h40pcXi9bb9Ij9@dpg-d2u62j3e5dus73eeo4l0-a.oregon-postgres.render.com:5432/tcc_production_db',
    
    // With SSL mode in URL
    'postgresql://tcc_production_db_user:kduvfSGb4YrhCQGBR0h40pcXi9bb9Ij9@dpg-d2u62j3e5dus73eeo4l0-a.oregon-postgres.render.com:5432/tcc_production_db?sslmode=require',
    
    // With SSL mode and other parameters
    'postgresql://tcc_production_db_user:kduvfSGb4YrhCQGBR0h40pcXi9bb9Ij9@dpg-d2u62j3e5dus73eeo4l0-a.oregon-postgres.render.com:5432/tcc_production_db?sslmode=require&sslcert=&sslkey=&sslrootcert=',
  ];

  for (let i = 0; i < connectionStrings.length; i++) {
    const connectionString = connectionStrings[i];
    console.log(`\n🔌 Testing connection ${i + 1}/${connectionStrings.length}`);
    console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':***@'));
    
    const client = new Client({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false,
        require: true
      },
      connectionTimeoutMillis: 10000,
      query_timeout: 10000
    });

    try {
      console.log('📡 Attempting to connect...');
      await client.connect();
      console.log('✅ Connected successfully!');
      
      const result = await client.query('SELECT version(), now() as current_time');
      console.log('📊 Database info:', result.rows[0]);
      
      await client.end();
      console.log('🔌 Connection closed gracefully');
      return true;
    } catch (error) {
      console.error(`❌ Connection ${i + 1} failed:`, error.message);
      if (i === connectionStrings.length - 1) {
        console.error('All connection attempts failed');
        return false;
      }
    }
  }
}

testSSLConnection().then(success => {
  process.exit(success ? 0 : 1);
});
