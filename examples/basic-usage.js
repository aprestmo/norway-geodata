const {
  getMunicipalities,
  getPostalCodes,
  getMunicipalityById,
  getPostalCodesByPlace
} = require('@aprestmo/norway-geodata');

// Basic municipality lookup
const oslo = getMunicipalityById('0301');
console.log(`Oslo population: ${oslo?.population}`);

// Search postal codes
const bergenCodes = getPostalCodesByPlace('bergen');
console.log(`Bergen has ${bergenCodes.length} postal codes`);

// Get statistics
const allMunicipalities = getMunicipalities();
console.log(`Total municipalities: ${allMunicipalities.length}`);

const allPostalCodes = getPostalCodes();
console.log(`Total postal codes: ${allPostalCodes.length}`);

