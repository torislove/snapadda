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
      common: {
        save: 'Save Changes',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        loading: 'Loading...'
      }
    }
  },
  te: {
    translation: {
      nav: {
        dashboard: 'హోమ్',
        properties: 'ఆస్తులు',
        leads: 'లీడ్స్',
        clients: 'కస్టమర్లు',
        analytics: 'పనితీరు',
        settings: 'సెట్టింగ్స్',
        engagement: 'మార్కెటింగ్'
      },
      dashboard: {
        welcome: 'స్వాగతం',
        stats: {
          active: 'లైవ్ ఆస్తులు',
          pending: 'పెండింగ్‌లో ఉన్నవి',
          totalLeads: 'మొత్తం లీడ్స్',
          revenue: 'మొత్తం విలువ'
        },
        recentActivity: 'ఇటీవలి అప్‌డేట్లు'
      },
      properties: {
        title: 'ఆస్తుల జాబితా',
        addBtn: 'కొత్తది చేర్చు',
        filters: {
          all: 'అన్నీ',
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
      common: {
        save: 'సేవ్ చేయండి',
        cancel: 'రద్దు',
        delete: 'తొలగించు',
        edit: 'సవరించు',
        loading: 'లోడ్ అవుతోంది...'
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
