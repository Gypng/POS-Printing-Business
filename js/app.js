const $=s=>document.querySelector(s);
const KEY='printpos_v1';
const seed={settings:{shop:'Dastrict Digital Printmedia',cur:'₱',tax:0},cats:['T-Shirts','Tarpaulin','Stickers','Documents'],
products:[
{id:1,name:'Custom T-Shirt',cat:'T-Shirts',type:'fixed',price:350,bq:12,bp:300},
{id:2,name:'Tarpaulin',cat:'Tarpaulin',type:'sqft',price:15,bq:0,bp:0},
{id:3,name:'Vinyl Sticker',cat:'Stickers',type:'fixed',price:25,bq:50,bp:18},
{id:4,name:'Document Print B/W',cat:'Documents',type:'fixed',price:3,bq:100,bp:2}],sales:[],nid:5};
let D;try{D=JSON.parse(localStorage[KEY])}catch{D=null}
if(!D)D=structuredClone(seed);
const save=()=>{try{localStorage[KEY]=JSON.stringify(D)}catch(e){alert('Storage is full. Export a backup in Settings, then reset old data.')}};
const money=n=>D.settings.cur+Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let cart=[],cat='All',design=null;

/* ---------- SALES ---------- */
const unit=i=>i.type==='sqft'?i.price*i.w*i.h:(i.bq&&i.qty>=i.bq?i.bp:i.price);
function renderPOS(){
  $('#brand').textContent=D.settings.shop;document.title=D.settings.shop;
  $('#catTabs').innerHTML=['All',...D.cats].map(c=>`<button class="btn btn-sm ${c===cat?'btn-dark':'btn-outline-dark'}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  const q=$('#search').value.toLowerCase();
  const ps=D.products.filter(p=>(cat==='All'||p.cat===cat)&&p.name.toLowerCase().includes(q));
  $('#grid').innerHTML=ps.map(p=>`<div class="col-6 col-md-4"><button class="prod w-100" data-add="${p.id}"><b>${esc(p.name)}</b><span>${money(p.price)}${p.type==='sqft'?' / sq ft':''}</span>${p.bq?`<small>${p.bq}+ pcs: ${money(p.bp)}</small>`:''}</button></div>`).join('')||'<p class="text-muted">No products here. Add some in the Products tab.</p>';
  renderCart();
}
function addToCart(id){
  const p=D.products.find(x=>x.id==id);let w=0,h=0;
  if(p.type==='sqft'){w=+prompt('Width (ft)?');h=+prompt('Height (ft)?');if(!(w>0&&h>0))return}
  const ex=cart.find(i=>i.pid==id&&i.w==w&&i.h==h);
  ex?ex.qty++:cart.push({pid:id,name:p.name,cat:p.cat,type:p.type,price:p.price,bq:p.bq,bp:p.bp,qty:1,w,h});
  renderCart();
}
function calc(){
  const sub=cart.reduce((s,i)=>s+unit(i)*i.qty,0),disc=Math.min(+$('#disc').value||0,sub);
  const tax=(sub-disc)*(D.settings.tax/100);return{sub,disc,tax,total:sub-disc+tax};
}
function renderCart(){
  $('#cartList').innerHTML=cart.map((i,n)=>`<div class="line"><span class="nm">${esc(i.name)}${i.type==='sqft'?` <small>(${i.w}×${i.h} ft)</small>`:''}<br><small>${money(unit(i))} each</small></span>
  <button class="btn btn-sm btn-light" data-q="${n}" data-d="-1">−</button><b>${i.qty}</b><button class="btn btn-sm btn-light" data-q="${n}" data-d="1">+</button>
  <span style="width:80px;text-align:right">${money(unit(i)*i.qty)}</span></div>`).join('')||'<p class="text-muted small">Tap a product to add it.</p>';
  const t=calc();
  $('#totals').innerHTML=`<div class="d-flex justify-content-between"><span>Subtotal</span>${money(t.sub)}</div>`+(t.tax?`<div class="d-flex justify-content-between"><span>Tax</span>${money(t.tax)}</div>`:'')+`<div class="d-flex justify-content-between fs-5 fw-bold"><span>Total</span>${money(t.total)}</div>`;
  $('#designNote').textContent=design?'Design preview attached to this order.':'';
}
function checkout(){
  if(!cart.length)return alert('Add at least one item.');
  const t=calc(),pv=$('#paid').value,paid=pv===''?t.total:Math.min(+pv,t.total);
  const s={id:D.nid++,date:new Date().toISOString(),cust:$('#cust').value||'Walk-in',items:cart.map(i=>({name:i.name,cat:i.cat,qty:i.qty,unit:unit(i),w:i.w,h:i.h})),
    sub:t.sub,disc:t.disc,tax:t.tax,total:t.total,paid,method:$('#method').value,status:$('#status').value,design};
  D.sales.push(s);save();receipt(s);
  cart=[];design=null;['#cust','#paid'].forEach(x=>$(x).value='');$('#disc').value=0;renderCart();renderReports();
}
function receipt(s){
  const w=open('','_blank','width=380,height=640');if(!w)return alert('Allow pop-ups to print receipts.');
  w.document.write(`<body style="font:13px monospace;width:300px;margin:auto"><h3 style="text-align:center;margin:4px">${esc(D.settings.shop)}</h3>
  <div>Order #${s.id} · ${new Date(s.date).toLocaleString()}<br>Customer: ${esc(s.cust)}</div><hr>
  ${s.items.map(i=>`<div>${i.qty} × ${esc(i.name)}${i.w?` (${i.w}×${i.h}ft)`:''}<span style="float:right">${money(i.unit*i.qty)}</span></div>`).join('')}<hr>
  <div>Discount<span style="float:right">${money(s.disc)}</span></div><div>Tax<span style="float:right">${money(s.tax)}</span></div>
  <div><b>Total<span style="float:right">${money(s.total)}</span></b></div><div>Paid (${s.method})<span style="float:right">${money(s.paid)}</span></div>
  <div><b>Balance<span style="float:right">${money(s.total-s.paid)}</span></b></div><div>Status: ${s.status}</div>
  ${s.design?`<hr><img src="${s.design}" style="width:100%">`:''}<p style="text-align:center">Thank you!</p><script>print()<\/script>`);
  w.document.close();
}

/* ---------- PRODUCTS ---------- */
function renderProducts(){
  $('#pcat').innerHTML=D.cats.map(c=>`<option>${esc(c)}</option>`).join('');
  $('#catList').innerHTML=D.cats.map(c=>`<span class="badge text-bg-dark">${esc(c)} <a href="#" class="text-white ms-1" data-delcat="${esc(c)}">×</a></span>`).join('');
  $('#prodRows').innerHTML=D.products.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.cat)}</td><td>${money(p.price)}${p.type==='sqft'?'/sq ft':''}</td><td>${p.bq?`${p.bq}+ @ ${money(p.bp)}`:'–'}</td>
  <td class="text-end"><button class="btn btn-sm btn-outline-dark" data-edit="${p.id}">Edit</button> <button class="btn btn-sm btn-outline-danger" data-del="${p.id}">Delete</button></td></tr>`).join('');
}
function clearForm(){['#pid','#pname','#pprice','#pbq','#pbp'].forEach(x=>$(x).value='');$('#pfTitle').textContent='Add product'}
function saveProduct(){
  const name=$('#pname').value.trim(),price=+$('#pprice').value;
  if(!name||!(price>=0)||!D.cats.length)return alert('Enter a name, a price, and add a category first.');
  const p={name,cat:$('#pcat').value,type:$('#ptype').value,price,bq:+$('#pbq').value||0,bp:+$('#pbp').value||0},id=$('#pid').value;
  if(id)Object.assign(D.products.find(x=>x.id==id),p);else D.products.push({id:D.nid++,...p});
  save();clearForm();renderProducts();renderPOS();
}

