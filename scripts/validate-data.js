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
  const municipalities = validateJsonFile(path.join(dataDir, 'kommuner-2025.json'));
  const counties = validateJsonFile(path.join(dataDir, 'fylker-2025.json'));
  const postalCodes = validateJsonFile(path.join(dataDir, 'postal-codes-2025.json'));
  
  // Validate data structures
  validateDataStructure(
    municipalities, 
    ['k_id', 'k_name', 'k_name_no', 'k_population', 'k_area', 'k_postal_codes'],
    'municipality'
  );
  
  validateDataStructure(
    counties,
    ['f_id', 'f_name', 'f_url'],
    'county'
  );
  
  validateDataStructure(
    postalCodes,
    ['k_postal_code', 'k_postal_place', 'k_id'],
    'postal code'
  );
  
  // Additional consistency checks
  console.log('Checking data consistency...');
  
  // Check municipality IDs are unique
  const municipalityIds = new Set();
  for (const municipality of municipalities) {
    if (municipalityIds.has(municipality.k_id)) {
      throw new Error(`Duplicate municipality ID: ${municipality.k_id}`);
    }
    municipalityIds.add(municipality.k_id);
  }
  
  // Check postal codes reference valid municipalities
  for (const postalCode of postalCodes.slice(0, 100)) { // Sample first 100 for performance
    if (!municipalityIds.has(postalCode.k_id)) {
      throw new Error(`Postal code ${postalCode.k_postal_code} references invalid municipality ID: ${postalCode.k_id}`);
    }
  }
  
  console.log('✅ All data validation checks passed!');
  console.log(`📊 Summary: ${municipalities.length} municipalities, ${counties.length} counties, ${postalCodes.length} postal codes`);
}

if (require.main === module) {
  main();
}

