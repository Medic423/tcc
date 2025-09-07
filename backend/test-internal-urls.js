const { Client } = require('pg');

async function testInternalURLs() {
  const baseCredentials = 'tcc_production_db_user:kduvfSGb4YrhCQGBR0h40pcXi9bb9Ij9';
  const databaseName = 'tcc_production_db';
  
  // Try different internal URL patterns
  const internalURLs = [
    // Pattern 1: Replace external hostname with internal
    `postgresql://${baseCredentials}@dpg-d2u62j3e5dus73eeo4l0-a.internal:5432/${databaseName}`,
    
    // Pattern 2: Use internal subdomain
    `postgresql://${baseCredentials}@dpg-d2u62j3e5dus73eeo4l0-a.internal.oregon-postgres.render.com:5432/${databaseName}`,
    
    // Pattern 3: Use internal hostname
    `postgresql://${baseCredentials}@dpg-d2u62j3e5dus73eeo4l0-a.internal.render.com:5432/${databaseName}`,
    
    // Pattern 4: Use localhost (if running on same host)
    `postgresql://${baseCredentials}@localhost:5432/${databaseName}`,
    
    // Pattern 5: Use 127.0.0.1
    `postgresql://${baseCredentials}@127.0.0.1:5432/${databaseName}`,
  ];

  for (let i = 0; i < internalURLs.length; i++) {
    const url = internalURLs[i];
    console.log(`\n🔌 Testing internal URL ${i + 1}/${internalURLs.length}`);
    console.log('URL:', url.replace(/:[^:@]+@/, ':***@'));
    
    const client = new Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
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
      console.log(`\n🎉 SUCCESS! Internal URL found: ${url}`);
      return url;
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n❌ No internal URL worked');
  return null;
}

testInternalURLs().then(url => {
  if (url) {
    console.log(`\n✅ Working internal URL: ${url}`);
  }
  process.exit(url ? 0 : 1);
});
