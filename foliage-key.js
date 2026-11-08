/* foliage-key.js : "Identify a leaf" (multi-access key) and "Practice" for the
   Northeast Foliage tab. Reads window.FOLIAGE_DATA (species with `key` tags)
   and window.FOLIAGE_MEDIA (photos + drawings). Exposes window.FoliageKey. */
(function(){
  "use strict";
  var D=window.FOLIAGE_DATA, M=window.FOLIAGE_MEDIA||{};
  if(!D) return;

  /* ---------- the questions ---------- */
  var Q=[
    { id:"type", title:"What is it?", teach:"Size first. A vine climbs, a shrub has many stems from the ground, a tree has one trunk.",
      opts:[["tree","A tree","one trunk, taller than you"],["shrub","A shrub","many stems from the ground"],["vine","A vine","climbing or sprawling"],["ground","On the ground","fern or ground cover"]] },
    { id:"leaf", title:"Leaf or needle?", teach:"Needles and scales mean a conifer. Those are a different key: count needles in a bundle.",
      opts:[["broad","Broad leaf","flat, with a blade"],["needle","Needles","thin, stiff, often in bundles"],["fern","Fern frond","no flowers, spores underneath"]] },
    { id:"arr", title:"How do the leaves attach?", teach:"The most powerful question. Opposite leaves are rare: Maple, Ash, Dogwood, the viburnums and honeysuckles (Caprifoliaceae), Horsechestnut. MAD Cap Horse. Look at the twig, not the leaflets.",
      opts:[["opp","Opposite","in pairs, across from each other"],["alt","Alternate","staggered, one at a time"]] },
    { id:"form", title:"One blade, or leaflets?", teach:"A compound leaf has one bud at the base of the whole thing. Leaflets have no buds. Find the bud and you know where the leaf starts.",
      opts:[["simple","Simple","one blade on a stalk"],["pinnate","Feather compound","leaflets along a central stalk"],["palmate","Hand compound","leaflets from one point"],["trifoliate","Three leaflets","leaves of three"],["bipinnate","Twice compound","feathery, leaflets on leaflets"]] },
    { id:"edge", title:"What is the edge like?", teach:"Look at the outline. Lobed leaves have deep bays; toothed leaves have a saw edge; smooth leaves have neither.",
      opts:[["smooth","Smooth","no teeth, no lobes"],["toothed","Toothed","saw edge, fine or coarse"],["lobed","Lobed","deep bays and fingers"]] },
    { id:"lobe", title:"Lobes pointed or rounded?", teach:"Pointed lobes with a tiny bristle at each tip: the red oak group. Rounded lobes with no bristles: the white oak group. Maples are pointed too.", when:function(a){return a.edge==="lobed";},
      opts:[["pointed","Pointed","sharp tips, often bristled"],["rounded","Rounded","soft fingers, no bristles"]] },
  ];
  /* signatures: the clinchers. Shown as a checklist after the shape questions. */
  var SIGS={
    "smell-rootbeer":"Crushed leaf smells like root beer","smell-wintergreen":"Scratched twig smells of wintergreen","smell-peanut":"Crushed leaf smells like rancid peanut butter",
    "smell-spice":"Crushed leaf smells spicy, citrusy","smell-almond":"Broken twig smells of bitter almond","smell-citrus":"Crushed leaflets smell sharp and citrusy","smell-pepper":"Crushed leaf smells like green pepper",
    "milky-sap":"Snapped leaf stalk bleeds milky white sap","clear-sap":"Snapped leaf stalk: clear sap","flat-stalk":"Leaf stalk is flattened, leaf flutters in any breeze","winged-stalk":"Leafy wing along the stalk between leaflets",
    "thorns":"Thorns on twigs or trunk","single-spine":"A single sharp spine at each leaf node","corky-wings":"Corky ridges or wings on the twigs","hairy-vine":"Thick hairy vine on a trunk","tendrils":"Climbs with tendrils",
    "striped-bark":"Green bark with white stripes","pale-bark":"White or chalky pale bark","camo-bark":"Bark peels in tan, olive and white patches","blocky-bark":"Dark bark in small square blocks","alligator-bark":"Bark like alligator skin",
    "smooth-gray-bark":"Smooth gray elephant-skin bark","shaggy-bark":"Bark in long peeling strips","diamond-bark":"Furrowed bark in a diamond pattern","rope-bark":"Deeply furrowed rope-like bark","scaly-pale-bark":"Light gray scaly bark","dark-ridged-bark":"Dark, deeply ridged bark","potato-chip-bark":"Dark flaky bark like burnt potato chips",
    "green-twigs":"Twigs are green","velvet-twigs":"Twigs velvety like deer antler","hollow-twigs":"Twigs hollow when snapped","zigzag-twigs":"Twigs zigzag","right-angle-branches":"Branches stick out at right angles","drooping-lower-limbs":"Lower limbs droop toward the ground","straight-trunk":"Very tall, straight trunk",
    "samara":"Paired winged seeds (helicopters)","paddle-seeds":"Paddle-shaped single-wing seeds in clusters","pods":"Flat bean-like pods","acorn":"Acorns","husked-nut":"Nut in a thick husk that splits","round-nut":"Round green nut like a tennis ball","gumball":"Spiky ball seed pods","seed-ball":"Round bristly seed balls on long stalks","bract-seed":"Small nutlets hanging from a strap-shaped leaf","catkins":"Catkins","small-cones":"Small upright cones","long-cone":"Long curved cones","seed-strands":"Drooping strands of pale seed capsules","seed-clusters":"Big hanging clusters of twisted tan seeds",
    "red-berries":"Red berries","white-berries":"White or gray berries","blue-berries":"Dark blue berries","black-berries":"Black berries","orange-berries":"Orange-red berries, sometimes in a yellow husk","red-berry-cone":"Upright fuzzy red berry cone","speckled-berries":"Red berries speckled with silver","orange-fruit":"Round orange fruit","green-fruit":"Lumpy green fruit like a small mango","tiny-pears":"Tiny brown pears","smelly-fruit":"Foul-smelling fruit on the ground",
    "needles-5":"Needles in bundles of 5","needle-tufts":"Needles in tufts on short knobs","bead-stalks":"Stiff brown bead-covered stalks",
    "three-leaflets":"Leaves of three","five-leaflets":"Five leaflets from one point","tiny-leaflets":"Dozens of tiny leaflets","end-leaflet-biggest":"End leaflet the largest","three-leaf-shapes":"Three leaf shapes on one tree: oval, mitten, three-lobed","three-lobes":"Three main lobes","deep-cut-lobes":"Lobes cut almost to the center","u-notches":"Rounded U-shaped notches between lobes","rounded-lobes":"Rounded lobes, no bristles","bristle-tips":"Bristle tips on the lobes","star-leaf":"Five-pointed star leaf","fan-leaf":"Fan-shaped leaf","heart-leaf":"Heart-shaped leaf","notched-tip":"Squared-off, notched leaf tip","wide-leaf":"Leaf wider than long","huge-leaf":"Leaves a foot long","glossy-round-leaf":"Glossy rounded leaves","lopsided-base":"Leaf base lopsided","double-teeth":"Teeth on the teeth (double-toothed)","rough-top":"Leaf rough like sandpaper on top","wavy-edge":"Wavy edge","straight-veins":"Straight parallel veins each ending in a tooth","curved-veins":"Veins curve to follow the leaf edge","rusty-midrib":"Rusty hairs along the midrib underneath","silver-underside":"Silver-white underside","gland-notch":"Small notch with a gland near each leaflet base","red-stalks":"Red leaf stalks","red-stalk":"Red central leaf stalk","stalk-covers-bud":"Leaf stalk base covers the bud",
    "naked-buds":"Buds without scales, visible all winter","cigar-buds":"Long cigar-shaped buds","fall-flowers":"Spidery yellow flowers while leaves turn","stretchy-threads":"Torn leaf held by stretchy threads","sour-taste":"Leaf tastes sour","low-shrub":"Knee to waist high","last-green":"Still green when everything else is bare","wet-ground":"Growing in a swamp or wet ground","strangling-vine":"Vine wrapping and strangling trees","yellow-wood":"Cut stems bright yellow inside"
  };

  var st={ open:false, mode:"key", ans:{}, sigs:{}, includeBare:false, pick:null, quiz:null };
  var ctx={ zone:null, day:null, stageOf:null, openCard:null };  // supplied by foliage.js

  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  function arr(v){ return v==null?[]:(Array.isArray(v)?v:[v]); }
  function has(sp,field,val){ var k=sp.key||{}; var v=k[field]; if(v==null) return false; return arr(v).indexOf(val)>=0; }

  /* ---------- candidates: in this region, in leaf today (unless includeBare) ---------- */
  function pool(){
    var z=ctx.zone, d=ctx.day;
    return D.species.filter(function(sp){
      if(!sp.key) return false;
      if(z && sp.only && sp.only.indexOf(z.id)<0) return false;
      if(!st.includeBare && ctx.stageOf && z && !sp.stageWords){ var s=ctx.stageOf(sp,d); if(s==="bare") return false; }
      return true;
    });
  }
  function matches(sp){
    var a=st.ans;
    if(a.type && (sp.type||"")!==a.type) return false;
    if(a.leaf && !has(sp,"leaf",a.leaf)) return false;
    if(a.arr && !has(sp,"arr",a.arr)) return false;
    if(a.form && !has(sp,"form",a.form)) return false;
    if(a.edge && !has(sp,"edge",a.edge)) return false;
    if(a.lobe && has(sp,"edge","lobed") && !has(sp,"lobe",a.lobe)) return false;
    for(var sid in st.sigs){ if(st.sigs[sid] && (sp.key.sig||[]).indexOf(sid)<0) return false; }
    return true;
  }
  function remaining(){ return pool().filter(matches); }
  /* how many would be left for each option: lets the UI gray out dead ends */
  function countIf(field,val){
    var save=st.ans[field]; st.ans[field]=val; var n=remaining().length; if(save===undefined) delete st.ans[field]; else st.ans[field]=save; return n;
  }

  /* ---------- media ---------- */
  var DRAW={};  // file title -> thumb url (resolved via Commons API)
  function resolveDrawings(titles){
    var need=titles.filter(function(t){ return t && DRAW[t]===undefined; });
    if(!need.length || !window.fetch) return;
    try{ var c=JSON.parse(localStorage.getItem("bl_fo_draw")||"{}"); need.forEach(function(t){ if(c[t]) DRAW[t]=c[t]; }); need=need.filter(function(t){return DRAW[t]===undefined;}); }catch(e){}
    if(!need.length){ render(); return; }
    need.forEach(function(t){ DRAW[t]="pending"; });
    var url="https://commons.wikimedia.org/w/api.php?format=json&origin=*&action=query&prop=imageinfo&iiprop=url&iiurlwidth=640&titles="+encodeURIComponent(need.map(function(t){return "File:"+t;}).join("|"));
    fetch(url).then(function(r){return r.json();}).then(function(j){
      var pages=(j.query&&j.query.pages)||{}, norm={};
      (j.query&&j.query.normalized||[]).forEach(function(n){ norm[n.to]=n.from; });
      Object.keys(pages).forEach(function(id){ var p=pages[id], ii=p.imageinfo&&p.imageinfo[0]; if(!ii) return;
        var title=(norm[p.title]||p.title).replace(/^File:/,""); DRAW[title]=ii.thumburl;
        var alt=p.title.replace(/^File:/,"").replace(/_/g," "); DRAW[alt]=ii.thumburl; });
      need.forEach(function(t){ if(DRAW[t]==="pending") DRAW[t]="fail"; });
      try{ var c=JSON.parse(localStorage.getItem("bl_fo_draw")||"{}"); need.forEach(function(t){ if(DRAW[t]&&DRAW[t]!=="fail") c[t]=DRAW[t]; }); localStorage.setItem("bl_fo_draw",JSON.stringify(c)); }catch(e){}
      render();
    }).catch(function(){ need.forEach(function(t){ DRAW[t]="fail"; }); render(); });
  }
  function media(sp){ return M[sp.common]||{}; }
  function drawImg(sp,cls){
    var m=media(sp); if(!m.draw) return '';
    var u=DRAW[m.draw.file];
    if(u && u!=="pending" && u!=="fail") return '<img class="'+cls+'" src="'+esc(u)+'" alt="Drawing of '+esc(sp.common)+'" loading="lazy">';
    if(u==="fail") return '<div class="'+cls+' fk-ph">drawing unavailable offline</div>';
    return '<div class="'+cls+' fk-ph">drawing loading…</div>';
  }
  function photoImg(sp,cls,med){
    var m=media(sp); if(!m.photo) return '';
    return '<img class="'+cls+'" src="'+esc(med?m.photo.med:m.photo.sq)+'" alt="Photo of '+esc(sp.common)+'" loading="lazy">';
  }
  function credit(sp){
    var m=media(sp), parts=[];
    if(m.photo) parts.push('Photo: '+esc(m.photo.by)+' (iNaturalist, '+esc(m.photo.lic)+')');
    if(m.draw) parts.push('Drawing: '+esc(m.draw.src)+', '+esc(m.draw.lic)+', via Wikimedia Commons');
    return parts.join(' · ');
  }

  /* ---------- tiles (schematic icons for the shape questions) ---------- */
  function icon(id,val){
    var s='<svg viewBox="0 0 60 60" aria-hidden="true">';
    var leaf=function(x,y,r,rot){ return '<path transform="translate('+x+' '+y+') rotate('+rot+')" d="M0 0 C-'+r+' -'+r*0.6+' -'+r*0.9+' -'+r*1.8+' 0 -'+r*2.2+' C'+r*0.9+' -'+r*1.8+' '+r+' -'+r*0.6+' 0 0 Z" fill="#6b8f3a"/>'; };
    if(id==="arr"){ s+='<path d="M30 56 V6" stroke="#6b4a32" stroke-width="3"/>';
      if(val==="opp"){ s+=leaf(30,20,6,-70)+leaf(30,20,6,70)+leaf(30,40,6,-70)+leaf(30,40,6,70); }
      else { s+=leaf(30,14,6,-70)+leaf(30,28,6,70)+leaf(30,42,6,-70); } }
    else if(id==="form"){
      if(val==="simple") s+='<path d="M30 56 V40" stroke="#6b4a32" stroke-width="2.5"/>'+leaf(30,40,14,0);
      else if(val==="pinnate"){ s+='<path d="M30 56 V8" stroke="#6b4a32" stroke-width="2"/>'; [16,28,40].forEach(function(y){ s+=leaf(30,y,5,-80)+leaf(30,y,5,80); }); s+=leaf(30,10,5,0); }
      else if(val==="palmate"){ s+='<path d="M30 56 V36" stroke="#6b4a32" stroke-width="2.5"/>'; [-60,-30,0,30,60].forEach(function(a){ s+=leaf(30,36,6,a); }); }
      else if(val==="trifoliate"){ s+='<path d="M30 56 V36" stroke="#6b4a32" stroke-width="2.5"/>'+leaf(30,36,7,-55)+leaf(30,36,7,55)+leaf(30,34,7,0); }
      else { s+='<path d="M30 56 V8" stroke="#6b4a32" stroke-width="2"/>'; [16,30,44].forEach(function(y){ s+='<path d="M30 '+y+' L10 '+(y-8)+' M30 '+y+' L50 '+(y-8)+'" stroke="#6b4a32" stroke-width="1.5"/>'; [0.3,0.6,0.9].forEach(function(f){ s+=leaf(30-20*f,y-8*f,2.2,-80)+leaf(30+20*f,y-8*f,2.2,80); }); }); } }
    else if(id==="edge"){
      if(val==="smooth") s+='<path d="M30 54 C10 44 8 20 30 6 C52 20 50 44 30 54 Z" fill="#6b8f3a"/>';
      else if(val==="toothed"){ var d='M30 54 '; for(var i=0;i<9;i++){ var t=i/8, x=30-20*Math.sin(Math.PI*t), y=54-48*t; d+='L'+(x-3)+' '+(y-2)+' L'+x+' '+y+' '; } for(var j=8;j>=0;j--){ var t2=j/8, x2=30+20*Math.sin(Math.PI*t2), y2=54-48*t2; d+='L'+(x2+3)+' '+(y2-2)+' L'+x2+' '+y2+' '; } s+='<path d="'+d+'Z" fill="#6b8f3a"/>'; }
      else s+='<path d="M30 56 L24 40 L8 44 L18 30 L6 18 L22 22 L30 6 L38 22 L54 18 L42 30 L52 44 L36 40 Z" fill="#6b8f3a"/>'; }
    else if(id==="lobe"){
      if(val==="pointed") s+='<path d="M30 56 L26 40 L10 46 L20 30 L8 14 L24 20 L30 4 L36 20 L52 14 L40 30 L50 46 L34 40 Z" fill="#6b8f3a"/>';
      else s+='<path d="M30 56 C28 48 22 48 18 50 C10 52 8 40 16 38 C8 36 8 24 18 26 C12 18 20 10 26 16 C26 6 34 6 34 16 C40 10 48 18 42 26 C52 24 52 36 44 38 C52 40 50 52 42 50 C38 48 32 48 30 56 Z" fill="#6b8f3a"/>'; }
    else if(id==="leaf"){
      if(val==="broad") s+='<path d="M30 56 V44" stroke="#6b4a32" stroke-width="2.5"/>'+leaf(30,44,16,0);
      else if(val==="needle") s+='<g stroke="#2f5a3a" stroke-width="2.5" stroke-linecap="round"><path d="M30 56 L16 10 M30 56 L24 8 M30 56 L30 6 M30 56 L36 8 M30 56 L44 10"/></g>';
      else s+='<path d="M30 56 V6" stroke="#4d6b2f" stroke-width="2"/>'+[14,22,30,38,46].map(function(y,i){ var w=14-i*1.5; return '<path d="M30 '+y+' L'+(30-w)+' '+(y-4)+' M30 '+y+' L'+(30+w)+' '+(y-4)+'" stroke="#6b8f3a" stroke-width="3" stroke-linecap="round"/>'; }).join(''); }
    else if(id==="type"){
      if(val==="tree") s+='<path d="M30 58 V34" stroke="#6b4a32" stroke-width="4"/><circle cx="30" cy="24" r="16" fill="#6b8f3a"/>';
      else if(val==="shrub") s+='<g stroke="#6b4a32" stroke-width="2"><path d="M30 58 L22 40 M30 58 L30 38 M30 58 L38 40"/></g><circle cx="22" cy="36" r="9" fill="#6b8f3a"/><circle cx="38" cy="36" r="9" fill="#6b8f3a"/><circle cx="30" cy="30" r="9" fill="#6b8f3a"/>';
      else if(val==="vine") s+='<path d="M10 58 C20 40 40 50 50 30 C56 18 44 10 40 18" stroke="#6b8f3a" stroke-width="4" fill="none" stroke-linecap="round"/>'+leaf(22,46,5,60)+leaf(44,32,5,-40);
      else s+='<path d="M6 54 H54" stroke="#6b4a32" stroke-width="3"/>'+leaf(18,54,6,-15)+leaf(30,54,8,0)+leaf(42,54,6,15); }
    return s+'</svg>';
  }

  /* ---------- render ---------- */
  function render(){
    var host=document.getElementById("foKey"); if(!host) return;
    if(!st.open){ host.innerHTML=""; host.style.display="none"; return; }
    host.style.display="block";
    host.innerHTML = st.mode==="quiz" ? renderQuiz() : renderKey();
    // resolve drawings for whatever is on screen
    var titles=[]; host.querySelectorAll("[data-draw]").forEach(function(el){ titles.push(el.getAttribute("data-draw")); });
    if(titles.length) resolveDrawings(titles);
  }
  function head(sub){
    return '<div class="fk-head"><div><div class="fo-chap">'+(st.mode==="quiz"?"Practice":"Identify a leaf")+'</div><h2>'+(st.mode==="quiz"?"Name that tree":"Which tree is this?")+'</h2>'+(sub?'<p class="fo-sub">'+sub+'</p>':'')+'</div>'+
      '<div class="fk-tabs"><button type="button" data-fkmode="key" class="'+(st.mode==="key"?"on":"")+'">Key</button><button type="button" data-fkmode="quiz" class="'+(st.mode==="quiz"?"on":"")+'">Practice</button><button type="button" id="fkClose" aria-label="Close">&times;</button></div></div>';
  }
  function renderKey(){
    var rem=remaining(), total=pool().length, z=ctx.zone;
    var h=head('Answer what you can, in any order. Skip what you cannot see. Trees that are bare in '+esc(z?z.label:"your region")+' today are left out.');
    // questions
    h+='<div class="fk-qs">';
    Q.forEach(function(q){
      if(q.when && !q.when(st.ans)) return;
      if(q.id!=="type" && q.id!=="leaf" && st.ans.leaf && st.ans.leaf!=="broad") return;
      var cur=st.ans[q.id];
      h+='<div class="fk-q'+(cur?' done':'')+'"><div class="fk-qt"><b>'+esc(q.title)+'</b>'+(cur?'<button type="button" class="fk-clear" data-clear="'+q.id+'">change</button>':'')+'</div>';
      h+='<div class="fk-opts">'+q.opts.map(function(o){
        var n=countIf(q.id,o[0]), on=cur===o[0], dead=!on&&n===0;
        return '<button type="button" class="fk-opt'+(on?' on':'')+(dead?' dead':'')+'" data-q="'+q.id+'" data-v="'+o[0]+'"'+(dead?' disabled':'')+'>'+icon(q.id,o[0])+'<span class="l">'+esc(o[1])+'</span><span class="d">'+esc(o[2])+'</span><span class="n">'+n+'</span></button>';
      }).join('')+'</div>';
      h+='<div class="fk-teach">'+esc(q.teach)+'</div></div>';
    });
    // signatures relevant to the remaining set
    if(rem.length>1 && rem.length<=14){
      var sigCount={}; rem.forEach(function(sp){ (sp.key.sig||[]).forEach(function(s){ sigCount[s]=(sigCount[s]||0)+1; }); });
      var sigs=Object.keys(sigCount).filter(function(s){ return SIGS[s] && sigCount[s]<rem.length; }).sort(function(a,b){ return Math.abs(sigCount[a]-rem.length/2)-Math.abs(sigCount[b]-rem.length/2); }).slice(0,10);
      if(sigs.length){
        h+='<div class="fk-q"><div class="fk-qt"><b>Any of these?</b></div><div class="fk-sigs">'+sigs.map(function(s){
          return '<button type="button" class="fk-sig'+(st.sigs[s]?' on':'')+'" data-sig="'+s+'">'+esc(SIGS[s])+'<span class="n">'+sigCount[s]+'</span></button>'; }).join('')+'</div>'+
          '<div class="fk-teach">Signatures clinch it. Crush a leaf, snap a stalk, look at the bark and the fruit.</div></div>';
      }
    }
    h+='</div>';
    // remaining
    h+='<div class="fk-rem"><div class="fk-remh"><b>'+rem.length+' of '+total+'</b> '+(rem.length===1?'tree left':'trees left')+
       '<label class="fk-bare"><input type="checkbox" id="fkBare"'+(st.includeBare?' checked':'')+'> include bare trees</label></div>';
    if(rem.length===1){ h+=result(rem[0]); }
    else if(rem.length===0){ h+='<p class="fo-sub">Nothing in the guide matches all of that. Change an answer, or tick "include bare trees".</p>'; }
    else {
      h+='<div class="fk-grid">'+rem.map(function(sp){
        var m=media(sp), d=m.draw?' data-draw="'+esc(m.draw.file)+'"':'';
        return '<button type="button" class="fk-card" data-pick="'+esc(sp.sci)+'"'+d+'>'+(st.pick===sp.sci?drawImg(sp,"fk-img"):photoImg(sp,"fk-img"))+'<span class="fk-name">'+esc(sp.common)+'</span></button>'; }).join('')+'</div>';
      if(st.pick){ var sp=rem.filter(function(x){return x.sci===st.pick;})[0]; if(sp) h+=result(sp,true); }
      h+='<p class="fk-tip">Tap a tree to see its drawing and the field marks that separate it from the others.</p>';
    }
    h+='</div>';
    return h;
  }
  function whatGaveItAway(sp){
    var rows=[];
    Q.forEach(function(q){ var v=st.ans[q.id]; if(!v) return; var o=q.opts.filter(function(x){return x[0]===v;})[0]; if(o) rows.push(o[1]); });
    Object.keys(st.sigs).forEach(function(s){ if(st.sigs[s]) rows.push(SIGS[s]); });
    return rows;
  }
  function result(sp,partial){
    var m=media(sp), stage=ctx.stageOf&&ctx.zone?ctx.stageOf(sp,ctx.day):null;
    var h='<div class="fk-res"'+(m.draw?' data-draw="'+esc(m.draw.file)+'"':'')+'>';
    h+='<div class="fk-res-media">'+drawImg(sp,"fk-draw")+photoImg(sp,"fk-photo",true)+'</div>';
    h+='<div class="fk-res-body"><div class="fo-chap">'+(partial?'Looking at':'Your tree')+'</div><h3>'+esc(sp.common)+'</h3><div class="fk-sci">'+esc(sp.sci)+'</div>';
    h+='<div class="fk-layer"><div class="lh">How to be sure</div><p>'+esc(sp.id)+'</p></div>';
    var gave=whatGaveItAway(sp); if(gave.length&&!partial) h+='<div class="fk-layer"><div class="lh">What gave it away</div><p>'+esc(gave.join(" · "))+'</p></div>';
    if(stage) h+='<div class="fk-layer"><div class="lh">Right now</div><p>'+esc(sp.colorWords)+'. '+esc(sp.where)+'</p></div>';
    h+='<div class="fk-actions"><button type="button" class="fk-go" data-go="'+esc(sp.common)+'">Open its card in the guide</button>'+(partial?'':'<button type="button" class="fk-again" id="fkReset">Identify another</button>')+'</div>';
    h+='<div class="fk-credit">'+credit(sp)+'</div></div></div>';
    return h;
  }

  /* ---------- practice ---------- */
  function newQuiz(){
    var p=pool().filter(function(sp){ return sp.key && sp.key.leaf==="broad" && media(sp).draw; });
    if(p.length<4) p=D.species.filter(function(sp){ return sp.key && sp.key.leaf==="broad" && media(sp).draw; });
    var picks=p.slice().sort(function(){return Math.random()-0.5;}).slice(0,5);
    st.quiz={ items:picks, i:0, step:0, score:0, asked:0, wrong:[], reveal:false };
  }
  var QSTEPS=[["arr","How do the leaves attach?"],["form","One blade, or leaflets?"],["edge","What is the edge like?"]];
  function renderQuiz(){
    if(!st.quiz) newQuiz();
    var qz=st.quiz, h=head('Five trees from your region. Read the drawing, answer the three shape questions, then name it.');
    if(qz.i>=qz.items.length){
      h+='<div class="fk-res"><div class="fk-res-body"><div class="fo-chap">Done</div><h3>'+qz.score+' of '+qz.asked+' right</h3>';
      if(qz.wrong.length) h+='<p class="fo-sub">Worth another look: '+esc(qz.wrong.join(", "))+'.</p>';
      h+='<div class="fk-actions"><button type="button" class="fk-go" id="fkQuizAgain">Five more</button></div></div></div>';
      return h;
    }
    var sp=qz.items[qz.i], m=media(sp);
    h+='<div class="fk-quiz" data-draw="'+esc(m.draw.file)+'"><div class="fk-qprog">Tree '+(qz.i+1)+' of '+qz.items.length+' · score '+qz.score+'/'+qz.asked+'</div>';
    h+='<div class="fk-res-media">'+drawImg(sp,"fk-draw")+(qz.reveal?photoImg(sp,"fk-photo",true):'')+'</div>';
    if(!qz.reveal && qz.step<QSTEPS.length){
      var f=QSTEPS[qz.step][0], q=Q.filter(function(x){return x.id===f;})[0];
      h+='<div class="fk-q"><div class="fk-qt"><b>'+esc(QSTEPS[qz.step][1])+'</b></div><div class="fk-opts">'+q.opts.map(function(o){
        var fb=qz.fb&&qz.fb.field===f?qz.fb:null, cls=fb?(has(sp,f,o[0])?' right':(fb.v===o[0]?' wrongpick':'')):'';
        return '<button type="button" class="fk-opt'+cls+'" data-qa="'+f+'" data-v="'+o[0]+'"'+(fb?' disabled':'')+'>'+icon(f,o[0])+'<span class="l">'+esc(o[1])+'</span></button>'; }).join('')+'</div>';
      if(qz.fb&&qz.fb.field===f) h+='<div class="fk-teach">'+(qz.fb.ok?'Right. ':'Not this one. ')+esc(q.teach)+'</div><div class="fk-actions"><button type="button" class="fk-go" id="fkNextStep">Next</button></div>';
      h+='</div>';
    } else if(!qz.reveal){
      var choices=[sp].concat(D.species.filter(function(x){ return x!==sp && x.key && x.key.leaf==="broad" && x.key.arr===sp.key.arr; }).sort(function(){return Math.random()-0.5;}).slice(0,3)).sort(function(){return Math.random()-0.5;});
      if(!qz.choices) qz.choices=choices;
      h+='<div class="fk-q"><div class="fk-qt"><b>So which tree is it?</b></div><div class="fk-names">'+qz.choices.map(function(x){ return '<button type="button" class="fk-namebtn" data-name="'+esc(x.sci)+'">'+esc(x.common)+'</button>'; }).join('')+'</div></div>';
    } else {
      h+='<div class="fk-res-body"><div class="fo-chap">'+(qz.last?'Right':'It was')+'</div><h3>'+esc(sp.common)+'</h3><div class="fk-sci">'+esc(sp.sci)+'</div>'+
         '<div class="fk-layer"><div class="lh">The tells</div><p>'+esc(sp.id)+'</p></div>'+
         '<div class="fk-actions"><button type="button" class="fk-go" id="fkNextTree">'+(qz.i+1<qz.items.length?'Next tree':'See score')+'</button><button type="button" class="fk-again" data-go="'+esc(sp.common)+'">Open its card</button></div>'+
         '<div class="fk-credit">'+credit(sp)+'</div></div>';
    }
    h+='</div>';
    return h;
  }

  /* ---------- events ---------- */
  document.addEventListener("click",function(e){
    var t=e.target.closest?e.target:null; if(!t) return;
    if(t.closest("#foToKey")){ st.open=true; st.mode="key"; render(); var k=document.getElementById("foKey"); if(k) k.scrollIntoView({behavior:"smooth",block:"start"}); return; }
    var host=document.getElementById("foKey"); if(!host||!st.open||!host.contains(t)) return;
    var b;
    if(t.closest("#fkClose")){ st.open=false; render(); window.scrollTo({top:0,behavior:"smooth"}); return; }
    if((b=t.closest("[data-fkmode]"))){ st.mode=b.getAttribute("data-fkmode"); if(st.mode==="quiz"&&!st.quiz) newQuiz(); render(); return; }
    if((b=t.closest(".fk-opt[data-q]"))){ var q=b.getAttribute("data-q"), v=b.getAttribute("data-v"); if(st.ans[q]===v) delete st.ans[q]; else st.ans[q]=v; if(q==="edge"&&v!=="lobed") delete st.ans.lobe; if(q==="leaf"&&v!=="broad"){ delete st.ans.arr; delete st.ans.form; delete st.ans.edge; delete st.ans.lobe; } st.pick=null; render(); return; }
    if((b=t.closest("[data-clear]"))){ var c=b.getAttribute("data-clear"); delete st.ans[c]; if(c==="edge") delete st.ans.lobe; render(); return; }
    if((b=t.closest("[data-sig]"))){ var s=b.getAttribute("data-sig"); st.sigs[s]=!st.sigs[s]; st.pick=null; render(); return; }
    if((b=t.closest("[data-pick]"))){ var pk=b.getAttribute("data-pick"); st.pick=(st.pick===pk?null:pk); render(); return; }
    if(t.closest("#fkReset")){ st.ans={}; st.sigs={}; st.pick=null; render(); host.scrollIntoView({behavior:"smooth",block:"start"}); return; }
    if((b=t.closest("[data-go]"))){ var name=b.getAttribute("data-go"); if(ctx.openCard) ctx.openCard(name); return; }
    // quiz
    if((b=t.closest(".fk-opt[data-qa]"))){ var f=b.getAttribute("data-qa"), vv=b.getAttribute("data-v"), sp=st.quiz.items[st.quiz.i]; var ok=has(sp,f,vv); st.quiz.asked++; if(ok) st.quiz.score++; else if(st.quiz.wrong.indexOf(sp.common)<0) st.quiz.wrong.push(sp.common); st.quiz.fb={field:f,v:vv,ok:ok}; render(); return; }
    if(t.closest("#fkNextStep")){ st.quiz.step++; st.quiz.fb=null; render(); return; }
    if((b=t.closest("[data-name]"))){ var sp2=st.quiz.items[st.quiz.i], ok2=b.getAttribute("data-name")===sp2.sci; st.quiz.asked++; if(ok2) st.quiz.score++; else if(st.quiz.wrong.indexOf(sp2.common)<0) st.quiz.wrong.push(sp2.common); st.quiz.last=ok2; st.quiz.reveal=true; render(); return; }
    if(t.closest("#fkNextTree")){ st.quiz.i++; st.quiz.step=0; st.quiz.reveal=false; st.quiz.choices=null; st.quiz.fb=null; render(); host.scrollIntoView({behavior:"smooth",block:"start"}); return; }
    if(t.closest("#fkQuizAgain")){ newQuiz(); render(); return; }
  });
  document.addEventListener("change",function(e){ if(e.target.id==="fkBare"){ st.includeBare=e.target.checked; st.pick=null; render(); } });

  window.FoliageKey={
    setContext:function(c){ ctx=Object.assign(ctx,c); if(st.open) render(); },
    render:render,
    isOpen:function(){ return st.open; }
  };
})();
