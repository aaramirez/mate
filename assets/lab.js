(function(){
const $=s=>document.querySelector(s);
const root=document.documentElement;
const tok=n=>getComputedStyle(root).getPropertyValue(n).trim();
const fmt=(n,d=2)=>{const p=Math.pow(10,d);const r=Math.round(n*p)/p;return (Object.is(r,-0)?0:r).toFixed(d);};
const short=n=>{const r=Math.round(n*100)/100;return String(Object.is(r,-0)?0:r);};
const num=id=>parseFloat($(id).value);
const renders=[];

function canvasWidget(c,ratio,draw){
  const ctx=c.getContext('2d');
  const r=()=>{const w=c.clientWidth;if(!w)return;const rt=typeof ratio==='function'?ratio(w):ratio;const h=Math.round(w*rt);const d=window.devicePixelRatio||1;c.width=Math.round(w*d);c.height=Math.round(h*d);c.style.height=h+'px';ctx.setTransform(d,0,0,d,0,0);draw(ctx,w,h);};
  renders.push(r);new ResizeObserver(r).observe(c);r();return r;
}
const rerenderAll=()=>renders.forEach(r=>r());
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',rerenderAll);
new MutationObserver(rerenderAll).observe(root,{attributes:true,attributeFilter:['data-theme']});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(rerenderAll);

function niceStep(range){const raw=range/8;const m=Math.pow(10,Math.floor(Math.log10(raw)));const n=raw/m;return (n<1.5?1:n<3?2:n<7?5:10)*m;}
function frame(ctx,w,h,v){
  const p={l:34,r:10,t:10,b:22};const pw=w-p.l-p.r,ph=h-p.t-p.b;
  let x0=v.x0,x1=v.x1,y0=v.y0,y1=v.y1;
  if(v.equal){const s=(x1-x0)/pw;const half=ph*s/2;const cy=v.cy||0;y0=cy-half;y1=cy+half;}
  const X=x=>p.l+(x-x0)/(x1-x0)*pw,Y=y=>p.t+(y1-y)/(y1-y0)*ph;
  const IX=px=>x0+(px-p.l)/pw*(x1-x0),IY=py=>y1-(py-p.t)/ph*(y1-y0);
  ctx.clearRect(0,0,w,h);
  const sx=v.sx||niceStep(x1-x0),sy=v.sy||niceStep(y1-y0);
  ctx.lineWidth=1;ctx.strokeStyle=tok('--grid');
  for(let x=Math.ceil(x0/sx)*sx;x<=x1+1e-9;x+=sx){ctx.beginPath();ctx.moveTo(X(x),p.t);ctx.lineTo(X(x),p.t+ph);ctx.stroke();}
  for(let y=Math.ceil(y0/sy)*sy;y<=y1+1e-9;y+=sy){ctx.beginPath();ctx.moveTo(p.l,Y(y));ctx.lineTo(p.l+pw,Y(y));ctx.stroke();}
  ctx.strokeStyle=tok('--muted');ctx.lineWidth=1.2;
  if(y0<=0&&y1>=0){ctx.beginPath();ctx.moveTo(p.l,Y(0));ctx.lineTo(p.l+pw,Y(0));ctx.stroke();}
  if(x0<=0&&x1>=0){ctx.beginPath();ctx.moveTo(X(0),p.t);ctx.lineTo(X(0),p.t+ph);ctx.stroke();}
  ctx.font='11px '+tok('--f-mono');ctx.fillStyle=tok('--muted');
  ctx.textAlign='center';ctx.textBaseline='top';
  for(let x=Math.ceil(x0/sx)*sx;x<=x1+1e-9;x+=sx)ctx.fillText(short(x),X(x),p.t+ph+5);
  ctx.textAlign='right';ctx.textBaseline='middle';
  for(let y=Math.ceil(y0/sy)*sy;y<=y1+1e-9;y+=sy)ctx.fillText(short(y),p.l-5,Y(y));
  return {X,Y,IX,IY,x0,x1,y0,y1,p,pw,ph,clip(){ctx.save();ctx.beginPath();ctx.rect(p.l,p.t,pw,ph);ctx.clip();}};
}
function curve(ctx,F,f,color,lw,dash){
  F.clip();ctx.strokeStyle=color;ctx.lineWidth=lw||2.5;ctx.setLineDash(dash||[]);ctx.beginPath();
  const N=500,span=F.y1-F.y0;let pen=false;
  for(let i=0;i<=N;i++){const x=F.x0+(F.x1-F.x0)*i/N;const y=f(x);if(!isFinite(y)||y>F.y1+span*3||y<F.y0-span*3){pen=false;continue;}const px=F.X(x),py=F.Y(y);pen?ctx.lineTo(px,py):ctx.moveTo(px,py);pen=true;}
  ctx.stroke();ctx.restore();
}
function dot(ctx,x,y,color,r){ctx.beginPath();ctx.arc(x,y,r||5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function arrow(ctx,x0,y0,x1,y1,color,lw){
  const a=Math.atan2(y1-y0,x1-x0),L=Math.hypot(x1-x0,y1-y0),hd=Math.min(12,L*.4);
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=lw||3;ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1-hd*.7*Math.cos(a),y1-hd*.7*Math.sin(a));ctx.stroke();
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1-hd*Math.cos(a-.4),y1-hd*Math.sin(a-.4));ctx.lineTo(x1-hd*Math.cos(a+.4),y1-hd*Math.sin(a+.4));ctx.closePath();ctx.fill();
}
function label(ctx,t,x,y,color,align){ctx.font='600 14px '+tok('--f-body');ctx.fillStyle=color;ctx.textAlign=align||'left';ctx.textBaseline='middle';ctx.fillText(t,x,y);}
function hexRgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255];}
function lerp(a,b,t){return a.map((v,i)=>Math.round(v+(b[i]-v)*t));}
function bindOut(id,f){const el=$(id),o=$(id+'-o');const u=()=>{o.textContent=f?f(parseFloat(el.value)):short(parseFloat(el.value));};el.addEventListener('input',u);u();}
const wide=w=>w<520?0.85:0.55;


