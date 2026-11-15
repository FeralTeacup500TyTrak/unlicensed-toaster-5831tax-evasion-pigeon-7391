(()=>{'use strict';
const catalog={"skins": {"name": "Wardrobe", "folder": "Wardrobe"}, "mounts": {"name": "Mounts", "folder": "Mounts"}, "minis": {"name": "Miniatures", "folder": "Miniatures"}, "mailcarriers": {"name": "Mail Carriers", "folder": "MailCarriers"}, "finishers": {"name": "Finishers", "folder": "Finishers"}, "fishing": {"name": "Fishing", "folder": "Fishing"}, "novelties": {"name": "Novelties", "folder": "Novelties"}, "jadebots": {"name": "Jade Bots", "folder": "JadeBots"}, "dyes": {"name": "Dyes", "folder": "Dyes"}, "masteries": {"name": "Masteries", "folder": "Masteries"}, "gliders": {"name": "Gliders", "folder": "Gliders"}, "outfits": {"name": "Outfits", "folder": "Outfits"}, "skiffs": {"name": "Skiffs", "folder": "Skiffs"}},KEY='mrschairmode.collectibles.manual.v1',FKEY='mrschairmode.collectibles.filters.v1';
const active=document.body.dataset.category||'', prefix=active?'../':'', $=id=>document.getElementById(id);
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}};
let progress=read(KEY,{}),filters=read(FKEY,{}),cache={},path=[],search='',hide=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sort=(a,b)=>a.name.localeCompare(b.name,'en',{sensitivity:'base'})||String(a.id).localeCompare(String(b.id));
const levelKey=(track,index)=>`masteries:${track.id}:level:${index}`;
function expandedItems(items){return items.filter(i=>!i.unverified).flatMap(i=>i.levels&&i.levels.length?i.levels.map((level,n)=>({key:levelKey(i,n)})):[i])}
const count=items=>{const all=expandedItems(items);return [all.filter(i=>progress[i.key]).length,all.length]};
function trackDone(track){return track.levels?.length&&track.levels.every((_,n)=>progress[levelKey(track,n)])}
function renderMasteryTracks(tracks){
 const content=$('content');const grid=document.createElement('div');grid.className='mastery-tracks';content.append(grid);
 const q=search.toLocaleLowerCase();
 for(const track of [...tracks].sort(sort)){
  const levels=track.levels||[];const done=levels.filter((_,n)=>progress[levelKey(track,n)]).length;
  const complete=levels.length>0&&done===levels.length;
  if(hide&&complete)continue;
  if(q&&!track.name.toLocaleLowerCase().includes(q)&&!levels.some(l=>l.name.toLocaleLowerCase().includes(q)))continue;
  const details=document.createElement('details');details.className='mastery-track'+(done>0?' checked':'');
  const summary=document.createElement('summary');summary.className='mastery-summary';
  if(track.icon){const img=document.createElement('img');img.src=track.icon;img.alt='';img.loading='lazy';summary.append(img)}
  const info=document.createElement('span');info.className='mastery-info';
  const title=document.createElement('strong');title.textContent=track.name;info.append(title);
  const status=document.createElement('small');status.textContent=complete?'Completed · '+done+'/'+levels.length:done+'/'+levels.length+' masteries';info.append(status);
  const progressBar=document.createElement('span');progressBar.className='mastery-mini-bar';
  const fill=document.createElement('span');fill.style.width=(levels.length?100*done/levels.length:0)+'%';progressBar.append(fill);info.append(progressBar);
  summary.append(info);
  const marker=document.createElement('span');marker.className='mastery-chevron';marker.textContent=complete?'★':'⌄';summary.append(marker);
  details.append(summary);
  if(!complete){const list=document.createElement('div');list.className='mastery-levels';
   levels.forEach((level,n)=>{
    const key=levelKey(track,n);const row=document.createElement('label');row.className='mastery-level'+(progress[key]?' checked':'');
    const check=document.createElement('input');check.type='checkbox';check.checked=!!progress[key];
    check.onchange=()=>{const wasOpen=details.open;if(check.checked)progress[key]=true;else delete progress[key];save();
      const isComplete=trackDone(track);render();
      if(!isComplete&&wasOpen){const replacement=[...$('content').querySelectorAll('.mastery-track')].find(x=>x.dataset.trackId===String(track.id));if(replacement)replacement.open=true}
    };
    row.append(check);if(level.icon){const img=document.createElement('img');img.src=level.icon;img.alt='';img.loading='lazy';row.append(img)}
    const label=document.createElement('span');label.textContent=level.name;row.append(label);list.append(row);
   });details.append(list)
  }
  details.dataset.trackId=String(track.id);grid.append(details);
 }
 if(!grid.children.length){const p=document.createElement('p');p.className='note';p.textContent='No matching mastery tracks.';grid.append(p)}
}
const bar=(a,b)=>`<div class="bar"><div class="fill" style="width:${b?100*a/b:0}%"></div></div>`;
function save(){localStorage.setItem(KEY,JSON.stringify(progress))}
function stats(items){const [a,b]=count(items);$('progress').textContent=`${a.toLocaleString('en')}/${b.toLocaleString('en')} · ${b?(100*a/b).toFixed(1):'0.0'}%`;$('progressBar').style.width=(b?100*a/b:0)+'%'}
function tile(label,items,href,click){const [a,b]=count(items);const el=document.createElement(href?'a':'button');el.className='tile'+(b&&a===b?' complete':a>0?' partial':'');el.innerHTML=`<strong>${esc(label)}</strong>${bar(a,b)}<div class="row muted"><span>${a.toLocaleString('en')} / ${b.toLocaleString('en')}</span><span>${b?(100*a/b).toFixed(1):'0.0'}%</span></div>`;if(href)el.href=href;else {el.type='button';el.onclick=click}return el}
function crumbs(){const nav=$('navigation');nav.replaceChildren();if(!active)return;const home=document.createElement('a');home.href='../index.html';home.textContent='Collectibles';nav.append(home);const root=document.createElement('button');root.textContent=catalog[active].name;root.onclick=()=>{path=[];search='';render()};nav.append(root);path.forEach((p,i)=>{const b=document.createElement('button');b.textContent=p;b.onclick=()=>{path=path.slice(0,i+1);search='';render()};nav.append(b)})}
function showList(items){
 const content=$('content');
 const q=search.toLocaleLowerCase();
 const matching=items.filter(i=>(i.name+' '+(i.unverified?'Unverified Skin':'')).toLocaleLowerCase().includes(q)).sort(sort);
 const visible=hide?matching.filter(i=>!progress[i.key]):matching;
 if(!visible.length){const p=document.createElement('p');p.className='note';p.textContent=matching.length?'All matching collectibles are hidden. Disable Hide Collected to see them.':'No matching collectibles found.';content.append(p);return}
 const grid=document.createElement('div');grid.className='items';content.append(grid);
 const more=document.createElement('button');let shown=0;
 function append(){
  for(const i of visible.slice(shown,shown+100)){
   const row=document.createElement('label');row.className='item'+(progress[i.key]?' checked':'');
   const ck=document.createElement('input');ck.type='checkbox';ck.checked=!!progress[i.key];
   ck.onchange=()=>{if(ck.checked)progress[i.key]=true;else delete progress[i.key];save();render()};
   const img=document.createElement('img');img.loading='lazy';img.alt='';if(i.icon)img.src=i.icon;else img.hidden=true;
   const name=document.createElement('span');name.className='name';name.textContent=i.unverified?'Unverified Skin ('+i.name+')':i.name;
   row.append(ck,img,name);grid.append(row);
  }
  shown=Math.min(visible.length,shown+100);more.remove();
  if(shown<visible.length){more.textContent=`Show next 100 (${visible.length-shown} remaining)`;content.append(more)}
 }
 more.onclick=append;append();
}
function render(){const content=$('content');content.replaceChildren();$('heading').textContent=active?catalog[active].name+(path.length?' / '+path.join(' / '):''):'All Collectibles';crumbs();const items=active?(cache[active]||[]).filter(i=>path.every((x,n)=>i.group[n]===x)):Object.values(cache).flat();stats(items);const [completed,total]=count(items);const panel=$('heading').closest('.panel');panel.classList.toggle('complete-section',total>0&&completed===total);panel.classList.toggle('partial-section',total>0&&completed>0&&completed<total);$('navigation').classList.toggle('complete-section',!!active&&path.length>0&&total>0&&completed===total);$('detailControls').hidden=!active;if(active){$('search').value=search;$('hideCollected').checked=hide;const next=[...new Set(items.map(i=>i.group[path.length]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'}));if(next.length&&!search){const grid=document.createElement('div');grid.className='grid';content.append(grid);for(const sub of next){const list=items.filter(i=>i.group[path.length]===sub);grid.append(tile(sub,list,null,()=>{path.push(sub);render()}))}}else if(active==='masteries')renderMasteryTracks(items);else showList(items)}else{const grid=document.createElement('div');grid.className='grid';content.append(grid);for(const [id,c] of Object.entries(catalog)){grid.append(tile(c.name,cache[id]||[],c.folder+'/index.html'))}}}
$('filtersButton').onclick=()=>$('filters').classList.toggle('hidden');document.querySelectorAll('[data-filter]').forEach(el=>{el.checked=!!filters[el.dataset.filter];el.onchange=()=>{filters[el.dataset.filter]=el.checked;localStorage.setItem(FKEY,JSON.stringify(filters))}});
$('search').oninput=e=>{search=e.target.value;render();$('search').focus();$('search').setSelectionRange(search.length,search.length)};
$('hideCollected').onchange=e=>{hide=e.target.checked;render()};$('clearSearch').onclick=()=>{search='';render()};
$('backupButton').onclick=()=>{const data={format:'mrschairmode-collectibles-progress',version:1,exportedAt:new Date().toISOString(),manual:progress,filters};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='GW2-Collectibles-Manual-Progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('importButton').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(data.format!=='mrschairmode-collectibles-progress'||data.version!==1||!data.manual||typeof data.manual!=='object')throw Error('Invalid progress backup');if(!confirm('Import progress? This replaces your manual Collectibles checkmarks in this browser.'))return;progress=data.manual;filters=data.filters||filters;save();localStorage.setItem(FKEY,JSON.stringify(filters));document.querySelectorAll('[data-filter]').forEach(el=>el.checked=!!filters[el.dataset.filter]);render()}catch(err){alert('Import failed: '+err.message)}finally{e.target.value=''}};
async function skinMetadata(){
 const records=cache.skins;if(!records)return;
 const k='mrschairmode.collectibles.skinmeta.v1';let meta=read(k,{});
 function apply(){let changed=false;for(const r of records){if(r.unverified)continue;const m=meta[r.id];if(m){if(m.name&&r.name!==m.name){r.name=m.name;changed=true}if(m.icon&&!r.icon){r.icon=m.icon;changed=true}}}if(changed){records.sort(sort);render()}}
 apply();
 const pending=records.filter(r=>!r.unverified&&/^ID \d+$/.test(r.name)&&!meta[r.id]).map(r=>r.id);
 if(!pending.length)return;
 let errors=0;
 for(let i=0;i<pending.length;i+=100){
  try{
   const ids=pending.slice(i,i+100);
   const res=await fetch('https://api.guildwars2.com/v2/skins?ids='+ids.join(',')+'&lang=en');
   if(!res.ok)throw Error('HTTP '+res.status);
   const data=await res.json();
   for(const skin of data)if(skin&&skin.id&&skin.name)meta[skin.id]={name:skin.name,icon:skin.icon||''};
   try{localStorage.setItem(k,JSON.stringify(meta))}catch(e){console.warn('Could not cache skin names',e)}
   apply();
  }catch(e){errors++;console.warn('Wardrobe skin names unavailable',e)}
 }
 const unresolved=records.filter(r=>!r.unverified&&/^ID \d+$/.test(r.name)).length;
 if(unresolved)$('error').textContent=`${unresolved} Wardrobe skin names are missing from the source data or could not be resolved by the GW2 API. Their IDs are shown only as temporary names; reload to retry.`;
}
async function dyeMetadata(){
 const records=cache.dyes;if(!records)return;
 const k='mrschairmode.collectibles.dyemeta.v1';let meta=read(k,{});
 const rarityNames={Starter:'Starter Dyes',Common:'Common Dyes',Uncommon:'Uncommon Dyes',Rare:'Rare Dyes',Exclusive:'Exclusive Dyes'};
 function apply(){for(const r of records){const m=meta[r.id];const rarity=m?.categories?.find(x=>rarityNames[x]);r.group=[rarityNames[rarity]||'Unclassified Dyes'];}render()}
 apply();const pending=records.filter(r=>!meta[r.id]).map(r=>r.id);
 for(let i=0;i<pending.length;i+=100){try{const res=await fetch('https://api.guildwars2.com/v2/colors?ids='+pending.slice(i,i+100).join(',')+'&lang=en');if(!res.ok)throw Error('HTTP '+res.status);for(const dye of await res.json())if(dye&&dye.id)meta[dye.id]={categories:dye.categories||[]};try{localStorage.setItem(k,JSON.stringify(meta))}catch(e){console.warn('Dye metadata cache unavailable',e)}apply()}catch(e){console.warn('Dye metadata unavailable',e);$('error').textContent='Dye rarity categories could not be loaded from GW2 API. Reload to retry.'}}
}
async function fishMetadata(){const records=cache.fishing;if(!records)return;const k='mrschairmode.collectibles.fishmeta.v1';let meta=read(k,{});function apply(){for(const r of records){const m=meta[r.id];if(m){r.name=m.name||r.name;r.icon=m.icon||r.icon}}records.sort(sort);render()}apply();const pending=records.filter(r=>!meta[r.id]).map(r=>r.id);for(let i=0;i<pending.length;i+=100){try{const res=await fetch('https://api.guildwars2.com/v2/items?ids='+pending.slice(i,i+100).join(',')+'&lang=en');if(!res.ok)throw Error('HTTP '+res.status);for(const item of await res.json())if(item&&item.id)meta[item.id]={name:item.name,icon:item.icon||''};try{localStorage.setItem(k,JSON.stringify(meta))}catch{}apply()}catch(e){console.warn('Fishing names unavailable',e);$('error').textContent='Some fishing names could not be retrieved. Reload to retry.'}}}
async function load(){const ids=active?[active]:Object.keys(catalog),fail=[];for(const id of ids){try{const res=await fetch(prefix+'data/'+id+'.json');if(!res.ok)throw Error('HTTP '+res.status);cache[id]=(await res.json()).map(r=>({...r,key:id+':'+r.id})).sort(sort);
 if(id==='masteries'){
  let migrated=false;
  for(const track of cache[id])if(progress[track.key]&&track.levels?.length){
   for(let n=0;n<track.levels.length;n++){const k=levelKey(track,n);if(!progress[k]){progress[k]=true;migrated=true}}
   delete progress[track.key];migrated=true;
  }
  if(migrated)save();
 }
 render();if(id==='fishing')fishMetadata();if(id==='skins')skinMetadata();if(id==='dyes')dyeMetadata()}catch(e){fail.push(id+': '+e.message)}}$('notice').textContent=`Loaded ${Object.keys(cache).length}/${ids.length} catalog${ids.length>1?'s':''}. Manual checkmarks are saved in this browser.`;if(fail.length)$('error').textContent='Missing data: '+fail.join('; ')+'. Check your uploaded data/ folder.';render()}
load();})();