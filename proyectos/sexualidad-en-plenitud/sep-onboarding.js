/* Sexualidad en Plenitud · Registro, clubes y actividades (sin datos sensibles) */
(function () {
 "use strict";
 const cfg=window.SEP_CONFIG||{};
 const ready=cfg.mode==="live"&&cfg.registrationOpen===true&&cfg.supabaseUrl&&cfg.supabasePublishableKey&&cfg.controllerName&&cfg.privacyContact;
 let api=null,user=null,profile=null,tab="register",sampleName="Persona de ejemplo",sampleClub="Club de ejemplo";
 const root=document.createElement("div");
 root.className="sep-layer";root.id="sepCommunityLayer";root.hidden=true;
 root.innerHTML='<div class="sep-panel" role="dialog" aria-modal="true" aria-labelledby="sepCommunityTitle"><div class="sep-panel-header"><div><span class="sep-eyebrow">SEXUALIDAD EN PLENITUD · VILLA ALEMANA</span><h2 id="sepCommunityTitle" class="sep-heading">Tu comunidad, a tu ritmo.</h2><p class="sep-lead" id="sepCommunityIntro"></p></div><button class="sep-close" id="sepCommunityClose" type="button" aria-label="Cerrar">×</button></div><div id="sepCommunityContent" class="sep-panel-body"></div></div>';
 document.body.append(root);
 const el=id=>document.getElementById(id),space=el("sepCommunityContent");
 const notice='<div class="sep-note"><b>Demostración sin cuentas reales:</b> no ingreses datos personales. La inscripción real se habilitará únicamente cuando exista infraestructura independiente y la documentación de privacidad esté aprobada.</div>';
 let priorFocus=null;
 function msg(t,error){const m=el("sepCommunityMessage");if(m){m.textContent=t;m.dataset.state=error?"error":"success"}}
 function title(a,b){el("sepCommunityTitle").textContent=a;el("sepCommunityIntro").textContent=b}
 function nav(t){return '<div class="sep-choice"><button type="button" class="sep-pill" data-septab="register" aria-pressed="'+(t==="register")+'">Crear usuario</button><button type="button" class="sep-pill" data-septab="signin" aria-pressed="'+(t==="signin")+'">Ingresar</button><button type="button" class="sep-pill" data-septab="preview" aria-pressed="'+(t==="preview")+'">Explorar demo</button></div>'}
 function hookNav(){space.querySelectorAll("[data-septab]").forEach(b=>b.onclick=()=>show(b.dataset.septab))}
 function open(t){priorFocus=document.activeElement;root.hidden=false;document.body.style.overflow="hidden";show(t||"register");el("sepCommunityClose").focus()}
 function close(){root.hidden=true;document.body.style.overflow="";if(priorFocus&&priorFocus.focus)priorFocus.focus()}
 el("sepCommunityClose").onclick=close;root.onclick=e=>{if(e.target===root)close()};
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!root.hidden)close()});
 async function backend(){
   if(!ready)throw Error("Registro real no disponible");
   if(!api){const mod=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm");api=mod.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,detectSessionInUrl:true,autoRefreshToken:true}})}
   return api;
 }
 function show(t){tab=t;if(t==="register")register();else if(t==="signin")signin();else if(t==="preview")preview();else if(t==="hub")hub();else if(t==="privacy")privacy();}
 async function clubs(){
   try{const db=await backend();const response=await db.from("sep_clubs").select("id,name,commune").eq("status","verified").order("name").limit(100);if(response.error)throw response.error;
   (response.data||[]).forEach(c=>{let o=document.createElement("option");o.value=c.id;o.textContent=c.name+" · "+c.commune;el("sepClubSelect").append(o)})}
   catch(e){msg("El directorio de clubes aún no está disponible.",true)}
 }
 function register(){
  title("Hazte parte de la conversación.","Crea tu usuario y solicita la vinculación a tu club. Nadie tendrá que contar información íntima.");
  space.innerHTML=nav("register")+(ready?"":notice)+'<form id="sepRegistration"><div class="sep-grid"><label class="sep-field">Nombre para mostrar <span class="sep-hint">Puede ser un seudónimo. No publiques tu nombre completo.</span><input name="nickname" maxlength="60" minlength="2" required placeholder="Ejemplo: Carmen"></label><label class="sep-field">Mi club de personas mayores <span class="sep-hint">Pertenecer a un club requiere verificación posterior.</span><select name="club" id="sepClubSelect"><option value="">Mi club no aparece todavía</option></select></label></div><label class="sep-field" id="sepNewClubLabel">Nombre del club que deseas proponer<input name="newclub" id="sepNewClub" maxlength="120" minlength="3" required placeholder="Ejemplo: Club de mi barrio"><span class="sep-hint">La propuesta queda pendiente de confirmación por representantes del club.</span></label><div class="sep-grid" id="sepRealCredentials" '+(ready?"":'hidden')+'><label class="sep-field">Correo electrónico<input name="email" type="email" autocomplete="email" '+(ready?"required":"")+'></label><label class="sep-field">Contraseña <span class="sep-hint">Mínimo 12 caracteres.</span><input name="password" type="password" autocomplete="new-password" minlength="12" '+(ready?"required":"")+'></label></div><label class="sep-check"><input id="sepApproval" type="checkbox" required><span>'+(ready?"Acepto el tratamiento mínimo de datos exclusivamente para gestionar mi cuenta, club y actividades.":"Sé que esto es una demostración, sin registro real, y no escribiré información personal.")+' <a href="#" id="sepReadPrivacy">Ver el aviso de privacidad</a>.</span></label><div class="sep-actions"><button id="sepSubmit" class="sep-primary" type="submit">'+(ready?"Crear cuenta y verificar correo":"Simular incorporación")+' →</button><button type="button" id="sepSkip" class="sep-secondary">Explorar sin registrar</button></div><p id="sepCommunityMessage" class="sep-message" role="status"></p></form>';
  hookNav();el("sepSkip").onclick=()=>show("preview");el("sepReadPrivacy").onclick=e=>{e.preventDefault();show("privacy")};
  el("sepClubSelect").onchange=()=>{el("sepNewClubLabel").hidden=!!el("sepClubSelect").value;el("sepNewClub").required=!el("sepClubSelect").value};
  if(ready)clubs();
  el("sepRegistration").onsubmit=async e=>{
    e.preventDefault();const f=new FormData(e.target);const nickname=String(f.get("nickname")||"").trim(),club=String(f.get("club")||""),suggested=String(f.get("newclub")||"").trim();
    if(nickname.length<2||(!club&&suggested.length<3))return msg("Completa el nombre para mostrar y tu club.",true);
    if(!el("sepApproval").checked)return msg("Debes aceptar para continuar.",true);
    if(!ready){sampleName=nickname;sampleClub=suggested||"Club de ejemplo";show("hub");return}
    const email=String(f.get("email")||"").trim(),password=String(f.get("password")||"");
    if(password.length<12)return msg("Tu contraseña necesita al menos 12 caracteres.",true);
    el("sepSubmit").disabled=true;
    try{
     const db=await backend(),ret=await db.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname,data:{sep_nickname:nickname,sep_requested_club_id:club||null,sep_requested_club_name:club?null:suggested,sep_consent_version:cfg.privacyVersion}}});
     if(ret.error)throw ret.error;
     if(ret.data.session){user=ret.data.user;await ensureProfile()}
     msg("Revisa tu correo para verificar el acceso. La pertenencia al club requerirá validación.",false);
    }catch(err){msg("No fue posible iniciar la inscripción. Revisa los datos e inténtalo nuevamente.",true)}
    finally{el("sepSubmit").disabled=false}
  };
 }
 async function ensureProfile(){
   const db=await backend(),auth=await db.auth.getUser();if(auth.error||!auth.data.user)throw Error("Sesión no verificada");
   user=auth.data.user;const own=await db.from("sep_profiles").select("nickname,club_id").eq("user_id",user.id).maybeSingle();
   if(own.error)throw own.error;
   if(!own.data){
    const md=user.user_metadata||{},nickname=String(md.sep_nickname||"").trim();
    if(nickname.length<2)throw Error("Nombre de visualización pendiente");
    const cr=await db.from("sep_profiles").insert({user_id:user.id,nickname});if(cr.error&&cr.error.code!=="23505")throw cr.error;
    const club=md.sep_requested_club_id,suggested=md.sep_requested_club_name;
    if(club||suggested){
      const rq=await db.from("sep_join_requests").select("id").eq("user_id",user.id).eq("status","pending").limit(1);
      if(!rq.data?.length){const j=await db.from("sep_join_requests").insert({user_id:user.id,club_id:club||null,proposed_club_name:club?null:String(suggested).slice(0,120)});if(j.error)throw j.error}
    }
    const c=await db.from("sep_consents").insert({user_id:user.id,purpose:"community_account",document_version:cfg.privacyVersion});if(c.error)throw c.error;
   }
   const p=await db.from("sep_profiles").select("nickname,club_id").eq("user_id",user.id).single();if(p.error)throw p.error;profile=p.data;
 }
 function signin(){
  title("Qué bueno tenerte aquí.","Accede a tu club y a tus actividades.");
  space.innerHTML=nav("signin")+(ready?"":notice)+'<form id="sepSigninForm"><div class="sep-grid"><label class="sep-field">Correo<input type="email" name="email" autocomplete="username" required '+(ready?"":"disabled")+'></label><label class="sep-field">Contraseña<input name="password" type="password" autocomplete="current-password" required '+(ready?"":"disabled")+'></label></div><div class="sep-actions"><button id="sepLogin" class="sep-primary" type="submit" '+(ready?"":"disabled")+' >Ingresar a mi comunidad</button><button type="button" id="sepDemo" class="sep-secondary">Explorar demostración</button><button id="sepResetPassword" type="button" class="sep-secondary" '+(ready?"":"disabled")+' >Olvidé mi contraseña</button></div><p id="sepCommunityMessage" class="sep-message" role="status"></p></form>';
  hookNav();el("sepDemo").onclick=()=>show("preview");
  el("sepResetPassword").onclick=async()=>{const email=String(new FormData(el("sepSigninForm")).get("email")||"").trim();if(!email)return msg("Indica tu correo.",true);try{const db=await backend(),r=await db.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(r.error)throw r.error;msg("Si tienes una cuenta, recibirás instrucciones para recuperar el acceso.",false)}catch(e){msg("No fue posible enviar las instrucciones.",true)}};
  el("sepSigninForm").onsubmit=async e=>{e.preventDefault();if(!ready)return;el("sepLogin").disabled=true;try{const db=await backend(),fd=new FormData(e.target),r=await db.auth.signInWithPassword({email:String(fd.get("email")||"").trim(),password:String(fd.get("password")||"")});if(r.error)throw r.error;await ensureProfile();show("hub")}catch(err){msg("No pudimos ingresar. Verifica el correo y la contraseña.",true)}finally{el("sepLogin").disabled=false}};
 }
 function preview(){
  title("Una comunidad que se construye juntos.","Explora cómo se organizarían los clubes y los encuentros.");
  space.innerHTML=nav("preview")+'<div class="sep-note mint">Estos ejemplos no corresponden a actividades reales. No pedimos ni almacenamos experiencias íntimas.</div><div class="sep-dashboard"><div class="sep-tile"><strong>Mi club, mi comunidad</strong><p>Solicita pertenencia a un club. Una coordinación verifica su afiliación antes de autorizar actividades interclubes.</p><button id="sepShowRegistration" class="sep-secondary">Conocer registro</button></div><div class="sep-tile"><strong>Conversemos con Psicología</strong><p>Preguntas moderadas y talleres con profesionales, sin reemplazar atención clínica.</p><button id="sepExampleEvents" class="sep-secondary">Ver actividades</button></div></div><div class="sep-featureline"><span>🎙️ Voz a texto</span><span>🗓️ Encuentros grupales</span><span>🛡️ Privacidad</span><span>🌼 Sin «match»</span></div><p id="sepCommunityMessage" class="sep-message" role="status"></p>';
  hookNav();el("sepShowRegistration").onclick=()=>show("register");el("sepExampleEvents").onclick=()=>show("hub");
 }
 async function hub(){
  title("Tu espacio, a tu ritmo.","Clubes, actividades y participación interclubes.");
  if(!ready){
    space.innerHTML='<div class="sep-toolbar"><span class="sep-chip">DEMOSTRACIÓN SIN DATOS REALES</span><button id="sepSeePrivacy">Privacidad y derechos</button></div><div class="sep-note mint">Hola, <b id="sepSampleName"></b>. Club: <b id="sepSampleClub"></b>. Solicitud pendiente de verificación en este ejemplo.</div><div class="sep-dashboard"><div class="sep-tile"><strong>¿Cómo se valida mi club?</strong><p>Una persona responsable del club verifica la membresía. No basta con seleccionar su nombre.</p></div><div class="sep-tile"><strong>¿Cómo funcionan los interclubes?</strong><p>La coordinación publica actividades con sedes autorizadas, y cada club confirma quiénes pueden participar.</p></div></div><h3 class="sep-subtitle">Actividades ilustrativas</h3><div class="sep-event"><span class="sep-chip">EJEMPLO · SIN FECHA</span><h4>Sexualidad y afectividad: preguntas sin vergüenza</h4><p>Conversatorio grupal con facilitación psicológica y participación voluntaria.</p><button class="sep-secondary" data-sep-interest type="button">Me interesa</button></div><div class="sep-event"><span class="sep-chip">EJEMPLO · INTERCLUBES</span><h4>Encuentro entre clubes: mitos y derechos</h4><p>Actividad comunitaria moderada y coordinada en sedes de clubes.</p><button class="sep-secondary" data-sep-interest type="button">Me interesa</button></div><p id="sepCommunityMessage" class="sep-message" role="status"></p>';
    el("sepSampleName").textContent=sampleName;el("sepSampleClub").textContent=sampleClub;el("sepSeePrivacy").onclick=()=>show("privacy");
    space.querySelectorAll("[data-sep-interest]").forEach(b=>b.onclick=()=>{b.textContent="Interés marcado (solo demo)";b.disabled=true;msg("No se ha realizado ninguna inscripción real.",false)});
    return;
  }
  space.innerHTML='<div class="sep-note mint">Verificando tu club y actividades…</div><p id="sepCommunityMessage" class="sep-message" role="status"></p>';
  try{await ensureProfile();const db=await backend();const own=await db.from("sep_join_requests").select("status,proposed_club_name").eq("user_id",user.id).order("submitted_at",{ascending:false}).limit(1);
   let clubName="Club pendiente de validación";if(profile.club_id){const c=await db.from("sep_clubs").select("name").eq("id",profile.club_id).maybeSingle();clubName=c.data?.name||clubName}
   space.innerHTML='<div class="sep-toolbar"><span class="sep-chip">CUENTA VERIFICADA</span><button id="sepSeePrivacy">Mis datos y derechos</button></div><div class="sep-note mint">Hola, <b id="sepRealName"></b>. Estado de club: <b id="sepRealClub"></b>.</div><h3 class="sep-subtitle">Mis actividades interclubes</h3><div id="sepRealEvents"></div><div class="sep-actions"><button id="sepSignout" class="sep-secondary">Cerrar sesión</button></div><p id="sepCommunityMessage" class="sep-message" role="status"></p>';
   el("sepRealName").textContent=profile.nickname;el("sepRealClub").textContent=profile.club_id?clubName:(own.data?.[0]?.proposed_club_name||"pendiente");
   el("sepSeePrivacy").onclick=()=>show("privacy");el("sepSignout").onclick=async()=>{await db.auth.signOut();user=null;profile=null;show("signin")};
   const events=await db.from("sep_events").select("id,title,summary,starts_at,venue").eq("status","published").order("starts_at",{ascending:true}).limit(30);
   if(events.error)throw events.error;
   const target=el("sepRealEvents");if(!events.data?.length){target.innerHTML='<div class="sep-note">Aún no hay encuentros oficialmente confirmados para tu club.</div>';return}
   for(const item of events.data){const card=document.createElement("article");card.className="sep-event";const label=document.createElement("span");label.className="sep-chip";label.textContent=new Date(item.starts_at).toLocaleString("es-CL",{dateStyle:"long",timeStyle:"short"})+" · "+item.venue;const h=document.createElement("h4");h.textContent=item.title;const desc=document.createElement("p");desc.textContent=item.summary;const button=document.createElement("button");button.type="button";button.className="sep-secondary";button.textContent="Solicitar inscripción";button.onclick=async()=>{button.disabled=true;const result=await db.from("sep_event_signups").insert({event_id:item.id,user_id:user.id});if(result.error){button.disabled=false;msg("No fue posible registrar tu solicitud; quizá ya exista.",true)}else{button.textContent="Solicitud registrada";msg("La coordinación deberá confirmar la inscripción.",false)}};card.append(label,h,desc,button);target.append(card)}
  }catch(e){msg("No pudimos cargar tu información. Contacta a la coordinación del piloto.",true)}
 }
 function privacy(){
  title("Tus datos, tus decisiones.","La privacidad es parte del bienestar y la participación segura.");
  space.innerHTML='<div class="sep-note">La Ley 21.719 entrará en vigor el 1 de diciembre de 2026. La comunidad no recoge relatos de vida sexual, audios ni información clínica durante esta fase.</div><div class="sep-dashboard"><div class="sep-tile"><strong>Recogida mínima</strong><p>Correo, seudónimo, club solicitado, autorización e inscripciones voluntarias. No pedimos RUT, diagnósticos ni orientación sexual.</p></div><div class="sep-tile"><strong>¿Quién accede?</strong><p>Cada persona ve sus propias solicitudes. La adscripción a clubes requiere verificación administrativa, con controles de acceso.</p></div><div class="sep-tile"><strong>Derechos</strong><p>Puedes solicitar acceso, corrección o eliminación de datos, y retirar tus consentimientos. La gestión de solicitudes requiere responsable identificable.</p></div><div class="sep-tile"><strong>Privacidad desde el diseño</strong><p>Sin perfiles públicos ni búsqueda de parejas. Los contenidos íntimos estarán deshabilitados hasta completar evaluaciones de impacto y protocolos.</p></div></div><div class="sep-actions"><button class="sep-primary" id="sepReturn" type="button">Volver</button>'+(ready&&user?'<button class="sep-secondary" id="sepDeleteRequest" type="button">Solicitar eliminación de datos</button>':"")+'</div><p id="sepCommunityMessage" class="sep-message" role="status"></p>';
  el("sepReturn").onclick=()=>show(user?"hub":"register");
  if(el("sepDeleteRequest"))el("sepDeleteRequest").onclick=async()=>{if(!confirm("¿Quieres registrar una solicitud de eliminación? Requerirá gestión por la entidad responsable."))return;try{const db=await backend(),r=await db.from("sep_privacy_requests").insert({user_id:user.id,request_type:"deletion"});if(r.error)throw r.error;msg("Solicitud registrada para revisión. No equivale a eliminación automática.",false)}catch(e){msg("No se pudo registrar la solicitud. Debe contactarse a la coordinación.",true)}};
 }
 window.SEP_ACCOUNT={open,openLogin:()=>open("signin"),openRegister:()=>open("register"),openPreview:()=>open("preview")};
})();
