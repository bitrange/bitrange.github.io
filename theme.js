// Runs before CSS is painted so a saved dark preference does not flash light.
(() => {
 'use strict';
 const key='bitrange-theme';
 const root=document.documentElement;
 const system=window.matchMedia('(prefers-color-scheme: dark)');
 let preference=null;
 try {const stored=localStorage.getItem(key);if(stored==='light'||stored==='dark')preference=stored;}catch{}
 function apply(theme){
  root.dataset.theme=theme;
  root.style.colorScheme=theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#101114':'#f5f5f7');
  const button=document.getElementById('theme-toggle');
  if(button){const label=theme==='dark'?'切换为浅色主题':'切换为深色主题';button.setAttribute('aria-label',label);button.setAttribute('title',label);button.setAttribute('aria-pressed',String(theme==='dark'));}
 }
 apply(preference||(system.matches?'dark':'light'));
 system.addEventListener('change',e=>{if(!preference)apply(e.matches?'dark':'light');});
 function bind(){
  const button=document.getElementById('theme-toggle');
  if(!button)return;
  apply(root.dataset.theme);
  button.addEventListener('click',()=>{
   preference=root.dataset.theme==='dark'?'light':'dark';
   try{localStorage.setItem(key,preference);}catch{}
   apply(preference);
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
