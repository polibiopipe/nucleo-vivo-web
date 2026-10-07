(function(){
'use strict';

var form=document.getElementById('customerForm');
if(!form)return;
var rutInput=form.querySelector('[name="rut"]');
var nameInput=form.querySelector('[name="name"]');
var addressInput=form.querySelector('[name="address"]');
var cityInput=form.querySelector('[name="city"]');
var contactInput=form.querySelector('[name="contact_name"]');
var phoneInput=form.querySelector('[name="phone"]');
var emailInput=form.querySelector('[name="email"]');
var giroInput=form.querySelector('[name="business_activity"]');
if(!rutInput||!nameInput)return;

var state={lat:null,lng:null,accuracy:null,geoSource:'',sources:[],lookupAt:'',cfg:null};
var oldSubmit=form.onsubmit;

function el(tag,attrs,text){
  var n=document.createElement(tag);attrs=attrs||{};
  Object.keys(attrs).forEach(function(k){if(k==='class')n.className=attrs[k];else n.setAttribute(k,attrs[k])});
  if(text!=null)n.textContent=text;return n;
}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function addStyle(){
  if(document.getElementById('mscCustomerToolsStyle'))return;
  var s=el('style',{id:'mscCustomerToolsStyle'});s.textContent='\
.mscAssistBox{grid-column:1/-1;border:1px solid #e2ca93;background:linear-gradient(180deg,#fffaf0,#fff);border-radius:10px;padding:12px;margin-top:2px}\
.mscAssistHead{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:9px}.mscAssistHead b{display:block;font-size:13px}.mscAssistHead span{font-size:10px;color:#777}\
.mscActionRow{display:flex;gap:7px;flex-wrap:wrap;margin-top:7px}.mscMiniBtn{border:1px solid #b98a32;background:#fff;color:#644813;border-radius:7px;padding:8px 10px;font-weight:800;font-size:11px}.mscMiniBtn.dark{background:#0e596b;border-color:#0e596b;color:#fff}.mscMiniBtn:disabled{opacity:.55;cursor:wait}.mscMiniBtn[hidden]{display:none!important}\
.mscLookupStatus{font-size:11px;color:#626a70;margin-top:8px;line-height:1.45}.mscLookupStatus.good{color:#176f43}.mscLookupStatus.bad{color:#a23d37}.mscLookupStatus.attn{color:#805d18;font-weight:650}\
.mscSuggested{border-color:#d3a344!important;background:#fffaf0!important;box-shadow:0 0 0 1px rgba(185,138,50,.12)}\
.mscSources{margin-top:10px;border-top:1px solid #eadfc7;padding-top:8px;font-size:10px}.mscSources a{display:inline-block;margin:3px 8px 3px 0;color:#0e596b;text-decoration:underline;text-underline-offset:2px}\
.mscVerify{display:grid;gap:7px;margin-top:11px;padding-top:10px;border-top:1px solid #eadfc7}.mscVerify label{display:flex;gap:8px;align-items:flex-start;font-size:11px;color:#4e555a;text-transform:none!important;letter-spacing:0!important}.mscVerify input{width:auto!important;margin-top:2px}.mscGeoState{font-size:10px;color:#6b7378;margin-top:7px}.mscGeoState.ok{color:#176f43;font-weight:700}\
.mscDeliveryCard{margin-top:10px;border:1px solid #c9d5d9;background:#f7fbfc;border-radius:9px;padding:11px}.mscDeliveryCard h4{margin:0 0 7px;font-size:13px}.mscDeliveryGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px}.mscDeliveryGrid b{display:block;color:#252a2d;margin-bottom:2px}.mscMapLinks{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.mscMapLinks a{display:inline-block;background:#0e596b;color:white;text-decoration:none;padding:7px 9px;border-radius:7px;font-size:10px;font-weight:800}.mscMapLinks a.waze{background:#172026}\
.mscPublicNote{font-size:10px;color:#7a6842;margin-top:8px}.mscHint{font-size:10px;color:#6d747a;margin-top:5px}\
@media(max-width:760px){.mscDeliveryGrid{grid-template-columns:1fr}.mscActionRow .mscMiniBtn{flex:1 1 140px}}';document.head.appendChild(s);
}
addStyle();

var nameField=nameInput.closest('.field');
var nameLabel=nameField&&nameField.querySelector('label');
if(nameLabel)nameLabel.textContent='Razón social / nombre';
nameInput.placeholder='Empresa o persona natural con actividad';

function addField(name,label,type,placeholder){
  if(form.querySelector('[name="'+name+'"]'))return form.querySelector('[name="'+name+'"]');
  var wrap=el('div',{class:'field'}),lab=el('label',{},label),inp=el(type==='textarea'?'textarea':'input',{name:name});
  if(type&&type!=='textarea')inp.type=type;if(placeholder)inp.placeholder=placeholder;if(type==='textarea')inp.rows=2;
  wrap.appendChild(lab);wrap.appendChild(inp);
  var obs=form.querySelector('[name="notes"]');var target=obs&&obs.closest('.field');form.insertBefore(wrap,target||form.querySelector('.full:last-of-type'));
  return inp;
}
var websiteInput=addField('website','Sitio web','url','https://...');
var deliveryContact=addField('delivery_contact_name','Contacto para entrega','text','Si es distinto del contacto comercial');
var deliveryPhone=addField('delivery_phone','Fono para entrega','tel','+56 ...');
var deliveryNotes=addField('delivery_notes','Indicaciones para transportista','textarea','Acceso, portería, horario, referencia, piso, faena, etc.');

var rutField=rutInput.closest('.field');
var lookupRow=el('div',{class:'mscActionRow'}),lookupBtn=el('button',{type:'button',class:'mscMiniBtn dark',id:'mscLookupRut'},'Buscar datos públicos del RUT');
lookupRow.appendChild(lookupBtn);rutField.appendChild(lookupRow);

var expandRow=el('div',{class:'mscActionRow'}),expandBtn=el('button',{type:'button',class:'mscMiniBtn',id:'mscLookupName',hidden:'hidden'},'Ampliar búsqueda con nombre');
expandRow.appendChild(expandBtn);if(nameField)nameField.appendChild(expandRow);

var assist=el('div',{class:'mscAssistBox'});
assist.innerHTML='<div class="mscAssistHead"><div><b>Asistente de datos y entrega</b><span>Prellena desde fuentes públicas; el vendedor confirma todo con el cliente.</span></div></div>'+ 
'<div class="mscActionRow"><button type="button" class="mscMiniBtn" id="mscOpenMap">Ver dirección en mapa</button><button type="button" class="mscMiniBtn" id="mscUseGps">Usar ubicación actual</button></div>'+ 
'<div id="mscGeoState" class="mscGeoState">Sin punto GPS guardado. El transportista igualmente podrá abrir la dirección confirmada en el mapa.</div>'+ 
'<div id="mscLookupStatus" class="mscLookupStatus">Ingrese un RUT y use “Buscar datos públicos del RUT”.</div>'+ 
'<div id="mscSources" class="mscSources" style="display:none"></div>'+ 
'<div class="mscVerify"><label><input id="mscConfirmData" type="checkbox"> <span>Verifiqué con el cliente que los datos de la ficha son correctos y vigentes.</span></label><label><input id="mscConfirmLocation" type="checkbox"> <span>Confirmé que esta dirección o punto corresponde al lugar de entrega.</span></label></div>'+ 
'<div class="mscPublicNote">Los datos encontrados en internet son sugerencias. Una coincidencia por nombre no sustituye la validación del vendedor con el cliente.</div>';
var firstFull=form.querySelector('.field.full');form.insertBefore(assist,firstFull||form.lastElementChild);
var status=document.getElementById('mscLookupStatus'),sourcesBox=document.getElementById('mscSources');
var confirmData=document.getElementById('mscConfirmData'),confirmLocation=document.getElementById('mscConfirmLocation'),geoState=document.getElementById('mscGeoState');
var gpsBtn=document.getElementById('mscUseGps'),mapBtn=document.getElementById('mscOpenMap');

function setStatus(text,kind){status.textContent=text;status.className='mscLookupStatus'+(kind?' '+kind:'')}
function fillSuggested(input,value){if(!input||!value)return;if(!input.value||input.dataset.mscSuggested==='1'){input.value=value;input.dataset.mscSuggested='1';input.classList.add('mscSuggested')}}
function clearSuggestedFlag(e){if(e&&e.target&&e.target.dataset.mscSuggested==='1'){delete e.target.dataset.mscSuggested;e.target.classList.remove('mscSuggested')}}
[nameInput,addressInput,cityInput,phoneInput,emailInput,giroInput,websiteInput].filter(Boolean).forEach(function(i){i.addEventListener('input',clearSuggestedFlag)});

function formatRut(raw){
  var s=String(raw||'').toUpperCase().replace(/[^0-9K]/g,'');if(s.length<2)return raw;
  var dv=s.slice(-1),body=s.slice(0,-1),out='';while(body.length>3){out='.'+body.slice(-3)+out;body=body.slice(0,-3)}return body+out+'-'+dv;
}
function validRut(raw){
  var s=String(raw||'').toUpperCase().replace(/[^0-9K]/g,'');if(s.length<2)return false;var body=s.slice(0,-1),dv=s.slice(-1);if(!/^\d+$/.test(body))return false;var sum=0,m=2;for(var i=body.length-1;i>=0;i--){sum+=Number(body[i])*m;m=m===7?2:m+1}var r=11-(sum%11),x=r===11?'0':r===10?'K':String(r);return dv===x;
}
rutInput.addEventListener('blur',function(){if(validRut(rutInput.value))rutInput.value=formatRut(rutInput.value)});

function renderSources(list){
  state.sources=Array.isArray(list)?list:[];sourcesBox.innerHTML='';
  if(!state.sources.length){sourcesBox.style.display='none';return}
  sourcesBox.appendChild(el('b',{},'Fuentes públicas consultadas: '));
  state.sources.forEach(function(s,i){var a=el('a',{href:s.url,target:'_blank',rel:'noopener noreferrer'},(s.title||('Fuente '+(i+1))).slice(0,70));sourcesBox.appendChild(a)});sourcesBox.style.display='block';
}
function foundCount(c){return [c.name,c.business_activity,c.address,c.city,c.phone,c.email,c.website].filter(Boolean).length}
function matchText(c){if(c.match==='exact_rut'||c.match==='rut_and_name')return 'Coincidencia vinculada al RUT';if(c.match==='name_assisted')return 'Coincidencia ampliada con nombre';if(c.match==='partial')return 'Coincidencia parcial';return 'Coincidencia encontrada'}
async function lookupCustomer(expanded){
  var rut=rutInput.value.trim();if(!validRut(rut)){setStatus('Revise el RUT y su dígito verificador.','bad');rutInput.focus();return}
  var hint=nameInput.value.trim();if(expanded&&!hint){setStatus('Ingrese la razón social o el nombre para ampliar la búsqueda.','attn');nameInput.focus();return}
  lookupBtn.disabled=true;expandBtn.disabled=true;lookupBtn.textContent='Buscando…';if(expanded)expandBtn.textContent='Buscando…';
  setStatus(expanded?'Ampliando búsqueda con RUT + nombre…':'Consultando el RUT en fuentes públicas…');
  try{
    var token=sessionStorage.getItem('msc_token')||'',payload={rut:rut};if(expanded)payload.name_hint=hint;
    var r=await fetch('/api/msc-customer-enrich',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(payload)});
    var d=await r.json();if(!r.ok)throw new Error(d.message||'No fue posible consultar la información pública.');
    state.lookupAt=d.lookedUpAt||new Date().toISOString();var c=d.company||{};renderSources(d.sources);
    if(!c.found){
      confirmData.checked=false;confirmLocation.checked=false;
      if(!expanded&&d.needs_name_hint!==false){expandBtn.hidden=false;setStatus('No pude identificar al contribuyente sólo con el RUT. Ingrese la razón social o nombre y pulse “Ampliar búsqueda con nombre”.','attn')}
      else setStatus('No encontré una coincidencia pública suficientemente clara. Complete la ficha directamente con el cliente.','attn');
      return;
    }
    fillSuggested(nameInput,c.name);fillSuggested(giroInput,c.business_activity);fillSuggested(addressInput,c.address);fillSuggested(cityInput,c.city);fillSuggested(phoneInput,c.phone);fillSuggested(emailInput,c.email);fillSuggested(websiteInput,c.website);
    if(!deliveryContact.value&&contactInput&&contactInput.value)deliveryContact.value=contactInput.value;if(!deliveryPhone.value&&phoneInput&&phoneInput.value)deliveryPhone.value=phoneInput.value;
    expandBtn.hidden=true;confirmData.checked=false;confirmLocation.checked=false;
    var n=foundCount(c),detail=c.note?' '+c.note:'';
    setStatus(matchText(c)+' · '+n+' dato'+(n===1?'':'s')+' sugerido'+(n===1?'':'s')+'. Revise cada campo con el cliente antes de guardar.'+detail,'good');
  }catch(err){setStatus(err.message||'No fue posible consultar la web.','bad')}
  finally{lookupBtn.disabled=false;expandBtn.disabled=false;lookupBtn.textContent='Buscar datos públicos del RUT';expandBtn.textContent='Ampliar búsqueda con nombre'}
}
lookupBtn.addEventListener('click',function(){lookupCustomer(false)});expandBtn.addEventListener('click',function(){lookupCustomer(true)});
nameInput.addEventListener('input',function(){if(nameInput.value.trim()&&status.textContent.indexOf('sólo con el RUT')>=0)expandBtn.hidden=false});

function mapQuery(){return [addressInput&&addressInput.value,cityInput&&cityInput.value,'Chile'].filter(Boolean).join(', ')}
function googleMapUrl(){if(Number.isFinite(state.lat)&&Number.isFinite(state.lng))return 'https://www.google.com/maps/search/?api=1&query='+state.lat+','+state.lng;return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(mapQuery())}
function wazeUrl(lat,lng,address){if(Number.isFinite(lat)&&Number.isFinite(lng))return 'https://www.waze.com/ul?ll='+lat+','+lng+'&navigate=yes';return 'https://www.waze.com/ul?q='+encodeURIComponent(address||'')+'&navigate=yes'}
mapBtn.addEventListener('click',function(){var q=mapQuery();if(!q&&!(Number.isFinite(state.lat)&&Number.isFinite(state.lng))){setStatus('Ingrese primero la dirección de entrega.','bad');return}window.open(googleMapUrl(),'_blank','noopener')});
gpsBtn.addEventListener('click',function(){
  if(!navigator.geolocation){setStatus('Este dispositivo no permite obtener ubicación GPS. Puede confirmar la dirección escrita.','bad');return}
  gpsBtn.disabled=true;gpsBtn.textContent='Obteniendo GPS…';
  navigator.geolocation.getCurrentPosition(function(pos){state.lat=Number(pos.coords.latitude);state.lng=Number(pos.coords.longitude);state.accuracy=Math.round(Number(pos.coords.accuracy||0));state.geoSource='device_gps';confirmLocation.checked=false;geoState.textContent='Punto GPS capturado · precisión aproximada '+state.accuracy+' m. Confirme que corresponde al lugar de entrega.';geoState.className='mscGeoState ok';gpsBtn.disabled=false;gpsBtn.textContent='Actualizar ubicación GPS'},function(err){gpsBtn.disabled=false;gpsBtn.textContent='Usar ubicación actual';setStatus(err.code===1?'El navegador no recibió permiso de ubicación. Puede confirmar la dirección escrita.':'No fue posible obtener la ubicación actual.','bad')},{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
});

async function getCfg(){
  if(state.cfg)return state.cfg;var t=await fetch('../gestion/').then(function(r){return r.text()});var base=(t.match(/var SUPABASE_URL='([^']+)'/)||[])[1]||'',key=(t.match(/var SUPABASE_KEY='([^']+)'/)||[])[1]||'';if(!base||!key)throw new Error('No se pudo abrir la conexión MSC.');state.cfg={base:base,key:key};return state.cfg;
}
async function rest(path,opt){
  var cfg=await getCfg(),token=sessionStorage.getItem('msc_token')||'';opt=opt||{};opt.headers=Object.assign({apikey:cfg.key,Authorization:'Bearer '+token,'Content-Type':'application/json'},opt.headers||{});var r=await fetch(cfg.base+path,opt),txt=await r.text(),d=txt?JSON.parse(txt):null;if(!r.ok)throw new Error((d&&d.message)||('Error '+r.status));return d;
}
function sourcePayload(){return state.sources.slice(0,8).map(function(s){return{title:String(s.title||'').slice(0,180),url:String(s.url||'').slice(0,1200)}})}
async function patchCreatedCustomer(rut,extra){
  var rows=await rest('/rest/v1/msc_customers?select=id&rut=eq.'+encodeURIComponent(rut)+'&order=created_at.desc&limit=1');if(!rows||!rows[0])throw new Error('Cliente creado, pero no pude asociar los datos de entrega.');
  var b={data_confirmed:true,address_confirmed:Boolean(extra.addressConfirmed),web_sources:sourcePayload()};
  if(extra.lookupAt)b.web_lookup_at=extra.lookupAt;if(extra.website)b.website=extra.website;if(extra.deliveryContact)b.delivery_contact_name=extra.deliveryContact;if(extra.deliveryPhone)b.delivery_phone=extra.deliveryPhone;if(extra.deliveryNotes)b.delivery_notes=extra.deliveryNotes;
  if(Number.isFinite(extra.lat)&&Number.isFinite(extra.lng)){b.latitude=extra.lat;b.longitude=extra.lng;b.geolocation_source=extra.geoSource||'device_gps';b.geolocated_at=new Date().toISOString()}
  await rest('/rest/v1/msc_customers?id=eq.'+encodeURIComponent(rows[0].id),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(b)});return rows[0].id;
}

form.onsubmit=async function(e){
  if(!confirmData.checked){e.preventDefault();setStatus('Antes de guardar, confirme que revisó los datos con el cliente.','bad');confirmData.focus();return false}
  if(!confirmLocation.checked){e.preventDefault();setStatus('Confirme también que la dirección o punto corresponde al lugar de entrega.','bad');confirmLocation.focus();return false}
  var snapshot={rut:rutInput.value.trim(),website:websiteInput.value.trim(),deliveryContact:deliveryContact.value.trim(),deliveryPhone:deliveryPhone.value.trim(),deliveryNotes:deliveryNotes.value.trim(),lat:state.lat,lng:state.lng,geoSource:state.geoSource,addressConfirmed:true,lookupAt:state.lookupAt};
  if(typeof oldSubmit==='function')await oldSubmit.call(form,e);else e.preventDefault();
  var msg=document.getElementById('customerMsg');
  if(msg&&/Cliente creado/i.test(msg.textContent||'')){
    try{var id=await patchCreatedCustomer(snapshot.rut,snapshot);msg.textContent='Cliente creado · datos verificados y ubicación de entrega disponible para despacho.';state.lat=null;state.lng=null;state.sources=[];state.lookupAt='';confirmData.checked=false;confirmLocation.checked=false;expandBtn.hidden=true;geoState.textContent='Sin punto GPS guardado. El transportista igualmente podrá abrir la dirección confirmada en el mapa.';geoState.className='mscGeoState';setTimeout(function(){refreshDeliveryCard(id)},100)}catch(err){msg.textContent='Cliente creado. '+err.message}
  }
};

async function refreshDeliveryCard(forcedId){
  var detail=document.getElementById('clientDetail');if(!detail)return;var old=document.getElementById('mscDeliveryCard');if(old)old.remove();var id=forcedId||sessionStorage.getItem('msc_sales_customer')||'';if(!id)return;
  try{
    var rows=await rest('/rest/v1/msc_customers?select=id,address,city,latitude,longitude,address_confirmed,delivery_contact_name,delivery_phone,delivery_notes,contact_name,phone,website&id=eq.'+encodeURIComponent(id)+'&limit=1');var c=rows&&rows[0];if(!c)return;
    var lat=c.latitude==null?null:Number(c.latitude),lng=c.longitude==null?null:Number(c.longitude),addr=[c.address,c.city,'Chile'].filter(Boolean).join(', '),hasCoords=Number.isFinite(lat)&&Number.isFinite(lng),gurl=hasCoords?'https://www.google.com/maps/dir/?api=1&destination='+lat+','+lng:'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(addr),wurl=wazeUrl(lat,lng,addr);
    var card=el('div',{id:'mscDeliveryCard',class:'mscDeliveryCard'});card.innerHTML='<h4>Entrega / transporte '+(c.address_confirmed?'<span class="ok">✓ confirmada</span>':'<span style="color:#9b6d16">· por verificar</span>')+'</h4><div class="mscDeliveryGrid"><div><b>Destino</b>'+esc(addr||'—')+'</div><div><b>Contacto entrega</b>'+esc(c.delivery_contact_name||c.contact_name||'—')+' · '+esc(c.delivery_phone||c.phone||'—')+'</div><div><b>GPS</b>'+(hasCoords?esc(lat.toFixed(6)+', '+lng.toFixed(6)):'No capturado')+'</div><div><b>Indicaciones</b>'+esc(c.delivery_notes||'—')+'</div></div>'+(addr||hasCoords?'<div class="mscMapLinks"><a href="'+esc(gurl)+'" target="_blank" rel="noopener">Abrir Google Maps</a><a class="waze" href="'+esc(wurl)+'" target="_blank" rel="noopener">Abrir Waze</a></div>':'');detail.appendChild(card);
  }catch(_){ }
}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-client]');if(b)setTimeout(function(){refreshDeliveryCard(b.dataset.client)},180)});
setTimeout(function(){refreshDeliveryCard()},600);

})();
