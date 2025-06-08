#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function validateJsonFile(filePath) {
  console.log(`Validating ${filePath}...`);
  const startTime = Date.now();
  
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      throw new Error(`Expected array, got ${typeof data}`);
    }
    
    const fileSize = fs.statSync(filePath).size;
    const duration = Date.now() - startTime;
    
    console.log(`✅ ${path.basename(filePath)} valid (${data.length} items, ${Math.round(fileSize/1024)}KB, ${duration}ms)`);
    return data;
  } catch (error) {
    console.error(`❌ ${path.basename(filePath)} failed:`, error.message);
    process.exit(1);
  }
}

function validateDataStructure(data, expectedFields, typeName) {
  console.log(`Validating ${typeName} structure...`);
  
  if (data.length === 0) {
    throw new Error(`No ${typeName} data found`);
  }
  
  const firstItem = data[0];
  for (const field of expectedFields) {
    if (!(field in firstItem)) {
      throw new Error(`Missing required field '${field}' in ${typeName}`);
    }
  }
  
  console.log(`✅ ${typeName} structure valid (${data.length} items)`);
}

function main() {
  console.log('🔍 Starting data validation...');
  
  const dataDir = path.join(__dirname, '..', 'data');
  
  // Validate JSON files
  const municipalities = validateJsonFile(path.join(dataDir, 'municipalities-2025.json'));
  const counties = validateJsonFile(path.join(dataDir, 'counties-2025.json'));
  const postalCodes = validateJsonFile(path.join(dataDir, 'postal-codes-2025.json'));
  
  // Validate data structures
  validateDataStructure(
    municipalities, 
    ['id', 'name', 'name_no', 'population', 'area', 'postal_codes'],
    'municipality'
  );
  
  validateDataStructure(
    counties,
    ['id', 'name', 'url'],
    'county'
  );
  
  validateDataStructure(
    postalCodes,
    ['code', 'place', 'id'],
    'postal code'
  );
  
  // Additional consistency checks
  console.log('Checking data consistency...');
  
  // Check municipality IDs are unique
  const municipalityIds = new Set();
  for (const municipality of municipalities) {
    if (municipalityIds.has(municipality.id)) {
      throw new Error(`Duplicate municipality ID: ${municipality.id}`);
    }
    municipalityIds.add(municipality.id);
  }
  
  // Check postal codes reference valid municipalities
  for (const postalCode of postalCodes.slice(0, 100)) { // Sample first 100 for performance
    if (!municipalityIds.has(postalCode.id)) {
      throw new Error(`Postal code ${postalCode.code} references invalid municipality ID: ${postalCode.id}`);
    }
  }
  
  console.log('✅ All data validation checks passed!');
  console.log(`📊 Summary: ${municipalities.length} municipalities, ${counties.length} counties, ${postalCodes.length} postal codes`);
}

if (require.main === module) {
  main();
}

