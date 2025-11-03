/**
 * Service Test Script
 * Tests all critical services to identify configuration issues
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('========================================');
console.log('🔍 Testing SEO Analyzer Services');
console.log('========================================\n');

async function testServices() {
  let allTestsPassed = true;

  // Test 1: Environment Variables
  console.log('1️⃣ Testing Environment Variables...');
  const requiredEnvVars = {
    'DATABASE_URL': process.env.DATABASE_URL,
    'CLAUDE_API_KEY': process.env.CLAUDE_API_KEY,
    'PORT': process.env.PORT || '3001'
  };

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      console.log(`   ❌ ${key} is NOT set`);
      allTestsPassed = false;
    } else {
      const displayValue = key === 'CLAUDE_API_KEY' ?
        `${value.substring(0, 10)}...${value.substring(value.length - 4)}` :
        value;
      console.log(`   ✅ ${key} = ${displayValue}`);
    }
  }
  console.log('');

  // Test 2: Database Connection
  console.log('2️⃣ Testing Database Connection...');
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, version() as version');
    client.release();
    await pool.end();

    console.log(`   ✅ Database connected successfully`);
    console.log(`   📊 PostgreSQL version: ${result.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
  } catch (error) {
    console.log(`   ❌ Database connection failed: ${error.message}`);
    allTestsPassed = false;
  }
  console.log('');

  // Test 3: Puppeteer/Browser
  console.log('3️⃣ Testing Puppeteer Browser...');
  try {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const version = await browser.version();
    await browser.close();

    console.log(`   ✅ Puppeteer browser launched successfully`);
    console.log(`   🌐 Chrome version: ${version}`);
  } catch (error) {
    console.log(`   ❌ Puppeteer failed: ${error.message}`);
    console.log(`   💡 You may need to install Chromium dependencies`);
    allTestsPassed = false;
  }
  console.log('');

  // Test 4: Claude API
  console.log('4️⃣ Testing Claude API Connection...');
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Test' }]
    });

    console.log(`   ✅ Claude API connected successfully`);
    console.log(`   🤖 Model: claude-3-5-sonnet-20240620`);
    console.log(`   💬 Test response received (${message.content[0].text.length} chars)`);
  } catch (error) {
    console.log(`   ❌ Claude API failed: ${error.message}`);
    if (error.message.includes('authentication')) {
      console.log(`   💡 Check if CLAUDE_API_KEY is valid`);
    }
    allTestsPassed = false;
  }
  console.log('');

  // Summary
  console.log('========================================');
  if (allTestsPassed) {
    console.log('✅ All services are working correctly!');
    console.log('You can now start the server with: npm start');
  } else {
    console.log('❌ Some services failed. Please fix the issues above.');
    console.log('\n💡 Common fixes:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check your .env file has correct values');
    console.log('   3. Install Chromium: npm install puppeteer');
    console.log('   4. Verify Claude API key is valid');
  }
  console.log('========================================\n');

  process.exit(allTestsPassed ? 0 : 1);
}

testServices().catch(error => {
  console.error('\n❌ Test script failed:', error);
  process.exit(1);
});
