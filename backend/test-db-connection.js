const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: 'postgresql://tcc_production_db_user:kduvfSGb4YrhCQGBR0h40pcXi9bb9Ij9@dpg-d2u62j3e5dus73eeo4l0-a.oregon-postgres.render.com:5432/tcc_production_db',
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    query_timeout: 30000
  });

  try {
    console.log('🔌 Attempting to connect to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT version(), now() as current_time');
    console.log('📊 Database info:', result.rows[0]);
    
    await client.end();
    console.log('🔌 Connection closed gracefully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
  }
}

testConnection();
