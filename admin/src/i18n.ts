import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        dashboard: 'Overview',
        properties: 'Inventory',
        leads: 'Inquiries',
        clients: 'Customers',
        analytics: 'Insights',
        settings: 'Prefs',
        engagement: 'Campaigns',
        messages: 'Messages',
        help: 'Help'
      },
      dashboard: {
        welcome: 'Welcome',
        stats: {
          active: 'Active Listings',
          pending: 'Pending Review',
          totalLeads: 'Total Leads',
          revenue: 'Total Value'
        },
        recentActivity: 'Recent Updates'
      },
      properties: {
        title: 'Property List',
        addBtn: 'Add New',
        filters: {
          all: 'Show All',
          pending: 'Drafts',
          active: 'Live',
          sold: 'Sold'
        },
        table: {
          asset: 'Property',
          status: 'Status',
          value: 'Price',
          health: 'Score',
          actions: 'Manage'
        }
      },
      leads: {
        title: 'Inquiry Management',
        newLead: 'New Inquiry',
        status: {
          new: 'New',
          contacted: 'Contacted',
          qualified: 'Qualified',
          closed: 'Closed',
          junk: 'Junk'
        }
      },
      settings: {
        title: 'Global Configuration',
        siteControl: 'Site Visibility Controls',
        postProperty: 'Post Property Section',
        expertHelp: 'Expert Help Section',
        verifyAssist: 'Verify Assist Section',
        saveSuccess: 'Settings updated successfully'
      },
      common: {
        save: 'Save Changes',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        loading: 'Loading...',
        actions: 'Actions',
        search: 'Search...'
      }
    }
  },
  te: {
    translation: {
      nav: {
        dashboard: 'అవలోకనం',
        properties: 'ఆస్తులు',
        leads: 'విచారణలు',
        clients: 'కస్టమర్లు',
        analytics: 'విశ్లేషణలు',
        settings: 'సెట్టింగ్స్',
        engagement: 'క్యాంపెయిన్స్',
        messages: 'సందేశాలు',
        help: 'సహాయం'
      },
      dashboard: {
        welcome: 'స్వాగతం',
        stats: {
          active: 'లైవ్ ఆస్తులు',
          pending: 'పెండింగ్‌లో ఉన్నవి',
          totalLeads: 'మొత్తం విచారణలు',
          revenue: 'మొత్తం విలువ'
        },
        recentActivity: 'ఇటీవలి అప్‌డేట్లు'
      },
      properties: {
        title: 'ఆస్తుల జాబితా',
        addBtn: 'కొత్తది చేర్చు',
        filters: {
          all: 'అన్నీ చూపించు',
          pending: 'డ్రాఫ్ట్స్',
          active: 'లైవ్',
          sold: 'అమ్ముడైనవి'
        },
        table: {
          asset: 'ఆస్తి',
          status: 'స్థితి',
          value: 'ధర',
          health: 'స్కోర్',
          actions: 'మేనేజ్'
        }
      },
      leads: {
        title: 'విచారణల నిర్వహణ',
        newLead: 'కొత్త విచారణ',
        status: {
          new: 'కొత్తది',
          contacted: 'సంప్రదించినవి',
          qualified: 'క్వాలిఫైడ్',
          closed: 'ముగిసినవి',
          junk: 'జంక్'
        }
      },
      settings: {
        title: 'గ్లోబల్ కాన్ఫిగరేషన్',
        siteControl: 'సైట్ విజిబిలిటీ నియంత్రణలు',
        postProperty: 'ప్రాపర్టీ పోస్ట్ సెక్షన్',
        expertHelp: 'ఎక్స్‌పర్ట్ హెల్ప్ సెక్షన్',
        verifyAssist: 'వెరిఫై అసిస్ట్ సెక్షన్',
        saveSuccess: 'సెట్టింగ్స్ విజయవంతంగా సేవ్ చేయబడ్డాయి'
      },
      common: {
        save: 'మార్పులను సేవ్ చేయండి',
        cancel: 'రద్దు',
        delete: 'తొలగించు',
        edit: 'సవరించు',
        loading: 'లోడ్ అవుతోంది...',
        actions: 'చర్యలు',
        search: 'వెతకండి...'
      }
    }
  }
};

const savedLng = localStorage.getItem('snapadda_admin_lng') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('snapadda_admin_lng', lng);
});

export default i18n;
