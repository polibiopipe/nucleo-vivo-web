import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../prototipos/move/index.html',import.meta.url),'utf8');
const addons=['move-demo.js','move-ai.js','move-experience.js'].map(file=>readFileSync(new URL('../prototipos/move/'+file,import.meta.url),'utf8'));
const tick=(ms=20)=>new Promise(r=>setTimeout(r,ms));
function setup(fetch){
  const errors=[];const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM(html,{url:'https://www.nucleovivo.net/prototipos/move/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole,beforeParse(w){
    w.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
    w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
    w.HTMLElement.prototype.scrollIntoView=function(){};w.fetch=fetch;
    w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
    w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  }});
  for(const addon of addons){const script=dom.window.document.createElement('script');script.textContent=addon;dom.window.document.body.append(script);}
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

test('Gym ball and every catalog product immediately request their own characteristics',async()=>{
  const calls=[];
  const {w,d,errors}=setup(async(url,options)=>{
    const body=JSON.parse(options.body);calls.push(body);
    return {ok:true,json:async()=>({source:'ai',intent:'question',referral:'unknown',message:`Características del producto ${body.productRank}.`,products:[],followUp:[]})};
  });
  try{
    const gym=d.querySelector('#featuredProducts [data-ai-product="32"]');
    assert.ok(gym);gym.click();await tick();
    assert.equal(calls.length,1);assert.equal(calls[0].productRank,32);
    assert.match(calls[0].messages[0].content,/Gym ball 65 cm \+ inflador/);
    assert.match(d.querySelector('#msTitle').textContent,/Gym ball/);
    assert.match(d.querySelector('#moveAIConversation').textContent,/Características del producto 32/);
    assert.equal(d.querySelector('#moveAIInput').value,'');
    d.querySelector('#moveAIInput').value='¿Qué debería verificar?';d.querySelector('#moveAISend').click();await tick();
    assert.equal(calls[1].productRank,32);assert.equal(calls[1].messages.length,3);

    w.closeMoveSelect();w.openCatalog();
    const catalogButtons=[...d.querySelectorAll('#catalogGrid [data-ai-product]')];
    assert.equal(catalogButtons.length,50);
    for(const button of catalogButtons){
      const before=calls.length;button.click();await tick();
      assert.equal(calls.length,before+1);
      assert.equal(calls.at(-1).productRank,Number(button.dataset.aiProduct));
      assert.ok(calls.at(-1).messages[0].content.includes(d.querySelector('#msTitle').textContent));
      w.closeMoveSelect();
    }
    const before=calls.length;w.openQuick(32);d.querySelector('#quickAsk').click();await tick(240);
    assert.equal(calls.length,before+1);assert.equal(calls.at(-1).productRank,32);
    w.closeMoveSelect();
    const afterProduct=calls.length;w.openMoveSelect();await tick();
    assert.equal(calls.length,afterProduct,'generic chat must wait for a user question');
    assert.equal(d.querySelector('.move-ai-context'),null);
    assert.deepEqual(errors,[]);
  }finally{w.close();}
});

test('a selected question sends once, and closing a product consultation discards its late answer',async()=>{
  let finish;const calls=[];
  const {w,d,errors}=setup((url,options)=>{
    calls.push(JSON.parse(options.body));
    return new Promise(resolve=>{finish=()=>resolve({ok:true,json:async()=>({source:'ai',intent:'question',referral:'unknown',message:'Late product answer',products:[],followUp:[]})});});
  });
  try{
    w.openMoveSelect({text:'Compara bandas y mancuernas'});
    assert.equal(calls.length,1);assert.equal(calls[0].messages[0].content,'Compara bandas y mancuernas');
    assert.equal(d.querySelector('#moveAISend').disabled,true);
    w.closeMoveSelect();w.openMoveSelect();finish();await tick();
    assert.doesNotMatch(d.querySelector('#moveAIConversation').textContent,/Late product answer/);
    assert.equal(d.querySelector('#moveAISend').disabled,false);
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
    assert.ok(d.querySelector('#agendaIssuer'),'confirmed referral skips the repeated first question');
    assert.match(d.querySelector('#agendaStage').textContent,/Ya indicaste que tienes derivación/);
    w.agendaClose();fail=true;w.openMoveSelect();d.querySelector('#moveAIInput').value='Busco bandas';d.querySelector('#moveAISend').click();await tick();
    assert.ok(d.querySelector('.move-ai-error'));assert.equal(d.querySelector('#moveAISend').disabled,false);
    [...d.querySelectorAll('button')].find(b=>b.textContent==='Usar preguntas guiadas').click();assert.ok(d.querySelector('#msFreeText'));
    assert.deepEqual(errors,[]);
  }finally{w.close();}
});

