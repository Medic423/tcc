const { Client } = require('pg');

async function testConnectionApproaches() {
  const baseUrl = 'postgresql://tcc_production_db_user:kduvfSGb4YrhCQGBR0h40pcXi9bb9Ij9@dpg-d2u62j3e5dus73eeo4l0-a.oregon-postgres.render.com:5432/tcc_production_db';
  
  const approaches = [
    {
      name: 'Basic connection with SSL',
      config: {
        connectionString: baseUrl,
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Connection with SSL require',
      config: {
        connectionString: baseUrl,
        ssl: { rejectUnauthorized: false, require: true }
      }
    },
    {
      name: 'Connection with SSL mode in URL',
      config: {
        connectionString: baseUrl + '?sslmode=require',
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Connection with detailed SSL config',
      config: {
        connectionString: baseUrl,
        ssl: {
          rejectUnauthorized: false,
          require: true,
          mode: 'require'
        }
      }
    },
    {
      name: 'Connection with timeout settings',
      config: {
        connectionString: baseUrl + '?sslmode=require&connect_timeout=30',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 30000,
        query_timeout: 30000
      }
    }
  ];

  for (const approach of approaches) {
    console.log(`\n🔌 Testing: ${approach.name}`);
    
    const client = new Client(approach.config);
    
    try {
      console.log('📡 Attempting to connect...');
      await client.connect();
      console.log('✅ Connected successfully!');
      
      const result = await client.query('SELECT 1 as test');
      console.log('📊 Query result:', result.rows[0]);
      
      await client.end();
      console.log('🔌 Connection closed gracefully');
      return true;
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      console.error(`   Detail: ${error.detail}`);
    }
  }
  
  console.log('\n❌ All connection approaches failed');
  return false;
}

testConnectionApproaches().then(success => {
  process.exit(success ? 0 : 1);
});
