import { X } from '../globals.jsx';
export const Button = ,({children:e,variant:t=`primary`,size:n=`md`,fullWidth:r=!1,className:i=``,...a}
)=>(0,X.jsx)(`button`,{className:[`btn`,`btn-${t}
`,`btn-${n}
`,r?`btn-full`:``,i].filter(Boolean).join(` `),...a,children:e}
