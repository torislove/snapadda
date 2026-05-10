import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        dashboard: 'Executive Overview',
        properties: 'Asset Portfolio',
        leads: 'Lead Pipeline',
        clients: 'Investor Registry',
        analytics: 'Market Intel',
        settings: 'System Configuration',
        engagement: 'Engagement Hub'
      },
      dashboard: {
        welcome: 'Welcome, Executive',
        stats: {
          active: 'Live Assets',
          pending: 'Pending Audit',
          totalLeads: 'Gross Leads',
          revenue: 'Projected Value'
        },
        recentActivity: 'Recent Registry Movements'
      },
      properties: {
        title: 'Institutional Asset Management',
        addBtn: 'NEW ASSET',
        filters: {
          all: 'ALL CATEGORIES',
          pending: 'PENDING AUDIT',
          active: 'LIVE ASSETS',
          sold: 'OFF-MARKET'
        },
        table: {
          asset: 'Asset',
          status: 'Status',
          value: 'Market Value',
          health: 'Data Health',
          actions: 'Operations'
        }
      },
      common: {
        save: 'COMMIT CHANGES',
        cancel: 'DISCARD',
        delete: 'REMOVE',
        edit: 'MODIFY',
        loading: 'SYNCING...'
      }
    }
  },
  te: {
    translation: {
      nav: {
        dashboard: 'నిర్వహణ అవలోకనం',
        properties: 'ఆస్తుల జాబితా',
        leads: 'లీడ్స్ పైప్‌లైన్',
        clients: 'పెట్టుబడిదారుల రిజిస్ట్రీ',
        analytics: 'మార్కెట్ విశ్లేషణ',
        settings: 'సిస్టమ్ కాన్ఫిగరేషన్',
        engagement: 'ఎంగేజ్‌మెంట్ హబ్'
      },
      dashboard: {
        welcome: 'స్వాగతం, ఎగ్జిక్యూటివ్',
        stats: {
          active: 'లైవ్ ఆస్తులు',
          pending: 'ఆడిట్ పెండింగ్‌లో ఉన్నాయి',
          totalLeads: 'మొత్తం లీడ్స్',
          revenue: 'అంచనా విలువ'
        },
        recentActivity: 'ఇటీవలి రిజిస్ట్రీ కదలికలు'
      },
      properties: {
        title: 'సంస్థాగత ఆస్తి నిర్వహణ',
        addBtn: 'కొత్త ఆస్తి',
        filters: {
          all: 'అన్ని వర్గాలు',
          pending: 'ఆడిట్ పెండింగ్',
          active: 'లైవ్ ఆస్తులు',
          sold: 'అమ్ముడైనవి'
        },
        table: {
          asset: 'ఆస్తి',
          status: 'స్థితి',
          value: 'మార్కెట్ విలువ',
          health: 'డేటా హెల్త్',
          actions: 'చర్యలు'
        }
      },
      common: {
        save: 'మార్పులను సేవ్ చేయండి',
        cancel: 'రద్దు చేయండి',
        delete: 'తొలగించు',
        edit: 'సవరించు',
        loading: 'సింక్ అవుతోంది...'
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
