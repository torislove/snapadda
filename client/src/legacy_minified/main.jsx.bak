import './App.css';

import{a as e}
from"./rolldown-runtime-COnpUsM8.js";
import{n as t,t as n}
from"./@react-oauth/google-Bb6Rfdg9.js";
import{t as r}
from"./react-dom-ClDLedu4.js";
import{a as i,i as a,n as o,o as s,r as c,t as l}
from"./framer-motion-CQIWVlQs.js";
import{a as u,c as d,i as f,l as p,n as m,o as h,r as g,s as _,t as v}
from"./react-router-Oo2JpXVB.js";
import{$ as y,A as b,B as x,C as ee,D as S,E as te,F as C,G as w,H as T,I as E,J as ne,K as re,L as ie,M as D,N as ae,O as oe,P as se,Q as ce,R as O,S as le,T as k,U as A,V as j,W as M,X as ue,Y as N,Z as de,_ as P,a as F,b as I,c as L,d as R,et as fe,f as pe,g as me,h as z,i as he,j as B,k as V,l as ge,m as _e,n as ve,nt as ye,o as be,p as H,q as U,r as W,rt as G,s as K,t as xe,tt as Se,u as Ce,v as we,w as Te,x as Ee,y as q,z as De}
from"./lucide-react-BK7IgdG8.js";
import{s as J,t as Oe}
from"./@firebase/analytics-Bx_9qNJf.js";
import{n as ke,r as Ae,t as je}
from"./@firebase/auth-BJgJPQ3r.js";
import"./firebase-BrtuBDiL.js";
import{t as Me}
from"./@firebase/storage-0qvjbnkz.js";
(function(){let e=document.createElement(`link`).relList;
if(e&&e.supports&&e.supports(`modulepreload`))return;
for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);
new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}
).observe(document,{childList:!0,subtree:!0}
);
function t(e){let t={}
;
return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}
function n(e){if(e.ep)return;
e.ep=!0;
let n=t(e);
fetch(e.href,n)}
}
)();
var Ne=r(),Y=e(t(),1),X=s(),Pe=(0,Y.createContext)(void 0),Fe = ({ children: e }) => {
let[t,n]=(0,Y.useState)(null),[r,i]=(0,Y.useState)(!0);
  (0, Y.useEffect)(() => {
    let e = localStorage.getItem(`snapadda_user`);
    if (e) try {
      n(JSON.parse(e))
    } catch {
      console.error(`Failed to parse user from local storage`)
    }
    i(!1)
  }, []);
  return(0,X.jsx)(Pe.Provider,{value:{user:t,login:e=>{n(e);localStorage.setItem(`snapadda_user`,JSON.stringify(e))},logout:()=>{n(null);localStorage.removeItem(`snapadda_user`)},completeOnboarding:()=>{if(t){let e={...t,onboardingCompleted:!0};n(e);localStorage.setItem(`snapadda_user`,JSON.stringify(e))}},isLoading:r},children:e});
};
const Z = () => {
  let e = (0, Y.useContext)(Pe);
  if (e === void 0) throw Error(`useAuth must be used within an AuthProvider`);
  return e;
};
const Q = `http://localhost:5000/api`;
const Ie = async (e = {}) => {
  try {
    let t = new URLSearchParams;
    Object.keys(e).forEach(n => {
      e[n] !== void 0 && e[n] !== null && e[n] !== `all` && t.set(n, e[n]);
    });
    let n = await fetch(`${Q}/properties?${t.toString()}`);
  if (!n.ok) {
    const errorData = await n.json().catch(() => ({}));
    throw Error(errorData.message || `Failed to fetch properties: ${n.status}`);
  }
  return await n.json();
} catch (e) {
  console.error(`API Error:`, e);
  throw e;
}
};
const Le = async e => {
try {
  const t = await fetch(`${Q}/properties/${e}`);
  if (!t.ok) {
    const errorData = await t.json().catch(() => ({}));
    throw Error(errorData.message || `Failed to fetch property details: ${t.status}`);
  }
  return await t.json();
} catch (e) {
  console.error(`API Error:`, e);
  throw e;
}
};
const Re = async e => {
try {
  const t = await fetch(`${Q}/leads`, {
    method: `POST`,
    headers: {
      "Content-Type": `application/json`
    },
    body: JSON.stringify(e)
  });
  if (!t.ok) {
    const errorData = await t.json().catch(() => ({}));
    throw Error(errorData.message || `Failed to submit lead: ${t.status}`);
  }
  return await t.json();
} catch (e) {
  console.error(`API Error:`, e);
  throw e;
}
};
const ze = async () => {
  try {
    let e = await fetch(`${Q}/promotions`);
    if (!e.ok) throw Error(`Failed to fetch promotions`);
    return (await e.json()).data || []
  } catch (e) {
    throw console.error(`API Error:`, e), e
  }
};
const Be = async e => {
  try {
    let t = await fetch(`${Q}/settings/${e}`);
    if (!t.ok) throw Error(`Failed to fetch setting: ${e}`);
    return (await t.json()).data || null
  } catch (e) {
    throw console.error(`API Error:`, e), e
  }
};
const Ve = async () => {
  try {
    let e = await fetch(`${Q}/testimonials`);
    if (!e.ok) throw Error(`Failed to fetch testimonials`);
    let t = await e.json();
    return t.data || (Array.isArray(t) ? t : [])
  } catch (e) {
    return console.error(`API Error:`, e), []
  }
};
const He = async () => {
  try {
    let e = await fetch(`${Q}/cities`);
    if (!e.ok) throw Error(`Failed to fetch cities`);
    let t = await e.json();
    return t.data || (Array.isArray(t) ? t : [])
  } catch (e) {
    return console.error(`API Error:`, e), []
  }
};
const Ue = async (e, t) => {
  try {
    let n = await fetch(`${Q}/properties/${e}/like`, {
      method: `POST`,
      headers: {
        "Content-Type": `application/json`
      },
      body: JSON.stringify({
        userId: t
      })
    });
    if (!n.ok) throw Error(`Failed to like property`);
    return await n.json()
  } catch (e) {
    throw console.error(`API Error:`, e), e
  }
};
const We = async (e, t, n) => {
  try {
    let r = await fetch(`${Q}/properties/${e}/share`, {
      method: `POST`,
      headers: {
        "Content-Type": `application/json`
      },
      body: JSON.stringify({
        platform: t,
        userId: n
      })
    });
    if (!r.ok) throw Error(`Failed to log share`);
    return await r.json()
  } catch (e) {
    throw console.error(`API Error:`, e), e
  }
};
const Ge = async e => {
  try {
    let t = await fetch(`${Q}/properties/validate`, {
      method: `POST`,
      headers: {
        "Content-Type": `application/json`
      },
      body: JSON.stringify({
        ids: e
      })
    });
    if (!t.ok) throw Error(`Failed to validate properties`);
    return await t.json()
  } catch (e) {
    throw console.error(`API Error:`, e), e
  }
};
const Ke = ({
  className: e = ``,
  size: t = 48,
  showText: n = !1,
  textSize: r = `1.1rem`
}) => {
  let [i, a] = (0, Y.useState)(!1);
return(0,X.jsxs)(`div`,{className:`snapadda-logo-container ${e}
`,style:{display:`inline-flex`,alignItems:`center`,gap:`0.45rem`,cursor:`pointer`,textDecoration:`none`,transition:`transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)`}
,onMouseEnter:()=>a(!0),onMouseLeave:()=>a(!1),children:[(0,X.jsx)(`style`,{children:`
        @keyframes goldShimmer {
          0% { background-position: -200% center;
 }

          100% { background-position: 200% center;
 }

        }

        .logo-text-shimmer {
          background: linear-gradient(
            90deg, 
            #ffffff 0%, 
            #f4d03f 40%, 
            #c5a059 50%, 
            #f4d03f 60%, 
            #ffffff 100%
          );

          background-size: 200% auto;

          -webkit-background-clip: text;

          -webkit-text-fill-color: transparent;

          animation: goldShimmer 4s infinite linear;

          text-decoration: none !important;

          border-bottom: none !important;

        }

        .logo-building {
          transition: filter 0.4s ease, transform 0.4s ease;

          filter: drop-shadow(0 0 10px rgba(244, 208, 63, 0.45));

        }

        .logo-container-hover .logo-building {
          filter: drop-shadow(0 0 24px rgba(244, 208, 63, 0.75));

          transform: scale(1.1) rotate(-2deg);

        }

        .window-sparkle {
          animation: sparkle 1.5s infinite alternate ease-in-out;

        }

        @keyframes sparkle {
          0% { opacity: 0.3;
 transform: scale(0.9);
 }

          100% { opacity: 1;
 transform: scale(1.1);
 }

        }

      `}
),(0,X.jsxs)(`div`,{className:i?`logo-container-hover`:``,style:{display:`flex`,alignItems:`center`,gap:`0.4rem`,textDecoration:`none`}
,children:[(0,X.jsxs)(`svg`,{width:t,height:t,viewBox:`0 0 400 400`,className:`logo-building`,fill:`none`,xmlns:`http://www.w3.org/2000/svg`,children:[(0,X.jsx)(`defs`,{children:(0,X.jsxs)(`linearGradient`,{id:`goldGrad`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`100%`,children:[(0,X.jsx)(`stop`,{offset:`0%`,stopColor:`#c5a059`}
),(0,X.jsx)(`stop`,{offset:`50%`,stopColor:`#f4d03f`}
),(0,X.jsx)(`stop`,{offset:`100%`,stopColor:`#c5a059`}
)]}
)}
),(0,X.jsx)(`rect`,{x:`150`,y:`50`,width:`100`,height:`300`,rx:`6`,fill:`url(#goldGrad)`}
),(0,X.jsx)(`path`,{d:`M150 50 L200 8 L250 50 Z`,fill:`url(#goldGrad)`}
),(0,X.jsx)(`rect`,{x:`80`,y:`160`,width:`60`,height:`190`,rx:`5`,ry:`5`,fill:`rgba(255,255,255,0.18)`,stroke:`url(#goldGrad)`,strokeWidth:`3`}
),(0,X.jsx)(`rect`,{x:`260`,y:`160`,width:`60`,height:`190`,rx:`5`,ry:`5`,fill:`rgba(255,255,255,0.18)`,stroke:`url(#goldGrad)`,strokeWidth:`3`}
),(0,X.jsx)(`rect`,{x:`175`,y:`90`,width:`18`,height:`22`,rx:`3`,fill:`white`,className:`window-sparkle`}
),(0,X.jsx)(`rect`,{x:`207`,y:`90`,width:`18`,height:`22`,rx:`3`,fill:`white`,className:`window-sparkle`,style:{animationDelay:`0.4s`}
}
),(0,X.jsx)(`rect`,{x:`175`,y:`130`,width:`18`,height:`22`,rx:`3`,fill:`white`,className:`window-sparkle`,style:{animationDelay:`0.8s`}
}
),(0,X.jsx)(`rect`,{x:`207`,y:`130`,width:`18`,height:`22`,rx:`3`,fill:`white`,className:`window-sparkle`,style:{animationDelay:`1.2s`}
}
),(0,X.jsx)(`rect`,{x:`175`,y:`170`,width:`18`,height:`22`,rx:`3`,fill:`white`,className:`window-sparkle`,style:{animationDelay:`0.2s`}
}
),(0,X.jsx)(`rect`,{x:`207`,y:`170`,width:`18`,height:`22`,rx:`3`,fill:`white`,className:`window-sparkle`,style:{animationDelay:`0.6s`}
}
) ]}
),n&&(0,X.jsx)(`div`,{className:`logo-text-wrap`,style:{display:`flex`,alignItems:`center`,fontFamily:`'Inter', sans-serif`,textDecoration:`none`}
,children:(0,X.jsx)(`span`,{className:`logo-text-shimmer`,style:{fontSize:r,fontWeight:900,letterSpacing:`-0.045em`,textTransform:`uppercase`,textShadow:`0 2px 4px rgba(0,0,0,0.18)`,userSelect:`none`,lineHeight:1,display:`inline-block`}
,children:`SnapAdda`})})]})]});
};
const qe = ({
  id: e,
  _id: t,
  image: n,
  images: r,
  title: i,
  price: o,
  location: s,
  beds: c,
  baths: l,
  sqft: u,
  type: d,
  measurementUnit: f = `Sq.Ft`,
  approval: p,
  approvalAuthority: h,
  facing: g,
  areaSize: _,
  isVerified: v = !1,
  isFeatured: y = !1,
  listerType: b = `Individual Owner`,
  createdAt: x,
  onTriggerLead: ee,
  likeCount: S = 0,
  initialLiked: te = !1
}) => {
  let {
    user: C
  } = Z(), w = e || t, [T, ne] = (0, Y.useState)(te), [re, ie] = (0, Y.useState)(S), D = p || h, ae = r?.length ? r : n ? [n] : [], oe = ae[0] ?? null, le = w ? w.charCodeAt(0) % 2 == 0 : !1, A = w ? w.charCodeAt(1 % w.length) % 12 + 3 : 5, j = x ? Date.now() - new Date(x).getTime() < 10080 * 60 * 1e3 : !1;
  return (0, X.jsx)(`div`, {className:`scene-3d`,style:{width:`100%`,height:`100%`}
,children:(0,X.jsxs)(a.div,{className:`property-card card-3d`,children:[(0,X.jsx)(a.div,{style:{position:`absolute`,inset:0,zIndex:10,pointerEvents:`none`,background:`radial-gradient(400px circle at 50% 50%, rgba(255,255,255,0.12), transparent 40%)`}
}
),(0,X.jsx)(m,{to:w?`/property/${w}
`:`#`,className:`property-card-link`,children:(0,X.jsxs)(`div`,{className:`property-image-container`,children:[oe?(0,X.jsx)(a.img,{src:oe,alt:i,className:`property-image`,loading:`lazy`,whileHover:{scale:1.08}
,transition:{duration:.6,ease:[.23,1,.32,1]}
}
):(0,X.jsx)(`div`,{className:`property-no-image`,children:(0,X.jsx)(se,{size:36}
)}
),(0,X.jsx)(`div`,{className:`property-image-gradient`}
),(0,X.jsx)(`div`,{className:`property-price-tag`,style:{transform:`translateZ(40px)`}
,children:(0,X.jsx)(`span`,{children:(e=>{let t=typeof e==`number`?e.toString():e,n=t.replace(/,/g,``).replace(/₹/g,``).trim().toLowerCase(),r=/crore/.test(n),i=/lakh/.test(n),a=parseFloat(n.replace(/[^0-9.]/g,``));
return isNaN(a)?t:r?`₹${a.toFixed(1)}
 Cr`:i?`₹${a.toFixed(1)}
 L`:a>=1e7?`₹${(a/1e7).toFixed(1)}
 Cr`:a>=1e5?`₹${(a/1e5).toFixed(1)}
 L`:`₹${a.toLocaleString(`en-IN`)}
`}
)(o)}
)}
),ae.length>1&&(0,X.jsx)(`div`,{className:`img-count-dots`,children:ae.slice(0,5).map((e,t)=>(0,X.jsx)(`div`,{className:`img-dot ${t===0?`active`:``}
`}
,t))}
),(0,X.jsxs)(`div`,{className:`property-tags-top-left`,style:{transform:`translateZ(30px)`}
,children:[y&&(0,X.jsx)(`div`,{className:`badge badge-featured`,children:`⭐ Featured`}
),j&&(0,X.jsx)(`div`,{className:`badge badge-new`,children:`✨ New`}
)]}
),(0,X.jsxs)(`div`,{className:`property-tags-top-right`,style:{transform:`translateZ(30px)`}
,children:[v&&(0,X.jsxs)(`div`,{className:`badge badge-verified`,children:[(0,X.jsx)(H,{size:11}
),` Verified`]}
),le&&(0,X.jsxs)(`div`,{className:`badge badge-hot`,children:[(0,X.jsx)(O,{size:11}
),` Hot`]}
)]}
),(0,X.jsxs)(`div`,{className:`property-image-actions`,style:{transform:`translateZ(50px)`}
,children:[(0,X.jsxs)(`button`,{className:`img-action-btn like-btn ${T?`active`:``}
`,onClick:async e=>{if(e.preventDefault(),e.stopPropagation(),!C){alert(`Please sign in to like properties`);
return}
try{if(w){let e=await Ue(w,C._id);
e.status===`success`&&(ne(e.data.liked),ie(e.data.likeCount))}
}
catch(e){console.error(`Like failed`,e)}
}
,title:T?`Unlike`:`Like`,children:[(0,X.jsx)(E,{size:16,fill:T?`currentColor`:`none`}
),re>0&&(0,X.jsx)(`span`,{className:`action-count`,children:re}
)]}
),(0,X.jsx)(`button`,{className:`img-action-btn share-btn`,onClick:async e=>{e.preventDefault(),e.stopPropagation();
let t=`${window.location.origin}
/property/${w}
`,n={title:`SnapAdda: ${i}
`,text:`Check out this property in ${s}
: ${i}
`,url:t}
;
try{navigator.share?(await navigator.share(n),w&&await We(w,`native`,C?._id)):(await navigator.clipboard.writeText(t),alert(`Link copied to clipboard!`),w&&await We(w,`clipboard`,C?._id))}
catch(e){console.error(`Share failed`,e)}
}
,title:`Share Property`,children:(0,X.jsx)(_e,{size:16}
)}
)]}
),(0,X.jsx)(`div`,{className:`property-image-overlay`,children:(0,X.jsxs)(`span`,{className:`view-details-btn`,children:[(0,X.jsx)(P,{size:13}
),` View Property`]}
)}
)]}
)}
),(0,X.jsxs)(`div`,{className:`property-content`,style:{transform:`translateZ(10px)`}
,children:[(0,X.jsx)(m,{to:w?`/property/${w}
`:`#`,className:`property-title-link`,children:(0,X.jsx)(`h3`,{className:`property-title text-royal-gold`,children:i}
)}
),(0,X.jsxs)(`div`,{className:`property-location text-muted`,children:[(0,X.jsx)(k,{size:12}
),` `,s]}
),(0,X.jsxs)(`div`,{className:`property-lister`,style:{color:b?.includes(`Builder`)?`var(--gold)`:`var(--txt-muted)`}
,children:[b?.includes(`Builder`)?(0,X.jsx)(ce,{size:11}
):(0,X.jsx)(F,{size:11}
),b]}
),(0,X.jsxs)(`div`,{className:`property-badges`,children:[d&&(0,X.jsx)(`span`,{className:`badge type-badge`,children:d}
),D&&D!==`N/A`&&D!==`Pending`&&(0,X.jsxs)(`span`,{className:`badge badge-gold`,children:[(0,X.jsx)(H,{size:10}
),` `,D]}
),(0,X.jsxs)(`span`,{className:`viewers-chip`,style:{marginLeft:`auto`}
,children:[(0,X.jsx)(he,{size:10}
),` `,A]}
)]}
),(0,X.jsxs)(`div`,{className:`property-features`,children:[d!==`Agriculture`&&(0,X.jsxs)(X.Fragment,{children:[(0,X.jsxs)(`div`,{className:`feature`,children:[(0,X.jsx)(`span`,{className:`feature-value`,children:c}
),(0,X.jsx)(`span`,{className:`feature-label`,children:`Beds`}
)]}
),(0,X.jsx)(`div`,{className:`feature-divider`}
),(0,X.jsxs)(`div`,{className:`feature`,children:[(0,X.jsx)(`span`,{className:`feature-value`,children:l}
),(0,X.jsx)(`span`,{className:`feature-label`,children:`Baths`}
)]}
),(0,X.jsx)(`div`,{className:`feature-divider`}
)]}
),(0,X.jsxs)(`div`,{className:`feature`,children:[(0,X.jsx)(`span`,{className:`feature-value`,children:_||u||`—`}
),(0,X.jsx)(`span`,{className:`feature-label`,children:f}
)]}
),g&&(0,X.jsxs)(X.Fragment,{children:[(0,X.jsx)(`div`,{className:`feature-divider`}
),(0,X.jsxs)(`div`,{className:`feature`,children:[(0,X.jsx)(`span`,{className:`feature-value`,children:g}
),(0,X.jsx)(`span`,{className:`feature-label`,children:`Facing`}
)]}
)]}
)]}
),(0,X.jsxs)(`div`,{className:`property-actions`,style:{transform:`translateZ(15px)`}
,children:[(0,X.jsxs)(`button`,{className:`btn-3d action-btn action-btn-call`,onClick:e=>{e.preventDefault(),e.stopPropagation(),ee?.(`callback`)}
,children:[(0,X.jsx)(I,{size:13}
),` Callback`]}
),(0,X.jsxs)(`button`,{className:`btn-3d btn-3d-emerald action-btn action-btn-contact`,onClick:e=>{e.preventDefault(),e.stopPropagation(),ee?.(`contact`)}
,children:[(0,X.jsx)(q,{size:13}
),` Contact`]}
)]}
)]}
)]}
)}
)}
,$=({children:e,variant:t=`primary`,size:n=`md`,fullWidth:r=!1,className:i=``,...a}
)=>(0,X.jsx)(`button`,{className:[`btn`,`btn-${t}
`,`btn-${n}
`,r?`btn-full`:``,i].filter(Boolean).join(` `),...a,children:e}
),Je=({isOpen:e,onClose:t,type:n}
)=>{let[r,o]=(0,Y.useState)(``),[s,c]=(0,Y.useState)(``),[l,u]=(0,Y.useState)(!1);
return(0,X.jsx)(i,{children:e&&(0,X.jsx)(a.div,{style:{position:`fixed`,top:0,left:0,right:0,bottom:0,backgroundColor:`rgba(0,0,0,0.85)`,display:`flex`,alignItems:`center`,justifyContent:`center`,zIndex:2e3,backdropFilter:`blur(4px)`}
,initial:{opacity:0}
,animate:{opacity:1}
,exit:{opacity:0}
,children:(0,X.jsxs)(a.div,{className:`glass-heavy`,style:{padding:`2rem`,borderRadius:`20px`,maxWidth:`420px`,width:`92%`,position:`relative`,border:`1px solid rgba(255,255,255,0.18)`}
,initial:{scale:.9,y:20,opacity:0}
,animate:{scale:1,y:0,opacity:1}
,exit:{scale:.9,y:20,opacity:0}
,transition:{type:`spring`,stiffness:300,damping:25}
,children:[(0,X.jsx)(`button`,{onClick:t,style:{position:`absolute`,top:`16px`,right:`16px`,background:`none`,border:`none`,color:`var(--text-muted)`,cursor:`pointer`,outline:`none`}
,children:(0,X.jsx)(W,{size:24}
)}
),l?(0,X.jsxs)(a.div,{style:{textAlign:`center`,padding:`var(--spacing-xl) 0`}
,initial:{opacity:0,scale:.8}
,animate:{opacity:1,scale:1}
,children:[(0,X.jsx)(`h3`,{style:{color:`var(--success)`}
,children:`Success!`}
),(0,X.jsx)(`p`,{className:`text-muted`,style:{marginTop:`8px`}
,children:`We have received your request. Our agent will contact you shortly.`}
)]}
):(0,X.jsxs)(a.div, {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { delay: .1 },
    children: [
      (0, X.jsx)(`h2`, { style: { marginBottom: `var(--spacing-xs)`, fontFamily: `var(--font-heading)` }, children: n === `callback` ? `Request a Callback` : `View Owner Contact` }),
      (0, X.jsx)(`p`, { className: `text-muted`, style: { marginBottom: `var(--spacing-lg)` }, children: `Please enter your details to proceed.` }),
      (0, X.jsxs)(`form`, {
        onSubmit: async e => {
          e.preventDefault();
          try { await Re({ name: s, phone: r, type: n }); }
          catch { console.log(`Mock lead submission`, { name: s, phone: r, type: n }); }
          u(!0), setTimeout(() => { u(!1), c(``), o(``), t(); }, 2e3);
        },
        className: `callback-form`,
        children: [
          (0, X.jsxs)(`div`, {
            className: `form-field`,
            children: [
              (0, X.jsx)(`label`, { children: `Full Name` }),
              (0, X.jsx)(`input`, { type: `text`, required: !0, value: s, onChange: e => c(e.target.value), placeholder: `Enter your full name` })
            ]
          }),
          (0, X.jsxs)(`div`, {
            className: `form-field`,
            children: [
              (0, X.jsx)(`label`, { children: `WhatsApp / Phone Number` }),
              (0, X.jsx)(`input`, { type: `tel`, required: !0, value: r, onChange: e => o(e.target.value), placeholder: `e.g. 9876543210` })
            ]
          }),
          (0, X.jsx)($, {
            type: `submit`,
            className: `btn-3d btn-3d-emerald`,
            style: { marginTop: `var(--spacing-md)` },
            children: n === `callback` ? `Get Callback Now` : `Reveal Contact Number`
          })
        ]
      })
    ]
  })
        ]})
      })
    })
  }
