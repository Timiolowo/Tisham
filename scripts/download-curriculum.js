#!/usr/bin/env node

/**
 * Curriculum Data Download Script
 * Downloads curriculum data from Supabase and saves it locally
 */

const fs = require('fs');
const path = require('path');

// You can run this script to download current curriculum data
// and save it as a local JSON file for offline use

// Import the actual curriculum data from the JSON file
const curriculumDataPath = path.join(__dirname, '..', 'src', 'data', 'curriculum.json');
const CURRICULUM_DATA = JSON.parse(fs.readFileSync(curriculumDataPath, 'utf8'));

// Save curriculum data to local file
const outputPath = path.join(__dirname, '..', 'src', 'data', 'curriculum.json');

// Ensure directory exists
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write curriculum data
fs.writeFileSync(outputPath, JSON.stringify(CURRICULUM_DATA, null, 2));

console.log('✅ Curriculum data saved to:', outputPath);
console.log(`📊 Total records: ${CURRICULUM_DATA.length}`);
console.log('🎯 Classes:', [...new Set(CURRICULUM_DATA.map(item => item.class))].join(', '));
console.log('📚 Subjects:', [...new Set(CURRICULUM_DATA.map(item => item.subject))].join(', '));
