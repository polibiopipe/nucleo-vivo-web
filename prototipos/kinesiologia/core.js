export const baseline = {
 office: {neck:30, elbow:135, screen:-24, feet:false, variation:false},
 lifting: {h:50, v:25, a:45, load:12, frequency:2, applicable:true},
 ankle: {exam:[]}, knee:{angle:55, exam:[]}
};
export function initialState(id){return {step:0,maxStep:0,facts:[],answers:{},rationale:'',reflection:'',lab:structuredClone(baseline[id]),submitted:false,result:null,error:''};}
// NIOSH RNLE, single task. Both endpoints require significant control.
// D=50 cm, good coupling CM=1; 30 min work + >=30 min light recovery.
// Discrete FM values from the <=1 hour table, identical for V<75 and V>=75.
export function lifting(p){
 if(!p.applicable) return {valid:false,reason:'El levantamiento con una mano queda fuera del alcance de la RNLE. Cambia la tarea antes de calcular.'};
 const fm={0.2:1,0.5:.97,1:.94,2:.91,4:.84}[p.frequency];
 if(![p.h,p.v,p.a,p.load,p.frequency].every(Number.isFinite)||p.h<25||p.h>63||p.v<25||p.v>125||p.a<0||p.a>135||p.load<1||p.load>25||!fm) return {valid:false,reason:'Las medidas quedan fuera del intervalo de este ejercicio.'};
 const hm=25/p.h, vmOrigin=1-.003*Math.abs(p.v-75), vmDest=1-.003*Math.abs(p.v+50-75),dm=.82+4.5/50,am=1-.0032*p.a;
 const origin=23*hm*vmOrigin*dm*am*fm;
 const destination=23*hm*vmDest*dm*am*fm;
 const rwl=Math.min(origin,destination);
 return {valid:true,rwl,li:p.load/rwl,origin,destination,governing:origin<=destination?'Origen':'Destino',factors:{HM:hm,VM:Math.min(vmOrigin,vmDest),DM:dm,AM:am,FM:fm,CM:1}};
}
export function grade(c,s){
 const rows=c.questions.map(q=>{const option=q.options.find(o=>o.id===s.answers[q.id]);return {id:q.id,dimension:q.dimension,question:q.text,answer:option?.text??'Sin respuesta',score:option?.score??0,feedback:option?.feedback??'Falta registrar una decisión.',critical:!!option?.critical};});
 return {rows,total:rows.reduce((n,r)=>n+r.score,0),max:c.questions.length*2,critical:rows.some(r=>r.critical),observed:s.facts.length,available:c.facts.length,lab:structuredClone(s.lab),rationale:s.rationale,completedAt:new Date().toISOString()};
}
export function canSubmit(c,s){return c.questions.every(q=>q.options.some(o=>o.id===s.answers[q.id]))&&s.rationale.trim().length>=15;}
export function escapeHtml(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
