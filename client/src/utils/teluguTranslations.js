/**
 * SnapAdda Telugu Translation Engine
 * Highly stylized and regional linguistic mapping for real estate assets.
 */

const translations = {
  // Property Types
  'Apartment': 'అపార్ట్‌మెంట్',
  'Flat': 'ఫ్లాట్',
  'Villa': 'విల్లా',
  'Independent House': 'ఇండిపెండెంట్ హౌస్',
  'Residential Plot': 'నివాస స్థలం (ప్లాట్)',
  'Open Plot': 'ఓపెన్ ప్లాట్',
  'CRDA Approved Plot': 'CRDA అప్రూవ్డ్ ప్లాట్',
  'Agricultural Land': 'వ్యవసాయ భూమి',
  'Farmhouse': 'ఫామ్‌హౌస్',
  'Commercial Plot': 'కమర్షియల్ ప్లాట్',
  'Industrial Shed': 'ఇండస్ట్రియల్ షెడ్',
  'Warehouse': 'వేర్‌హౌస్',
  'Layout Plot': 'లేఅవుట్ ప్లాట్',

  // Purpose
  'Sale': 'అమ్మకానికి',
  'Rent': 'అద్దెకు',
  'Lease': 'లీజుకు',
  'For Sale': 'అమ్మకానికి సిద్ధం',
  'For Rent': 'అద్దెకు సిద్ధం',

  // Common Labels
  'Price': 'ధర',
  'Location': 'ప్రాంతం',
  'Facing': 'దిశ (ఫేసింగ్)',
  'Area': 'విస్తీర్ణం',
  'BHK': 'BHK',
  'Beds': 'బెడ్ రూమ్స్',
  'Baths': 'బాత్ రూమ్స్',
  'Floor': 'ఫ్లోర్',
  'Total Floors': 'మొత్తం అంతస్తులు',
  'Ownership': 'యాజమాన్యం',
  'Furnishing': 'ఫర్నిషింగ్',
  'Property Age': 'నిర్మాణ వయస్సు',
  'Verified': 'వెరిఫైడ్',
  'Featured': 'ప్రీమియం',
  'Sold Out': 'అమ్మబడినది',
  'Active': 'అందుబాటులో ఉంది',
  'Hot Asset': 'హాట్ ప్రాపర్టీ',
  'View Details': 'వివరాలు చూడండి',
  'Call Agent': 'ఏజెంట్‌కు కాల్ చేయండి',
  'WhatsApp Chat': 'వాట్సాప్ చాట్',
  'Request Callback': 'కాల్‌బ్యాక్ అభ్యర్థించండి',
  'View on Map': 'మ్యాప్‌లో చూడండి',
  'Overview': 'అవలోకనం',
  'Details': 'వివరాలు',
  'Amenities': 'సదుపాయాలు',
  'Q&A': 'ప్రశ్నలు & సమాధానాలు',
  'Trust Scorecard': 'నమ్మకమైన సమాచారం',
  'Govt Approval': 'ప్రభుత్వ అనుమతి',
  'Elite Status': 'ఎలైట్ హోదా',
  'Verified Title': 'వెరిఫైడ్ టైటిల్',
  'SnapAdda Verified': 'SnapAdda వెరిఫైడ్',
  'Vastu Compliant': 'వాస్తు ప్రకారం',
  'Gated Community': 'గేటెడ్ కమ్యూనిటీ',
  'Corner Plot': 'కార్నర్ ప్లాట్',
  'Boundary Wall': 'ప్రహరీ గోడ',

  // Directions
  'East': 'తూర్పు',
  'West': 'పడమర',
  'North': 'ఉత్తరం',
  'South': 'దక్షిణం',
  'North-East': 'ఈశాన్యం',
  'South-West': 'నైరుతి',
  'North-West': 'వాయువ్యం',
  'South-East': 'ఆగ్నేయం',
  'Any': 'ఏదైనా',

  // Furnishing
  'Furnished': 'పూర్తిగా అమర్చబడినది',
  'Semi-Furnished': 'పాక్షికంగా అమర్చబడినది',
  'Unfurnished': 'అమర్చబడలేదు',
  'N/A': 'వర్తించదు',

  // Misc
  'Total Land Extent': 'మొత్తం భూమి విస్తీర్ణం',
  'Per Acre Price': 'ఎకరా ధర',
  'Total Asset Value': 'మొత్తం ఆస్తి విలువ',
  'Exclusive SnapAdda Valuation': 'SnapAdda ప్రత్యేకం',
  'Acres': 'ఎకరాలు',
  'Cents': 'సెంట్లు',
  'Sq.Yards': 'గజాలు',
  'Sq.Ft': 'చదరపు అడుగులు',
  'Gaj.': 'గజాలు',
  'Price on Request': 'ధర అడిగి తెలుసుకోండి',
};

export const tr = (text) => {
  if (!text) return '';
  const clean = String(text).trim();
  return translations[clean] || clean;
};

export default tr;
