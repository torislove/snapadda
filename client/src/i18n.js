import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav": {
        "properties": "Properties",
        "locations": "Locations",
        "about": "About Us",
        "contact": "Contact",
        "signIn": "SIGN IN",
        "signOut": "SIGN OUT"
      },
      "hero": {
        "eyebrow": "Andhra Pradesh's #1 Property Platform",
        "title1": "Discover Your Dream",
        "title2": "Place in Andhra",
        "subtitle": "Browse verified listings across Amaravati, Vijayawada, Guntur & beyond. CRDA-approved properties · Real prices · Trusted sellers.",
        "browseBtn": "Browse Properties",
        "callBtn": "Free Expert Call"
      },
      "stats": {
        "verified": "Verified Listings",
        "cities": "Cities Covered",
        "clients": "Happy Clients",
        "approved": "Approved Properties"
      },
      "search": {
        "placeholder": "Location, project, keyword...",
        "allTypes": "All Types",
        "allLocs": "All Locations",
        "searchBtn": "Search",
        "clear": "Clear All",
        "clearQuick": "Clear"
      },
      "intent": {
        "buy": "Buy",
        "rent": "Rent",
        "new": "New Launch",
        "plot": "Plot",
        "comm": "Commercial"
      },
      "cities": {
        "eyebrow": "Explore by Location",
        "title": "Andhra Pradesh Cities",
        "subtitle": "Tap a city to filter properties by location",
        "filtering": "Filtering:"
      },
      "pills": {
        "crda": "CRDA Approved",
        "underConst": "Under Construction",
        "ready": "Ready to Move",
        "premium": "Premium Spots",
        "east": "East Facing"
      },
      "properties": {
        "propsIn": "Properties in",
        "rentals": "Rentals",
        "plots": "Plots & Land",
        "featured": "Featured Properties",
        "showing": "Showing verified and trusted listings",
        "found": "found",
        "none": "No properties found",
        "adjust": "Try adjusting or clearing your filters."
      },
      "why": {
        "eyebrow": "Why Choose Us",
        "title": "The Premium Real Estate Edge"
      },
      "testimonials": {
        "eyebrow": "Client Voices",
        "title": "What People Say About Us"
      },
      "contact": {
        "title": "Get A Call Back",
        "subtitle": "Drop your details and our senior property expert will assist you shortly.",
        "name": "Your Name",
        "phone": "Phone Number",
        "city": "Select City",
        "inquiry": "Inquiry Type",
        "send": "Send Request"
      },
      "card": {
        "verified": "Verified",
        "hot": "Hot",
        "featured": "Featured",
        "new": "New",
        "details": "View Details",
        "contact": "Contact Agent",
        "call": "Call Now",
        "facing": "Facing",
        "sqyds": "sq.yds"
      },
      "why": {
        "eyebrow": "Why Choose Us",
        "title": "The SnapAdda Advantage",
        "c1title": "Verified Listings",
        "c1desc": "Every property is manually verified by our team before listing.",
        "c2title": "CRDA / RERA Compliant",
        "c2desc": "All listings hold valid approval certifications for full legal safety.",
        "c3title": "24/7 Expert Support",
        "c3desc": "Our real estate advisors are available round the clock to assist you.",
        "c4title": "Best Price Guarantee",
        "c4desc": "We negotiate directly with builders to get you the best deal possible.",
        "c5title": "Vastu-Guided Properties",
        "c5desc": "Find east-facing and Vastu-compliant homes for prosperous living.",
        "c6title": "Transparent Pricing",
        "c6desc": "Zero hidden charges. Complete cost breakdowns including registration."
      },
      "footer": {
        "quick": "Quick Links"
      }
    }
  },
  te: {
    translation: {
      "nav": {
        "properties": "ఆస్తులు",
        "locations": "ప్రాంతాలు",
        "about": "మా గురించి",
        "contact": "సంప్రదించండి",
        "signIn": "లాగిన్",
        "signOut": "లాగ్అవుట్"
      },
      "hero": {
        "eyebrow": "ఆంధ్రప్రదేశ్ నెం.1 ప్రాపర్టీ ప్లాట్‌ఫారమ్",
        "title1": "మీ కలల ఆస్తిని",
        "title2": "ఆంధ్రలో కనుక్కోండి",
        "subtitle": "అమరావతి, విజయవాడ, గుంటూరు మరియు అంతకు మించి ధృవీకరించిన ఆస్తులను బ్రౌజ్ చేయండి. CRDA ఆమోదించినవి · నిజమైన ధరలు · నమ్మకమైన అమ్మకందారులు.",
        "browseBtn": "ఆస్తులను బ్రౌజ్ చేయండి",
        "callBtn": "ఉచిత నిపుణుని కాల్"
      },
      "stats": {
        "verified": "ధృవీకరించిన ఆస్తులు",
        "cities": "కవర్ చేయబడిన నగరాలు",
        "clients": "సంతోషకరమైన కామెంట్లు",
        "approved": "ఆమోదించిన ఆస్తులు"
      },
      "search": {
        "placeholder": "ప్రాంతం, ప్రాజెక్ట్, కీవర్డ్...",
        "allTypes": "అన్ని రకాలు",
        "allLocs": "అన్ని ప్రాంతాలు",
        "searchBtn": "వెతకండి",
        "clear": "అన్నీ క్లియర్ చేయండి",
        "clearQuick": "క్లియర్"
      },
      "intent": {
        "buy": "కొనుగోలు",
        "rent": "అద్దెకు",
        "new": "కొత్తవి",
        "plot": "స్థలాలు",
        "comm": "వాణిజ్య"
      },
      "cities": {
        "eyebrow": "ప్రాంతం వారీగా అన్వేషించండి",
        "title": "ఆంధ్రప్రదేశ్ నగరాలు",
        "subtitle": "ప్రాంతం ఆధారంగా ఆస్తులను ఫిల్టర్ చేయడానికి నగరాన్ని ట్యాప్ చేయండి",
        "filtering": "ఫిల్టర్ చేస్తోంది:"
      },
      "pills": {
        "crda": "CRDA ఆమోదించినవి",
        "underConst": "నిర్మాణంలో ఉన్నవి",
        "ready": "వెంటనే మారడానికి",
        "premium": "ప్రీమియం స్పాట్స్",
        "east": "తూర్పు ముఖచిత్రం"
      },
      "properties": {
        "propsIn": "ముఖ్య ఆస్తులు:",
        "rentals": "అద్దెలు",
        "plots": "స్థలాలు మరియు భూములు",
        "featured": "ఫీచర్ చేసిన ఆస్తులు",
        "showing": "ధృవీకరించిన మరియు నమ్మదగిన జాబితాలు",
        "found": "కనుగొనబడినవి",
        "none": "ఆస్తులు దొరకలేదు",
        "adjust": "ఫిల్టర్లు మార్చి చూడండి."
      },
      "why": {
        "eyebrow": "మమ్మల్ని ఎందుకు ఎంచుకోవాలి",
        "title": "ప్రీమియం రియల్ ఎస్టేట్ ఎడ్జ్"
      },
      "testimonials": {
        "eyebrow": "క్లయింట్ వాయిస్‌లు",
        "title": "మా గురించి ప్రజలు చెప్పేది"
      },
      "contact": {
        "title": "కాల్ బ్యాక్ పొందండి",
        "subtitle": "మీ వివరాలు పంపండి, మా ప్రాపర్టీ నిపుణులు మీకు వెంటనే సహాయం చేస్తారు.",
        "name": "మీ పేరు",
        "phone": "ఫోన్ నంబర్",
        "city": "నగరాన్ని ఎంచుకోండి",
        "inquiry": "విచారణ రకం",
        "send": "అభ్యర్థన పంపండి"
      },
      "card": {
        "verified": "ధృవీకరించబడింది",
        "hot": "హాట్",
        "featured": "ఫీచర్డ్",
        "new": "కొత్తది",
        "details": "వివరాలు చూడండి",
        "contact": "ఏజెంట్‌ను సంప్రదించండి",
        "call": "కాల్ చేయండి",
        "facing": "ఫేసింగ్",
        "sqyds": "గజాలు"
      },
      "why": {
        "eyebrow": "మమ్మల్ని ఎందుకు ఎంచుకోవాలి",
        "title": "స్నాప్అడ్డా ప్రయోజనం",
        "c1title": "ధృవీకరించిన జాబితాలు",
        "c1desc": "మా టీమ్ ద్వారా ప్రతి ఆస్తిని జాబితా చేయడానికి ముందు మాన్యువల్‌గా ధృవీకరిస్తారు.",
        "c2title": "CRDA / RERA అనుమతి పొందినవి",
        "c2desc": "అన్ని జాబితాలు చట్టపరమైన భద్రత కోసం చెల్లుబాటు అయ్యే అనుమతి సర్టిఫికేట్‌లను కలిగి ఉంటాయి.",
        "c3title": "24/7 నిపుణుల సహాయం",
        "c3desc": "మా రియల్ ఎస్టేట్ సలహాదారులు మీకు సహాయపడటానికి రాత్రింబగళ్ళు అందుబాటులో ఉంటారు.",
        "c4title": "అత్యుత్తమ ధర హామీ",
        "c4desc": "మీకు అత్యుత్తమ డీల్ అందించడానికి బిల్డర్లతో నేరుగా సంప్రదిస్తాం.",
        "c5title": "వాస్తు-మార్గదర్శక ఆస్తులు",
        "c5desc": "సమృద్ధికరమైన జీవితం కోసం తూర్పు ముఖం మరియు వాస్తు-అనుగుణమైన ఇళ్ళను కనుగొనండి.",
        "c6title": "పారదర్శకమైన ధర నిర్ణయం",
        "c6desc": "దాచిన ఛార్జీలు లేవు. నమోదుతో సహా పూర్తి ఖర్చుల వివరాలు."
      },
      "footer": {
        "quick": "త్వరిత లింకులు"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
