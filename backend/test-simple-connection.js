const { Client } = require('pg');

async function testSimpleConnection() {
  const connectionString = 'postgresql://tcc_production_db_user:kduvfSGb4YrhCQGBR0h40pcXi9bb9Ij9@dpg-d2u62j3e5dus73eeo4l0-a.oregon-postgres.render.com:5432/tcc_production_db';
  
  console.log('🔌 Testing simple PostgreSQL connection...');
  console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':***@')); // Hide password
  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false,
      require: true,
      mode: 'require'
    },
    connectionTimeoutMillis: 30000,
    query_timeout: 30000,
    idleTimeoutMillis: 30000
  });

  try {
    console.log('📡 Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    console.log('📊 Testing query...');
    const result = await client.query('SELECT version(), now() as current_time, current_database() as db_name');
    console.log('📋 Database info:', result.rows[0]);
    
    console.log('🔍 Testing table existence...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('📋 Existing tables:', tablesResult.rows.map(r => r.table_name));
    
    await client.end();
    console.log('🔌 Connection closed gracefully');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    console.error('  Detail:', error.detail);
    console.error('  Hint:', error.hint);
    console.error('  Position:', error.position);
    console.error('  Internal Position:', error.internalPosition);
    console.error('  Internal Query:', error.internalQuery);
    console.error('  Where:', error.where);
    console.error('  Schema:', error.schema);
    console.error('  Table:', error.table);
    console.error('  Column:', error.column);
    console.error('  Data Type:', error.dataType);
    console.error('  Constraint:', error.constraint);
    console.error('  File:', error.file);
    console.error('  Line:', error.line);
    console.error('  Routine:', error.routine);
    return false;
  }
}

testSimpleConnection().then(success => {
  process.exit(success ? 0 : 1);
});
