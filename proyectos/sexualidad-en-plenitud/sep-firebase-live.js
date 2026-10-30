(function(){
"use strict";
const cfg=window.SEP_CONFIG||{},f=cfg.firebase||{};
const enabled=cfg.provider==="firebase"&&cfg.mode==="live"&&cfg.registrationOpen===true&&!!cfg.controllerName&&!!cfg.privacyContact&&!!f.apiKey&&!!f.authDomain&&!!f.projectId&&!!f.appId;
if(!enabled)return;
let svc=null,current=null,member=null,previous=null;
const get=id=>document.getElementById(id);
const popup=document.createElement("div");
popup.id="sepFirebaseDialog";
popup.className="sep-layer";
popup.hidden=true;
popup.innerHTML='<div class="sep-panel" role="dialog" aria-modal="true" aria-labelledby="sepFirebaseHeading"><div class="sep-panel-header"><div><span class="sep-eyebrow">SEXUALIDAD EN PLENITUD · CUENTAS</span><h2 class="sep-heading" id="sepFirebaseHeading">Mi comunidad</h2><p class="sep-lead" id="sepFirebaseLead"></p></div><button class="sep-close" id="sepFirebaseClose" type="button" aria-label="Cerrar">×</button></div><div class="sep-panel-body" id="sepFirebaseContent"></div></div>';
document.body.append(popup);
const area=get("sepFirebaseContent");
function setHeading(text,sub){get("sepFirebaseHeading").textContent=text;get("sepFirebaseLead").textContent=sub;}
function showError(text){const p=get("sepFirebaseError");if(p){p.textContent=text;p.dataset.state="error";}}
function showMessage(text){const p=get("sepFirebaseError");if(p){p.textContent=text;p.dataset.state="success";}}
function open(mode){previous=document.activeElement;popup.hidden=false;document.body.style.overflow="hidden";if(mode==="signin")signin();else register();get("sepFirebaseClose").focus();}
function close(){popup.hidden=true;document.body.style.overflow="";if(previous?.focus)previous.focus();}
get("sepFirebaseClose").onclick=close;
popup.onclick=e=>{if(e.target===popup)close();};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!popup.hidden)close();});
async function firebase(){
 if(svc)return svc;
 const v="13.1.0";
 const libs=await Promise.all([
 import("https://www.gstatic.com/firebasejs/"+v+"/firebase-app.js"),
 import("https://www.gstatic.com/firebasejs/"+v+"/firebase-auth.js"),
 import("https://www.gstatic.com/firebasejs/"+v+"/firebase-firestore.js")
 ]);
 const app=libs[0].initializeApp(f,"sep-live");
 svc={auth:libs[1],db:libs[2],session:libs[1].getAuth(app),store:libs[2].getFirestore(app)};
 svc.session.languageCode="es";
 return svc;
}
function register(){
 setHeading("Una comunidad que te escucha.","Crea tu cuenta y luego solicita tu club.");
 area.innerHTML='<div class="sep-note mint">No pedimos RUT, información clínica ni experiencias íntimas. Antes de continuar lee el aviso de privacidad.</div><form id="sepFirebaseRegistration"><div class="sep-grid"><label class="sep-field">Correo electrónico<input type="email" name="email" autocomplete="email" required></label><label class="sep-field">Contraseña de al menos 12 caracteres<input type="password" name="password" minlength="12" autocomplete="new-password" required></label></div><label class="sep-check"><input id="sepFbConsent" type="checkbox" required><span>Autorizo crear una cuenta para administrar mi solicitud de club y actividades. Responsable del tratamiento indicado en el aviso de privacidad.</span></label><div class="sep-actions"><button id="sepFbRegister" type="submit" class="sep-primary">Crear y verificar correo →</button><button id="sepFbToLogin" type="button" class="sep-secondary">Ya tengo cuenta</button></div><p class="sep-message" id="sepFirebaseError" role="status"></p></form>';
 get("sepFbToLogin").onclick=signin;
 get("sepFirebaseRegistration").onsubmit=async e=>{
 e.preventDefault();
 const data=new FormData(e.target),pass=String(data.get("password")||"");
 if(pass.length<12||!get("sepFbConsent").checked)return showError("Completa los datos y revisa las condiciones.");
 const btn=get("sepFbRegister");btn.disabled=true;
 try{const s=await firebase(),result=await s.auth.createUserWithEmailAndPassword(s.session,String(data.get("email")||"").trim(),pass);
 await s.auth.sendEmailVerification(result.user);await s.auth.signOut(s.session);
 e.target.reset();showMessage("Revisa tu correo, verifica tu dirección y luego ingresa para seleccionar tu club.");
 }catch(err){showError("No se pudo crear la cuenta. Revisa tus datos e inténtalo nuevamente.");}
 finally{btn.disabled=false;}
 };
}
function signin(){
 setHeading("Bienvenido a tu comunidad.","Ingresa con tu correo verificado.");
 area.innerHTML='<form id="sepFbSigninForm"><div class="sep-grid"><label class="sep-field">Correo electrónico<input name="email" type="email" autocomplete="username" required></label><label class="sep-field">Contraseña<input name="password" type="password" autocomplete="current-password" required></label></div><div class="sep-actions"><button id="sepFbSignin" type="submit" class="sep-primary">Ingresar →</button><button id="sepFbReset" type="button" class="sep-secondary">Recuperar contraseña</button><button id="sepFbToRegister" type="button" class="sep-secondary">Crear usuario</button></div><p class="sep-message" id="sepFirebaseError" role="status"></p></form>';
 get("sepFbToRegister").onclick=register;
 get("sepFbReset").onclick=async()=>{const email=String(new FormData(get("sepFbSigninForm")).get("email")||"").trim();if(!email)return showError("Escribe primero tu correo.");try{const s=await firebase();await s.auth.sendPasswordResetEmail(s.session,email);showMessage("Si existe esa cuenta, recibirás instrucciones.");}catch(err){showError("No se pudo solicitar la recuperación.");}};
 get("sepFbSigninForm").onsubmit=async e=>{
 e.preventDefault();const btn=get("sepFbSignin"),data=new FormData(e.target);btn.disabled=true;
 try{const s=await firebase(),result=await s.auth.signInWithEmailAndPassword(s.session,String(data.get("email")||"").trim(),String(data.get("password")||""));
 await s.auth.reload(result.user);await result.user.getIdToken(true);
 if(!result.user.emailVerified){await s.auth.signOut(s.session);showError("Confirma tu correo antes de ingresar.");return;}
 current=result.user;const snap=await s.db.getDoc(s.db.doc(s.store,"members",current.uid));
 member=snap.exists()?snap.data():null;
 if(member)hub();else club();
 }catch(err){showError("No fue posible ingresar. Revisa tus credenciales.");}
 finally{btn.disabled=false;}
 };
}
async function clubs(){
 const s=await firebase(),q=s.db.query(s.db.collection(s.store,"clubs"),s.db.where("status","==","verified"),s.db.limit(100));
 return (await s.db.getDocs(q)).docs.map(x=>({id:x.id,name:x.data().name}));
}
function club(){
 setHeading("¿De qué club eres parte?","El club deberá confirmar tu pertenencia antes de acceder a las actividades.");
 area.innerHTML='<div class="sep-note mint">Solo solicitamos el club y un nombre para mostrar. No hay perfiles públicos.</div><form id="sepFbClubForm"><label class="sep-field">Tu nombre para mostrar<input name="nickname" minlength="2" maxlength="60" placeholder="Ejemplo: Elena" required></label><label class="sep-field">Club de personas mayores<select id="sepFbClubs" name="clubId"><option value="">Mi club todavía no está incorporado</option></select></label><label class="sep-field" id="sepFbNewClubRow">Nombre del club que propones<input id="sepFbNewClub" name="clubName" minlength="3" maxlength="120" required></label><label class="sep-check"><input id="sepFbClubConsent" type="checkbox" required><span>Solicito vincularme a este club y autorizo usar estos datos mínimos para su verificación.</span></label><div class="sep-actions"><button id="sepFbSendClub" type="submit" class="sep-primary">Solicitar incorporación →</button></div><p class="sep-message" id="sepFirebaseError" role="status"></p></form>';
 get("sepFbClubs").onchange=()=>{get("sepFbNewClubRow").hidden=!!get("sepFbClubs").value;get("sepFbNewClub").required=!get("sepFbClubs").value;};
 clubs().then(items=>{const s=get("sepFbClubs");if(!s)return;items.forEach(i=>{const o=document.createElement("option");o.value=i.id;o.textContent=i.name;s.append(o);});}).catch(()=>showError("Directorio de clubes aún no disponible."));
 get("sepFbClubForm").onsubmit=async e=>{
 e.preventDefault();const d=new FormData(e.target),name=String(d.get("nickname")||"").trim(),id=String(d.get("clubId")||""),proposed=String(d.get("clubName")||"").trim();
 if(name.length<2||(!id&&proposed.length<3)||!get("sepFbClubConsent").checked)return showError("Completa los campos para solicitar tu club.");
 const btn=get("sepFbSendClub");btn.disabled=true;
 try{const s=await firebase(),batch=s.db.writeBatch(s.store),uid=current.uid;
 batch.set(s.db.doc(s.store,"members",uid),{nickname:name,clubId:null,createdAt:s.db.serverTimestamp(),updatedAt:s.db.serverTimestamp()});
 batch.set(s.db.doc(s.store,"clubRequests",uid),{clubId:id||null,proposedClubName:id?null:proposed,status:"pending",createdAt:s.db.serverTimestamp()});
 batch.set(s.db.doc(s.store,"consents",uid),{purpose:"community-account",version:cfg.privacyVersion,acceptedAt:s.db.serverTimestamp()});
 await batch.commit();member={nickname:name,clubId:null};hub();
 }catch(err){showError("No se pudo guardar la solicitud. Es posible que ya exista una anterior.");}
 finally{if(get("sepFbSendClub"))get("sepFbSendClub").disabled=false;}
 };
}
async function hub(){
 setHeading("Mi club y actividades.","La participación y los encuentros son siempre voluntarios.");
 area.innerHTML='<div class="sep-toolbar"><span class="sep-chip">CORREO VERIFICADO</span><button id="sepFbPrivacy" type="button">Privacidad</button></div><div class="sep-note mint" id="sepFbStatus"></div><h3 class="sep-subtitle">Encuentros interclubes</h3><div id="sepFbEvents"></div><div class="sep-actions"><button class="sep-secondary" id="sepFbLogout" type="button">Cerrar sesión</button></div><p class="sep-message" id="sepFirebaseError" role="status"></p>';
 get("sepFbPrivacy").onclick=privacy;
 get("sepFbLogout").onclick=async()=>{const s=await firebase();await s.auth.signOut(s.session);current=null;member=null;signin();};
 get("sepFbStatus").textContent=member.clubId?"Hola, "+member.nickname+". Club verificado.":"Hola, "+member.nickname+". Tu solicitud de club está pendiente de aprobación.";
 const items=get("sepFbEvents");
 if(!member.clubId){const p=document.createElement("p");p.className="sep-note";p.textContent="Cuando tu club confirme la vinculación, podrás solicitar actividades compartidas.";items.append(p);return;}
 try{
 const s=await firebase(),col=s.db.collection(s.store,"events");
 const queries=[
   s.db.query(col,s.db.where("status","==","published"),s.db.where("allVerifiedClubs","==",true),s.db.limit(30)),
   s.db.query(col,s.db.where("status","==","published"),s.db.where("invitedClubIds","array-contains",member.clubId),s.db.limit(30))
 ];
 const [one,two]=await Promise.all(queries.map(q=>s.db.getDocs(q)));
 const docs=new Map();[...one.docs,...two.docs].forEach(d=>docs.set(d.id,d));
 if(docs.size===0){items.textContent="Aún no hay actividades oficialmente publicadas.";return;}
 for(const document of docs.values()){
 const e=document.data(),card=document.createElement("article");card.className="sep-event";
 const h=document.createElement("h4");h.textContent=String(e.title||"Encuentro");
 const desc=document.createElement("p");desc.textContent=String(e.summary||"");
 const btn=document.createElement("button");btn.className="sep-secondary";btn.textContent="Solicitar inscripción";
 const eligible=e.allVerifiedClubs===true||(Array.isArray(e.invitedClubIds)&&e.invitedClubIds.includes(member.clubId));
 btn.disabled=!eligible;if(!eligible)btn.textContent="Solo clubes invitados";
 btn.onclick=async()=>{btn.disabled=true;try{await s.db.setDoc(s.db.doc(s.store,"events",document.id,"signups",current.uid),{status:"requested",createdAt:s.db.serverTimestamp()});btn.textContent="Solicitud enviada";showMessage("La organización deberá confirmar la inscripción.");}catch(err){btn.disabled=false;showError("No se pudo registrar la solicitud.");}};
 card.append(h,desc,btn);items.append(card);
 }
 }catch(err){showError("No fue posible consultar los eventos.");}
}
function privacy(){
 setHeading("Tus datos, tus decisiones.","Protegemos la autonomía y privacidad de cada participante.");
 area.innerHTML='<div class="sep-note">No se solicitan diagnósticos ni información sexual para crear una cuenta. La Ley 21.719 entra en vigor el 1 de diciembre de 2026.</div><div class="sep-dashboard"><div class="sep-tile"><strong>Datos mínimos</strong><p>Correo, seudónimo y club; se requiere consentimiento para fines distintos.</p></div><div class="sep-tile"><strong>Acceso</strong><p>No existen perfiles públicos; la coordinación verifica los clubes.</p></div><div class="sep-tile"><strong>Derechos</strong><p>Puedes solicitar acceso, corrección, supresión o retirar tu consentimiento.</p></div><div class="sep-tile"><strong>Seguridad</strong><p>Las conversaciones íntimas permanecen deshabilitadas hasta las validaciones legales y técnicas.</p></div></div><div class="sep-actions"><button id="sepFbPrivacyBack" class="sep-primary">Volver</button><button id="sepFbPrivacyDelete" class="sep-secondary">Solicitar eliminación</button></div><p class="sep-message" id="sepFirebaseError" role="status"></p>';
 get("sepFbPrivacyBack").onclick=()=>current?hub():register();
 get("sepFbPrivacyDelete").onclick=async()=>{if(!current)return showError("Debes ingresar para hacer una solicitud.");if(!confirm("¿Quieres solicitar la eliminación? Requerirá verificación del responsable."))return;try{const s=await firebase();await s.db.addDoc(s.db.collection(s.store,"privacyRequests"),{uid:current.uid,type:"deletion",status:"open",createdAt:s.db.serverTimestamp()});showMessage("Solicitud registrada para gestión, no eliminación automática.");}catch(err){showError("No fue posible registrar la solicitud.");}};
}
window.SEP_ACCOUNT={open,openRegister:()=>open("register"),openLogin:()=>open("signin"),openPreview:()=>open("register")};
})();