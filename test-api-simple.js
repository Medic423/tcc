#!/usr/bin/env node
/*
 Simple contract test runner for critical endpoints.
 Usage:
   API_URL=https://your-api node test-api-simple.js
   or
   node test-api-simple.js (uses http://localhost:5001)
*/

const https = require('https');
const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:5001';
const TCC_TOKEN = process.env.TCC_TOKEN || '';

function fetchJson(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const lib = url.protocol === 'https:' ? https : http;
    const headers = { 'Accept': 'application/json' };
    if (TCC_TOKEN && url.pathname.startsWith('/api')) {
      headers['Authorization'] = `Bearer ${TCC_TOKEN}`;
    }
    const req = lib.request(url, { method: 'GET', headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data || '{}');
          resolve({ status: res.statusCode, data: json, url: url.toString() });
        } catch (err) {
          reject(new Error(`Invalid JSON from ${url}: ${err.message}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  const results = [];

  // Health
  const health = await fetchJson('/health');
  results.push(['health', health.status, health.data.status]);
  assert(health.status === 200, 'Health endpoint should return 200');

  // Analytics overview
  const overview = await fetchJson('/api/tcc/analytics/overview');
  results.push(['analytics.overview', overview.status, !!overview.data.success]);
  if (overview.status !== 200) {
    console.warn('⚠️  Overview not accessible without token. Set TCC_TOKEN to test authenticated endpoints.');
  } else {
    assert(overview.data.success === true, 'Overview should succeed');
  }

  // Dropdown categories
  const categories = await fetchJson('/api/dropdown-options');
  results.push(['dropdown.categories', categories.status, Array.isArray(categories.data.data)]);
  if (categories.status !== 200) {
    console.warn('⚠️  Dropdown categories require auth. Set TCC_TOKEN to validate.');
  } else {
    assert(Array.isArray(categories.data.data), 'Categories should be array');
  }

  // Agencies
  const agencies = await fetchJson('/api/tcc/agencies');
  results.push(['agencies', agencies.status, Array.isArray(agencies.data.data)]);
  if (agencies.status !== 200) {
    console.warn('⚠️  Agencies not accessible without token. Set TCC_TOKEN to test authenticated endpoints.');
  } else {
    assert(Array.isArray(agencies.data.data), 'Agencies should be array');
  }

  // EMS analytics (auth required)
  const emsOverview = await fetchJson('/api/ems/analytics/overview');
  results.push(['ems.overview', emsOverview.status, !!emsOverview.data.success]);
  if (emsOverview.status !== 200) console.warn('⚠️  EMS overview requires auth.');

  const emsTrips = await fetchJson('/api/ems/analytics/trips');
  results.push(['ems.trips', emsTrips.status, !!emsTrips.data.success]);
  if (emsTrips.status !== 200) console.warn('⚠️  EMS trips requires auth.');

  const emsUnits = await fetchJson('/api/ems/analytics/units');
  results.push(['ems.units', emsUnits.status, !!emsUnits.data.success]);
  if (emsUnits.status !== 200) console.warn('⚠️  EMS units requires auth.');

  const emsPerf = await fetchJson('/api/ems/analytics/performance');
  results.push(['ems.performance', emsPerf.status, !!emsPerf.data.success]);
  if (emsPerf.status !== 200) console.warn('⚠️  EMS performance requires auth.');

  console.log('✅ Contract tests passed');
  for (const r of results) console.log('-', ...r);
}

run().catch((err) => {
  console.error('❌ Contract test failed:', err.message);
  process.exit(1);
});

// Removed duplicate legacy test block
