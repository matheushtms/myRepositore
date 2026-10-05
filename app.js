/* Portfólio: renderiza a home e as páginas de projeto a partir de data.js. */
const P={
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',x:'<path d="M18 6 6 18M6 6l12 12"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
 moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
 up:'<path d="M7 7h10v10M7 17 17 7"/>',left:'<path d="m12 19-7-7 7-7M19 12H5"/>',right:'<path d="M5 12h14m-7-7 7 7-7 7"/>',
 dl:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
 mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
 gh:'<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4M9 18c-4.51 2-5-2-7-2"/>',
 in:'<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>',
 copy:'<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
 web:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
 mob:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
 code:'<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',db:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0"/>',
 tool:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>',
 ext:'<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'
};
const ic=n=>`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
const wire=`<svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><rect x="10" y="10" width="180" height="100" rx="10"/><path d="M10 32h180"/><circle cx="24" cy="21" r="3"/><circle cx="36" cy="21" r="3"/><rect x="26" y="46" width="60" height="50" rx="6"/><path d="M98 52h76M98 68h60M98 84h70"/></svg>`;

const page=document.body.dataset.page||'home';
const isHome=page==='home';
const store={
 get(k){try{return localStorage.getItem(k)}catch(e){return null}},
 set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
};
const savedLang=store.get('lang');
let lang=savedLang==='pt'||savedLang==='en'?savedLang:((navigator.language||'pt').toLowerCase().startsWith('en')?'en':'pt');
let F={type:null,origin:null,stack:null},menuOpen=false;
const $=s=>document.querySelector(s),T=()=>L[lang];
const tt=o=>typeof o==='string'?o:o[lang];
const originL=o=>o==='freela'?T().freela:T().acad;
const pHref=id=>`/projetos/${id}.html`;
const reduceMotion=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;

function thumb(p,eager){return p.img?`<img src="${IMG[p.img]}" alt="" ${eager?'':'loading="lazy" '}decoding="async">`:`<div class="ph" style="--h:${p.h}">${wire}<b>${p.name}</b></div>`}
function card(p){
 const t=T();
 return `<a class="pc" href="${pHref(p.id)}" data-id="${p.id}" aria-label="${t.viewP}: ${p.name}">
 <div class="thumb">${thumb(p)}</div>
 <div class="pb"><div class="meta"><div class="types">${p.plat.map(x=>ic(x==='web'?'web':'mob')).join('')}</div><span class="mono">${p.year} · ${originL(p.origin)}</span></div>
 <h3>${p.name}</h3><p class="sub">${tt(p.sub)}</p><p class="sum">${tt(p.sum)}</p>
 <div class="chips">${p.stack.slice(0,3).map(s=>`<span class="chip">${s}</span>`).join('')}${p.stack.length>3?`<span class="chip">+${p.stack.length-3}</span>`:''}</div>
 <span class="go" aria-hidden="true">${t.viewP} ${ic('right')}</span></div></a>`;
}
function fbtn(g,val,label,icon){const on=(F[g]===val);return `<button type="button" class="fbtn" data-f="${g}" data-v="${val===null?'':val}" aria-pressed="${on}">${icon?ic(icon):''}${label}</button>`}
function match(p){return (!F.type||p.plat.includes(F.type))&&(!F.origin||p.origin===F.origin)&&(!F.stack||p.stack.some(s=>s.toLowerCase().includes(F.stack.toLowerCase())))}
const cvLink=(cls,inner)=>`<a class="${cls}" href="${SITE.cv}" download>${inner}</a>`;

function home(){
 const t=T(),x=XP[lang],e=ED[lang];
 return `<div class="view" id="home-top">
 <div class="wrap hero">
  <div>
   <div class="avail"><span class="dot"></span>${t.avail}</div>
   <h1 aria-label="Matheus Malta"><span class="w" style="--i:0">Matheus</span> <span class="w" style="--i:1">Malta<span class="dotm">.</span></span></h1>
   <p class="mono" style="margin-top:20px;font-size:.85rem">${t.heroRole}</p>
   <p class="lead">${t.lead}</p>
   <div class="cta"><a class="btn primary" href="#projetos">${t.cta1} ${ic('right')}</a>${cvLink('btn ghost',`${ic('dl')} ${t.cta2}`)}</div>
  </div>
  <div class="hero-art" aria-hidden="true">
   <div class="shot a" data-par="0.05"><div class="bar"><i></i><i></i><i></i></div><img src="${IMG.plantei}" alt="" width="1440" height="900" decoding="async"></div>
   <div class="shot b" data-par="-0.04"><div class="bar"><i></i><i></i><i></i></div><img src="${IMG.dindin}" alt="" width="1440" height="900" decoding="async"></div>
   <div class="badge"><span class="dot"></span>${t.pilot}</div>
  </div>
 </div>

 <section class="blk" id="sobre" aria-labelledby="h-sobre"><div class="wrap">
  <div class="sec-head rv"><div><span class="mono k">01 / ${t.aboutK}</span><h2 id="h-sobre">${t.aboutT}</h2></div></div>
  <div class="bento">
   <div class="side"><figure class="card photo rv" style="margin:0"><img src="${IMG.profile}" alt="Matheus Malta" width="1402" height="1122" decoding="async"><figcaption><span class="chip">${t.photoCap}</span></figcaption></figure>
   <div class="card more rv" style="--d:60ms">${t.bio.slice(3).map(x=>`<p>${x}</p>`).join('')}</div></div>
   <div class="card bio rv" style="--d:80ms">${t.bio.slice(0,3).map(x=>`<p>${x}</p>`).join('')}</div>
   <div class="card facts rv" style="--d:120ms"><dl>${t.facts.map(([k,v])=>`<dt class="mono">${k}</dt><dd>${v}</dd>`).join('')}</dl></div>
   <div class="card back rv" style="--d:160ms"><h3>${t.backT}</h3><p>${t.back}</p></div>
  </div>
 </div></section>

 <section class="blk" id="skills" aria-labelledby="h-skills"><div class="wrap">
  <div class="sec-head rv"><div><span class="mono k">02 / ${t.skK}</span><h2 id="h-skills">${t.skT}</h2></div></div>
  <div class="skills">${t.skCats.map((c,i)=>`<div class="card rv" style="--d:${i*80}ms"><h3>${ic(c[1])}${c[0]}</h3><div class="chips">${c[2].map(s=>`<span class="chip">${s}</span>`).join('')}</div></div>`).join('')}</div>
 </div></section>

 <section class="blk" id="projetos" aria-labelledby="h-projetos"><div class="wrap">
  <div class="sec-head rv"><div><span class="mono k">03 / ${t.prK}</span><h2 id="h-projetos">${t.prT}</h2></div><span class="mono">${t.tableHint}</span></div>
  <div class="filters rv" role="group" aria-label="${t.filters}">
   <div class="frow"><span class="mono">${t.fType}</span>${fbtn('type',null,t.all)}${fbtn('type','web',t.web,'web')}${fbtn('type','mobile',t.mobile,'mob')}</div>
   <div class="frow"><span class="mono">${t.fOrigin}</span>${fbtn('origin',null,t.all)}${fbtn('origin','freela',t.freela)}${fbtn('origin','acad',t.acad)}</div>
   <div class="frow"><span class="mono">${t.fStack}</span>${fbtn('stack',null,t.all)}${STK.map(s=>fbtn('stack',s,s)).join('')}</div>
  </div>
  <div class="fbar"><span class="mono" id="count" role="status"></span><button type="button" class="linkbtn" data-clear id="clearTop" hidden>${t.clear}</button></div>
  <div class="grid" id="grid">${PR.map(card).join('')}</div>
  <div class="empty" id="empty"><h3>${t.emptyT}</h3><p>${t.emptyP}</p><button type="button" class="btn ghost" style="margin-top:16px" data-clear>${t.clear}</button></div>
 </div></section>

 <section class="blk" id="experiencia" aria-labelledby="h-exp"><div class="wrap">
  <div class="sec-head rv"><div><span class="mono k">04 / ${t.exK}</span><h2 id="h-exp">${t.exT}</h2></div></div>
  <div class="tl">
   <ol>${x.map((i,k)=>`<li class="rv" style="--d:${k*60}ms"><span class="mono">${i[0]}</span><h3>${i[1]}</h3><div class="co">${i[2]}</div><p>${i[3]}</p><div class="chips">${i[4].map(s=>`<span class="chip">${s}</span>`).join('')}</div></li>`).join('')}</ol>
   <div class="edu"><span class="mono">${t.edK}</span>${e.map(i=>`<div class="card rv"><span class="mono">${i[0]}</span><h3>${i[1]}</h3><p>${i[2]}</p></div>`).join('')}</div>
  </div>
 </div></section>

 <section class="blk" id="contato" aria-labelledby="h-contato"><div class="wrap">
  <div class="contact rv">
   <div><span class="mono">05 / ${t.ctK}</span><h2 id="h-contato" style="margin-top:12px">${t.ctT}</h2><p>${t.ctP}</p></div>
   <div class="clist">
    <button type="button" class="crow" data-copy>${ic('mail')}<span><small>E-mail</small>${SITE.email}</span>${ic('copy')}</button>
    <a class="crow" href="https://www.linkedin.com/in/matheus-malta-a39b66255/" target="_blank" rel="noopener">${ic('in')}<span><small>LinkedIn</small>matheus-malta</span>${ic('up')}</a>
    <a class="crow" href="https://github.com/matheushtms" target="_blank" rel="noopener">${ic('gh')}<span><small>GitHub</small>matheushtms</span>${ic('up')}</a>
    ${cvLink('crow',`${ic('dl')}<span><small>${t.cvS}</small>${t.cv}</span>`)}
   </div>
  </div>
 </div></section></div>`;
}

function proj(id){
 const t=T(),i=PR.findIndex(p=>p.id===id),p=PR[i],pv=PR[(i+PR.length-1)%PR.length],nx=PR[(i+1)%PR.length];
 const shots=p.img?[p.img]:[];
 const ps=a=>(tt(a)||[]).map(x=>`<p>${x}</p>`).join('');
 const secs=[[t.ctxT,ps(p.ctx)],[t.feat,`<ul class="bul">${(tt(p.feats)||[]).map(x=>`<li>${x}</li>`).join('')}</ul>`],
  [t.dec,`<dl class="dec">${(tt(p.decs)||[]).map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>`],
  [t.stk,`<p>${tt(p.arch)}</p><ul class="stack-l" style="margin-top:16px">${p.techs.map(([n,d])=>`<li><b>${n}</b><span>${tt(d)}</span></li>`).join('')}</ul>`]];
 if(p.chall)secs.push([t.chall,`<ul class="bul">${tt(p.chall).map(x=>`<li>${x}</li>`).join('')}</ul>`]);
 secs.push([t.role,`<p>${tt(p.role)}</p>`]);
 secs.push([t.gal,shots.length?`<div class="gal">${shots.map(s=>`<figure><img src="${IMG[s]}" alt="${t.shotAlt} ${p.name}" loading="lazy" decoding="async"></figure>`).join('')}</div>`:`<div class="card" style="text-align:center;border-style:dashed"><p class="mono">${t.noShot}</p></div>`]);
 const lk=p.links.map(([k,u])=>`<a class="btn ${k==='code'?'ghost':'primary'}" href="${u}" target="_blank" rel="noopener">${k==='code'?ic('gh'):ic('ext')} ${k==='code'?t.code:k==='landing'?t.landing:t.live}</a>`).join('');
 return `<div class="view"><div class="wrap">
 <div class="ph-top"><a class="back-link" href="/#projetos">${ic('left')} ${t.back2}</a>
  <h1>${p.name}</h1><p class="sub">${tt(p.sub)}</p>
  <div class="pmeta">${p.status?`<span class="chip accent"><span class="dot"></span>${tt(p.status)}</span>`:''}<span class="chip">${p.year}</span><span class="chip">${originL(p.origin)}</span>${p.plat.map(x=>`<span class="chip">${ic(x==='web'?'web':'mob')}${x==='web'?t.web:t.mobile}</span>`).join('')}</div>
  ${lk?`<div class="pcta">${lk}</div>`:''}
 </div>
 <div class="cover">${thumb(p,true)}</div>
 <div class="pgrid">
  <article>
   ${secs.map(([h,c],i)=>`<section><h2><span class="n">${String(i+1).padStart(2,'0')}</span>${h}</h2>${c}</section>`).join('')}
  </article>
  <aside class="ficha" aria-label="${t.sheet}"><div class="card"><dl>
   <div><dt class="mono">${t.year}</dt><dd>${p.year}</dd></div>
   <div><dt class="mono">${t.origin}</dt><dd>${originL(p.origin)}</dd></div>
   <div><dt class="mono">${t.stack}</dt><dd class="chips">${p.stack.map(s=>`<span class="chip">${s}</span>`).join('')}</dd></div>
  </dl></div></aside>
 </div>
 <nav class="pn" aria-label="${t.moreP}"><a href="${pHref(pv.id)}"><span class="mono">${ic('left')} ${t.prev}</span><h3>${pv.name}</h3></a><a href="${pHref(nx.id)}"><span class="mono">${t.next} ${ic('right')}</span><h3>${nx.name}</h3></a></nav>
 </div></div>`;
}

function render(){
 const t=T();
 document.documentElement.lang=lang==='pt'?'pt-BR':'en';
 const pre=isHome?'':'/';
 $('#nav').innerHTML=t.nav.map(([id,l])=>`<a href="${pre}#${id}">${l}</a>`).join('');
 $('#brand').setAttribute('href',isHome?'#home-top':'/');
 $('#skip').textContent=t.skip;
 $('#main').innerHTML=isHome?home():proj(page);
 if(!isHome){const p=PR.find(x=>x.id===page);document.title=`${p.name} | Matheus Malta`}
 $('#foot1').textContent=t.foot1;$('#foot2').textContent=t.foot2;
 document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===lang));
 themeIcon();$('#menuBtn').innerHTML=ic(menuOpen?'x':'menu');
 if(isHome)applyFilter(false);
 observe();
}
function applyFilter(animate){
 const g=$('#grid');if(!g)return;
 const cards=[...g.children],reduce=reduceMotion();
 const first=new Map();if(animate&&!reduce)cards.forEach(c=>{if(!c.hidden)first.set(c,c.getBoundingClientRect())});
 let n=0;cards.forEach(c=>{const p=PR.find(x=>x.id===c.dataset.id),ok=match(p);c.hidden=!ok;if(ok)n++});
 $('#count').textContent=T().count(n,PR.length);
 $('#clearTop').hidden=!(F.type||F.origin||F.stack);
 $('#empty').classList.toggle('show',n===0);
 if(animate&&!reduce)cards.forEach(c=>{if(c.hidden)return;const f=first.get(c),l=c.getBoundingClientRect();
  if(f){const dx=f.left-l.left,dy=f.top-l.top;if(dx||dy)c.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'})}
  else c.animate([{opacity:0,transform:'scale(.92) translateY(12px)'},{opacity:1,transform:'none'}],{duration:420,delay:60,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'})});
}
function observe(){
 const els=document.querySelectorAll('.rv');
 if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -6% 0px',threshold:.05});
 els.forEach(e=>io.observe(e));
}
function isDark(){const a=document.documentElement.getAttribute('data-theme');return a?a==='dark':matchMedia('(prefers-color-scheme:dark)').matches}
function themeIcon(){const d=isDark();$('#themeBtn').innerHTML=ic(d?'sun':'moon');$('#themeBtn').setAttribute('aria-label',d?T().themeL:T().themeD)}
function toast(m){const e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)}
function closeMenu(){menuOpen=false;$('#nav').classList.remove('open');$('#menuBtn').setAttribute('aria-expanded','false');$('#menuBtn').innerHTML=ic('menu')}

document.addEventListener('click',e=>{
 const q=s=>e.target.closest(s);let b;
 if(q('#nav a')||q('#brand'))closeMenu();
 if(b=q('[data-lang]')){lang=b.dataset.lang;store.set('lang',lang);render()}
 else if(b=q('[data-f]')){const g=b.dataset.f,v=b.dataset.v||null;F[g]=(F[g]===v)?null:v;
   document.querySelectorAll('[data-f="'+g+'"]').forEach(x=>x.setAttribute('aria-pressed',(x.dataset.v||null)===F[g]));applyFilter(true)}
 else if(q('[data-clear]')){F={type:null,origin:null,stack:null};document.querySelectorAll('[data-f]').forEach(x=>x.setAttribute('aria-pressed',!x.dataset.v));applyFilter(true)}
 else if(q('#themeBtn')){const n=isDark()?'light':'dark';document.documentElement.setAttribute('data-theme',n);store.set('theme',n);themeIcon()}
 else if(q('#menuBtn')){menuOpen=!menuOpen;$('#nav').classList.toggle('open',menuOpen);$('#menuBtn').setAttribute('aria-expanded',menuOpen);$('#menuBtn').innerHTML=ic(menuOpen?'x':'menu')}
 else if(q('[data-copy]')){const m=SITE.email;(navigator.clipboard?navigator.clipboard.writeText(m):Promise.reject()).then(()=>toast(T().copied)).catch(()=>toast(m))}
});
const bgd=document.querySelector('#bg .dots');
addEventListener('scroll',()=>{
 const h=document.documentElement,p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);$('#progress').style.transform=`scaleX(${p})`;
 if(reduceMotion())return;
 bgd.style.transform=`translate3d(0,${-(scrollY*.08)%28}px,0)`;
 document.querySelectorAll('[data-par]').forEach(e=>{e.style.translate=`0 ${-scrollY*e.dataset.par}px`});
},{passive:true});
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('bg-paused',document.hidden));
render();
if(isHome&&location.hash.length>1){const el=document.getElementById(decodeURIComponent(location.hash.slice(1)));el&&requestAnimationFrame(()=>el.scrollIntoView())}