;
const Ye = ({ isOpen: e, onClose: t, filters: n, setFilters: r, onApply: i }) => {
  let a = Y.useRef(null);
  Y.useEffect(() => { e && a.current && (a.current.scrollTop = 0); }, [e]);
  let o = (e, t) => { r({ ...n, [e]: t }); };
  return e ? (0, X.jsx)(`div`, {
    className: `filter-sidebar-overlay ${e ? `open` : ``}`,
    onClick: t,
    children: (0, X.jsxs)(`div`, {
      className: `filter-sidebar`,
      onClick: e => e.stopPropagation(),
      children: [
        (0, X.jsxs)(`div`, {
          className: `filter-header`,
          children: [
            (0, X.jsxs)(`div`, {
              className: `flex items-center gap-2`,
              children: [
                (0, X.jsx)(pe, { size: 20, className: `text-gold` }),
                (0, X.jsx)(`h3`, { children: `Advanced Filters` })
              ]
            }),
            (0, X.jsx)(`button`, {
              onClick: t,
              className: `close-btn`,
              children: (0, X.jsx)(W, { size: 24 })
            })
          ]
        }),
        (0, X.jsxs)(`div`, {
          className: `filter-content`,
          ref: a,
          children: [
            (0, X.jsxs)(`div`, {
              className: `filter-group`,
              children: [
                (0, X.jsx)(`label`, { children: `Search Keyword` }),
                (0, X.jsx)(`input`, {
                  type: `text`,
                  placeholder: `e.g. 'Pool', 'Gated', 'Benz Circle'`,
                  value: n.keyword || ``,
                  onChange: e => o(`keyword`, e.target.value)
                })
              ]
            }),
            (0, X.jsxs)(`div`, {
              className: `filter-group`,
              children: [
                (0, X.jsx)(`label`, { children: `Property Type` }),
                (0, X.jsxs)(`select`, {
                  value: n.propertyType || `All`,
                  onChange: e => o(`propertyType`, e.target.value),
                  children: [
                    (0, X.jsx)(`option`, { value: `All`, children: `All Types` }),
                    (0, X.jsx)(`option`, { value: `Apartment`, children: `Apartment / Flats` }),
                    (0, X.jsx)(`option`, { value: `Villa`, children: `Villas & Independent Houses` }),
                    (0, X.jsx)(`option`, { value: `Agriculture`, children: `Agriculture & Farms` }),
                    (0, X.jsx)(`option`, { value: `Commercial`, children: `Commercial` }),
                    (0, X.jsx)(`option`, { value: `Plot`, children: `Open Plots` })
                  ]
                })
              ]
            }),
            (0, X.jsxs)(`div`, {
              className: `filter-group`,
              children: [
                (0, X.jsx)(`label`, { children: `Budget Range (₹)` }),
                (0, X.jsxs)(`div`, {
                  className: `price-inputs`,
                  children: [
                    (0, X.jsx)(`input`, {
                      type: `number`,
                      placeholder: `Min`,
                      value: n.minPrice,
                      onChange: e => o(`minPrice`, e.target.value)
                    }),
                    (0, X.jsx)(`span`, { className: `separator`, children: `-` }),
                    (0, X.jsx)(`input`, {
                      type: `number`,
                      placeholder: `Max`,
                      value: n.maxPrice,
                      onChange: e => o(`maxPrice`, e.target.value)
                    })
                  ]
                })
              ]
            }),
            (0, X.jsxs)(`div`, {
              className: `filter-group`,
              children: [
                (0, X.jsx)(`label`, { children: `BHK Configuration` }),
                (0, X.jsx)(`div`, {
                  className: `bhk-grid`,
                  children: [1, 2, 3, 4].map(e => (0, X.jsxs)(`button`, {
                    className: `bhk-btn ${n.bhk === e ? `active` : ``}`,
                    onClick: () => o(`bhk`, n.bhk === e ? `` : e),
                    children: [e, ` BHK`]
                  }, e))
                })
              ]
            }),
            (0, X.jsxs)(`div`, {
              className: `filter-group`,
              children: [
                (0, X.jsx)(`label`, { children: `Vastu / Facing` }),
                (0, X.jsxs)(`select`, {
                  value: n.facing,
                  onChange: e => o(`facing`, e.target.value),
                  children: [
                    (0, X.jsx)(`option`, { value: `Any`, children: `Any Facing` }),
                    (0, X.jsx)(`option`, { value: `East`, children: `East` }),
                    (0, X.jsx)(`option`, { value: `West`, children: `West` }),
                    (0, X.jsx)(`option`, { value: `North`, children: `North` }),
                    (0, X.jsx)(`option`, { value: `South`, children: `South` }),
                    (0, X.jsx)(`option`, { value: `North-East`, children: `North-East` })
                  ]
                })
              ]
            }),
            (0, X.jsxs)(`div`, {
              className: `filter-group`,
              children: [
                (0, X.jsx)(`label`, { children: `Approval Authority` }),
                (0, X.jsxs)(`select`, {
                  value: n.approval || `All`,
                  onChange: e => o(`approval`, e.target.value),
                  children: [
                    (0, X.jsx)(`option`, { value: `All`, children: `All Approvals` }),
                    (0, X.jsx)(`option`, { value: `AP CRDA`, children: `AP CRDA` }),
                    (0, X.jsx)(`option`, { value: `AP RERA`, children: `AP RERA` }),
                    (0, X.jsx)(`option`, { value: `VMRDA`, children: `VMRDA (Vizag)` }),
                    (0, X.jsx)(`option`, { value: `DTCP`, children: `DTCP` }),
                    (0, X.jsx)(`option`, { value: `Panchayat`, children: `Grama Panchayat` })
                  ]
                })
              ]
            }),
            (0, X.jsxs)(`div`, {
              className: `filter-group`,
              children: [
                (0, X.jsx)(`label`, { children: `Construction Status` }),
                (0, X.jsx)(`div`, {
                  className: `status-pills`,
                  children: [`Ready to Move`, `Under Construction`, `New Launch`].map(e => (0, X.jsx)(`button`, {
                    className: `pill-btn ${n.constructionStatus === e ? `active` : ``}`,
                    onClick: () => o(`constructionStatus`, n.constructionStatus === e ? `N/A` : e),
                    children: e
                  }, e))
                })
              ]
            }),
            (0, X.jsxs)(`div`, {
              className: `filter-group`,
              children: [
                (0, X.jsx)(`label`, { children: `Furnishing` }),
                (0, X.jsx)(`div`, {
                  className: `status-pills`,
                  children: [`Furnished`, `Semi-Furnished`, `Unfurnished`].map(e => (0, X.jsx)(`button`, {
                    className: `pill-btn ${n.furnishing === e ? `active` : ``}`,
                    onClick: () => o(`furnishing`, n.furnishing === e ? `N/A` : e),
                    children: e
                  }, e))
                })
              ]
            }),
            (0, X.jsxs)(`div`, {
              className: `filter-group flex-row`,
              children: [
                (0, X.jsx)(`label`, { children: `Verified Properties Only` }),
                (0, X.jsx)(`button`, {
                  className: `toggle-btn ${n.verified ? `active` : ``}`,
                  onClick: () => o(`verified`, !n.verified),
                  children: (0, X.jsx)(`div`, { className: `toggle-slider` })
                })
              ]
            })
          ]
        }),
        (0, X.jsxs)(`div`, {
          className: `filter-footer`,
          children: [
            (0, X.jsx)($, {
              variant: `ghost`,
              onClick: () => { r({ bhk: ``, minPrice: ``, maxPrice: ``, facing: `Any`, furnishing: `N/A`, constructionStatus: `N/A`, verified: !1, approval: `All`, propertyType: `All`, keyword: `` }); },
              children: `Clear All`
            }),
            (0, X.jsx)($, {
              variant: `primary`,
              onClick: i,
              style: { flex: 1 },
              children: `Show Results`
            })
          ]
        })
      ]
    })
  }) : null;
};
const Xe = [{
  id: `f1`,
  type: `ad`,
  title: `Grand Villa Launch — Amaravati`,
  subtitle: `Exclusive presale pricing. CRDA approved. Book your plot today.`,
  image: `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80`,
  actionText: `View Details`,
  cardColor: `dark`
}, {
  id: `f2`,
  type: `ad`,
  title: `Flat 12% Off Brokerage`,
  subtitle: `Limited time offer on all luxury 3BHK apartments in Vijayawada.`,
  image: `https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80`,
  actionText: `Claim Offer`,
  cardColor: `gold`,
  countdownActive: !0
}, {
  id: `f3`,
  type: `update`,
  title: `New: Virtual 3D Tours Live`,
  subtitle: `Tour premium properties from anywhere in the world.`,
  actionText: `Try Now`,
  cardColor: `teal`
}, {
  id: `f4`,
  type: `ad`,
  title: `Premium Farmland in Guntur`,
  subtitle: `RERA certified agriculture plots starting ₹18L. Vastu compliant.`,
  image: `https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80`,
  actionText: `Explore Now`,
  cardColor: `green`
}];
const Ze = {
  dark: `linear-gradient(135deg, rgba(7,7,15,0.92), rgba(18,18,42,0.85))`,
  gold: `linear-gradient(135deg, rgba(80,50,5,0.88), rgba(25,20,5,0.9))`,
  teal: `linear-gradient(135deg, rgba(5,50,60,0.88), rgba(5,20,30,0.9))`,
  green: `linear-gradient(135deg, rgba(5,45,20,0.88), rgba(5,20,10,0.9))`,
  red: `linear-gradient(135deg, rgba(60,10,10,0.88), rgba(25,5,5,0.9))`,
  violet: `linear-gradient(135deg, rgba(40,10,70,0.88), rgba(15,5,30,0.9))`
};
const Qe = {
  dark: `rgba(232,184,75,0.6)`,
  gold: `#e8b84b`,
  teal: `#0fa3b1`,
  green: `#27c97d`,
  red: `#f05d5e`,
  violet: `#7c5cbf`
};
const $e = e => {
  if (!e) return null;
  let t = new Date(e).getTime() - Date.now();
  if (t <= 0) return null;
  let n = Math.floor(t / 864e5),
    r = Math.floor(t % 864e5 / 36e5),
    i = Math.floor(t % 36e5 / 6e4);
  return n > 0 ? `${n} d ${r} h left` : `${r} h ${i} m left`
};
const et = () => {
  let [e, t] = (0, Y.useState)([]), [n, r] = (0, Y.useState)(0), [o, s] = (0, Y.useState)(!1), [c, l] = (0, Y.useState)(!0), u = (0, Y.useRef)(null), d = (0, Y.useRef)(0);
(0,Y.useEffect)(()=>{ze().then(e=>{let n=(e||[]).filter(e=>e.isActive!==!1);
t(n.length>0?n:Xe)}
).catch(()=>t(Xe)).finally(()=>l(!1))}
,[]);
let f=(0,Y.useCallback)(()=>{r(t=>(t+1)%Math.max(e.length,1))}
,[e.length]),p=()=>r(t=>(t-1+e.length)%e.length),m=()=>{f()}
;
(0,Y.useEffect)(()=>{if(!(o||e.length<=1))return u.current=setInterval(f,4500),()=>{u.current&&clearInterval(u.current)}
}
,[f,o,e.length]);
let h=e=>{d.current=e.touches[0].clientX}
,g=e=>{let t=d.current-e.changedTouches[0].clientX;
Math.abs(t)>40&&(t>0?m():p())}
;
if(c)return(0,X.jsx)(`div`,{style:{height:`180px`,borderRadius:`var(--r-lg)`,background:`linear-gradient(90deg,var(--midnight-1) 25%,var(--midnight-2) 50%,var(--midnight-1) 75%)`,backgroundSize:`200% 100%`,animation:`shimmer 1.8s infinite`}
}
);
let _=e[n]||Xe[0],v=_.cardColor||_.theme||`dark`,y=Qe[v]||Qe.dark,b=Ze[v]||Ze.dark,x=$e(_.expiryDate);
return(0,X.jsxs)(`div`,{style:{position:`relative`,borderRadius:`var(--r-xl)`,overflow:`hidden`,userSelect:`none`}
,onMouseEnter:()=>s(!0),onMouseLeave:()=>s(!1),onTouchStart:h,onTouchEnd:g,children:[(0,X.jsx)(i,{mode:`wait`,children:(0,X.jsxs)(a.div,{initial:{opacity:0,x:40}
,animate:{opacity:1,x:0}
,exit:{opacity:0,x:-40}
,transition:{duration:.4,ease:`easeOut`}
,style:{position:`relative`,minHeight:`190px`,borderRadius:`var(--r-xl)`,border:`1px solid ${y}
30`,overflow:`hidden`,display:`flex`,alignItems:`stretch`}
,children:[_.image&&(0,X.jsx)(`div`,{style:{position:`absolute`,inset:0,zIndex:0,backgroundImage:`url(${_.image}
)`,backgroundSize:`cover`,backgroundPosition:`center`,transition:`transform 0.8s ease`}
}
),(0,X.jsx)(`div`,{style:{position:`absolute`,inset:0,zIndex:1,background:b}
}
),(0,X.jsx)(`div`,{style:{position:`absolute`,inset:0,zIndex:2,background:`linear-gradient(to top, rgba(7,7,15,0.8) 0%, transparent 60%)`}
}
),(0,X.jsx)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,height:`1px`,zIndex:5,background:`linear-gradient(90deg, transparent, ${y}
80, transparent)`}
}
),(0,X.jsxs)(`div`,{style:{position:`relative`,zIndex:10,width:`100%`,padding:`1.5rem 1.75rem`,display:`flex`,flexDirection:`column`,justifyContent:`space-between`}
,children:[(0,X.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`flex-start`,gap:`1rem`}
,children:[(0,X.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`,flexWrap:`wrap`}
,children:[(0,X.jsx)(`span`,{style:{padding:`3px 10px`,borderRadius:`99px`,background:`${y}
18`,border:`1px solid ${y}
40`,fontSize:`0.65rem`,fontWeight:800,letterSpacing:`0.1em`,textTransform:`uppercase`,color:y}
,children:_.type===`festival`?`🎉 Event`:_.type===`update`?`⚡ New Feature`:`🏡 Promotion`}
),x&&(0,X.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:`3px`,padding:`3px 10px`,borderRadius:`99px`,background:`rgba(240,93,94,0.15)`,border:`1px solid rgba(240,93,94,0.3)`,fontSize:`0.65rem`,fontWeight:700,color:`#f05d5e`}
,children:[(0,X.jsx)(M,{size:10}
),` `,x]}
)]}
),(0,X.jsxs)(`span`,{style:{fontFamily:`var(--font-mono)`,fontSize:`0.7rem`,color:`rgba(255,255,255,0.4)`,flexShrink:0}
,children:[String(n+1).padStart(2,`0`),` / `,String(e.length).padStart(2,`0`)]}
)]}
),(0,X.jsxs)(`div`,{children:[(0,X.jsx)(`h3`,{style:{fontFamily:`var(--font-serif)`,fontSize:`clamp(1.1rem, 3vw, 1.6rem)`,fontWeight:700,color:`white`,marginBottom:`0.4rem`,lineHeight:1.2}
,children:_.headline||_.title}
),(_.subheadline||_.subtitle)&&(0,X.jsx)(`p`,{style:{fontSize:`0.87rem`,color:`rgba(255,255,255,0.65)`,lineHeight:1.5,marginBottom:`1.1rem`,maxWidth:`500px`}
,children:_.subheadline||_.subtitle}
),(_.ctaText||_.actionText)&&(0,X.jsxs)(`a`,{href:_.ctaUrl||_.actionUrl||`#`,target:_.ctaUrl?`_blank`:`_self`,rel:`noreferrer`,style:{display:`inline-flex`,alignItems:`center`,gap:`0.4rem`,padding:`0.5rem 1.25rem`,background:`linear-gradient(135deg, ${y}
, ${y}
cc)`,color:v===`gold`?`#07070f`:`white`,borderRadius:`var(--r-full)`,fontSize:`0.82rem`,fontWeight:700,textDecoration:`none`,boxShadow:`0 4px 16px ${y}
40`,transition:`all 0.25s`}
,children:[_.ctaText||_.actionText,_.ctaUrl?(0,X.jsx)(De,{size:12}
):(0,X.jsx)(ye,{size:12}
)]}
)]}
)]}
)]}
,_._id||_.id)}
),e.length>1&&(0,X.jsxs)(X.Fragment,{children:[(0,X.jsx)(`button`,{onClick:p,style:{position:`absolute`,left:`12px`,top:`50%`,transform:`translateY(-50%)`,zIndex:20,width:`34px`,height:`34px`,borderRadius:`50%`,background:`rgba(7,7,15,0.7)`,border:`1px solid rgba(255,255,255,0.1)`,backdropFilter:`blur(10px)`,color:`white`,display:`flex`,alignItems:`center`,justifyContent:`center`,transition:`all 0.2s`}
,children:(0,X.jsx)(U,{size:16}
)}
),(0,X.jsx)(`button`,{onClick:m,style:{position:`absolute`,right:`12px`,top:`50%`,transform:`translateY(-50%)`,zIndex:20,width:`34px`,height:`34px`,borderRadius:`50%`,background:`rgba(7,7,15,0.7)`,border:`1px solid rgba(255,255,255,0.1)`,backdropFilter:`blur(10px)`,color:`white`,display:`flex`,alignItems:`center`,justifyContent:`center`,transition:`all 0.2s`}
,children:(0,X.jsx)(re,{size:16}
)}
)]}
),e.length>1&&(0,X.jsx)(`div`,{style:{position:`absolute`,bottom:`12px`,left:`50%`,transform:`translateX(-50%)`,display:`flex`,gap:`5px`,zIndex:20}
,children:e.map((e,t)=>(0,X.jsx)(`button`,{onClick:()=>r(t),style:{width:t===n?`20px`:`6px`,height:`6px`,borderRadius:`99px`,background:t===n?y:`rgba(255,255,255,0.25)`,border:`none`,cursor:`pointer`,transition:`all 0.3s ease`,padding:0}
}
,t))})
      ]})
};
const tt = () => {
  let e = () => (0, X.jsxs)(`svg`, {
    viewBox: `0 0 64 64`,
    fill: `none`,
    xmlns: `http://www.w3.org/2000/svg`,
    children: [(0, X.jsx)(`path`, {
      d: `M8 32L32 10L56 32V58H40V42H24V58H8V32Z`,
      stroke: `currentColor`,
      strokeWidth: `2`,
      strokeLinecap: `round`,
      strokeLinejoin: `round`
    }), (0, X.jsx)(`line`, {
      x1: `8`,
      y1: `32`,
      x2: `56`,
      y2: `32`,
      stroke: `currentColor`,
      strokeWidth: `1`
    }), (0, X.jsx)(`rect`, {
      x: `14`,
      y: `38`,
      width: `8`,
      height: `8`,
      rx: `1.5`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`rect`, {
      x: `42`,
      y: `38`,
      width: `8`,
      height: `8`,
      rx: `1.5`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`rect`, {
      x: `26`,
      y: `44`,
      width: `12`,
      height: `14`,
      rx: `5`,
      ry: `5`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    })]
  }), t = () => (0, X.jsxs)(`svg`, {
    viewBox: `0 0 64 64`,
    fill: `none`,
    xmlns: `http://www.w3.org/2000/svg`,
    children: [(0, X.jsx)(`rect`, {
      x: `10`,
      y: `12`,
      width: `44`,
      height: `50`,
      rx: `2`,
      stroke: `currentColor`,
      strokeWidth: `2`
    }), (0, X.jsx)(`rect`, {
      x: `16`,
      y: `20`,
      width: `8`,
      height: `8`,
      rx: `1`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`rect`, {
      x: `28`,
      y: `20`,
      width: `8`,
      height: `8`,
      rx: `1`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`rect`, {
      x: `40`,
      y: `20`,
      width: `8`,
      height: `8`,
      rx: `1`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`rect`, {
      x: `16`,
      y: `34`,
      width: `8`,
      height: `8`,
      rx: `1`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`rect`, {
      x: `28`,
      y: `34`,
      width: `8`,
      height: `8`,
      rx: `1`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`rect`, {
      x: `40`,
      y: `34`,
      width: `8`,
      height: `8`,
      rx: `1`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`rect`, {
      x: `24`,
      y: `46`,
      width: `16`,
      height: `16`,
      rx: `2`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`line`, {
      x1: `10`,
      y1: `12`,
      x2: `54`,
      y2: `12`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`line`, {
      x1: `32`,
      y1: `4`,
      x2: `32`,
      y2: `12`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    })]
  }), n = () => (0, X.jsxs)(`svg`, {
    viewBox: `0 0 80 64`,
    fill: `none`,
    xmlns: `http://www.w3.org/2000/svg`,
    children: [(0, X.jsx)(`path`, {
      d: `M4 36L22 16L40 36`,
      stroke: `currentColor`,
      strokeWidth: `2`,
      strokeLinejoin: `round`
    }), (0, X.jsx)(`path`, {
      d: `M40 36L58 16L76 36`,
      stroke: `currentColor`,
      strokeWidth: `2`,
      strokeLinejoin: `round`
    }), (0, X.jsx)(`rect`, {
      x: `4`,
      y: `36`,
      width: `36`,
      height: `26`,
      stroke: `currentColor`,
      strokeWidth: `2`
    }), (0, X.jsx)(`rect`, {
      x: `40`,
      y: `36`,
      width: `36`,
      height: `26`,
      stroke: `currentColor`,
      strokeWidth: `2`
    }), (0, X.jsx)(`rect`, {
      x: `12`,
      y: `44`,
      width: `8`,
      height: `8`,
      rx: `1`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`rect`, {
      x: `24`,
      y: `44`,
      width: `8`,
      height: `8`,
      rx: `1`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`rect`, {
      x: `48`,
      y: `44`,
      width: `8`,
      height: `8`,
      rx: `1`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`rect`, {
      x: `60`,
      y: `44`,
      width: `8`,
      height: `8`,
      rx: `1`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    })]
  }), r = () => (0, X.jsxs)(`svg`, {
    viewBox: `0 0 40 56`,
    fill: `none`,
    xmlns: `http://www.w3.org/2000/svg`,
    children: [(0, X.jsx)(`circle`, {
      cx: `20`,
      cy: `20`,
      r: `16`,
      stroke: `currentColor`,
      strokeWidth: `2`
    }), (0, X.jsx)(`circle`, {
      cx: `20`,
      cy: `20`,
      r: `6`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`path`, {
      d: `M20 36L20 54`,
      stroke: `currentColor`,
      strokeWidth: `2`,
      strokeLinecap: `round`
    })]
  }), i = () => (0, X.jsxs)(`svg`, {
    viewBox: `0 0 64 32`,
    fill: `none`,
    xmlns: `http://www.w3.org/2000/svg`,
    children: [(0, X.jsx)(`circle`, {
      cx: `12`,
      cy: `16`,
      r: `10`,
      stroke: `currentColor`,
      strokeWidth: `2`
    }), (0, X.jsx)(`circle`, {
      cx: `12`,
      cy: `16`,
      r: `4`,
      stroke: `currentColor`,
      strokeWidth: `1.5`
    }), (0, X.jsx)(`line`, {
      x1: `22`,
      y1: `16`,
      x2: `56`,
      y2: `16`,
      stroke: `currentColor`,
      strokeWidth: `2`,
      strokeLinecap: `round`
    }), (0, X.jsx)(`line`, {
      x1: `46`,
      y1: `16`,
      x2: `46`,
      y2: `24`,
      stroke: `currentColor`,
      strokeWidth: `2`,
      strokeLinecap: `round`
    }), (0, X.jsx)(`line`, {
      x1: `54`,
      y1: `16`,
      x2: `54`,
      y2: `22`,
      stroke: `currentColor`,
      strokeWidth: `2`,
      strokeLinecap: `round`
    })]
  }), a = [{
    Comp: e,
    cls: `prop-svg-1`
  }, {
    Comp: t,
    cls: `prop-svg-2`
  }, {
    Comp: n,
    cls: `prop-svg-3`
  }, {
    Comp: r,
    cls: `prop-svg-4`
  }, {
    Comp: e,
    cls: `prop-svg-5`
  }, {
    Comp: i,
    cls: `prop-svg-6`
  }, {
    Comp: t,
    cls: `prop-svg-7`
  }, {
    Comp: e,
    cls: `prop-svg-8`
  }, {
    Comp: n,
    cls: `prop-svg-9`
  }, {
    Comp: r,
    cls: `prop-svg-10`
  }, {
    Comp: e,
    cls: `prop-svg-11`
  }, {
    Comp: t,
    cls: `prop-svg-12`
  }, {
    Comp: i,
    cls: `prop-svg-13`
  }, {
    Comp: n,
    cls: `prop-svg-14`
  }, {
    Comp: e,
    cls: `prop-svg-15`
  }];
  return (0, X.jsx)(`div`, {
    className: `property-bg`,
    "aria-hidden": `true`,
    children: a.map(({
      Comp: e,
      cls: t
    }, n) => (0, X.jsx)(`div`, {
      className: t,
      style: {
        position: `absolute`,
        color: `#e8b84b`
      },
      children: (0, X.jsx)(e, {})
    }, n))
  })
};
const nt = {
  speed1: 30,
  speed2: 35,
  band1: [
    { id: `1`, label: `Amaravati Region`, link: `#cities`, icon: `Landmark` },
    { id: `2`, label: `Verified Listings ✅`, link: `#properties`, icon: `ShieldCheck` },
    { id: `3`, label: `Under 50 Lakhs 🔥`, link: `#search`, icon: `IndianRupee` },
    { id: `4`, label: `Premium Villas`, link: `#search`, icon: `Home` },
    { id: `5`, label: `Zero Brokerage`, link: `#contact`, icon: `CheckCircle2` }
  ],
  band2: [
    { id: `6`, label: `Vijayawada Central`, link: `#cities`, icon: `MapPin` },
    { id: `7`, label: `CRDA Approved 🏛️`, link: `#properties`, icon: `Award` },
    { id: `8`, label: `Invest in Plots ✨`, link: `#search`, icon: `Square` },
    { id: `9`, label: `East Facing Homes 🧭`, link: `#search`, icon: `Compass` },
    { id: `10`, label: `Guntur Tech Park`, link: `#cities`, icon: `Building2` }
  ]
};
const rt = ({
  name: e
}) => {
  let t = xe[e];
  return t ? (0, X.jsx)(t, {
    size: 14,
    className: `marquee-icon`
  }) : null
};
const it = () => {
  let [e, t] = (0, Y.useState)(nt);
(0,Y.useEffect)(()=>{Be(`marquee_strips`).then(e=>{e&&e.band1&&e.band1.length>0&&t(e)}
).catch(console.error)}
,[]);
let n=(e,t,n)=>{if(!e||e.length===0)return null;
let r=[...e,...e,...e,...e];
return(0,X.jsx)(`div`,{className:`marquee-band-container`,children:(0,X.jsx)(`div`,{className:`marquee-track`,style:{animationDuration:`${t}
s`,animationDirection:n}
,children:r.map((e,t)=>(0,X.jsxs)(`a`,{href:e.link||`#`,className:`marquee-item tilt-3d shimmer-3d`,children:[e.icon&&(0,X.jsx)(rt,{name:e.icon}
),(0,X.jsx)(`span`,{className:`marquee-label`,children:e.label}
)]}
,`${e.id}
-${t}
`))}
)}
)}
;
return(0,X.jsxs)(`div`,{className:`animated-marquee-wrapper`,children:[(0,X.jsx)(`div`,{className:`marquee-band marquee-band-1`,children:n(e.band1,e.speed1||30,`normal`)})
,(0,X.jsx)(`div`,{className:`marquee-band marquee-band-2`,children:n(e.band2,e.speed2||35,`reverse`)})
  ]})
};
const at = [{
  label: `All`,
  value: `all`,
  icon: (0, X.jsx)(pe, {
    size: 15
  })
}, {
  label: `Apartments`,
  value: `Apartment`,
  icon: (0, X.jsx)(ce, {
    size: 15
  })
}, {
  label: `Villas`,
  value: `Villa`,
  icon: (0, X.jsx)(C, {
    size: 15
  })
}, {
  label: `Plots`,
  value: `Plot`,
  icon: (0, X.jsx)(Ce, {
    size: 15
  })
}, {
  label: `Agriculture`,
  value: `Agriculture`,
  icon: (0, X.jsx)(R, {
    size: 15
  })
}];
const ot = [{
  label: `All`,
  key: `all`
}, {
  label: `🔥 Under ₹50L`,
  key: `budget`
}, {
  label: `✅ Ready to Move`,
  key: `ready`
}, {
  label: `🧭 East Facing`,
  key: `east`
}, {
  label: `🏛️ CRDA Approved`,
  key: `crda`
}, {
  label: `✔️ Verified Only`,
  key: `verified`
}];
const st = [{
  label: `Newest First`,
  value: `newest`
}, {
  label: `Price: Low → High`,
  value: `price_asc`
}, {
  label: `Price: High → Low`,
  value: `price_desc`
}, {
  label: `Featured First`,
  value: `featured`
}];
const ct = [`Buy`, `Rent`, `Plot`];
const lt = [{
  label: `Any`,
  value: ``
}, {
  label: `Under ₹25L`,
  value: `2500000`
}, {
  label: `₹25L–50L`,
  value: `5000000`
}, {
  label: `₹50L–1Cr`,
  value: `10000000`
}, {
  label: `₹1Cr–2Cr`,
  value: `20000000`
}, {
  label: `₹2Cr+`,
  value: `999999999`
}];
const ut = [{
  icon: (0, X.jsx)(H, {
    size: 24
  }),
  title: `Verified Listings`,
  desc: `Every property is manually verified by our team before listing.`,
  color: `#10d98c`
}, {
  icon: (0, X.jsx)(Se, {
    size: 24
  }),
  title: `CRDA / RERA Compliant`,
  desc: `All listings hold valid approval certifications for full legal safety.`,
  color: `#f5c842`
}, {
  icon: (0, X.jsx)(I, {
    size: 24
  }),
  title: `24/7 Expert Support`,
  desc: `Our real estate advisors are available round the clock to assist you.`,
  color: `#9b59f5`
}, {
  icon: (0, X.jsx)(L, {
    size: 24
  }),
  title: `Best Price Guarantee`,
  desc: `We negotiate directly with builders to get you the best deal possible.`,
  color: `#22d9e0`
}, {
  icon: (0, X.jsx)(T, {
    size: 24
  }),
  title: `Vastu-Guided Properties`,
  desc: `Find east-facing and Vastu-compliant homes for prosperous living.`,
  color: `#f5397b`
}, {
  icon: (0, X.jsx)(ue, {
    size: 24
  }),
  title: `Transparent Pricing`,
  desc: `Zero hidden charges. Complete cost breakdowns including registration.`,
  color: `#ff8c42`
}];
const dt = {
  bhk: ``,
  minPrice: ``,
  maxPrice: ``,
  facing: `Any`,
  furnishing: `N/A`,
  constructionStatus: `N/A`,
  verified: !1,
  approval: `All`,
  propertyType: `All`,
  keyword: ``
};
const ft = (e, t = 100, n = 2e3) => {
  let [r, i] = (0, Y.useState)(``), [a, o] = (0, Y.useState)(0), [s, c] = (0, Y.useState)(!1);
return(0,Y.useEffect)(()=>{if(!e.length)return;
let r=e[a%e.length],l=setTimeout(()=>{i(s?e=>{let t=e.slice(0,-1);
return t===``&&(c(!1),o(e=>e+1)),t}
:e=>{let t=r.slice(0,e.length+1);
return t===r&&setTimeout(()=>c(!0),n),t}
)}
,s?t/2:t);
return()=>clearTimeout(l)}
,[r,s,a,e,t,n]),r}
,pt=(e=20)=>{let[t,n]=(0,Y.useState)(!1);
return(0,Y.useEffect)(()=>{let t=()=>n(window.scrollY>e);
return window.addEventListener(`scroll`,t,{passive:!0}
),()=>window.removeEventListener(`scroll`,t)}
,[e]),t}
,mt=({city:e,count:t,cityPhoto:n,isActive:r,onClick:i}
)=>{let[s,l]=(0,Y.useState)(!1),u=c(0),d=c(0),f=o(d,[-.5,.5],[`6deg`,`-6deg`]),p=o(u,[-.5,.5],[`-6deg`,`6deg`]);
return(0,X.jsxs)(a.div,{className:`city-card ${r?`active`:``}
`,style:{rotateX:f,rotateY:p,transformStyle:`preserve-3d`,perspective:`600px`}
,onMouseMove:e=>{let t=e.currentTarget.getBoundingClientRect();
u.set((e.clientX-t.left)/t.width-.5),d.set((e.clientY-t.top)/t.height-.5)}
,onMouseLeave:()=>{u.set(0),d.set(0),l(!1)}
,onMouseEnter:()=>l(!0),onClick:i,whileTap:{scale:.97}
,children:[(0,X.jsx)(`div`,{className:`city-card-bg`,style:{backgroundImage:n?`linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%), url(${n}
)`:`linear-gradient(135deg, ${e.color||`#c9a84c`}
aa, ${e.color||`#c9a84c`}
33)`,backgroundSize:`cover`,backgroundPosition:`center`,transform:s?`scale(1.08)`:`scale(1)`,transition:`transform 0.5s ease`}
  })
        ]})
};
const ht = () => {
  let {
    user: e,
    logout: t
  } = Z(), n = pt(), r = ft([`Apartments`, `Villas`, `Farmland`, `Premium Plots`, `CRDA Homes`]), s = (0, Y.useRef)(null), u = c(0), d = c(0), f = l(u), p = l(d), h = o(p, [-.5, .5], [`6deg`, `-6deg`]), g = o(f, [-.5, .5], [`-6deg`, `6deg`]), _ = o(f, [-.5, .5], [20, -20]), v = o(p, [-.5, .5], [20, -20]), y = e => {
    if (!s.current) return;
    let t = s.current.getBoundingClientRect();
    u.set((e.clientX - t.left) / t.width - .5), d.set((e.clientY - t.top) / t.height - .5)
  }, [b, x] = (0, Y.useState)([]), [S, te] = (0, Y.useState)(!0), [C, w] = (0, Y.useState)([]), [T, E] = (0, Y.useState)([]), [re, ie] = (0, Y.useState)(!1), [ae, oe] = (0, Y.useState)(`callback`), [se, O] = (0, Y.useState)(!1), [A, j] = (0, Y.useState)(``), [M, ue] = (0, Y.useState)(`Buy`), [N, de] = (0, Y.useState)(``), [F, L] = (0, Y.useState)(`all`), [R, fe] = (0, Y.useState)(`all`), [me, z] = (0, Y.useState)(`all`), [B, V] = (0, Y.useState)(null), [_e, ye] = (0, Y.useState)(!1), [U, G] = (0, Y.useState)({
    ...dt
  }), [K, xe] = (0, Y.useState)(`newest`), [Ce, we] = (0, Y.useState)(0), [Te, Ee] = (0, Y.useState)(!1), [q, De] = (0, Y.useState)(null), [J, Oe] = (0, Y.useState)(null), [ke, Ae] = (0, Y.useState)([]), je = q?.primaryColor ? {
    "--gold": q.primaryColor,
    "--royal-gold": q.primaryColor
  } : void 0, Me = q?.enable3D !== !1, Ne = q?.themeMode === `royal` ? `theme-royal` : ``;
(0,Y.useEffect)(()=>{Be(`appearance`).then(e=>De(e||{}
)).catch(console.error),Be(`support_info`).then(e=>Oe(e||{}
)).catch(console.error),He().then(w).catch(console.error),Ve().then(E).catch(console.error);
try{let e=localStorage.getItem(`snapadda_recent_views`);
if(e){let t=JSON.parse(e),n=t.map(e=>e._id||e.id);
n.length>0&&Ge(n).then(e=>{e.status===`success`&&(Ae(e.data),localStorage.setItem(`snapadda_recent_views`,JSON.stringify(e.data)))}
).catch(()=>Ae(t))}
}
catch(e){console.warn(`Could not load recent views`,e)}
}
,[]),(0,Y.useEffect)(()=>{let e=0;
U.bhk&&e++,U.minPrice&&e++,U.maxPrice&&e++,U.facing!==`Any`&&e++,U.furnishing!==`N/A`&&e++,U.constructionStatus!==`N/A`&&e++,U.verified&&e++,U.approval!==`All`&&e++,U.propertyType!==`All`&&e++,we(e)}
,[U]),(0,Y.useEffect)(()=>{let e={budget:{maxPrice:`5000000`}
,ready:{constructionStatus:`Ready to Move`}
,east:{facing:`East`}
,crda:{approval:`CRDA`}
,verified:{verified:!0}
,all:dt}
;
e[me]&&G(t=>({...t,...e[me]}
))}
,[me]);
  let Pe = (0, Y.useCallback)(() => {
    te(!0), Ie({
      ...U,
      search: U.keyword || A,
      type: F === `all` ? R === `all` ? void 0 : R : F,
      city: B || void 0,
      purpose: M === `Buy` ? `Buy` : M === `Rent` ? `Rent` : void 0,
      approval: U.approval === `All` ? void 0 : U.approval,
      maxPrice: N || U.maxPrice || void 0
    }).then(e => x(e?.data || (Array.isArray(e) ? e : []))).catch(console.error).finally(() => te(!1))
  }, [B, R, A, U, M, N, F]);
  (0, Y.useEffect)(() => {
    Pe()
  }, [Pe]);
  let Fe = (0, Y.useMemo)(() => {
    let e = [...b];
    return K === `price_asc` ? e.sort((e, t) => parseFloat(String(e.price).replace(/[^0-9.]/g, ``)) - parseFloat(String(t.price).replace(/[^0-9.]/g, ``))) : K === `price_desc` ? e.sort((e, t) => parseFloat(String(t.price).replace(/[^0-9.]/g, ``)) - parseFloat(String(e.price).replace(/[^0-9.]/g, ``))) : K === `featured` ? e.sort((e, t) => (t.isFeatured ? 1 : 0) - (e.isFeatured ? 1 : 0)) : e
  }, [b, K]);
  let handleOpenLead = e => {
     oe(e), ie(!0)
   };
   let handleResetFilters = () => {
     fe(`all`), V(null), j(``), z(`all`), G({
       ...dt
     }), xe(`newest`), de(``), L(`all`)
   };
   let handleSearch = () => Pe();
return(0,X.jsxs)(`div`,{className:`app-container ${Me?`scene-3d`:``}
 ${Ne}
`,style:je,children:[q?.bgUrl?(0,X.jsx)(a.div,{className:`site-bg-overlay`,style:{backgroundImage:`url(${q.bgUrl}
)`,opacity:.22,x:_,y:v}
}
):(0,X.jsx)(tt,{}
),(0,X.jsx)(`header`,{className:`app-nav`,style:{background:n||window.innerWidth<768?`rgba(7,7,15,0.98)`:`transparent`,backdropFilter:n||window.innerWidth<768?`blur(20px)`:`none`,borderBottom:n||window.innerWidth<768?`1px solid rgba(212, 175, 55, 0.4)`:`1px solid transparent`,boxShadow:n?`var(--shadow-md)`:`none`}
,children:(0,X.jsxs)(`div`,{className:`container nav-inner`,children:[(0,X.jsx)(m,{to:`/`,className:`nav-logo-wrap`,children:(0,X.jsx)(Ke,{size:36,showText:!0}
)}
),(0,X.jsxs)(`nav`,{className:`nav-links-center`,children:[(0,X.jsx)(`a`,{href:`#search`,className:`nav-link`,children:`Search`}
),(0,X.jsx)(`a`,{href:`#properties`,className:`nav-link`,children:`Properties`}
),(0,X.jsx)(`a`,{href:`#cities`,className:`nav-link`,children:`Locations`}
),(0,X.jsx)(`a`,{href:`#contact`,className:`nav-link`,children:`Contact`}
),e&&(0,X.jsxs)(`div`,{className:`nav-dropdown-wrap`,children:[(0,X.jsxs)(`span`,{className:`nav-link`,children:[`Liked `,(0,X.jsx)(ne,{size:12}
)]}
),(0,X.jsxs)(`div`,{className:`nav-dropdown`,children:[at.map(e=>(0,X.jsxs)(m,{to:`/dashboard/favorites?type=${e.value}
`,className:`dropdown-item`,children:[e.icon,` `,e.label,`s`]}
,e.value)),(0,X.jsx)(`hr`,{style:{margin:`8px 0`,borderColor:`var(--border)`}
}
),(0,X.jsx)(m,{to:`/dashboard/favorites`,className:`dropdown-item`,style:{color:`var(--gold)`}
,children:`View All Favorites`}
)]}
)]}
),e&&(0,X.jsx)(m,{to:`/dashboard`,className:`nav-link`,children:`Dashboard`}
)]}
),(0,X.jsxs)(`div`,{className:`nav-right`,children:[(0,X.jsx)(`div`,{className:`desktop-only`,children:e?(0,X.jsx)(`button`,{className:`nav-signout-btn`,onClick:t,children:`Sign Out`}
):(0,X.jsx)(m,{to:`/login`,className:`nav-signin-btn`,children:`Sign In`}
)}
),(0,X.jsx)(`button`,{className:`mobile-menu-btn`,onClick:()=>O(!0),"aria-label":`Open menu`,children:(0,X.jsx)(ee,{size:24}
)}
)]}
)]}
)}
),(0,X.jsxs)(`div`,{className:`mobile-nav-overlay ${se?`open`:``}
`,children:[(0,X.jsx)(`button`,{className:`mobile-close-btn`,onClick:()=>O(!1),children:(0,X.jsx)(W,{size:26}
)}
),(0,X.jsx)(`div`,{style:{width:`100%`,height:`20px`}
}
),` `,(0,X.jsx)(m,{to:`/about`,className:`gold-shimmer-text`,onClick:()=>O(!1),children:`About & Developer`}
),(0,X.jsx)(`a`,{href:`#search`,className:`gold-shimmer-text`,onClick:()=>O(!1),children:`Search`}
),(0,X.jsx)(`a`,{href:`#properties`,className:`gold-shimmer-text`,onClick:()=>O(!1),children:`Properties`}
),(0,X.jsx)(`a`,{href:`#cities`,className:`gold-shimmer-text`,onClick:()=>O(!1),children:`Locations`}
),(0,X.jsx)(`a`,{href:`#contact`,className:`gold-shimmer-text`,onClick:()=>O(!1),children:`Contact`}
),e&&(0,X.jsx)(m,{to:`/dashboard`,className:`gold-shimmer-text`,onClick:()=>O(!1),children:`Dashboard`}
),(0,X.jsx)(`hr`,{style:{width:`100%`,borderColor:`var(--border)`}
}
),(0,X.jsx)(`div`,{style:{marginTop:`1rem`,width:`100%`,display:`flex`,flexDirection:`column`,gap:`1rem`}
,children:e?(0,X.jsx)(`button`,{className:`mobile-auth-btn-glass logout`,onClick:()=>{t(),O(!1)}
,children:`Sign Out`}
):(0,X.jsx)(m,{to:`/login`,className:`mobile-auth-btn-glass login`,onClick:()=>O(!1),children:`Sign In to SnapAdda`}
)}
)]}
),(0,X.jsxs)(`main`,{style:{flex:1,paddingTop:`var(--nav-h)`}
,children:[(0,X.jsx)(it,{}
),(0,X.jsx)(`section`,{className:`promo-section-top`,children:(0,X.jsxs)(`div`,{className:`container`,children:[(0,X.jsxs)(`div`,{className:`promo-header-label`,children:[(0,X.jsx)(ve,{size:13}
),` Featured Promotions & Offers`]}
),(0,X.jsx)(et,{}
)]}
)}
),(0,X.jsx)(`section`,{className:`hero-section`,children:(0,X.jsxs)(`div`,{className:`container`,children:[(0,X.jsxs)(a.div,{className:`hero-eyebrow`,initial:{opacity:0,y:12}
,animate:{opacity:1,y:0}
,transition:{duration:.5}
,children:[(0,X.jsx)(k,{size:12}
),` Andhra Pradesh's #1 Property Platform`]}
),(0,X.jsxs)(a.h1,{className:`hero-title`,initial:{opacity:0,y:16}
,animate:{opacity:1,y:0}
,transition:{duration:.55,delay:.1}
,children:[`Discover Your Dream`,(0,X.jsxs)(`span`,{className:`gold-line text-royal-gold`,style:{display:`block`}
,children:[r,(0,X.jsx)(`span`,{style:{color:`var(--gold)`,opacity:.7}
,children:`|`}
)]}
),`Place in Andhra`]}
),(0,X.jsx)(a.p,{className:`hero-subtitle`,initial:{opacity:0,y:16}
,animate:{opacity:1,y:0}
,transition:{duration:.6,delay:.2}
,children:`Browse verified listings across Amaravati, Vijayawada, Guntur & beyond. CRDA-approved properties · Real prices · Trusted sellers.`}
),(0,X.jsxs)(a.div,{className:`hero-ctas`,initial:{opacity:0,y:16}
,animate:{opacity:1,y:0}
,transition:{duration:.65,delay:.3}
,children:[(0,X.jsxs)(`a`,{href:`#search`,className:`hero-btn hero-btn-primary`,children:[(0,X.jsx)(P,{size:18}
),` Browse Properties`]}
),(0,X.jsxs)(`button`,{className:`hero-btn hero-btn-glass`,onClick:()=>handleOpenLead(`callback`),children:[(0,X.jsx)(I,{size:18}
),` Free Expert Call`]}
)]}
),(0,X.jsx)(a.div,{className:`hero-stats-row`,initial:{opacity:0}
,animate:{opacity:1}
,transition:{delay:.5}
,children:[{icon:(0,X.jsx)(H,{size:15}
),val:`${b.filter(e=>e.isVerified).length||`0`}
+`,label:`Verified Listings`}
,{icon:(0,X.jsx)(k,{size:15}
),val:`${C.length}
`,label:`Cities Covered`}
,{icon:(0,X.jsx)(he,{size:15}
),val:`2,400+`,label:`Happy Clients`}
,{icon:(0,X.jsx)(Se,{size:15}
),val:`CRDA`,label:`Approved Properties`}
].map((e,t)=>(0,X.jsxs)(`div`,{className:`hero-stat-chip`,children:[e.icon,(0,X.jsxs)(`div`,{children:[(0,X.jsx)(`div`,{className:`hero-stat-val`,children:e.val}
),(0,X.jsx)(`div`,{className:`hero-stat-label`,children:e.label}
)]}
)]}
,t))}
)]}
)}
),(0,X.jsx)(`section`,{id:`search`,className:`search-section`,children:(0,X.jsx)(`div`,{className:`container`,children:(0,X.jsxs)(a.div,{ref:s,className:`search-platform glass-heavy`,style:{rotateX:h,rotateY:g,transformStyle:`preserve-3d`}
,onMouseMove:y,onMouseLeave:()=>{u.set(0),d.set(0)}
,children:[(0,X.jsx)(`div`,{className:`search-tabs`,children:ct.map(e=>(0,X.jsx)(`button`,{className:`search-tab ${M===e?`active`:``}
`,onClick:()=>ue(e),children:e}
,e))}
),(0,X.jsxs)(`div`,{className:`search-main-row`,children:[(0,X.jsxs)(`div`,{className:`search-bar-wrap`,children:[(0,X.jsx)(P,{size:18,className:`s-icon`}
),(0,X.jsx)(`input`,{type:`text`,className:`search-bar-input`,placeholder:`Location, project, keyword...`,value:A,onChange:e=>j(e.target.value),onFocus:()=>Ee(!0),onBlur:()=>setTimeout(()=>Ee(!1),200),onKeyDown:e=>e.key===`Enter`&&handleSearch()}
),(0,X.jsx)(i,{children:Te&&A.length>0&&(0,X.jsx)(a.div,{initial:{opacity:0,y:10}
,animate:{opacity:1,y:0}
,exit:{opacity:0,scale:.95}
,className:`search-autocomplete-dropdown`,children:C.filter(e=>e.name.toLowerCase().includes(A.toLowerCase())).length>0?(0,X.jsxs)(X.Fragment,{children:[(0,X.jsx)(`div`,{className:`autocomplete-header`,children:`Top Locations`}
),C.filter(e=>e.name.toLowerCase().includes(A.toLowerCase())).map(e=>(0,X.jsxs)(`button`,{className:`autocomplete-item`,onClick:()=>{j(e.name),V(e.name),Ee(!1)}
,children:[(0,X.jsx)(k,{size:14,className:`ac-icon`}
),(0,X.jsx)(`span`,{children:e.name}
),(0,X.jsx)(`span`,{className:`ac-badge`,children:e.tagline||`Andhra Pradesh`}
)]}
,e._id||e.id))]}
):(0,X.jsx)(`div`,{className:`autocomplete-header`,children:`Search across all of AP`}
)}
)}
),A&&(0,X.jsx)(`button`,{className:`search-clear`,onMouseDown:e=>{e.preventDefault(),j(``)}
,children:(0,X.jsx)(W,{size:14}
)}
)]}
),(0,X.jsxs)(`div`,{className:`search-selects-row`,children:[(0,X.jsxs)(`div`,{className:`search-select-wrap`,children:[(0,X.jsx)(ce,{size:15,className:`sel-icon`}
),(0,X.jsxs)(`select`,{value:F,onChange:e=>L(e.target.value),className:`search-select`,children:[(0,X.jsx)(`option`,{value:`all`,children:`All Types`}
),at.filter(e=>e.value!==`all`).map(e=>(0,X.jsx)(`option`,{value:e.value,children:e.label}
,e.value))]}
)]}
),(0,X.jsxs)(`div`,{className:`search-select-wrap`,children:[(0,X.jsx)(D,{size:15,className:`sel-icon`}
),(0,X.jsx)(`select`,{value:N,onChange:e=>de(e.target.value),className:`search-select`,children:lt.map(e=>(0,X.jsx)(`option`,{value:e.value,children:e.label}
,e.value))}
)]}
),(0,X.jsxs)(`div`,{className:`search-select-wrap`,children:[(0,X.jsx)(k,{size:15,className:`sel-icon`}
),(0,X.jsxs)(`select`,{value:B||``,onChange:e=>V(e.target.value||null),className:`search-select`,children:[(0,X.jsx)(`option`,{value:``,children:`All Locations`}
),C.map(e=>(0,X.jsx)(`option`,{value:e.name,children:e.name}
,e._id||e.id))]}
)]}
)]}
),(0,X.jsxs)(`div`,{className:`search-action-row`,children:[(0,X.jsxs)(`button`,{className:`search-go-btn`,onClick:Re,children:[(0,X.jsx)(P,{size:18}
),` Search`]}
),(0,X.jsxs)(`button`,{className:`search-filter-btn`,onClick:()=>ye(!0),children:[(0,X.jsx)(pe,{size:16}
),Ce>0&&(0,X.jsx)(`span`,{className:`filter-badge`,children:Ce}
)]}
)]}
)]}
),(0,X.jsxs)(`div`,{className:`search-quick-chips`,children:[[`1 BHK`,`2 BHK`,`3 BHK`,`4+ BHK`].map(e=>(0,X.jsx)(`button`,{className:`quick-chip ${U.bhk===e.split(` `)[0]?`active`:``}
`,onClick:()=>G(t=>({...t,bhk:t.bhk===e.split(` `)[0]?``:e.split(` `)[0]}
)),children:e}
,e)),(0,X.jsx)(`div`,{className:`chip-divider`}
),[`Under 50L`,`50L-1Cr`,`1Cr-2Cr`,`2Cr+`].map((e,t)=>{let[n,r]=[[``,`5000000`],[`5000000`,`10000000`],[`10000000`,`20000000`],[`20000000`,``]][t],i=U.minPrice===n&&U.maxPrice===r;
return(0,X.jsxs)(`button`,{className:`quick-chip ${i?`active`:``}
`,onClick:()=>G(e=>i?{...e,minPrice:``,maxPrice:``}
:{...e,minPrice:n,maxPrice:r}
),children:[`₹`,e]}
,e)}
),Ce>0&&(0,X.jsxs)(`button`,{className:`quick-chip clear-chip`,onClick:handleResetFilters,children:[(0,X.jsx)(W,{size:12}
),` Clear`]}
)]}
)]}
)}
)}
),(0,X.jsx)(`section`,{id:`cities`,className:`section-wrap`,children:(0,X.jsxs)(`div`,{className:`container`,children:[(0,X.jsxs)(`div`,{className:`section-head`,children:[(0,X.jsx)(`div`,{className:`section-eyebrow`,children:`Explore by Location`}
),(0,X.jsx)(`h2`,{className:`section-title`,children:`Andhra Pradesh Cities`}
),(0,X.jsx)(`p`,{className:`section-subtitle`,children:`Tap a city to filter properties by location`}
)]}
),(0,X.jsx)(`div`,{className:`city-cards-grid`,children:C.map((e,t)=>(0,X.jsx)(a.div,{initial:{opacity:0,y:20}
,whileInView:{opacity:1,y:0}
,viewport:{once:!0}
,transition:{delay:t*.07}
,children:(0,X.jsx)(mt,{city:e,count:e.propertyCount||0,cityPhoto:e.image,isActive:B===e.name,onClick:()=>V(B===e.name?null:e.name)}
)}
,e._id||e.id))}
),B&&(0,X.jsxs)(a.div,{className:`active-city-tag`,initial:{opacity:0,scale:.9}
,animate:{opacity:1,scale:1}
,children:[(0,X.jsx)(k,{size:13}
),` Filtering: `,(0,X.jsx)(`strong`,{children:B}
),(0,X.jsx)(`button`,{onClick:()=>V(null),children:(0,X.jsx)(W,{size:13}
)}
)]}
)]}
)}
),(0,X.jsx)(`section`,{style:{padding:`0 0 1.5rem`}
,children:(0,X.jsx)(`div`,{className:`container`,children:(0,X.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.85rem`}
,children:[(0,X.jsx)(`div`,{className:`type-tabs-bar`,children:at.map(e=>(0,X.jsxs)(`button`,{className:`type-tab ${R===e.value?`active`:``}
`,onClick:()=>fe(e.value),children:[e.icon,` `,e.label]}
,e.value))}
),(0,X.jsx)(`div`,{className:`smart-filter-pills`,children:ot.map(e=>(0,X.jsx)(`button`,{className:`smart-pill ${me===e.key?`active`:``}
`,onClick:()=>z(e.key),children:e.label}
,e.key))}
)]}
)}
)}
),(0,X.jsx)(`section`,{id:`properties`,className:`section-wrap`,style:{paddingTop:`0.5rem`}
,children:(0,X.jsxs)(`div`,{className:`container`,children:[(0,X.jsxs)(`div`,{className:`section-title-row`,children:[(0,X.jsxs)(`div`,{children:[(0,X.jsx)(`h2`,{style:{fontSize:`1.35rem`,marginBottom:`2px`}
,children:B?`Properties in ${B}
`:M===`Rent`?`Rentals`:M===`Plot`?`Plots & Land`:`Featured Properties`}
),(0,X.jsx)(`p`,{style:{fontSize:`0.82rem`,color:`var(--txt-muted)`}
,children:`Showing verified and trusted listings`}
)]}
),(0,X.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.75rem`}
,children:[(0,X.jsxs)(`span`,{className:`result-count`,children:[Fe.length,` found`]}
),(0,X.jsx)(`select`,{className:`sort-select`,value:K,onChange:e=>xe(e.target.value),children:st.map(e=>(0,X.jsx)(`option`,{value:e.value,children:e.label}
,e.value))}
),(Ce>0||B||N||F!==`all`)&&(0,X.jsxs)(`button`,{className:`btn btn-glass btn-sm`,onClick:handleResetFilters,children:[(0,X.jsx)(W,{size:12}
),` Clear All`]}
)]}
)]}
),S?(0,X.jsx)(`div`,{className:`properties-grid`,children:[1,2,3,4,5,6].map(e=>(0,X.jsxs)(`div`,{className:`skeleton-card`,children:[(0,X.jsx)(`div`,{className:`skeleton`,style:{height:`220px`,borderRadius:`var(--r-lg)`}
}
),(0,X.jsxs)(`div`,{style:{padding:`0.85rem`,display:`flex`,flexDirection:`column`,gap:`0.5rem`}
,children:[(0,X.jsx)(`div`,{className:`skeleton`,style:{height:`16px`,width:`80%`}
}
),(0,X.jsx)(`div`,{className:`skeleton`,style:{height:`13px`,width:`55%`}
}
)]}
)]}
,e))}
):(0,X.jsx)(i,{mode:`wait`,children:(0,X.jsx)(a.div,{className:`properties-grid`,initial:{opacity:0,y:16}
,animate:{opacity:1,y:0}
,exit:{opacity:0,y:-16}
,transition:{duration:.3}
,children:Fe.length>0?Fe.map((e,t)=>(0,X.jsx)(a.div,{initial:{opacity:0,y:20}
,animate:{opacity:1,y:0}
,transition:{delay:t*.04}
,children:(0,X.jsx)(qe,{...e,approval:e.approvalAuthority||e.approval,onTriggerLead:Q}
)}
,e._id||e.id)):(0,X.jsxs)(`div`,{className:`empty-state`,children:[(0,X.jsx)(P,{size:48}
),(0,X.jsx)(`h3`,{children:`No properties found`}
),(0,X.jsx)(`p`,{children:`Try adjusting or clearing your filters.`}
),(0,X.jsx)(`button`,{className:`hero-btn hero-btn-primary`,style:{marginTop:`0.5rem`,fontSize:`0.88rem`,padding:`0.6rem 1.4rem`}
,onClick:handleResetFilters,children:`Clear All Filters`}
)]}
)}
,R+me+B+A+M+K)}
)]}
)}
),ke.length>0&&(0,X.jsx)(`section`,{className:`section-wrap`,style:{background:`var(--bg-glass-heavy)`,borderTop:`1px solid var(--border)`,borderBottom:`1px solid var(--border)`}
,children:(0,X.jsxs)(`div`,{className:`container`,children:[(0,X.jsxs)(`div`,{className:`section-head`,children:[(0,X.jsx)(`h2`,{className:`section-title`,children:`Jump Back In`}
),(0,X.jsx)(`p`,{className:`section-subtitle`,children:`Based on your recent search history`}
)]}
),(0,X.jsx)(`div`,{className:`recent-views-grid`,children:ke.map((e,t)=>(0,X.jsx)(a.div,{initial:{opacity:0,x:20}
,animate:{opacity:1,x:0}
,transition:{delay:t*.1}
,children:(0,X.jsx)(qe,{...e,size:`sm`,minimal:!0,onTriggerLead:Q}
)}
,e._id||e.id))}
)]}
)}
),(0,X.jsx)(`section`,{className:`stats-band`,children:(0,X.jsx)(`div`,{className:`container`,children:(0,X.jsx)(`div`,{className:`stats-grid`,children:[{icon:(0,X.jsx)(be,{size:22}
),val:`${b.length}
+`,label:`Total Listings`}
,{icon:(0,X.jsx)(H,{size:22}
),val:`${b.filter(e=>e.isVerified).length}
+`,label:`Verified Properties`}
,{icon:(0,X.jsx)(k,{size:22}
),val:`${new Set(b.map(e=>e.location)).size}
+`,label:`Locations`}
,{icon:(0,X.jsx)(I,{size:22}
),val:`24/7`,label:`Expert Support`}
].map((e,t)=>(0,X.jsxs)(a.div,{className:`stat-card`,whileInView:{opacity:1,y:0}
,initial:{opacity:0,y:20}
,viewport:{once:!0}
,transition:{delay:t*.1}
,children:[(0,X.jsx)(`div`,{className:`stat-icon`,children:e.icon}
),(0,X.jsx)(`div`,{className:`stat-value`,children:e.val}
),(0,X.jsx)(`div`,{className:`stat-label`,children:e.label}
)]}
,t))}
)}
)}
),(0,X.jsx)(`section`,{className:`section-wrap why-section`,children:(0,X.jsxs)(`div`,{className:`container`,children:[(0,X.jsxs)(`div`,{className:`section-head`,style:{textAlign:`center`}
,children:[(0,X.jsx)(`div`,{className:`section-eyebrow`,style:{justifyContent:`center`}
,children:`Why Choose Us`}
),(0,X.jsx)(`h2`,{className:`section-title`,children:`The SnapAdda Advantage`}
),(0,X.jsx)(`p`,{className:`section-subtitle`,children:`Everything you need to find, verify, and close a property deal`}
)]}
),(0,X.jsx)(`div`,{className:`why-grid`,children:ut.map((e,t)=>(0,X.jsxs)(a.div,{className:`why-card glass-heavy tilt-3d`,initial:{opacity:0,y:24}
,whileInView:{opacity:1,y:0}
,viewport:{once:!0}
,transition:{delay:t*.1}
,children:[(0,X.jsx)(`div`,{className:`why-icon-wrap`,style:{color:e.color,background:`${e.color}
18`,border:`1px solid ${e.color}
30`}
,children:e.icon}
),(0,X.jsx)(`h3`,{className:`why-title`,children:e.title}
),(0,X.jsx)(`p`,{className:`why-desc`,children:e.desc}
)]}
,t))}
)]}
)}
),(0,X.jsxs)(`section`,{className:`section-wrap`,style:{overflow:`hidden`}
,children:[(0,X.jsxs)(`div`,{className:`section-head`,style:{textAlign:`center`}
,children:[(0,X.jsx)(`div`,{className:`section-eyebrow`,style:{justifyContent:`center`}
,children:`Happy Clients`}
),(0,X.jsx)(`h2`,{className:`section-title`,children:`What People Say`}
),(0,X.jsx)(`p`,{className:`section-subtitle`,children:`Thousands of families have found their home with SnapAdda`}
)]}
),(0,X.jsx)(`div`,{className:`testimonial-marquee-container`,children:(0,X.jsx)(`div`,{className:`testimonial-marquee-track`,children:T&&T.length>0&&[...T,...T].map((e,t)=>(0,X.jsxs)(a.div,{className:`testimonial-card glass-heavy`,children:[(0,X.jsx)(`div`,{className:`test-quote`,children:`"`}
),(0,X.jsx)(`p`,{className:`test-text`,children:e.text}
),(0,X.jsxs)(`div`,{className:`test-footer`,children:[(0,X.jsx)(`div`,{className:`test-avatar`,style:{background:e.color||`var(--gold)`}
,children:e.name?.charAt(0)||`U`}
),(0,X.jsxs)(`div`,{className:`test-info`,children:[(0,X.jsx)(`div`,{className:`test-name`,children:e.name}
),(0,X.jsx)(`div`,{className:`test-loc`,children:e.location}
)]}
),(0,X.jsx)(`div`,{className:`test-rating`,children:[1,2,3,4,5].map(t=>(0,X.jsx)(ge,{size:12,fill:t<=(e.rating||5)?`var(--gold)`:`none`,color:`var(--gold)`}
,t))}
)]}
)]}
,`testimonial-${e._id||t}
-${t}
`))}
)}
)]}
),(0,X.jsx)(`section`,{id:`contact`,className:`cta-section`,children:(0,X.jsx)(`div`,{className:`container`,children:(0,X.jsxs)(a.div,{className:`cta-card glass-heavy`,initial:{opacity:0,y:24}
,whileInView:{opacity:1,y:0}
,viewport:{once:!0,amount:.35}
,transition:{duration:.75,ease:[.22,1,.36,1]}
,style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:`2rem`,flexWrap:`wrap`}
,children:[(0,X.jsxs)(`div`,{className:`cta-content`,style:{flex:1,minWidth:`300px`}
,children:[(0,X.jsx)(`h2`,{style:{fontSize:`2.2rem`,marginBottom:`1rem`}
,children:`Ready to Start Your Journey?`}
),(0,X.jsxs)(`p`,{style:{fontSize:`1.05rem`,color:`var(--txt-secondary)`,marginBottom:`2rem`,lineHeight:1.6}
,children:[`Connect with our verified property experts today and get a free consultation on the `,(0,X.jsx)(`strong`,{children:B||`Andhra`}
),` real estate market.`]}
),(0,X.jsxs)(`div`,{className:`cta-buttons`,style:{display:`flex`,gap:`1.25rem`,flexWrap:`wrap`,position:`relative`,zIndex:10}
,children:[(0,X.jsxs)(`button`,{type:`button`,className:`hero-btn hero-btn-primary`,onClick:e=>{e.preventDefault(),e.stopPropagation(),handleOpenLead(`callback`)}
,style:{position:`relative`,zIndex:5}
,children:[(0,X.jsx)(I,{size:18}
),` Get a Callback`]}
),(0,X.jsxs)(`a`,{href:`https://wa.me/${J?.whatsapp||`919999999911`}
?text=Hello, I am interested in property in Andhra.`,className:`hero-btn hero-btn-whatsapp`,children:[(0,X.jsx)(le,{size:18}
),` WhatsApp Us`]}
)]}
)]}
),(0,X.jsxs)(`div`,{className:`cta-visual`,style:{flex:.4,minWidth:`240px`,position:`relative`,height:`180px`,display:`flex`,alignItems:`center`,justifyContent:`center`}
,children:[(0,X.jsx)(`div`,{className:`cta-orb gold-orb`,style:{width:`200px`,height:`200px`,opacity:.15}
}
),(0,X.jsx)(`div`,{className:`cta-orb emerald-orb`,style:{width:`140px`,height:`140px`,opacity:.2,top:`-20px`}
}
),(0,X.jsx)(ce,{size:80,style:{color:`var(--gold)`,opacity:.3,position:`absolute`,filter:`blur(1px)`}
}
)]}
)]}
)}
)}
)]}
),(0,X.jsx)(`footer`,{className:`admin-footer`,style:{borderTop:`1px solid var(--border)`}
,children:(0,X.jsxs)(`div`,{className:`container`,children:[(0,X.jsxs)(`div`,{className:`footer-grid`,children:[(0,X.jsxs)(`div`,{className:`footer-col`,children:[(0,X.jsx)(Ke,{size:28,showText:!0}
),(0,X.jsx)(`p`,{style:{marginTop:`1rem`,fontSize:`0.85rem`,color:`var(--txt-muted)`,lineHeight:1.6}
,children:`Andhra Pradesh's most trusted 3D interactive property portal. We simplify search, verify authenticity, and deliver dreams.`}
)]}
),(0,X.jsxs)(`div`,{className:`footer-col`,children:[(0,X.jsx)(`h4`,{children:`Quick Links`}
),(0,X.jsx)(`a`,{href:`#properties`,children:`Properties`}
),(0,X.jsx)(`a`,{href:`#cities`,children:`Locations`}
),(0,X.jsx)(`a`,{href:`/login`,children:`Admin Login`}
)]}
),(0,X.jsxs)(`div`,{className:`footer-col`,children:[(0,X.jsx)(`h4`,{children:`Support`}
),(0,X.jsx)(`a`,{href:`mailto:${J?.email||`info@snapadda.com`}
`,children:J?.email||`info@snapadda.com`}
),(0,X.jsx)(`a`,{href:`tel:${J?.phone?.replace(/\s+/g,``)||`+919999999999`}
`,children:J?.phone||`+91 99999 99999`}
),(0,X.jsx)(`p`,{style:{fontSize:`0.75rem`,marginTop:`0.5rem`}
,children:J?.address||`D.No 4-56, Benz Circle, Vijayawada`}
)]}
)]}
),(0,X.jsxs)(`div`,{className:`footer-bottom`,children:[(0,X.jsx)(`span`,{children:`© 2026 SnapAdda. All rights reserved.`}
),(0,X.jsxs)(`div`,{className:`footer-badges`,children:[(0,X.jsx)(`span`,{className:`badge-crda`,children:`AP CRDA Approved`}
),(0,X.jsx)(`span`,{className:`badge-rera`,children:`AP RERA Registered`}
)]}
)]}
)]}
)}
),(0,X.jsx)(Ye,{isOpen:_e,onClose:()=>ye(!1),filters:U,setFilters:G,onApply:Re}
),(0,X.jsx)(Je,{isOpen:re,onClose:()=>ie(!1),type:ae}
  )]}
)}
;
const gt = `http://localhost:5000/api`;
const _t = () => {
  let {
    id: e
  } = p(), t = d(), [n, r] = (0, Y.useState)(null), [i, o] = (0, Y.useState)(!0), [s, c] = (0, Y.useState)(`photos`), [l, u] = (0, Y.useState)(`overview`), [f, h] = (0, Y.useState)([]), [g, _] = (0, Y.useState)([]), [v, b] = (0, Y.useState)(``), [x, ee] = (0, Y.useState)(``), [S, te] = (0, Y.useState)(``), [C, E] = (0, Y.useState)(``), [ne, ie] = (0, Y.useState)(null), [loanAmount, setLoanAmount] = (0, Y.useState)(80), [interestRate, setInterestRate] = (0, Y.useState)(8.5), [tenureYears, setTenureYears] = (0, Y.useState)(20), [ue, N] = (0, Y.useState)(!1), [P, I] = (0, Y.useState)(`callback`);
(0,Y.useEffect)(()=>{e&&(o(!0),window.scrollTo(0,0),Le(e).then(e=>{r(e.data||e)}
).catch(e=>{console.error(`Property not found or database error:`,e),r(null)}
).finally(()=>o(!1)),fetch(`${gt}
/properties/${e}
/similar`).then(e=>e.json()).then(e=>{e.data&&h(e.data)}
).catch(()=>{}
),fetch(`${gt}
/inquiries/property/${e}
`).then(e=>e.json()).then(e=>{e.status===`success`&&_(e.data||[])}
).catch(()=>{}
),Be(`support_info`).then(e=>{ie(e||{}
)}
).catch(console.error))}
,[e]);
let L=n?.images&&n.images.length>0?n.images:[n?.image,...n?.gallery||[]].filter(Boolean),R=e=>{if(!e)return``;
if(e.description)return e.description;
let t=e.facing&&e.facing!==`Any`?`${e.facing}
 facing `:``,n=e.approvalAuthority||e.approval?` with ${e.approvalAuthority||e.approval}
 approval`:``;
return`This premium ${t}
${e.type||`property`}
 is located in ${e.location}
${n}
. Spanning ${e.areaSize||e.sqft}
 ${e.measurementUnit||`Sq.Ft`}
, it offers ${e.beds?e.beds+` bedrooms, `+e.baths+` bathrooms, and `:``}
exceptional value for both living and investment. Contact us for a site visit today.`}
;
(0,Y.useEffect)(()=>{if(!n)return;
let e={title:`${n.title}
 in ${n.location}
 | SnapAdda`,description:R(n),image:L[0]||``,schema:{"@context":`https://schema.org`,"@type":`RealEstateListing`,name:n.title,description:R(n),url:window.location.href,image:L[0]||``,address:{"@type":`PostalAddress`,addressLocality:n.location,addressRegion:n.district||`Andhra Pradesh`,addressCountry:`IN`}
,offers:{"@type":`Offer`,price:n.price,priceCurrency:`INR`}
}
}
;
return window.dispatchEvent(new CustomEvent(`snap_seo_update`,{detail:e}
)),()=>{window.dispatchEvent(new CustomEvent(`snap_seo_update`,{detail:null}
))}
}
,[n,L]),(0,Y.useEffect)(()=>{if(!(!n||!n._id))try{let e=localStorage.getItem(`snapadda_recent_views`),t=e?JSON.parse(e):[];
t=t.filter(e=>e._id!==n._id);
let r={_id:n._id,title:n.title,price:n.price,location:n.location,type:n.type,images:n.images?.length>0?[n.images[0]]:[],beds:n.beds,baths:n.baths,sqft:n.sqft}
;
t.unshift(r),t.length>6&&(t.length=6),localStorage.setItem(`snapadda_recent_views`,JSON.stringify(t))}
catch(e){console.warn(`Failed to save recent view history:`,e)}
}
,[n]);
let pe=async t=>{if(t.preventDefault(),!(!v||!x||!S||!e)){E(`Sending...`);
try{(await fetch(`${gt}
/inquiries`,{method:`POST`,headers:{"Content-Type":`application/json`}
,body:JSON.stringify({propertyId:e,clientName:x,clientContact:S,question:v}
)}
)).ok?(E(`Question submitted! Agent will respond soon.`),b(``),ee(``),te(``),setTimeout(()=>E(``),5e3)):E(`Failed to submit.`)}
catch{E(`Network error.`)}
}
}
  let handleOpenModal = e => {
    I(e), N(!0)
  };
  let handleWhatsApp = () => {
    if (!n) return;
    let e = `Hi SnapAdda, I am interested in "${n.title}" listed for ${n.price}. Is it still available?`,
      t = ne?.whatsapp || `919999999911`;
    window.open(`https://wa.me/${t}?text=${encodeURIComponent(e)}`, `_blank`)
  };
  let calculateEMI = () => {
    if (!n?.price) return 0;
    let e = parseInt((n.price + ``).replace(/[^0-9]/g, ``), 10);
    if ((n.price + ``).toLowerCase().includes(`crore`) && (e = parseFloat((n.price + ``).replace(/[^0-9.]/g, ``)) * 1e7), (n.price + ``).toLowerCase().includes(`lakh`) && (e = parseFloat((n.price + ``).replace(/[^0-9.]/g, ``)) * 1e5), isNaN(e)) return 0;
    let t = e * D / 100,
      r = O / 12 / 100,
      i = j * 12;
    return Math.round(t * r * (1 + r) ** +i / ((1 + r) ** +i - 1))
  };
  let getYouTubeEmbed = e => {
    if (!e) return ``;
    try {
      if (e.includes(`youtube.com`) || e.includes(`youtu.be`)) {
        let t = ``;
        e.includes(`v=`) ? t = e.split(`v=`)[1] : e.includes(`youtu.be/`) && (t = e.split(`youtu.be/`)[1]);
        let n = t.indexOf(`&`);
        return n !== -1 && (t = t.substring(0, n)), `https://www.youtube.com/embed/${t}?rel=0`
      }
      return e
    } catch {
      return ``
    }
  };
if(i)return(0,X.jsxs)(`div`,{className:`property-loading-screen`,children:[(0,X.jsx)(`div`,{className:`loader`}
),(0,X.jsx)(`p`,{children:`Loading property details...`}
)]}
);
if(!n)return(0,X.jsxs)(`div`,{className:`container`,style:{paddingTop:`120px`,textAlign:`center`,minHeight:`60vh`}
,children:[(0,X.jsx)(`h2`,{children:`Property Not Found`}
),(0,X.jsx)($,{onClick:()=>t(`/`),style:{marginTop:`20px`}
,children:`Return Home`}
)]}
);
let ge=n.approvalAuthority||n.approval,_e=[{id:`overview`,label:`Overview`}
,{id:`description`,label:`Details`}
,{id:`amenities`,label:`Amenities`}
,{id:`emi`,label:`EMI Calculator`}
,{id:`qna`,label:`Q&A`}
];
return(0,X.jsxs)(a.div,{className:`property-details-page`,initial:{opacity:0}
,animate:{opacity:1}
,transition:{duration:.4}
,children:[(0,X.jsx)(`div`,{className:`pd-topbar glass`,children:(0,X.jsxs)(`div`,{className:`container pd-topbar-inner`,children:[(0,X.jsxs)(`button`,{className:`back-button`,onClick:()=>t(`/`),"aria-label":`Go back`,children:[(0,X.jsx)(G,{size:20}
),` Back`]}
),(0,X.jsxs)(`div`,{className:`pd-topbar-actions`,children:[(0,X.jsx)($,{size:`sm`,className:`btn-3d`,onClick:()=>z(`callback`),children:`Callback`}
),(0,X.jsxs)($,{size:`sm`,className:`btn-3d-emerald`,style:{backgroundColor:`#25D366`,borderColor:`#25D366`,color:`white`,border:`none`}
,onClick:he,children:[(0,X.jsx)(le,{size:16}
),` WhatsApp`]}
)]}
)]}
)}
),(0,X.jsxs)(`section`,{className:`pd-gallery`,children:[(0,X.jsxs)(`div`,{className:`pd-gallery-tabs`,children:[(0,X.jsxs)(`button`,{className:`media-tab ${s===`photos`?`active`:``}
`,onClick:()=>c(`photos`),children:[(0,X.jsx)(ae,{size:16}
),` Photos`]}
),(0,X.jsxs)(`button`,{className:`media-tab ${s===`video`?`active`:``}
`,onClick:()=>c(`video`),children:[(0,X.jsx)(we,{size:16}
),` Virtual Tour`]}
)]}
),s===`photos`?(0,X.jsxs)(`div`,{className:`pd-gallery-grid`,children:[(0,X.jsx)(`div`,{className:`pd-main-image`,children:L[0]?(0,X.jsx)(`img`,{src:L[0],alt:n.title}
):(0,X.jsx)(`div`,{className:`property-no-image`,children:(0,X.jsx)(se,{size:48}
)}
)}
),(0,X.jsxs)(`div`,{className:`pd-side-images`,children:[L.slice(1,3).map((e,t)=>(0,X.jsx)(`div`,{className:`pd-side-img`,children:(0,X.jsx)(`img`,{src:e,alt:`View ${t+2}
`}
)}
,t)),L.length<3&&(0,X.jsx)(`div`,{className:`pd-side-img pd-placeholder`,children:(0,X.jsx)(se,{size:32,opacity:.3}
)}
)]}
)]}
):(0,X.jsx)(`div`,{className:`pd-video-frame`,children:n.videoUrl?(0,X.jsx)(`iframe`,{src:V(n.videoUrl),title:`Virtual Tour`,frameBorder:`0`,allow:`accelerometer;
 autoplay;
 clipboard-write;
 encrypted-media;
 gyroscope;
 picture-in-picture`,allowFullScreen:!0}
):(0,X.jsxs)(`div`,{className:`pd-video-empty`,children:[(0,X.jsx)(we,{size:48}
),(0,X.jsx)(`p`,{children:`Virtual Tour Coming Soon`}
)]}
)}
)]}
),(0,X.jsx)(`section`,{className:`pd-title-bar`,children:(0,X.jsx)(`div`,{className:`container`,children:(0,X.jsxs)(`div`,{className:`pd-title-row`,children:[(0,X.jsxs)(`div`,{className:`pd-title-left`,children:[(0,X.jsxs)(`div`,{className:`pd-badges`,children:[n.isVerified&&(0,X.jsxs)(`span`,{className:`pd-badge pd-badge-green`,children:[(0,X.jsx)(H,{size:13}
),` Verified`]}
),n.type&&(0,X.jsx)(`span`,{className:`pd-badge pd-badge-gold`,children:n.type}
),n.condition&&n.condition!==`N/A`&&(0,X.jsx)(`span`,{className:`pd-badge pd-badge-muted`,children:n.condition}
),n.listerType&&(0,X.jsxs)(`span`,{className:`pd-badge`,style:{color:n.listerType===`Verified Builder`?`var(--accent-gold)`:`var(--text-muted)`}
,children:[n.listerType===`Verified Builder`?(0,X.jsx)(ce,{size:12}
):(0,X.jsx)(F,{size:12}
),` `,n.listerType]}
)]}
),(0,X.jsx)(`h1`,{className:`pd-title`,children:n.title}
),(0,X.jsxs)(`p`,{className:`pd-location`,children:[(0,X.jsx)(k,{size:16}
),` `,n.location]}
)]}
),(0,X.jsx)(`div`,{className:`pd-price-block`,children:(0,X.jsx)(`div`,{className:`pd-price`,children:n.price}
)}
)]}
)}
)}
),(0,X.jsx)(`div`,{className:`pd-tab-nav-wrapper`,children:(0,X.jsx)(`div`,{className:`container`,children:(0,X.jsx)(`div`,{className:`pd-tab-nav`,children:_e.map(e=>(0,X.jsx)(`a`,{href:`#${e.id}
`,className:`pd-tab ${l===e.id?`active`:``}
`,onClick:()=>u(e.id),children:e.label}
,e.id))}
)}
)}
),(0,X.jsxs)(`div`,{className:`container pd-content-grid`,children:[(0,X.jsxs)(`div`,{className:`pd-main`,children:[(0,X.jsxs)(`section`,{id:`overview`,className:`pd-section`,children:[(0,X.jsx)(`h2`,{children:`Property Overview`}
),(0,X.jsxs)(`div`,{className:`pd-overview-cards`,children:[n.type!==`Agriculture`&&(0,X.jsxs)(X.Fragment,{children:[(0,X.jsxs)(`div`,{className:`pd-ov-card`,children:[(0,X.jsx)(y,{size:22,className:`text-gold`}
),(0,X.jsxs)(`div`,{children:[(0,X.jsx)(`span`,{className:`pd-ov-val`,children:n.beds}
),(0,X.jsx)(`span`,{className:`pd-ov-label`,children:`Bedrooms`}
)]}
)]}
),(0,X.jsxs)(`div`,{className:`pd-ov-card`,children:[(0,X.jsx)(fe,{size:22,className:`text-gold`}
),(0,X.jsxs)(`div`,{children:[(0,X.jsx)(`span`,{className:`pd-ov-val`,children:n.baths}
),(0,X.jsx)(`span`,{className:`pd-ov-label`,children:`Bathrooms`}
)]}
)]}
)]}
),(0,X.jsxs)(`div`,{className:`pd-ov-card`,children:[(0,X.jsx)(Ce,{size:22,className:`text-gold`}
),(0,X.jsxs)(`div`,{children:[(0,X.jsx)(`span`,{className:`pd-ov-val`,children:n.areaSize||n.sqft}
),(0,X.jsx)(`span`,{className:`pd-ov-label`,children:n.measurementUnit||`Sq.Ft`}
)]}
)]}
),n.facing&&n.facing!==`Any`&&(0,X.jsxs)(`div`,{className:`pd-ov-card`,children:[(0,X.jsx)(T,{size:22,className:`text-gold`}
),(0,X.jsxs)(`div`,{children:[(0,X.jsx)(`span`,{className:`pd-ov-val`,children:n.facing}
),(0,X.jsx)(`span`,{className:`pd-ov-label`,children:`Facing`}
)]}
)]}
),ge&&ge!==`N/A`&&(0,X.jsxs)(`div`,{className:`pd-ov-card`,children:[(0,X.jsx)(H,{size:22,style:{color:`var(--success)`}
}
),(0,X.jsxs)(`div`,{children:[(0,X.jsx)(`span`,{className:`pd-ov-val`,children:ge}
),(0,X.jsx)(`span`,{className:`pd-ov-label`,children:`Approval`}
)]}
)]}
)]}
)]}
),(0,X.jsxs)(`section`,{id:`description`,className:`pd-section`,children:[(0,X.jsx)(`h2`,{children:`About this Property`}
),(0,X.jsx)(`p`,{className:`pd-description`,children:R(n)}
)]}
),n.customFeatures&&n.customFeatures.length>0&&(0,X.jsxs)(`section`,{className:`pd-section`,children:[(0,X.jsx)(`h2`,{children:`Key Highlights`}
),(0,X.jsx)(`div`,{className:`pd-highlights-grid`,children:n.customFeatures.map((e,t)=>(0,X.jsxs)(`div`,{className:`pd-highlight-card`,children:[(0,X.jsx)(`div`,{className:`pd-hl-label`,children:e.label}
),(0,X.jsx)(`div`,{className:`pd-hl-value`,children:e.value}
)]}
,t))}
)]}
),(0,X.jsxs)(`section`,{id:`amenities`,className:`pd-section`,children:[(0,X.jsx)(`h2`,{children:`Amenities & Features`}
),(0,X.jsx)(`div`,{className:`pd-amenities-grid`,children:(n.amenities||[`Power Backup`,`Water Supply`,`Clear Title`,`Vastu Compliant`]).map((e,t)=>(0,X.jsxs)(`div`,{className:`pd-amenity`,children:[(0,X.jsx)(w,{size:16,className:`text-gold`}
),(0,X.jsx)(`span`,{children:e}
)]}
,t))}
)]}
),(0,X.jsxs)(`section`,{id:`emi`,className:`pd-section`,children:[(0,X.jsxs)(`h2`,{children:[(0,X.jsx)(de,{size:22,className:`text-gold`}
),` EMI Calculator`]}
),(0,X.jsxs)(`div`,{className:`pd-emi-grid`,children:[(0,X.jsxs)(`div`,{className:`pd-emi-sliders`,children:[(0,X.jsxs)(`div`,{className:`pd-emi-slider-row`,children:[(0,X.jsx)(`label`,{children:`Loan Amount`}
),(0,X.jsxs)(`span`,{children:[D,`%`]}
),(0,X.jsx)(`input`,{type:`range`,min:`10`,max:`90`,value:D,onChange:e=>oe(parseInt(e.target.value))}
)]}
),(0,X.jsxs)(`div`,{className:`pd-emi-slider-row`,children:[(0,X.jsx)(`label`,{children:`Interest Rate`}
),(0,X.jsxs)(`span`,{children:[O,`%`]}
),(0,X.jsx)(`input`,{type:`range`,min:`6`,max:`15`,step:`0.1`,value:O,onChange:e=>A(parseFloat(e.target.value))}
)]}
),(0,X.jsxs)(`div`,{className:`pd-emi-slider-row`,children:[(0,X.jsx)(`label`,{children:`Tenure`}
),(0,X.jsxs)(`span`,{children:[j,` years`]}
),(0,X.jsx)(`input`,{type:`range`,min:`5`,max:`30`,value:j,onChange:e=>M(parseInt(e.target.value))}
)]}
)]}
),(0,X.jsxs)(`div`,{className:`pd-emi-result glass-heavy tilt-3d`,style:{padding:`2rem`,border:`1px solid var(--royal-gold)`,borderRadius:`16px`}
,children:[(0,X.jsx)(`p`,{children:`Estimated Monthly EMI`}
),(0,X.jsxs)(`h3`,{className:`text-royal-gold`,children:[`₹ `,B().toLocaleString(`en-IN`)]}
),(0,X.jsx)(`small`,{children:`*Estimate only. Terms vary by bank.`}
)]}
)]}
)]}
),(0,X.jsxs)(`section`,{id:`qna`,className:`pd-section`,children:[(0,X.jsxs)(`h2`,{children:[(0,X.jsx)(Ee,{size:22,className:`text-gold`}
),` Property Q&A`]}
),(0,X.jsx)(`div`,{className:`pd-qna-list`,children:g.length===0?(0,X.jsx)(`p`,{className:`text-muted`,style:{fontStyle:`italic`}
,children:`No questions yet. Be the first to ask!`}
):g.map(e=>(0,X.jsxs)(`div`,{className:`pd-qna-item`,children:[(0,X.jsxs)(`div`,{className:`pd-qna-q`,children:[`Q: `,e.question]}
),(0,X.jsxs)(`div`,{className:`pd-qna-a`,children:[(0,X.jsx)(`span`,{className:`text-gold`,children:`A:`}
),` `,e.answer]}
)]}
,e._id))}
),(0,X.jsxs)(`div`,{className:`pd-ask-form glass-heavy tilt-3d`,style:{padding:`2rem`,borderRadius:`16px`}
,children:[(0,X.jsx)(`h3`,{children:`Ask the Agent`}
),(0,X.jsxs)(`form`,{onSubmit:pe,children:[(0,X.jsxs)(`div`,{className:`pd-ask-row`,children:[(0,X.jsx)(`input`,{type:`text`,placeholder:`Your Name`,value:x,onChange:e=>ee(e.target.value),required:!0}
),(0,X.jsx)(`input`,{type:`text`,placeholder:`Phone or Email`,value:S,onChange:e=>te(e.target.value),required:!0}
)]}
),(0,X.jsx)(`textarea`,{placeholder:`What do you want to know?`,value:v,onChange:e=>b(e.target.value),rows:3,required:!0}
),(0,X.jsxs)(`div`,{className:`pd-ask-footer`,children:[(0,X.jsx)(`span`,{style:{color:C.includes(`submitted`)?`var(--success)`:`var(--text-muted)`,fontSize:`0.85rem`}
,children:C}
),(0,X.jsxs)($,{type:`submit`,className:`btn-3d`,children:[(0,X.jsx)(me,{size:14}
),` Submit`]}
)]}
)]}
)]}
)]}
)]}
),(0,X.jsx)(`aside`,{className:`pd-sidebar`,children:(0,X.jsxs)(`div`,{className:`pd-contact-card glass-heavy tilt-3d`,style:{padding:`2rem`,borderRadius:`16px`}
,children:[(0,X.jsx)(`h3`,{children:`Interested?`}
),(0,X.jsx)(`p`,{className:`text-muted`,children:`Connect directly with the owner or agent.`}
),(0,X.jsxs)(`div`,{className:`pd-contact-actions`,children:[(0,X.jsx)($,{size:`lg`,fullWidth:!0,className:`btn-3d`,onClick:()=>z(`callback`),children:`Request Callback`}
),(0,X.jsx)(`div`,{className:`pd-divider`,children:`or`}
),(0,X.jsxs)($,{size:`lg`,fullWidth:!0,className:`btn-3d-emerald`,style:{backgroundColor:`#25D366`,borderColor:`#25D366`,color:`white`,border:`none`}
,onClick:he,children:[(0,X.jsx)(le,{size:18}
),` WhatsApp`]}
)]}
),(0,X.jsxs)(`div`,{className:`pd-trust-badges`,children:[(0,X.jsxs)(`div`,{className:`pd-trust`,children:[(0,X.jsx)(H,{size:15,className:`text-gold`}
),` Verified Listing`]}
),(0,X.jsxs)(`div`,{className:`pd-trust`,children:[(0,X.jsx)(w,{size:15,className:`text-gold`}
),` SnapAdda Guaranteed`]}
)]}
)]}
)}
)]}
),f.length>0&&(0,X.jsx)(`section`,{className:`pd-similar-section`,children:(0,X.jsxs)(`div`,{className:`container`,children:[(0,X.jsxs)(`div`,{className:`section-title-row`,children:[(0,X.jsx)(`h2`,{children:`Similar Properties`}
),(0,X.jsxs)(m,{to:`/`,style:{display:`flex`,alignItems:`center`,gap:`4px`,color:`var(--accent-gold)`,fontSize:`0.9rem`}
,children:[`View All `,(0,X.jsx)(re,{size:16}
)]}
)]}
),(0,X.jsx)(`div`,{className:`pd-similar-grid`,children:f.map(e=>(0,X.jsx)(qe,{...e,approval:e.approvalAuthority||e.approval,onTriggerLead:z}
,e._id||e.id))}
)]}
)}
),(0,X.jsxs)(`div`,{className:`mobile-sticky-footer glass-heavy`,style:{padding:`1rem`,borderTop:`1px solid var(--border-light)`}
,children:[(0,X.jsx)($,{size:`lg`,className:`btn-3d`,style:{flex:1,height:`48px`}
,onClick:()=>z(`callback`),children:`Callback`}
),(0,X.jsx)($,{size:`lg`,className:`btn-3d-emerald`,style:{flex:1,height:`48px`,backgroundColor:`#25D366`,borderColor:`#25D366`,color:`white`,border:`none`}
,onClick:he,children:`WhatsApp`}
)]}
),(0,X.jsx)(Je,{isOpen:ue,onClose:()=>N(!1),type:P}
)]}
)}
,vt=J({apiKey:`AIzaSyAQX18dK6_wumA5bKEhPnKeckOIfC-SOR0`,authDomain:`snapadda-7a6e6.firebaseapp.com`,projectId:`snapadda-7a6e6`,storageBucket:`snapadda-7a6e6.firebasestorage.app`,messagingSenderId:`227172321059`,appId:`1:227172321059:web:7fe7097f7937739c0f6e96`,measurementId:`G-EPKYKL1SPN`}
),yt=ke(vt),bt=new je;
Me(vt),typeof window<`u`&&Oe(vt);
var xt=`http://localhost:5000/api`,St=()=>{let e=d(),{login:t}
=Z(),[n,r]=(0,Y.useState)(!1),[i,o]=(0,Y.useState)(null);
return(0,X.jsxs)(`div`,{className:`login-page`,children:[(0,X.jsx)(`div`,{className:`login-spline-bg`}
),(0,X.jsxs)(a.div,{className:`login-container glass-heavy tilt-3d`,style:{transformStyle:`preserve-3d`,padding:`2.5rem`,borderRadius:`16px`,margin:`1rem`}
,initial:{opacity:0,y:30}
,animate:{opacity:1,y:0}
,transition:{duration:.8,ease:`easeOut`}
,children:[(0,X.jsxs)(`div`,{className:`login-header`,children:[(0,X.jsx)(`div`,{className:`login-logo`,children:(0,X.jsx)(Ke,{size:42,showText:!0}
)}
),(0,X.jsx)(`h1`,{children:`Welcome to SnapAdda`}
),(0,X.jsx)(`p`,{children:`Securely sign in to save favorites, get personalized property matches, and explore verified listings.`}
),(0,X.jsx)(`div`,{className:`login-info`,children:(0,X.jsx)(`p`,{children:`Fast access with Google authentication and an option to browse as a guest.`}
)}
)]}
),(0,X.jsxs)(`div`,{className:`login-actions`,style:{minHeight:`180px`}
,children:[i&&(0,X.jsx)(`div`,{style:{color:`var(--error)`,background:`rgba(231, 76, 60, 0.1)`,padding:`10px 15px`,borderRadius:`8px`,fontSize:`0.85rem`,marginBottom:`15px`,textAlign:`center`}
,children:i}
),(0,X.jsx)(`div`,{className:`google-btn-wrapper`,children:(0,X.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`}
,children:(0,X.jsxs)(`button`,{onClick:async()=>{r(!0),o(null);
try{let n=(await Ae(yt,bt)).user,r=await n.getIdToken(),i={email:n.email,name:n.displayName,picture:n.photoURL,sub:n.uid}
,a=await fetch(`${xt}
/users/auth`,{method:`POST`,headers:{"Content-Type":`application/json`}
,body:JSON.stringify({token:r,payload:i}
)}
);
if(!a.ok)throw Error(`Server authentication failed: ${a.statusText}
`);
let o=await a.json();
o.user&&(t(o.user),o.user.onboardingCompleted?e(`/`):e(`/onboarding`))}
catch(e){console.error(`Firebase Login Error Details:`,{code:e.code,message:e.message,stack:e.stack}
),e.code===`auth/popup-blocked`?o(`Auth popup was blocked by your browser. Please allow popups for this site.`):e.code===`auth/cancelled-popup-request`||o(e.message?.includes(`Failed to fetch`)?`Network Error: Could not connect to SnapAdda Server. Please check your internet or retry later.`:e.message||`Login failed. Please verify your internet connection.`)}
finally{r(!1)}
}
,disabled:n,className:`firebase-google-btn`,style:{display:`flex`,alignItems:`center`,gap:`12px`,backgroundColor:`white`,color:`#111`,padding:`12px 24px`,borderRadius:`12px`,fontWeight:`700`,border:`none`,cursor:n?`wait`:`pointer`,boxShadow:`0 4px 12px rgba(0,0,0,0.1)`,transition:`all 0.2s ease`,opacity:n?.7:1}
,children:[n?(0,X.jsx)(`span`,{className:`spinner`,style:{border:`2px solid #ddd`,borderTop:`2px solid #000`,borderRadius:`50%`,width:`16px`,height:`16px`,animation:`spin 1s linear infinite`}
}
):(0,X.jsx)(`img`,{src:`https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg`,alt:`Google`,style:{width:`18px`}
}
),n?`Connecting...`:`Continue with Google`]}
)}
)}
),(0,X.jsx)(`div`,{className:`divider`,children:(0,X.jsx)(`span`,{children:`Or`}
)}
),(0,X.jsx)(`button`,{onClick:()=>{t({_id:`guest_`+Date.now(),name:`Guest User`,email:`guest@snapadda.com`,avatar:`https://ui-avatars.com/api/?name=Guest&background=111&color=d4af37`,onboardingCompleted:!0,role:`client`,favorites:[]}
),e(`/`)}
,style:{width:`100%`,padding:`12px`,background:`transparent`,border:`1px solid var(--border-color)`,color:`var(--text-secondary)`,borderRadius:`12px`,cursor:`pointer`,fontWeight:500,transition:`all 0.3s ease`,marginTop:`5px`}
,onMouseOver:e=>{e.currentTarget.style.color=`var(--text-primary)`,e.currentTarget.style.borderColor=`var(--accent-gold)`}
,onMouseOut:e=>{e.currentTarget.style.color=`var(--text-secondary)`,e.currentTarget.style.borderColor=`var(--border-color)`}
,className:`btn-3d`,children:`Skip & Browse as Guest`}
)]}
),(0,X.jsxs)(`div`,{className:`login-footer`,children:[(0,X.jsxs)(`p`,{children:[(0,X.jsx)(H,{size:16}
),` Secure Authentication via Google`]}
),(0,X.jsx)(`p`,{children:`By signing in, you agree to our Terms of Service & Privacy Policy.`}
)]}
)]}
)]}
)}
,Ct=`http://localhost:5000/api`,wt=[{id:`phone`,key:`phone`,title:`What is your phone number?`,type:`phone`,options:[],helper:`Enter the number we can reach you on for property updates.`,enabled:!0}
,{id:`whatsapp`,key:`whatsapp`,title:`WhatsApp number`,type:`phone`,options:[],helper:`Use the number where you want WhatsApp alerts and messages.`,enabled:!0}
,{id:`propertyType`,key:`propertyType`,title:`I am looking for`,type:`options`,options:[`Apartment`,`Villa`,`Agriculture Land`,`Commercial`,`Plot`],helper:`Choose the property type you want most.`,enabled:!0}
,{id:`budget`,key:`budget`,title:`My budget is`,type:`options`,options:[`Under 50 Lakhs`,`50L - 1 Crore`,`1Cr - 5 Crore`,`5 Crore+`],helper:`Pick the budget range that fits your plan.`,enabled:!0}
,{id:`purpose`,key:`purpose`,title:`Preferred purpose`,type:`options`,options:[`Personal Use`,`Investment`,`Agriculture`],helper:`What do you need this property for?`,enabled:!0}
,{id:`additionalNotes`,key:`additionalNotes`,title:`Tell us more`,type:`text`,options:[],helper:`Share any extra details or property preferences.`,enabled:!0}
],Tt=()=>{let e=d(),{user:t,completeOnboarding:n}
=Z(),[r,o]=(0,Y.useState)(1),[s,c]=(0,Y.useState)(wt),[l,u]=(0,Y.useState)({phone:``,whatsapp:``,propertyType:``,budget:``,purpose:``,additionalNotes:``}
),[f,p]=(0,Y.useState)(1),[m,h]=(0,Y.useState)(!1);
(0,Y.useEffect)(()=>{Be(`onboarding_questions`).then(e=>{Array.isArray(e)&&e.length>0&&c(e)}
).catch(()=>{}
)}
,[]);
let g=s.filter(e=>e.enabled),_=g[r-1]||g[0]||wt[0],v=Math.max(g.length,1),y=async()=>{r<v?(p(1),o(e=>e+1)):await b()}
,b=async()=>{if(t?._id){h(!0);
try{let r={propertyType:l.propertyType||``,budget:l.budget||``,purpose:l.purpose||``,additionalNotes:l.additionalNotes||``}
,i=Object.entries(l).reduce((e,[t,n])=>([`propertyType`,`budget`,`purpose`,`additionalNotes`].includes(t)||(e[t]=n),e),{}
);
(await fetch(`${Ct}
/users/${t._id}
/preferences`,{method:`POST`,headers:{"Content-Type":`application/json`}
,body:JSON.stringify({...r,extraAnswers:i}
)}
)).ok?(n(),e(`/`)):alert(`Failed to save preferences. Please try again.`)}
catch(e){console.error(e),alert(`An error occurred.`)}
finally{h(!1)}
}
}
,x=(e,t)=>{u(n=>({...n,[e]:t}
)),_?.type===`options`&&r<v&&setTimeout(()=>{p(1),o(e=>Math.min(e+1,v))}
,250)}
,ee=()=>{p(-1),o(e=>Math.max(e-1,1))}
,S=r/v*100;
return(0,X.jsxs)(`div`,{className:`onboarding-page`,children:[(0,X.jsxs)(`div`,{className:`onboarding-nav`,children:[(0,X.jsx)(`div`,{className:`brand`,children:(0,X.jsx)(Ke,{size:42,showText:!0}
)}
),(0,X.jsxs)(`div`,{className:`user-pill`,children:[t?.avatar&&(0,X.jsx)(`img`,{src:t.avatar,alt:`Profile`,className:`avatar`}
),(0,X.jsx)(`span`,{children:t?.name||`Welcome`}
)]}
)]}
),(0,X.jsx)(`div`,{className:`progress-bar-container`,children:(0,X.jsx)(`div`,{className:`progress-bar`,style:{width:`${S}
%`}
}
)}
),(0,X.jsx)(`div`,{className:`onboarding-container`,children:(0,X.jsx)(i,{mode:`wait`,children:(0,X.jsxs)(a.div,{initial:{opacity:0,x:f>0?40:-40,scale:.98}
,animate:{opacity:1,x:0,scale:1}
,exit:{opacity:0,x:f>0?-40:40,scale:.98}
,transition:{duration:.35,ease:`easeOut`}
,className:`step-content glass-heavy tilt-3d`,style:{padding:`2.5rem`,borderRadius:`18px`,margin:`auto`,maxWidth:`640px`,minHeight:`420px`,transformStyle:`preserve-3d`}
,children:[(0,X.jsxs)(`div`,{className:`step-header`,children:[(0,X.jsxs)(`span`,{className:`step-badge`,children:[`Step `,r,` of `,v]}
),(0,X.jsx)(`h2`,{className:`step-title`,children:_.title}
),(0,X.jsx)(`p`,{className:`step-description`,children:_.helper}
)]}
),(0,X.jsxs)(`div`,{className:`options-grid`,children:[_.type===`options`&&_.options.map(e=>(0,X.jsxs)(`button`,{className:`option-btn tilt-3d ${l[_.key]===e?`selected`:``}
`,onClick:()=>x(_.key,e),style:{transformStyle:`preserve-3d`}
,children:[(0,X.jsx)(`span`,{children:e}
),l[_.key]===e&&(0,X.jsx)(N,{size:18,className:`text-gold check-icon`}
)]}
,e)),(_.type===`text`||_.type===`phone`)&&(0,X.jsx)(`div`,{className:`textarea-container`,children:_.type===`text`?(0,X.jsx)(`textarea`,{value:l[_.key]||``,onChange:e=>u(t=>({...t,[_.key]:e.target.value}
)),placeholder:`E.g. I need a corner plot with east facing... (Optional)`,rows:6}
):(0,X.jsx)(`input`,{type:`tel`,value:l[_.key]||``,onChange:e=>u(t=>({...t,[_.key]:e.target.value}
)),placeholder:_.key===`phone`?`Enter your phone number`:`Enter your WhatsApp number`,className:`onboarding-input`}
)}
)]}
),(0,X.jsxs)(`div`,{className:`step-actions`,children:[r>1&&(0,X.jsx)(`button`,{className:`back-btn`,onClick:ee,children:`Back`}
),(0,X.jsx)($,{className:`btn-3d`,onClick:y,disabled:m,style:{marginLeft:r>1?`auto`:`0`}
,children:r===v?m?`Saving...`:`Finish`:`Continue`}
)]}
)]}
,_.key)}
)}
)]});
};
const Et = () => {
  let e = _(),
    t = [{
      path: `/dashboard`,
      label: `Explore`,
      icon: P
    }, {
      path: `/dashboard/favorites`,
      label: `Saved`,
      icon: E
    }, {
      path: `/dashboard/profile`,
      label: `Profile`,
      icon: F
    }];
return(0,X.jsxs)(`div`,{className:`client-dashboard`,children:[(0,X.jsx)(`main`,{className:`dashboard-content`,children:(0,X.jsx)(i,{mode:`wait`,children:(0,X.jsx)(a.div,{initial:{opacity:0,y:10}
,animate:{opacity:1,y:0}
,exit:{opacity:0,y:-10}
,transition:{duration:.3}
,className:`page-wrapper`,children:(0,X.jsx)(f,{}
)}
,e.pathname)}
)}
),(0,X.jsx)(`nav`,{className:`bottom-nav`,children:t.map(t=>{let n=t.icon,r=e.pathname===t.path;
return(0,X.jsxs)(m,{to:t.path,className:`nav-item ${r?`active`:``}
`,children:[(0,X.jsxs)(`div`,{className:`icon-wrapper`,children:[(0,X.jsx)(n,{size:24}
),r&&(0,X.jsx)(a.div,{className:`active-indicator`,layoutId:`nav-indicator`,transition:{type:`spring`,stiffness:300,damping:30}
}
)]}
),(0,X.jsx)(`span`,{children:t.label}
)]}
,t.path)})}
)]})
};
const Dt = `http://localhost:5000/api`;
const Ot = () => {
  let [e, t] = (0, Y.useState)([]), [n, r] = (0, Y.useState)(!0), [i, a] = (0, Y.useState)(``), [o, s] = (0, Y.useState)(`all`), c = [{
    id: `all`,
    label: `All`
  }, {
    id: `Apartment`,
    label: `Apartments`
  }, {
    id: `Villa`,
    label: `Villas`
  }, {
    id: `Plot`,
    label: `Plots`
  }, {
    id: `Agriculture`,
    label: `Agriculture`
  }];
(0,Y.useEffect)(()=>{l()}
,[o,i]),(0,Y.useEffect)(()=>(window.dispatchEvent(new CustomEvent(`snap_seo_update`,{detail:{title:`Explore Premium Properties in Andhra Pradesh | SnapAdda`}
}
)),()=>{window.dispatchEvent(new CustomEvent(`snap_seo_update`,{detail:null}
))}
),[]);
let l=async()=>{try{let e=new URLSearchParams;
o!==`all`&&e.append(`type`,o),i&&e.append(`search`,i);
let n=await(await fetch(`${Dt}
/properties?${e.toString()}
`)).json();
n.status===`success`&&t(n.data)}
catch(e){console.error(e)}
finally{r(!1)}
}
;
return(0,X.jsxs)(`div`,{className:`explore-page`,children:[(0,X.jsxs)(`header`,{className:`flex justify-between items-center mb-6`,children:[(0,X.jsxs)(`div`,{children:[(0,X.jsx)(`h1`,{className:`dashboard-title`,children:`Explore Amaravati`}
),(0,X.jsx)(`p`,{className:`dashboard-subtitle`,children:`Find your next premium property.`}
)]}
),(0,X.jsxs)(`div`,{className:`flex gap-2 bg-secondary p-1 rounded-xl border border-subtle`,children:[(0,X.jsx)(`button`,{className:`p-2 rounded-lg bg-tertiary text-accent-gold`,children:(0,X.jsx)(b,{size:20}
)}
),(0,X.jsx)(`button`,{className:`p-2 rounded-lg text-muted-foreground`,children:(0,X.jsx)(Te,{size:20}
)}
)]}
)]}
),(0,X.jsxs)(`div`,{className:`search-bar-wrapper mb-6 relative`,children:[(0,X.jsx)(P,{className:`absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground`,size:20}
),(0,X.jsx)(`input`,{type:`text`,placeholder:`Search by location, title, or type...`,className:`w-full bg-secondary border border-subtle rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-accent-gold outline-none transition-colors`,value:i,onChange:e=>a(e.target.value)}
)]}
),(0,X.jsxs)(`div`,{className:`filter-scroll flex gap-3 overflow-x-auto pb-4 mb-4 no-scrollbar`,children:[c.map(e=>(0,X.jsx)(`button`,{onClick:()=>s(e.id),className:`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${o===e.id?`bg-accent-gold text-bg-primary border-accent-gold`:`bg-tertiary text-muted-foreground border-subtle hover:border-accent-gold-dim`}
`,children:e.label}
,e.id)),(0,X.jsx)(`button`,{className:`px-4 py-2 bg-tertiary border border-subtle rounded-full text-muted-foreground`,children:(0,X.jsx)(pe,{size:18}
)}
)]}
),n?(0,X.jsx)(`div`,{className:`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`,children:[1,2,3,4,5,6].map(e=>(0,X.jsx)(`div`,{className:`h-64 bg-secondary animate-pulse rounded-2xl`}
,e))}
):e.length===0?(0,X.jsx)(`div`,{className:`text-center p-20 opacity-50`,children:(0,X.jsx)(`p`,{children:`No properties found matching your criteria.`}
)}
):(0,X.jsx)(`div`,{className:`properties-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`,children:e.map(e=>(0,X.jsx)(`div`,{children:(0,X.jsx)(qe,{...e}
)}
,e._id))}
)]}
)}
,kt=`http://localhost:5000/api`,At=()=>{let{user:e}
=Z(),[t,n]=(0,Y.useState)([]),[r,i]=(0,Y.useState)(!0);
(0,Y.useEffect)(()=>{e?._id?a():i(!1)}
,[e]);
let a=async()=>{if(e?._id)try{let t=await(await fetch(`${kt}
/users/${e._id}
/favorites`)).json();
t.status===`success`&&n(t.data)}
catch(e){console.error(e)}
finally{i(!1)}
}
;
return r?(0,X.jsx)(`div`,{className:`flex items-center justify-center p-20`,children:(0,X.jsx)(V,{className:`animate-spin text-accent-gold`,size:40}
)}
):(0,X.jsxs)(`div`,{className:`favorites-page`,children:[(0,X.jsx)(`h1`,{className:`dashboard-title`,children:`Saved Properties`}
),(0,X.jsx)(`p`,{className:`dashboard-subtitle`,children:`Everything you've bookmarked for later.`}
),t.length===0?(0,X.jsxs)(`div`,{className:`empty-state text-center p-20`,children:[(0,X.jsx)(E,{size:64,className:`text-muted-foreground mx-auto mb-4 opacity-20`}
),(0,X.jsx)(`h3`,{className:`text-xl font-medium mb-2`,children:`No Saved Properties`}
),(0,X.jsx)(`p`,{className:`text-muted-foreground mb-6`,children:`Start exploring to find your dream home!`}
),(0,X.jsx)(`button`,{className:`dev-mock-btn`,style:{width:`auto`,padding:`12px 24px`}
,children:`Explore Now`})
      ]}):null
    ]})
};
const jt = () => {
  let {
    user: e,
    logout: t
  } = Z(), n = () => {
    window.confirm(`Are you sure you want to log out?`) && t()
  }, r = [{
    label: `My Inquiries`,
    icon: H
  }, {
    label: `Saved Regions`,
    icon: k
  }, {
    label: `Notification Settings`,
    icon: z
  }];
return e?(0,X.jsxs)(`div`,{className:`profile-page flex flex-col items-center`,children:[(0,X.jsxs)(`div`,{className:`profile-header w-full flex flex-col items-center mb-8 mt-4`,children:[(0,X.jsx)(`div`,{className:`avatar-wrapper w-24 h-24 rounded-full overflow-hidden border-2 border-accent-gold mb-4 p-1`,children:(0,X.jsx)(`img`,{src:e.avatar||`https://ui-avatars.com/api/?name=${e.name}
&background=c9a84c&color=111`,alt:e.name,className:`w-full h-full rounded-full object-cover`}
)}
),(0,X.jsx)(`h2`,{className:`text-2xl font-bold`,children:e.name}
),(0,X.jsx)(`p`,{className:`text-muted-foreground`,children:e.email}
)]}
),(0,X.jsxs)(`div`,{className:`profile-preferences w-full bg-secondary border border-subtle rounded-2xl p-6 mb-6`,children:[(0,X.jsx)(`h3`,{className:`text-lg font-semibold mb-4 text-accent-gold`,children:`Current Preferences`}
),(0,X.jsxs)(`div`,{className:`space-y-3`,children:[(0,X.jsxs)(`div`,{className:`flex justify-between items-center text-sm border-b border-subtle pb-2`,children:[(0,X.jsx)(`span`,{className:`text-muted-foreground`,children:`Property Type`}
),(0,X.jsx)(`span`,{className:`font-medium`,children:e.preferences?.propertyType||`Not specified`}
)]}
),(0,X.jsxs)(`div`,{className:`flex justify-between items-center text-sm border-b border-subtle pb-2`,children:[(0,X.jsx)(`span`,{className:`text-muted-foreground`,children:`Budget`}
),(0,X.jsx)(`span`,{className:`font-medium`,children:e.preferences?.budget||`Not specified`}
)]}
),(0,X.jsxs)(`div`,{className:`flex justify-between items-center text-sm border-b border-subtle pb-2`,children:[(0,X.jsx)(`span`,{className:`text-muted-foreground`,children:`Purpose`}
),(0,X.jsx)(`span`,{className:`font-medium`,children:e.preferences?.purpose||`Not specified`}
)]}
),(0,X.jsxs)(`div`,{className:`flex flex-col gap-2 pt-2`,children:[(0,X.jsx)(`span`,{className:`text-sm text-muted-foreground`,children:`Looking in`}
),(0,X.jsx)(`div`,{className:`flex flex-wrap gap-2`,children:(e.preferences?.locations?.length??0)>0?e.preferences?.locations.map((e,t)=>(0,X.jsx)(`span`,{className:`bg-muted text-accent-gold text-xs font-semibold px-2 py-1 rounded-lg border border-gold-dim`,children:e}
,t)):(0,X.jsx)(`span`,{className:`text-xs text-muted-foreground opacity-50 italic`,children:`None selected`}
)}
)]}
)]}
)]}
),(0,X.jsxs)(`div`,{className:`settings-menu w-full space-y-2 mb-10`,children:[r.map((e,t)=>{let n=e.icon;
return(0,X.jsxs)(a.button,{whileTap:{scale:.98}
,className:`w-full flex items-center justify-between p-4 bg-tertiary rounded-xl text-sm font-medium border border-subtle hover:border-accent-gold-dim transition-colors`,children:[(0,X.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,X.jsx)(n,{size:18,className:`text-accent-gold`}
),(0,X.jsx)(`span`,{children:e.label}
)]}
),(0,X.jsx)(re,{size:16}
)]}
,t)}
),(0,X.jsxs)(`button`,{onClick:n,className:`w-full flex items-center gap-3 p-4 text-red-400 font-semibold hover:bg-red-900/10 rounded-xl transition-colors mt-6`,children:[(0,X.jsx)(S,{size:18}
),(0,X.jsx)(`span`,{children:`Sign Out`}
)]})
      ]})
    ]}) : null;
};
const Mt = ({
  children: e,
  className: t = ``
}) => {
  let n = c(0),
    r = c(0),
    i = l(n),
    s = o(l(r), [-.5, .5], [`10deg`, `-10deg`]),
    u = o(i, [-.5, .5], [`-10deg`, `10deg`]);
  return (0, X.jsx)(a.div, {
    onMouseMove: e => {
      let t = e.currentTarget.getBoundingClientRect(),
        i = t.width,
        a = t.height,
        o = e.clientX - t.left,
        s = e.clientY - t.top,
        c = o / i - .5,
        l = s / a - .5;
      n.set(c), r.set(l)
    },
    onMouseLeave: () => {
      n.set(0), r.set(0)
    },
    style: {
      rotateY: u,
      rotateX: s,
      transformStyle: `preserve-3d`
    },
    className: `relative h-full w-full rounded-[40px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl transition-all hover:bg-white/[0.05] ${t}`,
    children: (0, X.jsx)(`div`, {
      style: {
        transform: `translateZ(75px)`,
        transformStyle: `preserve-3d`
      },
      className: `h-full w-full`,
      children: e
    })
  })
};
const Nt = () => {
  let e = {
    initial: {
      opacity: 0,
      y: 60
    },
    whileInView: {
      opacity: 1,
      y: 0
    },
    viewport: {
      once: !0
    },
    transition: {
      duration: 1.2,
      ease: `easeOut`
    }
  };
return(0,X.jsxs)(`div`,{className:`min-h-screen bg-[#030306] text-white selection:bg-[#d4af37]/30 overflow-x-hidden`,children:[(0,X.jsxs)(`nav`,{className:`fixed top-0 left-0 right-0 z-[1000] px-8 py-10 flex justify-between items-center bg-gradient-to-b from-black/95 to-transparent`,children:[(0,X.jsxs)(m,{to:`/`,className:`group flex items-center gap-2`,children:[(0,X.jsx)(G,{size:24,className:`text-[#d4af37] group-hover:-translate-x-1 transition-transform`}
),(0,X.jsx)(`span`,{className:`text-[10px] uppercase tracking-[0.6em] font-black text-[#d4af37] opacity-60 group-hover:opacity-100`,children:`Back`}
)]}
),(0,X.jsx)(Ke,{size:32,showText:!0}
)]}
),(0,X.jsxs)(`main`,{className:`pt-52 pb-40 px-6 container max-w-7xl mx-auto`,children:[(0,X.jsxs)(`section`,{className:`text-center mb-48 relative`,children:[(0,X.jsx)(`div`,{className:`absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#d4af37]/5 blur-[150px] rounded-full -z-10 animate-pulse`}
),(0,X.jsxs)(a.div,{initial:{opacity:0,scale:1.1}
,animate:{opacity:1,scale:1}
,transition:{duration:1.8,ease:`easeOut`}
,children:[(0,X.jsx)(`h1`,{className:`font-calligraphy text-9xl md:text-[15rem] gold-shimmer-text mb-4 leading-none filter drop-shadow-[0_0_80px_rgba(212,175,55,0.4)]`,children:`Manoj`}
),(0,X.jsx)(`p`,{className:`font-calligraphy text-4xl md:text-6xl text-[#d4af37] opacity-60 mt-[-10px]`,children:`Master Architect`}
)]}
),(0,X.jsxs)(a.div,{className:`mt-16 max-w-3xl mx-auto text-xl md:text-2xl font-light opacity-60 leading-relaxed px-4`,initial:e.initial,whileInView:e.whileInView,viewport:e.viewport,transition:e.transition,children:[`I engineered `,(0,X.jsx)(`span`,{className:`text-[#d4af37] font-bold`,children:`SnapAdda`}
),` as an ultra-high-velocity real estate discovery platform. Every line of code is optimized for elite property acquisition and administrative precision.`]}
)]}
),(0,X.jsxs)(`section`,{className:`mb-48`,children:[(0,X.jsx)(a.h2,{className:`text-[10px] uppercase tracking-[0.8em] text-center mb-24 opacity-20 font-black`,initial:e.initial,whileInView:e.whileInView,viewport:e.viewport,transition:e.transition,children:`Terminal Infrastructure`}
),(0,X.jsxs)(`div`,{className:`grid lg:grid-cols-3 gap-10`,children:[(0,X.jsx)(a.div,{initial:e.initial,whileInView:e.whileInView,viewport:e.viewport,transition:{...e.transition,delay:.1}
,children:(0,X.jsxs)(Mt,{className:`p-12 overflow-hidden group`,children:[(0,X.jsx)(`div`,{className:`absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl group-hover:bg-[#d4af37]/10 transition-colors`}
),(0,X.jsx)(`div`,{className:`w-16 h-16 rounded-3xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mb-10 shadow-[0_0_20px_rgba(212,175,55,0.1)]`,children:(0,X.jsx)(K,{size:32,className:`text-[#d4af37]`}
)}
),(0,X.jsx)(`h3`,{className:`text-3xl font-bold mb-6 tracking-tight`,children:`Vite-Powered UI`}
),(0,X.jsx)(`p`,{className:`opacity-40 text-lg mb-8 leading-relaxed`,children:`A high-fidelity parallax interaction engine built for absolute fluidity.`}
),(0,X.jsx)(`div`,{className:`space-y-4`,children:[`3D Discovery Matrix`,`Instant Filter Response`,`Optimized Asset Loading`].map(e=>(0,X.jsxs)(`div`,{className:`flex items-center gap-3 text-sm font-medium opacity-80`,children:[(0,X.jsx)(w,{size:18,className:`text-[#d4af37]`}
),` `,e]}
,e))}
)]}
)}
),(0,X.jsx)(a.div,{initial:e.initial,whileInView:e.whileInView,viewport:e.viewport,transition:{...e.transition,delay:.2}
,children:(0,X.jsxs)(Mt,{className:`p-12 overflow-hidden group`,children:[(0,X.jsx)(`div`,{className:`absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl group-hover:bg-[#d4af37]/10 transition-colors`}
),(0,X.jsx)(`div`,{className:`w-16 h-16 rounded-3xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mb-10 shadow-[0_0_20px_rgba(212,175,55,0.1)]`,children:(0,X.jsx)(j,{size:32,className:`text-[#d4af37]`}
)}
),(0,X.jsx)(`h3`,{className:`text-3xl font-bold mb-6 tracking-tight`,children:`API Command`}
),(0,X.jsx)(`p`,{className:`opacity-40 text-lg mb-8 leading-relaxed`,children:`Secure Node.js orchestration handling complex data lead pipelines.`}
),(0,X.jsx)(`div`,{className:`space-y-4`,children:[`JWT Encryption Layer`,`Dynamic Lead Pipeline`,`Mongo Scalability`].map(e=>(0,X.jsxs)(`div`,{className:`flex items-center gap-3 text-sm font-medium opacity-80`,children:[(0,X.jsx)(oe,{size:18,className:`text-[#d4af37]`}
),` `,e]}
,e))}
)]}
)}
),(0,X.jsx)(a.div,{initial:e.initial,whileInView:e.whileInView,viewport:e.viewport,transition:{...e.transition,delay:.3}
,children:(0,X.jsxs)(Mt,{className:`p-12 overflow-hidden group`,children:[(0,X.jsx)(`div`,{className:`absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl group-hover:bg-[#d4af37]/10 transition-colors`}
),(0,X.jsx)(`div`,{className:`w-16 h-16 rounded-3xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mb-10 shadow-[0_0_20px_rgba(212,175,55,0.1)]`,children:(0,X.jsx)(B,{size:32,className:`text-[#d4af37]`}
)}
),(0,X.jsx)(`h3`,{className:`text-3xl font-bold mb-6 tracking-tight`,children:`Global CMS`}
),(0,X.jsx)(`p`,{className:`opacity-40 text-lg mb-8 leading-relaxed`,children:`Real-time platform authority with zero-latency settings control.`}
),(0,X.jsx)(`div`,{className:`space-y-4`,children:[`Lead Management Hub`,`Dynamic Page Builder`,`Platform Overrides`].map(e=>(0,X.jsxs)(`div`,{className:`flex items-center gap-3 text-sm font-medium opacity-80`,children:[(0,X.jsx)(ve,{size:18,className:`text-[#d4af37]`}
),` `,e]}
,e))}
)]}
)}
)]}
)]}
),(0,X.jsx)(`section`,{className:`mb-48 relative`,children:(0,X.jsx)(a.div,{className:`p-1.5 rounded-[60px] bg-gradient-to-br from-[#d4af37] to-transparent shadow-[0_0_100px_rgba(212,175,55,0.2)]`,initial:e.initial,whileInView:e.whileInView,viewport:e.viewport,transition:e.transition,children:(0,X.jsxs)(`div`,{className:`bg-[#05050a] rounded-[56px] p-16 md:p-32 text-center relative overflow-hidden backdrop-blur-3xl`,children:[(0,X.jsx)(`div`,{className:`absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none`}
),(0,X.jsx)(`div`,{className:`absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/10 blur-[120px] rounded-full animate-pulse`}
),(0,X.jsxs)(a.div,{className:`relative z-10`,initial:e.initial,whileInView:e.whileInView,viewport:e.viewport,transition:e.transition,children:[(0,X.jsx)(`span`,{className:`inline-block px-6 py-2 rounded-full border border-[#d4af37]/30 text-[#d4af37] text-[12px] font-black uppercase tracking-[0.4em] mb-12 bg-[#d4af37]/5 backdrop-blur-md`,children:`Proprietary Digital Asset Sale`}
),(0,X.jsxs)(`h2`,{className:`font-calligraphy text-5xl md:text-7xl mb-12 leading-tight`,children:[`The Platinum `,(0,X.jsx)(`br`,{}
),` `,(0,X.jsx)(`span`,{className:`gold-shimmer-text`,children:`SnapAdda Portfolio`}
)]}
),(0,X.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-4xl mx-auto`,children:[(0,X.jsxs)(`div`,{className:`p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center group hover:bg-[#d4af37]/5 transition-all`,children:[(0,X.jsx)(ie,{size:40,className:`text-[#d4af37] mb-4 opacity-50 group-hover:opacity-100`}
),(0,X.jsx)(`span`,{className:`text-xs font-bold uppercase tracking-widest`,children:`Global Domain`}
)]}
),(0,X.jsxs)(`div`,{className:`p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center group hover:bg-[#d4af37]/5 transition-all`,children:[(0,X.jsx)(A,{size:40,className:`text-[#d4af37] mb-4 opacity-50 group-hover:opacity-100`}
),(0,X.jsx)(`span`,{className:`text-xs font-bold uppercase tracking-widest`,children:`Source Code`}
)]}
),(0,X.jsxs)(`div`,{className:`p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center group hover:bg-[#d4af37]/5 transition-all`,children:[(0,X.jsx)(x,{size:40,className:`text-[#d4af37] mb-4 opacity-50 group-hover:opacity-100`}
),(0,X.jsx)(`span`,{className:`text-xs font-bold uppercase tracking-widest`,children:`Master DB`}
)]}
)]}
),(0,X.jsxs)(`div`,{className:`relative group inline-block transform-gpu`,children:[(0,X.jsx)(`div`,{className:`absolute inset-0 bg-[#d4af37] blur-[150px] opacity-20 animate-pulse`}
),(0,X.jsxs)(a.div,{className:`relative bg-black/60 border border-[#d4af37]/50 backdrop-blur-3xl px-16 py-12 md:px-28 md:py-24 rounded-[60px] shadow-[0_0_100px_rgba(212,175,55,0.2)] flex flex-col items-center gap-4 group-hover:scale-[1.05] transition-all duration-700`,whileHover:{rotate:1}
,children:[(0,X.jsx)(`span`,{className:`text-[12px] font-black uppercase tracking-[0.8em] text-[#d4af37] mb-4`,children:`Final Valuation`}
),(0,X.jsx)(`span`,{className:`font-calligraphy text-8xl md:text-[14rem] gold-shimmer-text leading-none filter drop-shadow-[0_0_50px_rgba(212,175,55,0.3)]`,children:`₹50 Lakhs`}
)]}
)]}
),(0,X.jsx)(`p`,{className:`mt-20 text-xs opacity-20 uppercase tracking-[0.5em] font-bold`,children:`Absolute IP Transference & Documentation Included`}
)]}
)]}
)}
)}
),(0,X.jsxs)(`section`,{children:[(0,X.jsxs)(a.div,{className:`flex flex-col md:grid md:grid-cols-2 gap-8`,initial:`initial`,whileInView:`animate`,viewport:{once:!0}
,variants:{animate:{transition:{staggerChildren:.2}
}
}
,children:[(0,X.jsxs)(a.a,{href:`tel:9346793364`,className:`group p-12 md:p-20 rounded-[60px] bg-white/[0.02] border border-white/5 hover:bg-[#d4af37]/5 hover:border-[#d4af37]/40 transition-all flex flex-col items-center text-center backdrop-blur-3xl`,initial:e.initial,whileInView:e.whileInView,viewport:e.viewport,transition:e.transition,children:[(0,X.jsx)(`div`,{className:`w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:bg-[#d4af37]/20 transition-all`,children:(0,X.jsx)(q,{size:40,className:`text-[#d4af37]`}
)}
),(0,X.jsx)(`span`,{className:`text-[12px] uppercase tracking-[0.8em] text-[#d4af37] font-black mb-6 opacity-40`,children:`Cellular`}
),(0,X.jsx)(`span`,{className:`text-5xl md:text-8xl font-black gold-shimmer-text tracking-tighter`,children:`9346793364`}
)]}
),(0,X.jsxs)(a.a,{href:`mailto:manojkadiyala8@gmail.com`,className:`group p-12 md:p-20 rounded-[60px] bg-white/[0.02] border border-white/5 hover:bg-[#d4af37]/5 hover:border-[#d4af37]/40 transition-all flex flex-col items-center text-center backdrop-blur-3xl`,initial:e.initial,whileInView:e.whileInView,viewport:e.viewport,transition:e.transition,children:[(0,X.jsx)(`div`,{className:`w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:bg-[#d4af37]/20 transition-all`,children:(0,X.jsx)(te,{size:40,className:`text-[#d4af37]`}
)}
),(0,X.jsx)(`span`,{className:`text-[12px] uppercase tracking-[0.8em] text-[#d4af37] font-black mb-6 opacity-40`,children:`Master Correspondence`}
),(0,X.jsx)(`span`,{className:`text-2xl md:text-4xl font-bold break-all gold-shimmer-text`,children:`manojkadiyala8@gmail.com`}
)]}
)]}
),(0,X.jsx)(a.div,{className:`mt-32 text-center`,initial:e.initial,whileInView:e.whileInView,viewport:e.viewport,transition:e.transition,children:(0,X.jsxs)(m,{to:`/contact`,className:`inline-flex items-center gap-4 text-sm font-black uppercase tracking-[0.5em] text-[#d4af37] border-b border-[#d4af37]/20 pb-2 hover:border-[#d4af37] transition-all group`,children:[`Access The Presentation Deck `,(0,X.jsx)(be,{className:`group-hover:translate-x-2 transition-transform`}
)]}
)}
)]}
)]}
),(0,X.jsxs)(`footer`,{className:`py-24 border-t border-white/5 text-center px-6 bg-black`,children:[(0,X.jsx)(Ke,{size:40}
),(0,X.jsx)(`p`,{className:`mt-8 text-[12px] uppercase tracking-[1em] opacity-20 font-black`,children:`SnapAdda Real Estate Ecosystem Architected by Manoj`}
)]}
)]}
)}
const Pt = ({
  children: e
}) => {
  let {
    user: t,
    isLoading: n
  } = Z(), r = _();
  return n ? (0, X.jsx)(`div`, {
    style: {
      height: `100vh`,
      display: `flex`,
      alignItems: `center`,
      justifyContent: `center`,
      color: `var(--accent-gold)`
    },
    children: `Loading...`
  }) : t ? t.role === `client` ? !t.onboardingCompleted && r.pathname !== `/onboarding` ? (0, X.jsx)(g, {
    to: `/onboarding`,
    replace: !0
  }) : e : (0, X.jsx)(g, {
    to: `/`,
    replace: !0
  }) : (0, X.jsx)(g, {
    to: `/login`,
    replace: !0,
    state: {
      from: r
    }
  })
};
const Ft = () => {
  let e = _(),
    [t, n] = (0, Y.useState)(null);
  return (0, Y.useEffect)(() => {
    Be(`seo`).then(e => {
      n(e)
    }).catch(() => {})
  }, []), (0, Y.useEffect)(() => {
    let n = n => {
        let r = window.location.origin,
          i = `${r}${e.pathname}`,
          a = {
            title: n?.title || t?.title || `SnapAdda — Plots, Apartments & Villas`,
            description: n?.description || t?.description || ``,
            keywords: n?.keywords || t?.keywords || ``,
            image: n?.image || t?.image || `${r}/favicon.svg`,
            robots: n?.robots || t?.robots || `index, follow`,
            canonical: n?.canonical || t?.canonical || i,
            schema: n?.schema || null
          };
        document.title = a.title;
        let o = (e, t, n) => {
          if (!n) return;
          let r = e === `property` ? `meta[property="${t}"]` : `meta[name="${t}"]`,
            i = document.head.querySelector(r);
          i || (i = document.createElement(`meta`), e === `property` ? i.setAttribute(`property`, t) : i.setAttribute(`name`, t), document.head.appendChild(i)), i.setAttribute(`content`, n)
        };
        o(`name`, `description`, a.description), o(`name`, `keywords`, a.keywords), o(`property`, `og:title`, a.title), o(`property`, `og:description`, a.description), o(`property`, `og:image`, a.image), o(`property`, `og:url`, i), o(`name`, `twitter:title`, a.title), o(`name`, `twitter:description`, a.description), o(`name`, `twitter:image`, a.image), o(`name`, `robots`, a.robots), (e => {
          let t = document.head.querySelector(`link[rel="canonical"]`);
          t || (t = document.createElement(`link`), t.setAttribute(`rel`, `canonical`), document.head.appendChild(t)), t.setAttribute(`href`, e)
        })(a.canonical);
        let s = document.getElementById(`snap-json-ld`);
        a.schema ? (s || (s = document.createElement(`script`), s.id = `snap-json-ld`, s.type = `application/ld+json`, document.head.appendChild(s)), s.text = JSON.stringify(a.schema)) : s && s.remove()
      },
      r = e => {
        n(e.detail)
      };
    return n(), window.addEventListener(`snap_seo_update`, r), () => window.removeEventListener(`snap_seo_update`, r)
  }, [e.pathname, t]), null
};
;
function It(){
let[U,G]=(0,Y.useState)({bhk:``,minPrice:``,maxPrice:``,facing:`Any`,furnishing:`N/A`,constructionStatus:`N/A`,verified:!1,approval:`All`,propertyType:`All`,keyword:``}
),[_e,ye]=(0,Y.useState)(!1),[re,ie]=(0,Y.useState)(!1),[ae,oe]=(0,Y.useState)(`callback`);
let le_nav=_();
let isHome=le_nav.pathname===`/`||le_nav.pathname===`/dashboard`;
return(0,X.jsxs)(v,{children:[(0,X.jsx)(Ft,{}
),(0,X.jsxs)(h,{children:[(0,X.jsx)(u,{path:`/login`,element:(0,X.jsx)(St,{}
)}
),(0,X.jsx)(u,{path:`/about`,element:(0,X.jsx)(Nt,{}
)}
),(0,X.jsx)(u,{path:`/`,element:(0,X.jsx)(Pt,{children:(0,X.jsx)(ht,{}
)}
)}
),(0,X.jsx)(u,{path:`/property/:id`,element:(0,X.jsx)(Pt,{children:(0,X.jsx)(_t,{}
)}
)}
),(0,X.jsx)(u,{path:`/onboarding`,element:(0,X.jsx)(Pt,{children:(0,X.jsx)(Tt,{}
)}
)}
),(0,X.jsxs)(u,{path:`/dashboard`,element:(0,X.jsx)(Pt,{children:(0,X.jsx)(Et,{}
)}
),children:[(0,X.jsx)(u,{index:!0,element:(0,X.jsx)(Ot,{}
)}
),(0,X.jsx)(u,{path:`favorites`,element:(0,X.jsx)(At,{}
)}
),(0,X.jsx)(u,{path:`profile`,element:(0,X.jsx)(jt,{}
)}
)]}
)]}
),(0,X.jsx)($,{className:`fab-callback`,onClick:()=>{oe(`callback`),ie(!0)},children:(0,X.jsx)(I,{size:28})}),isHome&&(0,X.jsx)(`button`,{className:`fab-filters`,onClick:()=>ye(!0),children:(0,X.jsx)(pe,{size:24})}),(0,X.jsx)(Ye,{isOpen:_e,onClose:()=>ye(!1),filters:U,setFilters:G,onApply:()=>ye(!1)}),(0,X.jsx)(Je,{isOpen:re,onClose:()=>ie(!1),type:ae})]}
)}
(0,Ne.createRoot)(document.getElementById(`root`)).render((0,X.jsx)(Y.StrictMode,{children:(0,X.jsx)(n,{clientId:`1234567890-mockclientid.apps.googleusercontent.com`,children:(0,X.jsx)(Fe,{children:(0,X.jsxs)(X.Fragment,{children:[(0,X.jsx)(It,{}),(0,X.jsx)(`style`,{children:`.fab-callback { position: fixed; bottom: 2rem; right: 2rem; width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #f4d03f, #c5a059); color: #07070f; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 36px rgba(244, 208, 63, 0.4); z-index: 1000; cursor: pointer; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); border: 1px solid rgba(255, 255, 255, 0.2); } .fab-callback:hover { transform: scale(1.15) translateY(-8px) rotate(8deg); box-shadow: 0 20px 50px rgba(244, 208, 63, 0.6); } .fab-filters { position: fixed; bottom: 2rem; left: 2rem; width: 58px; height: 58px; border-radius: 50%; background: rgba(18, 18, 42, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); color: #f4d03f; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(244, 208, 63, 0.3); z-index: 1000; cursor: pointer; transition: all 0.4s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.5); } .fab-filters:hover { background: rgba(25, 25, 55, 0.95); border-color: #f4d03f; transform: translateY(-5px) scale(1.05); box-shadow: 0 12px 40px rgba(244, 208, 63, 0.2); } @media (max-width: 768px) { .fab-callback { bottom: 1.5rem; right: 1.5rem; width: 58px; height: 58px; } .fab-filters { bottom: 1.5rem; left: 1.5rem; width: 54px; height: 54px; } .bottom-nav { padding-bottom: env(safe-area-inset-bottom); } } .glass-heavy { background: rgba(18, 18, 42, 0.8) !important; backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; } .section-wrap { padding: 6rem 0 !important; } @media (max-width: 768px) { .section-wrap { padding: 4rem 0 !important; } }
.filter-sidebar { background: rgba(18, 18, 42, 0.98) !important; backdrop-filter: blur(40px) !important; border-left: 1px solid rgba(212, 175, 55, 0.3) !important; padding: 2.5rem !important; box-shadow: -20px 0 80px rgba(0,0,0,0.9) !important; }
.filter-header { border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important; padding-bottom: 2rem !important; margin-bottom: 2.5rem !important; }
.filter-group label { color: #f4d03f !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 0.15em !important; font-size: 0.7rem !important; margin-bottom: 1rem !important; display: block !important; }
.filter-group input, .filter-group select { background: rgba(255, 255, 255, 0.04) !important; border: 1px solid rgba(255, 255, 255, 0.12) !important; border-radius: 14px !important; padding: 1rem 1.25rem !important; color: white !important; width: 100% !important; transition: all 0.35s ease !important; font-size: 0.9rem !important; }
.filter-group input:focus, .filter-group select:focus { border-color: #f4d03f !important; background: rgba(255, 255, 255, 0.08) !important; outline: none !important; box-shadow: 0 0 0 4px rgba(244, 208, 63, 0.1) !important; }
.bhk-btn, .pill-btn { background: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 10px !important; padding: 0.75rem !important; color: white !important; font-weight: 600 !important; transition: all 0.3s ease !important; }
.bhk-btn.active, .pill-btn.active { background: #f4d03f !important; color: #07070f !important; border-color: #f4d03f !important; transform: scale(1.05) !important; box-shadow: 0 4px 15px rgba(244, 208, 63, 0.3) !important; }
.filter-footer { border-top: 1px solid rgba(255, 255, 255, 0.08) !important; padding-top: 2rem !important; margin-top: 2.5rem !important; gap: 1.5rem !important; }
</style>`})] }) }) }) }) );


