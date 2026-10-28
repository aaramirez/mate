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
const PAGES=[
  ['index','index.html','','Inicio'],
  ['aritmetica','01-aritmetica.html','01','Aritmética y razones'],
  ['notacion','02-notacion.html','02','Notación sin miedo'],
  ['funciones','03-funciones.html','03','Funciones'],
  ['vectores','04-vectores.html','04','Vectores'],
  ['matrices','05-matrices.html','05','Matrices'],
  ['limites','06-limites.html','06','Límites y continuidad'],
  ['derivadas','07-derivadas.html','07','Derivadas'],
  ['integrales','08-integrales.html','08','Integrales'],
  ['gradiente','09-gradiente.html','09','Descenso del gradiente'],
  ['probabilidad','10-probabilidad.html','10','Probabilidad'],
  ['neurona','11-neurona.html','11','La neurona y la red'],
  ['regresion','12-regresion.html','12','Regresión y error'],
  ['modelos','13-modelos.html','13','Modelos clásicos de ML'],
  ['cnn','14-cnn.html','14','Redes convolucionales'],
  ['llm','15-llm.html','15','Cómo funciona un LLM'],
  ['agentes','16-agentes.html','16','Agentes'],
  ['recursos','recursos.html','','Canales y plan']
];
const store={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};
const holder=document.querySelector('[data-page]');
const page=holder?holder.getAttribute('data-page'):'';
const mods=PAGES.filter(p=>p[2]);
const isDone=id=>store.get('mate-ml-'+id)==='1';
function sync(){
  let n=0;
  mods.forEach(([id])=>{const d=isDone(id);if(d)n++;document.querySelectorAll('[data-id="'+id+'"]').forEach(a=>a.classList.toggle('done',d));});
  const p=$('#prog'),b=$('#prog-bar');if(p)p.textContent=n+' de '+mods.length;if(b)b.style.width=(n/mods.length*100)+'%';
}
(function(){
  const nav=$('#toc');
  if(nav){
    nav.innerHTML='<span class="eyebrow">Ruta</span><ol>'+PAGES.map(([id,f,n,t])=>`<li><a href="${f}" data-id="${id}"${id===page?' aria-current="page" class="active"':''}><span class="n">${n||'·'}</span>${t}<span class="ck"${n?'':' style="visibility:hidden"'}></span></a></li>`).join('')+
      '</ol><div class="prog"><span>Tu avance: <b id="prog"></b></span><div class="bar"><i id="prog-bar"></i></div><span>Se guarda solo en este navegador.</span></div>';
    const cur=nav.querySelector('[aria-current]');if(cur&&window.innerWidth<=900){const ol=nav.querySelector('ol');ol.scrollLeft=Math.max(0,cur.offsetLeft-16);}
  }
  const pg=$('#pager');
  if(pg){
    const i=PAGES.findIndex(p=>p[0]===page),prev=PAGES[i-1],next=PAGES[i+1];
    const lab=p=>(p[2]?p[2]+' · ':'')+p[3];
    pg.innerHTML=(prev?`<a class="prev" href="${prev[1]}"><small>← Anterior</small>${lab(prev)}</a>`:'')+(next?`<a class="next" href="${next[1]}"><small>Siguiente →</small>${lab(next)}</a>`:'');
  }
  const cb=$('#got');
  if(cb){cb.checked=isDone(page);cb.addEventListener('change',()=>{store.set('mate-ml-'+page,cb.checked?'1':'0');sync();});}
  sync();
})();

window.Lab={$,tok,fmt,short,num,canvasWidget,frame,curve,seg,ring,dot,arrow,label,hexRgb,lerp,bindOut,wide};
})();
