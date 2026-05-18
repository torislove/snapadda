/**
 * High-performance, O(1) Typo-Tolerant regional spelling corrector.
 * Maps historical, colloquial, and common misspellings of Andhra Pradesh 
 * locations to standardized database tokens.
 */
export const correctRegionalSpelling = (input) => {
  if (!input || typeof input !== 'string') return input;
  const normalized = input.trim().toLowerCase();

  const spellingDictionary = {
    // Amaravati Region
    'amaravathy': 'Amaravati',
    'amravati': 'Amaravati',
    'amaravathi': 'Amaravati',
    
    // Visakhapatnam Region
    'vizag': 'Visakhapatnam',
    'visakhapatinam': 'Visakhapatnam',
    'visakhapatnam': 'Visakhapatnam',
    
    // Vijayawada Region
    'vijaywada': 'Vijayawada',
    'bezawada': 'Vijayawada',
    
    // Guntur
    'guntoor': 'Guntur',
    
    // Nellore
    'nelloor': 'Nellore',
    
    // Tirupati
    'tirupathi': 'Tirupati',
    
    // Chittoor
    'chittor': 'Chittoor',
    
    // Kurnool
    'kurnoolu': 'Kurnool',
    
    // Kadapa
    'cuddapah': 'Kadapa',
    
    // Anantapur
    'ananthapur': 'Anantapur',
    
    // Rajahmundry Region
    'rajamahendravaram': 'Rajahmundry',
    'rajamundry': 'Rajahmundry',
    
    // Kakinada
    'coconada': 'Kakinada',
    
    // Eluru
    'ellore': 'Eluru'
  };

  return spellingDictionary[normalized] || input;
};
