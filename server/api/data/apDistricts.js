// All 26 Andhra Pradesh districts with their major cities/towns
export const AP_DISTRICTS = [
  {
    district: 'Amaravati (Capital Region)',
    cities: ['Amaravati', 'Mangalagiri', 'Thullur', 'Tadepalli', 'Undavalli']
  },
  {
    district: 'Guntur',
    cities: ['Guntur', 'Tenali', 'Narasaraopet', 'Ponnur', 'Bapatla', 'Chilakaluripet', 'Vinukonda', 'Macherla']
  },
  {
    district: 'NTR (Vijayawada)',
    cities: ['Vijayawada', 'Jaggayyapeta', 'Nandigama', 'Tiruvuru', 'Mylavaram']
  },
  {
    district: 'Krishna',
    cities: ['Machilipatnam', 'Gudivada', 'Nuzvid', 'Pedana', 'Vuyyuru']
  },
  {
    district: 'Palnadu',
    cities: ['Narasaraopet', 'Macherla', 'Gurazala', 'Piduguralla', 'Dachepalli']
  },
  {
    district: 'Bapatla',
    cities: ['Bapatla', 'Chirala', 'Repalle', 'Addanki', 'Ongole']
  },
  {
    district: 'Prakasam',
    cities: ['Ongole', 'Markapur', 'Chirala', 'Kandukur', 'Darsi']
  },
  {
    district: 'Nellore (SPSR)',
    cities: ['Nellore', 'Gudur', 'Kavali', 'Atmakur', 'Kandukur']
  },
  {
    district: 'Tirupati',
    cities: ['Tirupati', 'Srikalahasti', 'Sullurpeta', 'Puttur', 'Nagari']
  },
  {
    district: 'Chittoor',
    cities: ['Chittoor', 'Madanapalle', 'Punganur', 'Palamaner', 'Kuppam']
  },
  {
    district: 'Annamayya',
    cities: ['Rayachoti', 'Rajampet', 'Kadapa portion', 'Vontimitta']
  },
  {
    district: 'YSR Kadapa',
    cities: ['Kadapa', 'Proddatur', 'Jammalamadugu', 'Pulivendula', 'Mydukur']
  },
  {
    district: 'Anantapur',
    cities: ['Anantapur', 'Hindupur', 'Tadipatri', 'Guntakal', 'Dharmavaram']
  },
  {
    district: 'Sri Sathya Sai',
    cities: ['Puttaparthi', 'Penukonda', 'Dharmavaram', 'Kadiri', 'Rayadurg']
  },
  {
    district: 'Kurnool',
    cities: ['Kurnool', 'Nandyal', 'Adoni', 'Yemmiganur', 'Dhone']
  },
  {
    district: 'Nandyal',
    cities: ['Nandyal', 'Allagadda', 'Nandikotkur', 'Banaganapalle']
  },
  {
    district: 'Eluru',
    cities: ['Eluru', 'Tadepalligudem', 'Nidadavole', 'Chintalapudi', 'Jangareddygudem']
  },
  {
    district: 'West Godavari',
    cities: ['Bhimavaram', 'Narasapuram', 'Tanuku', 'Palakol', 'Tadepalligudem']
  },
  {
    district: 'East Godavari',
    cities: ['Rajahmundry', 'Amalapuram', 'Mandapeta', 'Ramachandrapuram', 'Peddapuram']
  },
  {
    district: 'Kakinada',
    cities: ['Kakinada', 'Samalkot', 'Pithapuram', 'Gollaprolu', 'Tuni']
  },
  {
    district: 'Konaseema',
    cities: ['Amalapuram', 'Ravulapalem', 'Mummidivaram', 'Ramachandrapuram']
  },
  {
    district: 'Visakhapatnam',
    cities: ['Visakhapatnam', 'Gajuwaka', 'Pendurthi', 'Anakapalli', 'Bheemunipatnam']
  },
  {
    district: 'Anakapalli',
    cities: ['Anakapalli', 'Narsipatnam', 'Yelamanchili', 'Chodavaram']
  },
  {
    district: 'Alluri Sitharama Raju',
    cities: ['Paderu', 'Rampachodavaram', 'Chintapalli', 'Araku Valley']
  },
  {
    district: 'Vizianagaram',
    cities: ['Vizianagaram', 'Bobbili', 'Rajam', 'Parvathipuram', 'Nellimarla']
  },
  {
    district: 'Srikakulam',
    cities: ['Srikakulam', 'Palasa', 'Tekkali', 'Amadalavalasa', 'Narasannapeta']
  },
  {
    district: 'Parvathipuram Manyam',
    cities: ['Parvathipuram', 'Palakonda', 'Salur', 'Seethanagaram']
  }
];

// Flat list of all cities
export const ALL_AP_CITIES = AP_DISTRICTS.flatMap(d => d.cities);

// Flat list of all districts
export const ALL_AP_DISTRICT_NAMES = AP_DISTRICTS.map(d => d.district);