function seg(ctx,F,f,xa,xb,color,lw,N){
  F.clip();ctx.strokeStyle=color;ctx.lineWidth=lw||2.5;ctx.setLineDash([]);ctx.beginPath();
  N=N||600;const span=F.y1-F.y0;let pen=false;
  for(let i=0;i<=N;i++){const x=xa+(xb-xa)*i/N,y=f(x);if(!isFinite(y)||y>F.y1+span*3||y<F.y0-span*3){pen=false;continue;}const px=F.X(x),py=F.Y(y);pen?ctx.lineTo(px,py):ctx.moveTo(px,py);pen=true;}
  ctx.stroke();ctx.restore();
}
function ring(ctx,x,y,color,fill){ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle=color;ctx.stroke();}

/* ---------- Navegación entre páginas y avance ---------- */
// Datos del curso: los escribe el motor al generar el sitio
const CURSO={"prefijo": "mate-ml-"};
const PAGES=[["index", "index.html", "", "Inicio", 0, 0], ["aritmetica", "01-aritmetica.html", "01", "Aritmética y razones", 0, 1], ["notacion", "02-notacion.html", "02", "Notación sin miedo", 0, 1], ["funciones", "03-funciones.html", "03", "Funciones", 0, 1], ["vectores", "04-vectores.html", "04", "Vectores", 0, 2], ["matrices", "05-matrices.html", "05", "Matrices", 0, 2], ["limites", "06-limites.html", "06", "Límites y continuidad", 0, 3], ["derivadas", "07-derivadas.html", "07", "Derivadas", 0, 3], ["integrales", "08-integrales.html", "08", "Integrales", 0, 3], ["probabilidad", "09-probabilidad.html", "09", "Probabilidad", 0, 3], ["gradiente", "10-gradiente.html", "10", "Descenso del gradiente", 0, 4], ["regresion", "11-regresion.html", "11", "Regresión y error", 0, 4], ["modelos", "12-modelos.html", "12", "Modelos clásicos de ML", 0, 4], ["neurona", "13-neurona.html", "13", "La neurona y la red", 0, 5], ["cnn", "14-cnn.html", "14", "Redes convolucionales", 0, 5], ["llm", "15-llm.html", "15", "Cómo funciona un LLM", 0, 5], ["agentes", "16-agentes.html", "16", "Agentes", 0, 6], ["refuerzo", "17-refuerzo.html", "17", "Aprendizaje por refuerzo", 0, 6], ["recursos", "recursos.html", "", "Canales y plan", 0, 6]];
const ETAPAS=[[1, "Etapa 1 · Bases"], [2, "Etapa 2 · Álgebra lineal"], [3, "Etapa 3 · Cálculo y probabilidad"], [4, "Etapa 4 · Aprender de los datos"], [5, "Etapa 5 · Redes neuronales"], [6, "Etapa 6 · Agentes que deciden"]];
const PREF=CURSO.prefijo;
const store={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};
const holder=document.querySelector('[data-page]');
const page=holder?holder.getAttribute('data-page'):'';
const mods=PAGES.filter(p=>/^\d/.test(p[2])&&!p[4]);
const isDone=id=>store.get(PREF+id)==='1';
function sync(){
  let n=0;
  mods.forEach(([id])=>{const d=isDone(id);if(d)n++;document.querySelectorAll('[data-id="'+id+'"]').forEach(a=>a.classList.toggle('done',d));});
  const p=$('#prog'),b=$('#prog-bar');if(p)p.textContent=n+' de '+mods.length;if(b)b.style.width=(n/mods.length*100)+'%';
  document.querySelectorAll('[data-etapa-cuenta]').forEach(s=>{const k=s.getAttribute('data-etapa-cuenta'),ms=mods.filter(m=>String(m[5])===k);s.textContent=ms.filter(m=>isDone(m[0])).length+'/'+ms.length;});
}
(function(){
  const nav=$('#toc');
  if(nav){
    const item=([id,f,n,t,soon])=>soon?`<li><span class="soon" data-id="${id}" title="En preparación"><span class="n">${n}</span>${t}<span class="ck"></span></span></li>`:`<li><a href="${f}" data-id="${id}"${id===page?' aria-current="page" class="active"':''}><span class="n">${n||'·'}</span>${t}<span class="ck"${n?'':' style="visibility:hidden"'}></span></a></li>`;
    const actual=PAGES.find(p=>p[0]===page),aqui=actual&&actual[2]?actual[2]+' · '+actual[3]:'Inicio';
    const grupos=ETAPAS.map(([k,rot])=>{const ps=PAGES.filter(p=>p[5]===k),hay=ps.some(p=>/^\d/.test(p[2]));
      return `<details class="etapa"${actual&&actual[5]===k?' open':''}><summary><span>${rot}</span>${hay?`<span class="cuenta" data-etapa-cuenta="${k}"></span>`:''}</summary><ol>${ps.map(item).join('')}</ol></details>`;}).join('');
    const escritorio=matchMedia('(min-width:901px)');
    const plegada=store.get(PREF+'ruta')==='0';
    nav.innerHTML=`<details class="ruta"${escritorio.matches&&!plegada?' open':''}><summary><span class="eyebrow">Ruta</span><span class="aqui">${aqui}</span></summary>`+
      `<ol class="ini">${PAGES.filter(p=>p[5]===0).map(item).join('')}</ol>${grupos}`+
      '<div class="prog"><span>Tu avance: <b id="prog"></b></span><div class="bar"><i id="prog-bar"></i></div><span>Se guarda solo en este navegador.</span></div></details>';
    const ruta=nav.querySelector('.ruta');
    const capa=nav.closest('.layout');
    const marcar=()=>{if(capa)capa.classList.toggle('toc-cerrada',escritorio.matches&&!ruta.open);};
    escritorio.addEventListener('change',e=>{ruta.open=e.matches&&store.get(PREF+'ruta')!=='0';marcar();});
    ruta.addEventListener('toggle',()=>{if(escritorio.matches)store.set(PREF+'ruta',ruta.open?'1':'0');marcar();});
    marcar();
  }
  const pg=$('#pager');
  if(pg){
    const open=PAGES.filter(p=>!p[4]),i=open.findIndex(p=>p[0]===page),prev=open[i-1],next=open[i+1];
    const lab=p=>(p[2]?p[2]+' · ':'')+p[3];
    pg.innerHTML=(prev?`<a class="prev" href="${prev[1]}"><small>← Anterior</small>${lab(prev)}</a>`:'')+(next?`<a class="next" href="${next[1]}"><small>Siguiente →</small>${lab(next)}</a>`:'');
  }
  const cb=$('#got');
  if(cb){cb.checked=isDone(page);cb.addEventListener('change',()=>{store.set(PREF+page,cb.checked?'1':'0');sync();});}
  // Portada: un enlace a #parte-N abre su etapa plegada
  const etapaDe=h=>{const t=h&&h.length>1&&document.getElementById(decodeURIComponent(h.slice(1)));return t&&t.matches('details.stage')?t:null;};
  const abrirAncla=()=>{const t=etapaDe(location.hash);if(t){t.open=true;t.scrollIntoView();}};
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]'),t=a&&etapaDe(a.getAttribute('href'));if(t)t.open=true;});
  window.addEventListener('hashchange',abrirAncla);abrirAncla();
  // Comandos: una pestaña por sistema operativo (se recuerda) y «Copiar» en cada línea
  const soDetectado=(()=>{const p=((navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||navigator.userAgent||'').toLowerCase();return /win/.test(p)?'win':/mac|iphone|ipad/.test(p)?'mac':/linux|android|cros|x11/.test(p)?'linux':'win';})();
  let so=store.get(PREF+'so')||soDetectado;
  const cajas=[...document.querySelectorAll('.cmds')];
  const elegir=caja=>{const tabs=[...caja.querySelectorAll('[role="tab"]')];if(!tabs.length)return;const t=tabs.find(b=>b.dataset.so.split(' ').includes(so))||tabs[0];
    tabs.forEach(b=>{const on=b===t;b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;document.getElementById(b.getAttribute('aria-controls')).hidden=!on;});};
  cajas.forEach((caja,k)=>{const tabs=[...caja.querySelectorAll('[role="tab"]')],panels=[...caja.querySelectorAll('[role="tabpanel"]')];
    tabs.forEach((b,i)=>{b.id='so-'+k+'-'+i;panels[i].id='so-'+k+'-'+i+'-p';b.setAttribute('aria-controls',panels[i].id);panels[i].setAttribute('aria-labelledby',b.id);
      b.addEventListener('click',()=>{const lista=b.dataset.so.split(' ');if(!lista.includes(so))so=lista[0];store.set(PREF+'so',so);cajas.forEach(elegir);});
      b.addEventListener('keydown',ev=>{const d=ev.key==='ArrowRight'?1:ev.key==='ArrowLeft'?-1:0;if(!d)return;ev.preventDefault();const n=tabs[(i+d+tabs.length)%tabs.length];n.click();n.focus();});});
    elegir(caja);});
  const aviso=document.createElement('span');aviso.setAttribute('aria-live','polite');aviso.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';document.body.appendChild(aviso);
  document.querySelectorAll('.copiar').forEach(b=>{const c=b.parentElement.querySelector('code');if(c)b.setAttribute('aria-label','Copiar: '+c.textContent.slice(0,80));});
  const copiaVieja=t=>new Promise((ok,mal)=>{const a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;top:0;opacity:0';document.body.appendChild(a);a.select();let r=false;try{r=document.execCommand('copy');}catch(e){}a.remove();r?ok():mal();});
  const copiarTexto=t=>(navigator.clipboard&&window.isSecureContext)?navigator.clipboard.writeText(t).catch(()=>copiaVieja(t)):copiaVieja(t);
  document.addEventListener('click',ev=>{const b=ev.target.closest('.copiar');if(!b)return;const c=b.parentElement.querySelector('code');if(!c)return;
    copiarTexto(c.textContent).then(()=>{b.textContent='Copiado';b.classList.add('ok');aviso.textContent='Copiado';setTimeout(()=>{b.textContent='Copiar';b.classList.remove('ok');aviso.textContent='';},1500);},
      ()=>{b.textContent='Selecciónalo y copia';const r=document.createRange();r.selectNodeContents(c);const s=getSelection();s.removeAllRanges();s.addRange(r);});});
  sync();
})();

window.Lab={$,tok,fmt,short,num,canvasWidget,frame,curve,seg,ring,dot,arrow,label,hexRgb,lerp,bindOut,wide};
})();