/* ---------- REPORTS ---------- */
let shown=[];
function renderReports(){
  const days=+$('#range').value,from=days===0?0:days===1?new Date().setHours(0,0,0,0):Date.now()-days*864e5;
  shown=D.sales.filter(s=>new Date(s.date)>=from).reverse();
  const rev=shown.reduce((a,s)=>a+s.paid,0),tot=shown.reduce((a,s)=>a+s.total,0);
  $('#stats').innerHTML=[['Orders',shown.length],['Total sales',money(tot)],['Collected',money(rev)],['Unpaid balance',money(tot-rev)]].map(([l,v])=>`<div class="col-6 col-md-3"><div class="stat">${l}<b>${v}</b></div></div>`).join('');
  const bc={},tp={};
  shown.forEach(s=>s.items.forEach(i=>{bc[i.cat]=(bc[i.cat]||0)+i.unit*i.qty;tp[i.name]=(tp[i.name]||0)+i.qty}));
  $('#byCat').innerHTML=Object.entries(bc).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${esc(k)}</td><td class="text-end">${money(v)}</td></tr>`).join('')||'<tr><td class="text-muted">No sales yet.</td></tr>';
  $('#topP').innerHTML=Object.entries(tp).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>`<tr><td>${esc(k)}</td><td class="text-end">${v} sold</td></tr>`).join('')||'<tr><td class="text-muted">No sales yet.</td></tr>';
  $('#orders').innerHTML=shown.map(s=>`<tr><td>${s.id}</td><td>${new Date(s.date).toLocaleDateString()}</td><td>${esc(s.cust)}</td><td>${money(s.total)}</td><td>${money(s.total-s.paid)}</td>
  <td><select class="form-select form-select-sm" data-st="${s.id}">${['Pending','In production','Ready','Claimed'].map(o=>`<option${o===s.status?' selected':''}>${o}</option>`).join('')}</select></td>
  <td class="no-print text-nowrap">${s.total-s.paid>0?`<button class="btn btn-sm btn-outline-dark" data-pay="${s.id}">Collect</button> `:''}<button class="btn btn-sm btn-light" data-rc="${s.id}">Receipt</button></td></tr>`).join('');
}
function exportCSV(){
  const rows=[['Order','Date','Customer','Items','Total','Paid','Balance','Method','Status'],...shown.map(s=>[s.id,s.date,s.cust,s.items.map(i=>i.qty+'x '+i.name).join('; '),s.total,s.paid,s.total-s.paid,s.method,s.status])];
  download(new Blob([rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')],{type:'text/csv'}),'sales-report.csv');
}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click()}

/* ---------- DESIGN PREVIEW ---------- */
const cv=$('#cv'),cx=cv.getContext('2d');let L=[],sel=-1;
const SHIRT=new Path2D('M150 60L200 40Q250 70 300 40L350 60L440 130L395 180L350 150L350 440L150 440L150 150L105 180L60 130Z');
function drawDesign(){
  cx.clearRect(0,0,500,480);const t=$('#dprod').value;let a;
  document.querySelectorAll('.flat').forEach(e=>e.style.display=t==='shirt'?'none':'');
  cx.fillStyle=$('#dcol').value;cx.strokeStyle='#0004';cx.setLineDash([]);
  if(t==='shirt'){cx.fill(SHIRT);cx.stroke(SHIRT);a=[165,130,170,270]}
  else{const w=+$('#dw').value||1,h=+$('#dh').value||1,k=Math.min(450/w,430/h),W=w*k,H=h*k,x=(500-W)/2,y=(480-H)/2;a=[x,y,W,H];
    cx.beginPath();t==='sticker'?cx.ellipse(250,240,W/2,H/2,0,0,7):cx.rect(x,y,W,H);cx.fill();cx.stroke()}
  cx.save();cx.beginPath();cx.rect(...a);cx.clip();
  L.forEach((l,i)=>{cx.save();cx.translate(l.x,l.y);cx.rotate(l.r*Math.PI/180);cx.scale(l.s,l.s);
    if(l.t==='img')cx.drawImage(l.img,-l.img.width/2,-l.img.height/2);
    else{cx.font='bold 48px Bricolage Grotesque,sans-serif';cx.fillStyle=l.c;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(l.txt,0,0)}
    cx.restore()});
  cx.restore();cx.setLineDash([6,4]);cx.strokeStyle='#e6007e';cx.strokeRect(...a);
  $('#layers').innerHTML=L.map((l,i)=>`<button class="btn btn-sm ${i===sel?'btn-dark':'btn-outline-dark'}" data-layer="${i}">${l.t==='img'?'Image':esc(l.txt.slice(0,10))}</button>`).join('');
  if(L[sel]){$('#ds').value=L[sel].s;$('#dr').value=L[sel].r}
}
function pushLayer(l){L.push({x:250,y:250,s:1,r:0,...l});sel=L.length-1;drawDesign()}
let drag=null;
cv.onpointerdown=e=>{if(sel<0)return;drag=[e.clientX,e.clientY];cv.setPointerCapture(e.pointerId)};
cv.onpointermove=e=>{if(!drag||sel<0)return;const k=cv.width/cv.clientWidth;L[sel].x+=(e.clientX-drag[0])*k;L[sel].y+=(e.clientY-drag[1])*k;drag=[e.clientX,e.clientY];drawDesign()};
cv.onpointerup=()=>drag=null;
function thumb(){const c=document.createElement('canvas');c.width=250;c.height=240;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,250,240);x.drawImage(cv,0,0,250,240);return c.toDataURL('image/jpeg',.6)}

/* ---------- EVENTS ---------- */
document.addEventListener('click',e=>{
  const g=a=>e.target.closest(`[data-${a}]`)?.dataset[a];
  if(g('cat')!==undefined){cat=g('cat');renderPOS()}
  if(g('add'))addToCart(g('add'));
  if(g('q')!==undefined){const i=cart[g('q')];i.qty+=+g('d');if(i.qty<1)cart.splice(g('q'),1);renderCart()}
  if(g('layer')!==undefined){sel=+g('layer');drawDesign()}
  if(g('edit')){const p=D.products.find(x=>x.id==g('edit'));$('#pid').value=p.id;$('#pname').value=p.name;$('#pcat').value=p.cat;$('#ptype').value=p.type;$('#pprice').value=p.price;$('#pbq').value=p.bq;$('#pbp').value=p.bp;$('#pfTitle').textContent='Edit product'}
  if(g('del')&&confirm('Delete this product?')){D.products=D.products.filter(x=>x.id!=g('del'));save();renderProducts();renderPOS()}
  if(g('delcat')){e.preventDefault();if(confirm('Delete this category?')){D.cats=D.cats.filter(c=>c!==g('delcat'));save();renderProducts();renderPOS()}}
  if(g('pay')){const s=D.sales.find(x=>x.id==g('pay'));s.paid=s.total;save();renderReports()}
  if(g('rc'))receipt(D.sales.find(x=>x.id==g('rc')));
});
document.addEventListener('change',e=>{const id=e.target.dataset.st;if(id){D.sales.find(x=>x.id==id).status=e.target.value;save()}});
$('#search').oninput=renderPOS;$('#disc').oninput=renderCart;$('#checkout').onclick=checkout;
$('#psave').onclick=saveProduct;$('#pclear').onclick=clearForm;
$('#cadd').onclick=()=>{const c=$('#ccat').value.trim();if(c&&!D.cats.includes(c)){D.cats.push(c);$('#ccat').value='';save();renderProducts();renderPOS()}};
$('#range').onchange=renderReports;$('#csv').onclick=exportCSV;$('#print').onclick=()=>print();
['#dprod','#dcol','#dw','#dh'].forEach(s=>$(s).oninput=drawDesign);
$('#dfile').onchange=e=>{const f=e.target.files[0];if(!f)return;const img=new Image();img.onload=()=>pushLayer({t:'img',img,s:Math.min(1,220/Math.max(img.width,img.height))});img.src=URL.createObjectURL(f)};
$('#dadd').onclick=()=>{const v=$('#dtext').value.trim();if(v){pushLayer({t:'text',txt:v,c:$('#dtc').value});$('#dtext').value=''}};
$('#ds').oninput=e=>{if(L[sel]){L[sel].s=+e.target.value;drawDesign()}};
$('#dr').oninput=e=>{if(L[sel]){L[sel].r=+e.target.value;drawDesign()}};
$('#ddel').onclick=()=>{if(L[sel]){L.splice(sel,1);sel=L.length-1;drawDesign()}};
$('#dpng').onclick=()=>cv.toBlob(b=>download(b,'design-preview.png'));
$('#dattach').onclick=()=>{design=thumb();renderCart();alert('Design attached. Go to Sales and complete the order.')};
$('#ssave').onclick=()=>{D.settings={shop:$('#sshop').value||'PrintPOS',cur:$('#scur').value||'₱',tax:+$('#stax').value||0};save();renderPOS();alert('Settings saved.')};
$('#bexp').onclick=()=>download(new Blob([JSON.stringify(D)],{type:'application/json'}),'printpos-backup.json');
$('#bimp').onchange=e=>{const r=new FileReader();r.onload=()=>{try{D=JSON.parse(r.result);save();init();alert('Backup restored.')}catch{alert('That file is not a valid backup.')}};r.readAsText(e.target.files[0])};
$('#breset').onclick=()=>{if(confirm('Erase all products and sales?')){D=structuredClone(seed);save();init()}};
document.querySelectorAll('[data-bs-toggle=pill]').forEach(b=>b.addEventListener('shown.bs.tab',()=>{renderReports();drawDesign()}));

function init(){$('#sshop').value=D.settings.shop;$('#scur').value=D.settings.cur;$('#stax').value=D.settings.tax;renderPOS();renderProducts();renderReports();drawDesign()}
init();
