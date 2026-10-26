'use strict';
(() => {
 const cfg=window.PORTFOLIO||{};
 const $=id=>document.getElementById(id);
 const text=(id,value)=>{if(value!==undefined&&value!==null&&$(id))$(id).textContent=value;};
 const username=cfg.username||'';
 const github=username?`https://github.com/${encodeURIComponent(username)}`:'';
 let projects=[],filter='all';
 for(const [id,value] of [['eyebrow',cfg.eyebrow],['headline-one',cfg.headline?.[0]],['headline-two',cfg.headline?.[1]],['intro',cfg.intro],['about-text',cfg.about]])text(id,value);
 function profile(data={}) {
  const name=cfg.name||data.name||username||'Personal Space';
  for(const id of ['brand-name','profile-name','footer-name'])text(id,name);
  text('profile-handle',username?`@${username}`:'YOUR NEXT CHAPTER');
  if(data.avatar_url&&/^https:\/\/avatars\.githubusercontent\.com\//.test(data.avatar_url)){
   const img=document.createElement('img');img.src=data.avatar_url;img.alt=`${name} 的 GitHub 头像`;img.loading='lazy';img.referrerPolicy='no-referrer';img.addEventListener('error',()=>{$('avatar').textContent='b.';},{once:true});$('avatar').replaceChildren(img);
  }
  document.title=`${name} · 个人主页`;
 }
 function outbound(a,url){a.href=url;a.target='_blank';a.rel='noopener noreferrer';}
 for(const a of document.querySelectorAll('.github-link')){if(github){outbound(a,github);a.hidden=false;}}
 if(github){const a=$('contact-link');outbound(a,github);a.setAttribute('aria-label','在 GitHub 上联系 bitrange');a.querySelector('span').textContent='访问 GitHub';}
 if(cfg.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cfg.email)){
  $('contact-link').href=`mailto:${cfg.email}`;$('contact-link').removeAttribute('target');$('contact-link').querySelector('span').textContent='发邮件';
  $('copy-email').hidden=false;$('copy-email').onclick=async()=>{try{await navigator.clipboard.writeText(cfg.email);text('copy-status','已复制');}catch{text('copy-status',cfg.email);}};
 }
 function node(tag,cls,value){const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;return el;}
 function safeRepoURL(p){try{const u=new URL(p.html_url);return u.protocol==='https:'&&u.hostname==='github.com'&&u.pathname.startsWith(`/${username}/`)?u.href:null;}catch{return null;}}
 function render(){
  const visible=filter==='all'?projects:projects.filter(p=>(p.language||'Other')===filter);
  $('projects').replaceChildren(...visible.map((p,index)=>{
   const card=node('article','project');
   card.append(node('span','project-number',String(index+1).padStart(2,'0')));
   const info=node('div','project-info');info.append(node('h3','project-title',p.name));
   const tags=node('div','tags');
   for(const topic of [p.language||'Other',...(p.topics||[]).slice(0,2)])tags.append(node('span','tag',topic));
   info.append(tags);card.append(info);
   const detail=node('div','project-detail');detail.append(node('p','project-desc',p.description||'暂无项目说明。'));
   const meta=node('div','project-meta');
   if(Number.isFinite(p.stargazers_count))meta.append(node('span','',`☆ ${p.stargazers_count}`));
   if(p.updated_at&&!Number.isNaN(Date.parse(p.updated_at)))meta.append(node('span','',`更新于 ${new Date(p.updated_at).toLocaleDateString('zh-CN')}`));
   detail.append(meta);card.append(detail,node('span','project-arrow','↗'));
   const url=safeRepoURL(p);if(url){const a=node('a','project-accessible-link');outbound(a,url);a.setAttribute('aria-label',`查看 ${p.name} 的 GitHub 仓库`);card.append(a);}
   return card;
  }));
  for(const b of document.querySelectorAll('.filter')){const active=b.dataset.language===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));}
 }
 function useProjects(data){
  const order=cfg.featuredRepos||[];
  projects=data.filter(p=>!p.fork&&!p.archived&&p.name!==`${username}.github.io`);
  projects.sort((a,b)=>{const ai=order.indexOf(a.name),bi=order.indexOf(b.name);if(ai!==-1||bi!==-1)return(ai===-1?999:ai)-(bi===-1?999:bi);return (b.stargazers_count||0)-(a.stargazers_count||0);});
  projects=projects.slice(0,8);
  const languages=[...new Set(projects.map(p=>p.language||'Other'))];
  if(filter!=='all'&&!languages.includes(filter))filter='all';
  $('language-filters').replaceChildren(...languages.map(language=>{const b=node('button','filter',language);b.type='button';b.dataset.language=language;b.setAttribute('aria-pressed','false');return b;}));
  text('project-count',String(projects.length).padStart(2,'0'));render();
  if(!projects.length)text('work-message','暂时没有可展示的原创公开仓库，可前往 GitHub 查看更多。');
 }
 document.querySelector('.filters').addEventListener('click',e=>{const b=e.target.closest('button[data-language]');if(b){filter=b.dataset.language;render();}});
 text('year',new Date().getFullYear());
 function clock(){text('clock',new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(new Date()));}clock();setInterval(clock,60000);
 profile(cfg.snapshot);useProjects(cfg.snapshot?.repos||[]);
 text('data-label',`GITHUB / ${cfg.snapshot?.capturedAt||'PUBLIC PROJECTS'}`);
 // Keep the checked-in public snapshot visible if GitHub is unavailable or rate limited.
 async function githubJSON(url){const r=await fetch(url,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(7000)});if(!r.ok)throw Error(`GitHub ${r.status}`);return r.json();}
 if(username){
  githubJSON(`https://api.github.com/users/${encodeURIComponent(username)}`).then(data=>{if(data.login?.toLowerCase()===username.toLowerCase())profile(data);}).catch(()=>{});
  githubJSON(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`).then(data=>{if(!Array.isArray(data))throw Error('Invalid repositories');useProjects(data);text('data-label','GITHUB / LIVE');}).catch(()=>{text('data-label',`GITHUB / ${cfg.snapshot?.capturedAt||'SNAPSHOT'}`);});
 }
 if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('reveal');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.section-head,.about-layout,.contact-layout').forEach(el=>observer.observe(el));}
})();
