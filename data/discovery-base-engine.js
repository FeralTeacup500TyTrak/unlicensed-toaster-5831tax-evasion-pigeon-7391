/* Discovery base-material dependency index. A base is any item without a producing
   recipe in this snapshot. Counts are DISTINCT discovery recipe IDs, never quantities.
   All production paths are traversed; each terminal item is counted once per discovery recipe. */
(function(root){'use strict';
class GW2DiscoveryBases {
 constructor(index){this.index=index;this.recipes=index.recipes||{};this.byOutput=index.by_output_item_id||{};this.names=index.item_names||{};this.cache=new Map();this.alternatives=new Set();this.cycles=new Set();}
 trace(itemId, stack=new Set()){
  const id=String(itemId);
  if(stack.has(id)){this.cycles.add(id);return new Set();}
  if(this.cache.has(id))return this.cache.get(id);
  const name=this.names[id]||'';if(/(?:glacial)\s+(?:shard|core|fragment|lodestone)s?$/i.test(name)){const terminal=new Set([id]);this.cache.set(id,terminal);return terminal;}
  const options=(this.byOutput[id]||[]).map(x=>this.recipes[String(x)]).filter(Boolean).sort((a,b)=>Number(a.id)-Number(b.id));
  if(!options.length){const result=new Set([id]);this.cache.set(id,result);return result;}
  if(options.length>1)this.alternatives.add(id);
  const next=new Set(stack);next.add(id);const result=new Set();
  for(const option of options)for(const ing of option.ingredients||[])if(ing.item_id!=null)for(const base of this.trace(ing.item_id,next))result.add(base);
  if(!stack.size)this.cache.set(id,result);
  return result;
 }
 forRecipe(recipe){const result=new Set();for(const ing of recipe.ingredients||[])if(ing.item_id!=null)for(const id of this.trace(ing.item_id))result.add(id);return result;}
}
root.GW2DiscoveryBases=GW2DiscoveryBases;
})(typeof window!=='undefined'?window:globalThis);
