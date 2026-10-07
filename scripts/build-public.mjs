import { readFile, writeFile, mkdir, rm, copyFile } from 'node:fs/promises';
import path from 'node:path';
const files = JSON.parse(await readFile(new URL('./public-files.json', import.meta.url), 'utf8'));
const requiredPublicFiles = [
  'prototipos/msc-safety/gestion/index.html',
  'prototipos/msc-safety/ventas/index.html'
];
for (const file of requiredPublicFiles) {
  if (!files.includes(file)) files.push(file);
}
const root = path.resolve('.');
const output = path.join(root,'public');
await rm(output,{recursive:true,force:true});
for (const file of files) {
  if (file.includes('..') || file.startsWith('/') || /^(api|server|scripts|docs|docs-internos|supabase|evidencias)\//.test(file)) throw new Error('Invalid public file: '+file);
  if (!/\.(html|css|js|png|jpe?g|webp|svg|mp4|pdf|vtt|woff2)$/.test(file) && file !== 'assets/fonts/commissioner/OFL.txt') throw new Error('Invalid public extension');
  const destination = path.join(output,file);
  await mkdir(path.dirname(destination),{recursive:true});
  await copyFile(path.join(root,file),destination);
}

// MSC Safety: un solo maestro de clientes para app de ventas, gestión y portal.
// La tabla canónica es msc_customers; aquí igualamos las interfaces públicas al mismo contrato.
const customerFields = ['rut','name','address','city','contact_name','phone','email','business_activity','credit_limit','payment_terms','default_discount_percent','notes'];

const managementPath = path.join(output,'prototipos/msc-safety/gestion/index.html');
try {
  let html = await readFile(managementPath,'utf8');
  const oldCustomerForm = `<div class="formbox"><h2>Nuevo cliente</h2><p class="muted">El correo será también su identidad de acceso al portal de cotización.</p><form id="customerForm"><div class="field"><label>RUT</label><input name="rut"></div><div class="field"><label>Razón social</label><input name="name" required></div><div class="field"><label>Contacto</label><input name="contact_name"></div><div class="field"><label>Email · acceso portal</label><input name="email" type="email"></div><div class="field"><label>Condición de pago</label><input name="payment_terms"></div><div class="field"><label>Descuento base %</label><input name="default_discount_percent" type="number" min="0" step=".01" value="0"></div><button class="btn" type="submit">Guardar cliente</button></form></div>`;
  const newCustomerForm = `<div class="formbox"><h2>Nuevo cliente</h2><p class="muted">Maestro único MSC Safety · estos datos se comparten con ventas, administración y portal cliente.</p><form id="customerForm" class="formgrid"><div class="field"><label>RUT</label><input name="rut"></div><div class="field"><label>Razón social</label><input name="name" required></div><div class="field"><label>Dirección</label><input name="address"></div><div class="field"><label>Ciudad</label><input name="city"></div><div class="field"><label>Contacto</label><input name="contact_name"></div><div class="field"><label>Fono</label><input name="phone"></div><div class="field"><label>Email · acceso portal</label><input name="email" type="email"></div><div class="field"><label>Giro</label><input name="business_activity"></div><div class="field"><label>Cupo crédito</label><input name="credit_limit" type="number" min="0" step="1"></div><div class="field"><label>Condición de pago</label><input name="payment_terms"></div><div class="field"><label>Descuento base %</label><input name="default_discount_percent" type="number" min="0" step=".01" value="0"></div><div class="field full"><label>Observaciones</label><textarea name="notes" rows="3"></textarea></div><div class="full"><button class="btn" type="submit">Guardar cliente</button></div></form></div>`;
  html = html.replace(oldCustomerForm,newCustomerForm);
  html = html.replace(`<thead><tr><th>Cliente</th><th>RUT</th><th>Email</th><th>Portal</th></tr></thead><tbody id="customerRows"></tbody>`,`<thead><tr><th>Cliente</th><th>RUT</th><th>Ciudad</th><th>Fono</th><th>Email</th><th>Cupo</th><th>Condición</th><th>Portal</th></tr></thead><tbody id="customerRows"></tbody>`);
  html = html.replace(`if(el('customerRows'))el('customerRows').innerHTML=customers.map(function(c){var linked=customerUsers.some(function(u){return u.customer_id===c.id&&u.active});return '<tr><td><b>'+esc(c.name)+'</b><div class="muted">'+esc(c.contact_name||'')+'</div></td><td>'+esc(c.rut||'')+'</td><td>'+esc(c.email||'—')+'</td><td><span class="portal-status '+(linked?'on':'')+'">'+(linked?'Activo':'Pendiente activación')+'</span></td></tr>'}).join('');`,`if(el('customerRows'))el('customerRows').innerHTML=customers.map(function(c){var linked=customerUsers.some(function(u){return u.customer_id===c.id&&u.active});return '<tr><td><b>'+esc(c.name)+'</b><div class="muted">'+esc(c.contact_name||'')+(c.business_activity?' · '+esc(c.business_activity):'')+'</div></td><td>'+esc(c.rut||'')+'</td><td>'+esc(c.city||'—')+'</td><td>'+esc(c.phone||'—')+'</td><td>'+esc(c.email||'—')+'</td><td>'+money(c.credit_limit||0)+'</td><td>'+esc(c.payment_terms||'—')+'<div class="muted">Desc. '+Number(c.default_discount_percent||0)+'%</div></td><td><span class="portal-status '+(linked?'on':'')+'">'+(linked?'Activo':'Pendiente activación')+'</span></td></tr>'}).join('');`);
  html = html.replace(`el('customerForm').addEventListener('submit',async function(e){e.preventDefault();var b=formObject(e.target);b.default_discount_percent=Number(b.default_discount_percent||0);try{await authFetch('/rest/v1/msc_customers',{method:'POST',headers:{'Prefer':'return=minimal'},body:JSON.stringify(b)});e.target.reset();await loadAll()}catch(err){alert(err.message)}});`,`el('customerForm').addEventListener('submit',async function(e){e.preventDefault();var b=formObject(e.target);b.default_discount_percent=Number(b.default_discount_percent||0);b.credit_limit=b.credit_limit?Number(b.credit_limit):null;Object.keys(b).forEach(function(k){if(b[k]==='')delete b[k]});try{await authFetch('/rest/v1/msc_customers',{method:'POST',headers:{'Prefer':'return=minimal'},body:JSON.stringify(b)});e.target.reset();await loadAll()}catch(err){alert(err.message)}});`);
  html = html.replace('</script>\n</body>\n</html>',`<script>window.MSC_CUSTOMER_FIELDS=${JSON.stringify(customerFields)};</script>\n</body>\n</html>`);
  await writeFile(managementPath,html,'utf8');
} catch (error) {
  console.warn('MSC management normalization skipped:',error.message);
}

const salesPath = path.join(output,'prototipos/msc-safety/ventas/index.html');
try {
  let html = await readFile(salesPath,'utf8');
  html = html.replace(`var CUSTOMER_FIELDS=['rut','name','address','city','contact_name','phone','email','business_activity','credit_limit','payment_terms','default_discount_percent','notes'];`,`var CUSTOMER_FIELDS=${JSON.stringify(customerFields)};`);
  await writeFile(salesPath,html,'utf8');
} catch (error) {
  console.warn('MSC sales normalization skipped:',error.message);
}

const portalPath = path.join(output,'prototipos/msc-safety/index.html');
try {
  let html = await readFile(portalPath,'utf8');
  html = html.replace('msc_customers(id,name,contact_name,email)','msc_customers(id,rut,name,address,city,contact_name,email,phone,business_activity,credit_limit,payment_terms,default_discount_percent,notes)');
  await writeFile(portalPath,html,'utf8');
} catch (error) {
  console.warn('MSC portal normalization skipped:',error.message);
}

console.log(`Prepared ${files.length} public files. MSC customer contract: ${customerFields.join(', ')}. API code remains outside the public directory.`);
