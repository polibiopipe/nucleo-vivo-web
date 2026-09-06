import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../prototipos/move/index.html',import.meta.url),'utf8');
const addon=readFileSync(new URL('../prototipos/move/move-ai.js',import.meta.url),'utf8');
const tick=()=>new Promise(r=>setTimeout(r,20));
function setup(fetch){
  const errors=[];const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM(html,{url:'https://www.nucleovivo.net/prototipos/move/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole,beforeParse(w){
    w.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
    w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
    w.HTMLElement.prototype.scrollIntoView=function(){};w.fetch=fetch;
  }});
  const script=dom.window.document.createElement('script');script.textContent=addon;dom.window.document.body.append(script);
  return {dom,w:dom.window,d:dom.window.document,errors};
}
test('chat preserves history, renders model text safely and adds real catalog items',async()=>{
  const calls=[];
  const {w,d,errors}=setup(async(url,options)=>{
    calls.push(JSON.parse(options.body));return {ok:true,json:async()=>({source:'ai',intent:'products',referral:'unknown',message:'<img id="injected" src=x> Dos opciones.',products:[{rank:1,price:'$5.990',reason:'Bandas para comparar'}],followUp:['Comparar otra alternativa']})};
  });
  try{
    d.querySelector('[data-ai-open]').click();assert.ok(d.querySelector('#moveAIInput'));
    d.querySelector('#moveAIInput').value='Busco bandas';d.querySelector('#moveAISend').click();await tick();
    assert.equal(calls.length,1);assert.equal(d.querySelector('#injected'),null);assert.match(d.querySelector('#moveAIConversation').textContent,/<img/);
    d.querySelector('.move-ai-add').click();assert.equal(d.querySelector('#bagCount').textContent,'1');
    [...d.querySelectorAll('.move-ai-choice')].find(b=>b.textContent==='Comparar otra alternativa').click();await tick();
    assert.equal(calls[1].messages.length,3);assert.equal(calls[1].messages[1].role,'assistant');
    w.closeMoveSelect();assert.equal(d.querySelector('#moveSelectOverlay').getAttribute('aria-hidden'),'true');
    assert.deepEqual(errors,[]);
  }finally{w.close();}
});
test('confirmed referral opens the existing agenda; failures retain guided alternative',async()=>{
  let fail=false;
  const {w,d,errors}=setup(async()=>({ok:!fail,json:async()=>fail?{message:'Unavailable'}:{source:'ai',intent:'appointment',referral:'yes',message:'Puedes probar la agenda.',products:[],followUp:[]}}));
  try{
    w.openMoveSelect();d.querySelector('#moveAIInput').value='Tengo derivación';d.querySelector('#moveAISend').click();await tick();
    [...d.querySelectorAll('button')].find(b=>b.textContent==='Continuar a la agenda de prueba').click();
    assert.ok(d.querySelector('#agendaOverlay').classList.contains('open'));
    w.agendaClose();fail=true;w.openMoveSelect();d.querySelector('#moveAIInput').value='Busco bandas';d.querySelector('#moveAISend').click();await tick();
    assert.ok(d.querySelector('.move-ai-error'));assert.equal(d.querySelector('#moveAISend').disabled,false);
    [...d.querySelectorAll('button')].find(b=>b.textContent==='Usar preguntas guiadas').click();assert.ok(d.querySelector('#msFreeText'));
    assert.deepEqual(errors,[]);
  }finally{w.close();}
});
