// Minimal JWT implementation — compatible with Node 18+
import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'change-me';

function b64(s){
  return Buffer.from(s).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
}
function b64d(s){
  s=s.replace(/-/g,'+').replace(/_/g,'/');
  while(s.length%4)s+='=';
  return Buffer.from(s,'base64').toString('utf8');
}

export function sign(payload){
  const h = b64(JSON.stringify({alg:'HS256',typ:'JWT'}));
  const b = b64(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256',SECRET).update(`${h}.${b}`).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  return `${h}.${b}.${sig}`;
}

export function verify(token){
  if(!token)return null;
  const [head,body,sig]=token.split('.');
  if(!head||!body||!sig)return null;
  const expected = crypto.createHmac('sha256',SECRET).update(`${head}.${body}`).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  if(sig!==expected)return null;
  try{
    const p=JSON.parse(b64d(body));
    if(p.exp&&Date.now()/1000>p.exp)return null;
    return p;
  }catch{return null;}
}
