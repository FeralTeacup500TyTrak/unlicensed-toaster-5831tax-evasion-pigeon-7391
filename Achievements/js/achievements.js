'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const modes=['raid','pvp','wvw'], progressKey='chairmode-achievements-tier-progress-v1', settingsKey='chairmode-achievement-layout-settings-v1', apKey='chairmode-achievement-manual-offset-v1';
const state={data:[],groups:[],categories:[],group:null,category:null,progress:{},settings:{},page:0,apOffset:0};
try{state.progress=JSON.parse(localStorage.getItem(progressKey)||'{}')||{}}catch{}
try{state.settings=JSON.parse(localStorage.getItem(settingsKey)||'{}')||{}}catch{}
try{const stored=Number(localStorage.getItem(apKey));if(localStorage.getItem(apKey)!==null&&Number.isFinite(stored))state.apOffset=stored}catch{}
for(const m of modes){$(m).checked=!!state.settings[m];$(m).addEventListener('change',()=>{state.settings[m]=$(m).checked;localStorage.setItem(settingsKey,JSON.stringify(state.settings));render()})}
$('filterBtn').onclick=()=>{$('filters').hidden=!$('filters').hidden};
$('backBtn').onclick=()=>{if(state.category)navigate(state.group,null);else navigate(null,null)};
$('search').oninput=()=>{state.page=0;render()};$('hideExcluded').onchange=()=>{state.page=0;render()};$('showAll').onchange=()=>{state.page=0;render()};
const inMode=a=>!(a.gameModes||[]).some(m=>modes.some(n=>$(n).checked&&m.toLowerCase()===n));
const eligible=a=>a.status==='included'&&inMode(a);
const tiers=a=>a.tiers?.length||1;
function doneCount(a){const p=state.progress[String(a.id)];return Array.isArray(p)?Array.from({length:tiers(a)},(_,i)=>p.includes(i)).filter(Boolean).length:0}
function completed(a){return doneCount(a)===tiers(a)}
function scoped(g,c){return state.data.filter(a=>(!g||(a.groupNames||[]).includes(g))&&(!c||(a.categoryNames||[]).includes(c)))}
function tierPoints(a,i){const n=Number(a.tiers?.[i]?.points??0);return Number.isFinite(n)&&n>0?n:0}
function apEarned(a){const checked=new Set(state.progress[String(a.id)]||[]);return Array.from({length:tiers(a)},(_,i)=>checked.has(i)?tierPoints(a,i):0).reduce((x,y)=>x+y,0)}
function apPossible(a){return Array.from({length:tiers(a)},(_,i)=>tierPoints(a,i)).reduce((x,y)=>x+y,0)}
function totals(g,c){const x=scoped(g,c).filter(eligible);return {total:x.length,done:x.filter(completed).length,ap:x.reduce((n,a)=>n+apEarned(a),0),maxAp:x.reduce((n,a)=>n+apPossible(a),0)}}
const fmt=n=>n.toLocaleString('en-US');
const apRanks=[
  [0,'ash'],[1000,'ivory'],[2000,'emerald'],[4000,'sapphire'],[5000,'sunfire'],
  [6000,'amber'],[7500,'crimson'],[10000,'amethyst'],[15000,'aqua'],
  [20000,'astral-blue'],[30000,'prismatic'],[50000,'celestial']
];
function allEarnedAP(){return totals(null,null).ap}
function totalAP(){return Math.max(0,Math.round(allEarnedAP()+state.apOffset))}
function renderAP(){
  const total=totalAP(),rank=[...apRanks].reverse().find(([min])=>total>=min)[1];
  const hero=$('apHero');hero.className='ap-hero ap-rank-'+rank;
  $('apTotal').textContent=fmt(total);
  if(document.activeElement!==$('manualAp'))$('manualAp').value=String(total);
}
$('manualAp').addEventListener('change',()=>{
  const raw=$('manualAp').value.trim(),value=Number(raw);
  if(raw===''||!Number.isFinite(value)||value<0){$('manualAp').value=String(totalAP());return}
  state.apOffset=Math.round(value)-allEarnedAP();
  localStorage.setItem(apKey,String(state.apOffset));
  renderAP();
  $('apSaved').textContent='Saved';
});
$('manualAp').addEventListener('input',()=>$('apSaved').textContent='');
function setProgress(a,i,checked){const k=String(a.id),arr=new Set(state.progress[k]||[]);if(checked)arr.add(i);else arr.delete(i);state.progress[k]=[...arr].sort((a,b)=>a-b);localStorage.setItem(progressKey,JSON.stringify(state.progress));render()}
function navigate(g,c){state.group=g;state.category=c;state.page=0;$('search').value='';history.replaceState(null,'',g?'#'+encodeURIComponent(g)+(c?'~'+encodeURIComponent(c):''):'#');render();window.scrollTo(0,0)}
function tile(name,g,c){const {done,total,ap,maxAp}=totals(g,c),pct=total?done/total*100:0;const b=document.createElement('button');const started=scoped(g,c).some(a=>eligible(a)&&doneCount(a)>0);b.className='tile compact-tile'+(total>0&&done===total?' category-complete':started?' category-started':'');b.innerHTML=`<span class="arrow">›</span><strong>${esc(name)}</strong><div class="tile-progress"><div class="tile-progress-label"><span>${fmt(ap)} / ${fmt(maxAp)} AP</span><span>${fmt(done)} / ${fmt(total)}</span></div><div class="tile-progress-track"><div class="tile-progress-fill" style="width:${pct}%"></div></div></div>`;b.onclick=()=>navigate(g,c);return b}
function crumb(label,cb){const b=document.createElement('button');b.textContent=label;b.onclick=cb;$('breadcrumbs').append(b)}
function achievementCard(a){const d=document.createElement('details');d.className='achievement'+(eligible(a)&&completed(a)?' achievement-complete':'');d.dataset.id=a.id;const n=doneCount(a),total=tiers(a),ap=apEarned(a),maxAp=apPossible(a);const rows=(a.tiers?.length?a.tiers:[{points:0}]).map((t,i)=>`<label class="tier"><input type="checkbox" data-tier="${i}" ${((state.progress[String(a.id)]||[]).includes(i))?'checked':''}><span><b>${a.tiers?.length?'Tier '+(i+1):'Completed'}</b></span><span class="tier-ap">${fmt(tierPoints(a,i))} AP</span></label>`).join('');d.innerHTML=`<summary><div class="ach-title"><h3>${esc(a.name)}</h3><small>${n} / ${total} tiers${completed(a)?' · Complete':''}</small></div><span class="ach-ap">${fmt(ap)} / ${fmt(maxAp)} AP</span><span class="expand">⌄</span></summary><div class="detail"><div class="tiers">${rows}</div></div>`;d.querySelectorAll('input[data-tier]').forEach(input=>input.onchange=()=>{const openIds=[...document.querySelectorAll('.achievement[open]')].map(e=>e.dataset.id);setProgress(a,Number(input.dataset.tier),input.checked);for(const id of openIds){const el=document.querySelector(`.achievement[data-id="${id}"]`);if(el)el.open=true}});return d}
function render(){renderAP();const el=$('content'),g=state.group,c=state.category;el.innerHTML='';el.classList.toggle('detailgrid',!!c);$('backBtn').hidden=!g;$('searchRow').hidden=!c;$('breadcrumbs').innerHTML='';crumb('Achievements',()=>navigate(null,null));if(g)crumb(g,()=>navigate(g,null));if(c)crumb(c,()=>{});
$('pageTitle').textContent=c||g||'Explore your achievements across Tyria';$('intro').textContent=c?'Expand an achievement to check individual tiers.':g?'Choose a category to open its achievements.':'Choose a group to browse achievements.';
const t=totals(g,c),pct=t.total?t.done/t.total*100:0;$('progressHeading').textContent=c?'Category completion':g?'Group completion':'Overall achievement completion';$('counts').textContent=`${fmt(t.done)} / ${fmt(t.total)} completed · ${pct.toFixed(1)}%`;$('apCounts').textContent=`${fmt(t.ap)} / ${fmt(t.maxAp)} AP earned`;$('apFill').style.width=(t.maxAp?t.ap/t.maxAp*100:0)+'%';$('completionPanel').classList.toggle('category-complete',!!c&&t.total>0&&t.done===t.total);$('overallFill').style.width=pct+'%';
if(!g){for(const group of state.groups){if(totals(group.name,null).total>0)el.append(tile(group.name,group.name,null))}return}
if(!c){const group=state.groups.find(x=>x.name===g);const ids=new Set(group?.categories||[]);for(const cat of state.categories.filter(x=>ids.has(x.id)).sort((a,b)=>(a.order||0)-(b.order||0))){if(totals(g,cat.name).total>0)el.append(tile(cat.name,g,cat.name))}return}
let list=scoped(g,c).filter(inMode).filter(a=>$('showAll').checked||a.status==='included').filter(a=>!$('hideExcluded').checked||a.status==='included').filter(a=>a.name.toLowerCase().includes($('search').value.trim().toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name));$('resultCount').textContent=`${list.length.toLocaleString('en-US')} achievements`;
const pageSize=75, pages=Math.max(1,Math.ceil(list.length/pageSize));state.page=Math.min(state.page,pages-1);const wrap=document.createElement('div');wrap.className='full';for(const a of list.slice(state.page*pageSize,(state.page+1)*pageSize))wrap.append(achievementCard(a));el.append(wrap);if(!list.length)el.innerHTML='<p class="muted full">No matching achievements.</p>';
const pager=$('pager');pager.hidden=pages<=1;pager.querySelector('.page-label').textContent=`Page ${state.page+1} / ${pages}`;pager.querySelector('.prev').disabled=state.page===0;pager.querySelector('.next').disabled=state.page>=pages-1;
}
$('pager').querySelector('.prev').onclick=()=>{state.page--;render();window.scrollTo(0,0)};$('pager').querySelector('.next').onclick=()=>{state.page++;render();window.scrollTo(0,0)};
async function init(){try{const res=await fetch('data/achievement-catalogue.json');if(!res.ok)throw Error('HTTP '+res.status);const d=await res.json();state.data=d.achievements;state.groups=d.groups.sort((a,b)=>(a.order||0)-(b.order||0));state.categories=d.categories;const hash=location.hash.slice(1).split('~');state.group=hash[0]?decodeURIComponent(hash[0]):null;state.category=hash[1]?decodeURIComponent(hash[1]):null;render()}catch(e){$('error').textContent='Could not load achievement catalogue: '+e.message+'. Open via VS Code Live Server.'}}init();