test('comparison bounds the selection, retains state after filtering and adds the chosen product',()=>{
  const {w,d,errors}=setup();
  try{
    const buttons=[...d.querySelectorAll('#featuredProducts [data-compare-rank]')];
    const ranks=buttons.slice(0,4).map(b=>Number(b.dataset.compareRank));
    buttons.slice(0,4).forEach(b=>b.click());
    assert.match(d.querySelector('.move-compare-tray').textContent,/3 de 3/);
    assert.equal(buttons[3].getAttribute('aria-pressed'),'false');
    w.renderCatalog();
    assert.equal(d.querySelector(`#catalogGrid [data-compare-rank="${ranks[0]}"]`).getAttribute('aria-pressed'),'true');
    d.querySelector('.move-compare-tray .move-compare-primary').click();
    assert.ok(d.querySelector('dialog').open);
    assert.equal(d.querySelectorAll('.move-compare-table thead th').length,4);
    const chosenName=buttons[0].closest('.product-card').querySelector('h3').textContent;
    assert.match(d.querySelector('.move-compare-table').textContent,new RegExp(chosenName));
    d.querySelector('.move-compare-table .move-compare-primary').click();
    assert.equal(d.querySelector('dialog').open,false);
    assert.equal(d.querySelector('#bagCount').textContent,'1');
    assert.ok(d.querySelector('#cartItems').textContent.includes(chosenName));
    assert.deepEqual(errors,[]);
  }finally{w.close();}
});

test('agenda creates a synthetic request that the Juan Pablo panel can review and clear',()=>{
  const {w,d,errors}=setup();let manager;
  try{
    w.agendaOpen({referral:'yes'});
    d.querySelector('#agendaIssuer').value='Medicina general';
    d.querySelector('#agendaReason').value='DO_NOT_STORE_CLINICAL_TEXT';
    d.querySelector('#agendaOrderContinue').click();
    d.querySelector('[data-agenda-modality="Presencial"]').click();
    d.querySelector('#agendaModalityContinue').click();
    d.querySelector('[data-agenda-date]').click();d.querySelector('[data-agenda-time]').click();
    d.querySelector('#agendaSlotContinue').click();
    d.querySelector('#agendaName').value='DO_NOT_STORE_NAME';
    d.querySelector('#agendaEmail').value='private@example.test';
    d.querySelector('#agendaPhone').value='DO_NOT_STORE_PHONE';
    d.querySelector('#agendaConsent').checked=true;d.querySelector('#agendaSubmit').click();
    assert.ok(d.querySelector('.move-demo-receipt a[href$="#solicitudes-demo"]'));
    const serialized=w.localStorage.getItem(w.MoveDemo.key);
    assert.ok(serialized);assert.doesNotMatch(serialized,/DO_NOT_STORE|private@example/);
    assert.deepEqual(Object.keys(JSON.parse(serialized)[0]).sort(),['created','date','id','modality','status','time']);
    const v=new VirtualConsole();v.on('jsdomError',e=>errors.push(e.message));
    manager=new JSDOM(readFileSync(new URL('../prototipos/move/gestion/index.html',import.meta.url),'utf8'),{
      url:'https://www.nucleovivo.net/prototipos/move/gestion/#solicitudes-demo',runScripts:'dangerously',virtualConsole:v,
      beforeParse(window){window.scrollTo=()=>{};window.HTMLElement.prototype.scrollIntoView=function(){};},
    });
    const md=manager.window.document;
    manager.window.localStorage.setItem(w.MoveDemo.key,serialized);
    for(const file of ['move-demo.js','gestion/move-requests.js']){
      const script=md.createElement('script');script.textContent=readFileSync(new URL('../prototipos/move/'+file,import.meta.url),'utf8');md.body.append(script);
    }
    assert.equal(md.querySelector('#dashboardView').hidden,false);
    assert.equal(md.querySelectorAll('.move-request-row').length,1);
    assert.match(md.querySelector('.move-request-row').textContent,/Paciente de demostración/);
    assert.match(md.querySelector('.move-request-row').textContent,/Pendiente de revisión/);
    md.querySelector('.move-request-row button').click();
    assert.match(md.querySelector('.move-request-row').textContent,/Revisada · demo/);
    manager.window.enterRole('polibio');assert.equal(md.querySelector('#moveDemoRequests').hidden,true);
    manager.window.enterRole('juan');md.querySelector('#moveDemoRequests .panel-head button').click();
    assert.equal(md.querySelectorAll('.move-request-row').length,0);
    assert.deepEqual(errors,[]);
  }finally{w.close();manager?.window.close();}
});

test('demo bridge discards expired and malformed data, and reports unavailable storage',()=>{
  const {w,d,errors}=setup();
  try{
    w.localStorage.setItem(w.MoveDemo.key,JSON.stringify([{id:'<img src=x>',created:Date.now(),name:'private'}]));
    assert.equal(w.MoveDemo.list().length,0);
    assert.equal(w.localStorage.getItem(w.MoveDemo.key),null);
    const result=w.MoveDemo.create({date:'2026-09-08',time:'09:00',modality:'Presencial'});
    assert.equal(result.saved,true);
    const old={...JSON.parse(w.localStorage.getItem(w.MoveDemo.key))[0],created:Date.now()-25*60*60*1000};
    w.localStorage.setItem(w.MoveDemo.key,JSON.stringify([old]));
    assert.equal(w.MoveDemo.list().length,0);
    Object.defineProperty(w,'localStorage',{get(){throw new Error('Storage unavailable');}});
    assert.equal(w.MoveDemo.create({date:'2026-09-08',time:'09:00',modality:'Presencial'}).saved,false);
    assert.deepEqual(errors,[]);
  }finally{w.close();}
});
