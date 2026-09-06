import assert from 'node:assert/strict';
import { answer, validateInput } from '../server/move-assistant.mjs';
const cases = [
  {name:'catalog-and-budget',body:{messages:[{role:'user',content:'Quiero comparar dos sets de bandas para entrenar en casa, sin lesiones. Tengo máximo 10000 pesos por alternativa.'}],budget:10000},check:r=>{assert.equal(r.source,'ai');assert.ok(r.products.length>0);assert.ok(r.products.every(p=>p.value<=10000));}},
  {name:'referral-to-agenda',body:{messages:[{role:'user',content:'Ya tengo una derivación escrita de mi traumatólogo para kinesiología. Quiero agendar.'}]},check:r=>{assert.equal(r.source,'ai');assert.equal(r.intent,'appointment');assert.equal(r.referral,'yes');assert.equal(r.products.length,0);}},
  {name:'needs-referral-question',body:{messages:[{role:'user',content:'Quiero una sesión de kinesiología. ¿Cómo agendo?'}]},check:r=>{assert.equal(r.intent,'question');assert.match(r.message,/deriv|indicaci[oó]n/i);assert.equal(r.products.length,0);}},
];
for(const c of cases){const result=await answer(validateInput(c.body));c.check(result);console.log(JSON.stringify({smoke:c.name,result:'PASS',intent:result.intent,products:result.products.map(p=>p.rank),reply:result.message}));}
