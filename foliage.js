/* foliage.js : renders the Northeast Foliage tab and the Blooms / Foliage tab switch.
   Data comes from foliage-data.js (window.FOLIAGE_DATA). */
(function(){
  "use strict";
  var D = window.FOLIAGE_DATA;
  if(!D) return;

  var YR=new Date().getFullYear();
  var AX0 = doy(9,1), AX1 = doy(11,30);          // Sep 1 .. Nov 30 axis
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var STAGES = [
    {k:"peak",     title:"At peak now",            sub:"Full color this week"},
    {k:"turning",  title:"Turning now",            sub:"Color coming in, best still ahead"},
    {k:"coming",   title:"Coming next",            sub:"Still mostly green; watch for these"},
    {k:"dropping", title:"Past peak, dropping",    sub:"Fading and falling"}
  ];
  var STAGE_LABEL = {peak:"At peak", turning:"Turning", coming:"Still green", dropping:"Dropping", bare:"Bare"};

  function doy(m,d){ var t=new Date(YR,m-1,d), s=new Date(YR,0,0); return Math.round((t-s)/864e5); }
  function fromDoy(n){ var t=new Date(YR,0,n); return MON[t.getMonth()]+" "+t.getDate(); }
  function todayDoy(){ var n=new Date(); return doy(n.getMonth()+1,n.getDate()); }
  function pct(n){ return Math.max(0,Math.min(100,(n-AX0)/(AX1-AX0)*100)); }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  function store(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v);}catch(e){ return null; } }

  /* ---------- state ---------- */
  var realToday = todayDoy();
  var inSeason = realToday>=AX0 && realToday<=AX1;
  var defaultDay = inSeason ? realToday : doy(10,20);
  var st = { zone: store("bl_fo_zone") || "south", day: defaultDay, open:{}, q:"", browse:false };
  if(!D.zones.some(function(z){return z.id===st.zone;})) st.zone="south";
  function zone(){ for(var i=0;i<D.zones.length;i++) if(D.zones[i].id===st.zone) return D.zones[i]; return D.zones[0]; }

  function win(sp){
    var sh=zone().shift;
    return { s:doy(sp.win.s[0],sp.win.s[1])+sh, p:doy(sp.win.p[0],sp.win.p[1])+sh, e:doy(sp.win.e[0],sp.win.e[1])+sh };
  }
  /* Breathing room: trees of the same kind run about a week apart, so the
     stage bands are wide and a tree near the edge of a band is labeled with
     both stages ("At peak, starting to drop") instead of snapping to one. */
  var SLACK=5, PEAKBAND=7, EDGE=3;
  function bands(sp){
    var w=win(sp);
    return { s:w.s-SLACK, p0:w.p-PEAKBAND, p1:w.p+PEAKBAND, e:w.e+SLACK };
  }
  function stageOf(sp,d){
    var b=bands(sp);
    if(d<b.s) return "coming";
    if(d<b.p0) return "turning";
    if(d<=b.p1) return "peak";
    if(d<=b.e) return "dropping";
    return "bare";
  }
  function stageLabel(sp,d){
    var b=bands(sp), k=stageOf(sp,d);
    if(sp.stageWords) return sp.stageWords[k] || STAGE_LABEL[k];
    if(k==="coming"   && b.s-d<=EDGE)  return "Green, first color soon";
    if(k==="turning"  && b.p0-d<=EDGE) return "Turning, near peak";
    if(k==="peak"     && d-b.p0<=EDGE-1 && b.p0-bands(sp).s>EDGE) return "Peak just starting";
    if(k==="peak"     && b.p1-d<=EDGE) return "At peak, starting to drop";
    if(k==="dropping" && b.e-d<=EDGE)  return "Dropping, nearly bare";
    return STAGE_LABEL[k];
  }

  /* ---------- tab switch ---------- */
  function setTab(t, push){
    var fo = t==="foliage";
    document.body.classList.toggle("fo-mode", fo);
    var bs=document.querySelectorAll("#tabs button");
    for(var i=0;i<bs.length;i++){ var on=bs[i].getAttribute("data-tab")===t; bs[i].classList.toggle("on",on); bs[i].setAttribute("aria-selected",on); }
    var tag=document.querySelector("header .tag");
    if(tag){ if(!tag.getAttribute("data-bloom")) tag.setAttribute("data-bloom",tag.textContent);
      tag.textContent = fo ? "what's turning color, Maine to Virginia" : tag.getAttribute("data-bloom"); }
    document.title = fo ? "Northeast Foliage · Bloomline" : "Bloomline";
    if(push){ try{ history.replaceState(null,"", fo ? "#foliage" : location.pathname+location.search); }catch(e){} }
    if(fo) render();
  }

  /* ---------- render pieces ---------- */
  function seasonGradient(){
    var sh=zone().shift;
    return "linear-gradient(90deg,"+D.seasonLine.map(function(s){
      return s.c+" "+pct(doy(s.md[0],s.md[1])+sh).toFixed(1)+"%";
    }).join(",")+")";
  }
  function swatches(sp){ return sp.colors.map(function(c){return '<i style="background:'+c+'"></i>';}).join(""); }
  function track(sp){
    var w=win(sp), a=pct(w.s), b=pct(w.e);
    var g="linear-gradient(90deg,"+sp.colors.join(",")+")";
    return '<div class="fo-track"><div class="seg" style="left:'+a+'%;width:'+Math.max(2,b-a)+'%;background:'+g+'"></div>'+
           '<div class="tk" style="left:'+pct(st.day)+'%"></div></div>'+
           '<div class="fo-axis"><span>Sep</span><span>Oct</span><span>Nov</span></div>';
  }
  function badges(sp,stg,lab){
    var cls = sp.status==="invasive"?"invasive":sp.status==="planted"?"planted":sp.status==="naturalized"?"naturalized":"native";
    return '<div class="fo-badges"><span class="fo-b stage '+stg+'">'+esc(lab||STAGE_LABEL[stg])+'</span>'+
           '<span class="fo-b '+cls+'">'+esc(sp.status)+'</span>'+
           '<span class="fo-b">'+esc(sp.type)+'</span><span class="fo-b">'+esc(sp.fam)+'</span></div>';
  }
  function card(sp,stg,i){
    var w=win(sp), open=!!st.open[sp.sci];
    return '<div class="fo-card'+(open?' open':'')+'" data-sci="'+esc(sp.sci)+'">'+
      '<div class="fo-head" role="button" tabindex="0" aria-expanded="'+open+'">'+
        '<div class="fo-top"><div class="fo-sw">'+swatches(sp)+'</div>'+
          '<div class="fo-names"><div class="fo-common">'+esc(sp.common)+'</div>'+
          '<div class="fo-sci">'+esc(sp.sci)+'</div>'+
          '<div class="fo-words">'+esc(sp.colorWords)+'</div></div>'+
          '<div class="fo-chev">&rsaquo;</div></div>'+
        badges(sp,stg,stageLabel(sp,st.day))+track(sp)+liveLine(sp)+
      '</div>'+
      '<div class="fo-body"><div class="fo-inner">'+
        '<div class="fo-layer"><div class="lh">Where it turns first</div><p>'+esc(sp.where)+'</p></div>'+
        '<div class="fo-layer"><div class="lh">How to identify it</div><p>'+esc(sp.id)+'</p></div>'+
        '<div class="fo-layer"><div class="lh">'+(sp.winText?'Timing here':'Color window here')+'</div><p>'+
          (sp.winText? esc(sp.winText[0])+' '+fromDoy(w.s)+', '+esc(sp.winText[1])+' '+fromDoy(w.p)+', '+esc(sp.winText[2])+' '+fromDoy(w.e)
                     : 'First color around '+fromDoy(w.s)+', peak around '+fromDoy(w.p)+', mostly bare by '+fromDoy(w.e))+
          '. Any single tree can run about a week either side.</p></div>'+
        '<div class="fo-layer"><div class="lh">Worth knowing</div><p>'+esc(sp.also)+'</p></div>'+
      '</div></div></div>';
  }

  function redSvg(){
    return '<svg class="fo-diag" viewBox="0 0 320 210" role="img" aria-label="A red leaf on a twig. The sun makes sugar in the leaf, a seal at the stalk blocks it from leaving, the trapped sugar becomes red pigment, and next year\'s bud sits on the twig just above the stalk.">'+
      '<circle cx="292" cy="26" r="13" fill="#e8b23a"/>'+
      '<g stroke="#e8b23a" stroke-width="2" stroke-linecap="round"><path d="M272 26h-6M312 26h6M292 46v6M292 6v-6M278 12l-4-4M306 12l4-4M278 40l-4 4"/></g>'+
      '<path d="M268 40 L214 70" stroke="#e8b23a" stroke-width="2" stroke-dasharray="4 4" fill="none"/>'+
      '<path d="M14 182 H306" stroke="#6b4a32" stroke-width="7" stroke-linecap="round"/>'+
      '<path d="M120 178 C128 150 140 132 156 118" stroke="#8a5a2a" stroke-width="4" fill="none" stroke-linecap="round"/>'+
      '<path d="M156 118 C150 70 196 34 246 40 C252 92 214 132 156 118 Z" fill="#c0391b"/>'+
      '<path d="M156 118 C186 96 214 70 240 46" stroke="#8a1e1e" stroke-width="2" fill="none"/>'+
      '<g fill="#f6e3a8"><circle cx="196" cy="80" r="3.2"/><circle cx="210" cy="96" r="3.2"/><circle cx="182" cy="100" r="3.2"/><circle cx="222" cy="70" r="3.2"/><circle cx="170" cy="86" r="3.2"/></g>'+
      '<path d="M113 170 L133 162" stroke="#2a1a12" stroke-width="5" stroke-linecap="round"/>'+
      '<path d="M104 178 C98 166 102 156 110 150 C114 160 112 170 104 178 Z" fill="#6b7a3a"/>'+
      '<g font-family="Spline Sans Mono, monospace" font-size="9.5" fill="#2a1a12" letter-spacing=".04em">'+
        '<text x="178" y="20">SUN MAKES SUGAR</text>'+
        '<text x="236" y="122">SUGAR + LIGHT</text><text x="236" y="134">= NEW RED</text>'+
        '<text x="150" y="160">SEAL BLOCKS</text><text x="150" y="172">THE EXIT</text>'+
        '<text x="12" y="132">NEXT YEAR\'S</text><text x="12" y="144">BUD, ALREADY</text><text x="12" y="156">FORMED</text>'+
        '<text x="12" y="202" fill="#7a6352">TWIG</text>'+
      '</g>'+
      '<path d="M76 150 L98 160" stroke="#7a6352" stroke-width="1.2"/>'+
    '</svg>';
  }
  var F='font-family="Spline Sans Mono, monospace" font-size="9.5" letter-spacing=".04em" fill="#2a1a12"';
  function cellSvg(mode){
    /* mode "green": healthy cell, panels full of green with hidden yellow
       mode "yellow": panels being taken apart, green leaving, yellow left */
    var y = mode==="yellow";
    var h='<svg class="fo-diag" viewBox="0 0 320 200" role="img" aria-label="'+(y?
      'A leaf cell in fall. The green solar panels are being taken apart from inside, their nutrients leave through the stalk to the twig, and the yellow pigments are left behind.':
      'A leaf cell in summer, full of green chloroplasts. Small yellow pigments sit inside each chloroplast but are hidden by the green.')+'">';
    h+='<rect x="20" y="30" width="200" height="140" rx="26" fill="'+(y?'#fbf0c9':'#e9f0dc')+'" stroke="'+(y?'#c9a227':'#4d6b2f')+'" stroke-width="3"/>';
    var pos=[[62,68],[118,60],[176,72],[56,128],[112,122],[170,132],[140,94],[84,98]];
    pos.forEach(function(q,i){
      if(!y){
        h+='<ellipse cx="'+q[0]+'" cy="'+q[1]+'" rx="20" ry="11" fill="#4d6b2f"/>'+
           '<circle cx="'+(q[0]-7)+'" cy="'+(q[1]-2)+'" r="2.2" fill="#d9b521" opacity=".55"/>'+
           '<circle cx="'+(q[0]+6)+'" cy="'+(q[1]+3)+'" r="2.2" fill="#d9b521" opacity=".55"/>';
      } else {
        h+='<ellipse cx="'+q[0]+'" cy="'+q[1]+'" rx="20" ry="11" fill="none" stroke="#a8a82c" stroke-width="1.5" stroke-dasharray="3 3"/>'+
           '<circle cx="'+(q[0]-7)+'" cy="'+(q[1]-2)+'" r="3.4" fill="#d9a521"/>'+
           '<circle cx="'+(q[0]+6)+'" cy="'+(q[1]+3)+'" r="3.4" fill="#d9a521"/>'+
           (i%2? '<rect x="'+(q[0]+12)+'" y="'+(q[1]-9)+'" width="5" height="3" fill="#4d6b2f" opacity=".7" transform="rotate(30 '+q[0]+' '+q[1]+')"/>':'');
      }
    });
    if(!y){
      h+='<circle cx="290" cy="34" r="12" fill="#e8b23a"/><path d="M276 44 L224 64" stroke="#e8b23a" stroke-width="2" stroke-dasharray="4 4"/>'+
         '<g '+F+'><text x="232" y="96">CHLOROPLAST</text><text x="232" y="108">= SOLAR PANEL</text>'+
         '<text x="232" y="132">GREEN ON TOP,</text><text x="232" y="144">YELLOW HIDDEN</text><text x="232" y="156">UNDERNEATH</text>'+
         '<text x="20" y="20">A SINGLE LEAF CELL, SUMMER</text></g>'+
         '<path d="M230 100 L198 76" stroke="#7a6352" stroke-width="1.2"/>';
    } else {
      h+='<path d="M222 100 H286" stroke="#4d6b2f" stroke-width="3" stroke-dasharray="6 5"/><path d="M286 100 l-9 -6 v12 z" fill="#4d6b2f"/>'+
         '<g '+F+'><text x="228" y="86">NITROGEN</text><text x="228" y="122">TO THE TWIG,</text><text x="228" y="134">SAVED FOR</text><text x="228" y="146">SPRING</text>'+
         '<text x="20" y="20">SAME CELL, FALL</text><text x="20" y="190">PANELS TAKEN APART INSIDE; YELLOW LEFT</text></g>';
    }
    return h+'</svg>';
  }
  function brownSvg(){
    var L=[["#4d6b2f","GREEN"],["#d9b521","YELLOW"],["#c0391b","RED"],["#7a5a3a","BROWN"]];
    var h='<svg class="fo-diag" viewBox="0 0 320 130" role="img" aria-label="The order a leaf changes: green, then yellow, then red, then brown last.">';
    L.forEach(function(l,i){
      var x=18+i*76;
      h+='<path d="M'+(x+10)+' 80 C'+(x+6)+' 44 '+(x+34)+' 20 '+(x+60)+' 22 C'+(x+64)+' 58 '+(x+40)+' 84 '+(x+10)+' 80 Z" fill="'+l[0]+'"/>'+
         '<path d="M'+(x+10)+' 80 L'+(x+56)+' 26" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>'+
         '<text x="'+(x+34)+'" y="104" text-anchor="middle" font-family="Spline Sans Mono, monospace" font-size="10" letter-spacing=".08em" fill="#2a1a12">'+(i+1)+' '+l[1]+'</text>';
      if(i<3) h+='<path d="M'+(x+64)+' 52 h8" stroke="#7a6352" stroke-width="2"/><path d="M'+(x+74)+' 52 l-5 -4 v8 z" fill="#7a6352"/>';
    });
    h+='<text x="160" y="124" text-anchor="middle" font-family="Spline Sans Mono, monospace" font-size="9" letter-spacing=".06em" fill="#7a6352">BROWN IS ALWAYS THE LAST STOP</text>';
    return h+'</svg>';
  }
  function storySection(R, cls, num, svg){
    if(!R) return "";
    var h='<section class="fo-sec fo-story '+cls+'"><div class="fo-chap">Part '+num+' of 4</div><h2>'+esc(R.title)+'</h2><p class="fo-sub">'+esc(R.sub)+'</p>'+
          (svg?'<div class="fo-diagwrap">'+svg+'</div>':'');
    R.parts.forEach(function(p,i){
      h+='<div class="fo-step"><div class="n">'+(i+1)+'</div><div><b>'+esc(p.h)+'</b><ul>'+
         p.pts.map(function(t){return '<li>'+esc(t)+'</li>';}).join("")+'</ul></div></div>';
    });
    if(R.prune) h+='<div class="fo-prune"><b>'+esc(R.prune.h)+'</b><ul>'+
         R.prune.pts.map(function(t){return '<li>'+esc(t)+'</li>';}).join("")+'</ul></div>';
    return h+'</section>';
  }
  function colorStory(){
    var O=D.overview||{title:"How a leaf changes color",sub:"",paras:[]};
    return '<section class="fo-sec fo-guide" id="foGuide"><div class="fo-chap">The guide</div><h2>'+esc(O.title)+'</h2><p class="fo-sub">'+esc(O.sub)+'</p>'+
           '<div class="fo-diagwrap">'+brownSvg()+'</div>'+
           '<div class="fo-overview">'+O.paras.map(function(t){return '<p>'+esc(t)+'</p>';}).join("")+'</div>'+
           '<button type="button" class="fo-totop" id="foToTop">&uarr; Back to the trees</button></section>'+
      storySection(D.greenStory,"st-green",1,cellSvg("green"))+
      storySection(D.yellowStory,"st-yellow",2,cellSvg("yellow"))+
      storySection(D.redStory,"st-red",3,redSvg())+
      storySection(D.brownStory,"st-brown",4,"");
  }

  function norm(t){ return String(t||"").toLowerCase().replace(/&/g," ").replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim(); }
  function matches(sp,q){
    var words=[sp.common, sp.sci].concat(sp.aka||[]).map(norm).join(" | ");
    return q.split(" ").every(function(w){ return (" "+words).indexOf(" "+w)>=0 || words.indexOf(w)===0; });
  }
  function searchBox(){
    var all=D.species.slice().sort(function(a,b){return a.common<b.common?-1:1;});
    return '<div class="fo-search"><div class="fo-sbar">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>'+
      '<input id="foQ" type="search" placeholder="Search a tree: maple, oak, ash, poplar\u2026" autocomplete="off" value="'+esc(st.q)+'" aria-label="Search trees">'+
      (st.q?'<button type="button" id="foQx" aria-label="Clear search">&times;</button>':'')+'</div>'+
      '<button type="button" class="fo-browse" id="foBrowse" aria-expanded="'+st.browse+'">'+(st.browse?'Hide tree list':'Browse all '+all.length+' trees')+'</button>'+
      (st.browse?'<div class="fo-chips">'+all.map(function(sp){return '<button type="button" data-tree="'+esc(sp.common)+'">'+esc(sp.common)+'</button>';}).join("")+'</div>':'')+
      '</div>';
  }

  /* ---------- live color reports (iNaturalist "Leaves: Colored Leaves") ----------
     One query per region, cached 6 hours. Counts are matched to guide cards by
     scientific name; anything reported in color that the guide lacks is listed
     under "Also in color near you", so gaps surface without manual research. */
  var LIVE={}, LIVE_DAYS=30, LIVE_TTL=6*3600e3, LIVE_RETRY=5*60e3;
  function isoDay(t){ return new Date(t).toISOString().slice(0,10); }
  function loadLive(z){
    if(!z.bbox || !window.fetch) return;
    var L=LIVE[z.id], now=Date.now();
    if(L && (L.status==="loading" || (L.status==="ok" && now-L.at<LIVE_TTL) || (L.status==="err" && now-L.at<LIVE_RETRY))) return;
    var key="bl_fo_live_"+z.id;
    try{ var c=JSON.parse(localStorage.getItem(key)||"null"); if(c && c.status==="ok" && now-c.at<LIVE_TTL){ LIVE[z.id]=c; return; } }catch(e){}
    LIVE[z.id]={status:"loading"};
    var b=z.bbox;
    var url="https://api.inaturalist.org/v1/observations/species_counts?term_id=36&term_value_id=39&iconic_taxa=Plantae"+
      "&quality_grade=research&swlat="+b[0]+"&swlng="+b[1]+"&nelat="+b[2]+"&nelng="+b[3]+
      "&d1="+isoDay(now-LIVE_DAYS*864e5)+"&d2="+isoDay(now)+"&per_page=200";
    var ctl=window.AbortController?new AbortController():null, to=setTimeout(function(){ if(ctl) ctl.abort(); },12000);
    fetch(url, ctl?{signal:ctl.signal}:{}).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).then(function(j){
      clearTimeout(to);
      var rows=(j.results||[]).map(function(x){ var t=x.taxon||{};
        return {id:t.id, name:t.name||"", common:t.preferred_common_name||"", rank:t.rank||"", count:x.count||0}; });
      LIVE[z.id]={status:"ok", at:Date.now(), rows:rows};
      try{ localStorage.setItem(key, JSON.stringify(LIVE[z.id])); }catch(e){}
      if(zone().id===z.id && document.body.classList.contains("fo-mode")) render();
    }).catch(function(){
      clearTimeout(to); LIVE[z.id]={status:"err", at:Date.now()};
      if(zone().id===z.id && document.body.classList.contains("fo-mode")) render();
    });
  }
  function sciKeys(sp){
    if(sp._keys) return sp._keys;
    var out={species:{}, genera:{}}, genus="";
    String(sp.sci).split(",").concat(sp.inat||[]).forEach(function(part){
      var w=part.replace(/\u00d7|×/g," ").trim().split(/\s+/).filter(Boolean); if(!w.length) return;
      var g=w[0]; if(/^[A-Z]\.$/.test(g)) g=genus; else genus=g;
      var e=w[1]||"";
      if(!e || e==="spp." || e==="sp.") out.genera[g.toLowerCase()]=1; else out.species[(g+" "+e).toLowerCase()]=1;
    });
    return (sp._keys=out);
  }
  function matchSp(name){
    var w=String(name).replace(/\u00d7|×/g," ").trim().toLowerCase().split(/\s+/);
    var sp2=w.length>1?w[0]+" "+w[1]:"", g=w[0];
    for(var i=0;i<D.species.length;i++){ var k=sciKeys(D.species[i]); if(sp2 && k.species[sp2]) return D.species[i]; }
    for(var j=0;j<D.species.length;j++){ if(sciKeys(D.species[j]).genera[g]) return D.species[j]; }
    return null;
  }
  function liveIndex(z){
    var L=LIVE[z.id]; if(!L || L.status!=="ok") return null;
    if(L._idx) return L._idx;
    var by={}, gaps=[];
    L.rows.forEach(function(r){
      var sp=matchSp(r.name);
      if(sp) by[sp.sci]=(by[sp.sci]||0)+r.count;
      else if(/^(species|subspecies|variety|hybrid|form)$/.test(r.rank)) gaps.push(r);
    });
    gaps.sort(function(a,b){ return b.count-a.count; });
    return (L._idx={by:by, gaps:gaps});
  }
  function liveLine(sp){
    var idx=liveIndex(zone()); if(!idx) return "";
    var n=idx.by[sp.sci]||0;
    if(!n && sp.noLive) return "";
    return '<div class="fo-live'+(n?' on':'')+'">'+(n? n+' color report'+(n===1?'':'s')+' nearby in the last 30 days'
      : 'No color reports nearby in the last 30 days')+'</div>';
  }
  function gapSection(z){
    var L=LIVE[z.id], h='<section class="fo-sec fo-gaps"><h2>Also in color near you</h2>';
    if(!L || L.status==="loading") return h+'<p class="fo-sub">Checking iNaturalist for other plants in color in '+esc(z.label)+'\u2026</p></section>';
    if(L.status==="err") return h+'<p class="fo-sub">Could not reach iNaturalist right now. The guide above still works; live reports will return on the next visit.</p></section>';
    var idx=liveIndex(z), g=idx.gaps.slice(0,15);
    if(!g.length) return h+'<p class="fo-sub">Every plant reported in fall color in '+esc(z.label)+' over the last 30 days is already in this guide.</p></section>';
    return h+'<p class="fo-sub">Live from iNaturalist: plants people photographed with fall color in '+esc(z.label)+
      ' in the last 30 days that this guide does not cover yet. Tap a name to see photos.</p><ul class="fo-gaplist">'+
      g.map(function(r){ return '<li><a href="https://www.inaturalist.org/taxa/'+encodeURIComponent(r.id)+'" target="_blank" rel="noopener">'+
        '<b>'+esc(r.common?r.common.replace(/\b\w/g,function(c){return c.toUpperCase();}):r.name)+'</b><i>'+esc(r.name)+'</i></a><span>'+r.count+'</span></li>'; }).join("")+
      '</ul></section>';
  }

  function render(){
    var host=document.getElementById("foPanel"); if(!host) return;
    var z=zone(), d=st.day;
    loadLive(z);
    var groups={peak:[],turning:[],coming:[],dropping:[],bare:[]};
    D.species.forEach(function(sp){ if(sp.only && sp.only.indexOf(z.id)<0) return; groups[stageOf(sp,d)].push(sp); });
    // order within a group by peak date
    Object.keys(groups).forEach(function(k){ groups[k].sort(function(a,b){ return win(a).p-win(b).p; }); });

    var peakNames = groups.peak.slice().sort(function(a,b){ return Math.abs(win(a).p-d)-Math.abs(win(b).p-d); })
                      .slice(0,3).map(function(s){return s.common;});
    var summary;
    if(d<doy(9,10)+z.shift) summary="Still summer green. The first color comes from black gum, sumac, Virginia creeper and black walnut.";
    else if(groups.peak.length) summary="Brightest now: <b>"+esc(peakNames.join(", "))+"</b>"+(groups.peak.length>3?" and "+(groups.peak.length-3)+" more":"")+".";
    else if(groups.turning.length) summary="Color is coming in. Watch the <b>"+esc(groups.turning[0].common)+"</b> first.";
    else summary="Mostly past. The oaks and beeches carry the last of it.";

    var h=searchBox();
    h+='<div class="fo-guidebtn"><button type="button" id="foToGuide">How fall color works <span>&darr;</span> read the guide</button></div>';
    h+='<div class="fo-zones" role="tablist" aria-label="Region">'+D.zones.map(function(x){
      return '<button type="button" data-zone="'+x.id+'" class="'+(x.id===z.id?'on':'')+'">'+esc(x.label)+'</button>';
    }).join("")+'</div>';
    h+='<div class="fo-zone-note">'+esc(z.note)+'</div>';

    h+='<section class="fo-season"><div class="fo-when"><span>'+(inSeason||d!==defaultDay?"":"Typical year · ")+fromDoy(d)+
       (d===realToday?" · today":"")+'</span>'+
       '<button type="button" class="fo-today'+(d!==realToday&&inSeason?' show':'')+'" id="foToday">&#8634; Today</button></div>'+
       '<div class="fo-line" id="foLine" role="slider" tabindex="0" aria-label="Date in the foliage season" aria-valuetext="'+fromDoy(d)+'">'+
         '<div class="bar" style="background:'+seasonGradient()+'"></div>'+
         '<div class="mk" style="left:'+pct(d)+'%"></div></div>'+
       '<div class="fo-months"><span>Sep</span><span>Oct</span><span>Nov</span></div>'+
       '<p class="fo-summary">'+summary+'</p>'+
       '<div class="fo-hint">Drag along the color line to move through the season. Trees of the same kind can run about a week ahead or behind each other.</div></section>';

    var idx=0, q=norm(st.q);
    if(q){
      var hits=D.species.filter(function(sp){ return matches(sp,q); });
      h+='<section class="fo-sec fo-results"><h2>Search<span class="cnt">'+hits.length+' match'+(hits.length===1?'':'es')+'</span></h2>';
      if(!hits.length) h+='<p class="fo-sub">No tree in the guide matches \u201c'+esc(st.q)+'\u201d. Try browsing the full list above.</p>';
      else h+='<p class="fo-sub">Shown with where each tree stands on '+fromDoy(d)+' in '+esc(z.label)+'.</p>';
      hits.forEach(function(sp){
        if(hits.length===1) st.open[sp.sci]=true;
        var off = sp.only && sp.only.indexOf(z.id)<0;
        if(off) h+='<p class="fo-off">'+esc(sp.common)+' is not common in '+esc(z.label)+'. Timing below is an estimate.</p>';
        h+=card(sp,stageOf(sp,d),idx++);
      });
      h+='</section>';
    } else {
      STAGES.forEach(function(s){
        var list=groups[s.k]; if(!list.length) return;
        h+='<section class="fo-sec '+s.k+'"><h2>'+s.title+'<span class="cnt">'+list.length+'</span></h2><p class="fo-sub">'+s.sub+'</p>';
        list.forEach(function(sp){ h+=card(sp,s.k,idx++); });
        h+='</section>';
      });
      if(groups.bare.length){
        h+='<section class="fo-sec dropping"><h2>Already bare<span class="cnt">'+groups.bare.length+'</span></h2>'+
           '<p class="fo-bare">'+groups.bare.map(function(s){return esc(s.common);}).join(" · ")+'</p></section>';
      }
    }

    if(!q) h+=gapSection(z);
    h+=colorStory();
    h+='<section class="fo-sec"><h2>The color key</h2><p class="fo-sub">Four pigments make every fall color you see. Only the red is new.</p><div class="fo-pig">'+
       D.pigments.map(function(p){ return '<div class="pc"><i style="background:'+p.c+'"></i><div><b>'+esc(p.name)+'</b><span>'+esc(p.text)+'</span></div></div>'; }).join("")+
       '</div></section>';
    h+='<section class="fo-sec"><h2>Where to look first</h2><p class="fo-sub">What turns before what, on the landscape and on a single tree</p><div class="fo-where">'+
       D.whereFirst.map(function(w){ return '<div class="w"><b>'+esc(w.h)+'</b><span>'+esc(w.t)+'</span></div>'; }).join("")+
       '</div></section>';
    h+='<div class="fo-foot">Timing shown is a typical year for the selected region. Dry summers bring color early; a warm, wet fall delays it.'+
       '<div class="legal"><a href="/privacy.html">Privacy</a> &middot; <a href="/terms.html">Community Guidelines</a></div></div>';

    host.innerHTML=h;
  }

  /* ---------- interactions ---------- */
  function setDay(n){ var v=Math.max(AX0,Math.min(AX1,Math.round(n))); if(v===st.day) return; st.day=v; render(); }
  function dayFromX(line,clientX){ var r=line.getBoundingClientRect(); return AX0+(clientX-r.left)/r.width*(AX1-AX0); }

  document.addEventListener("click",function(e){
    var t=e.target.closest ? e.target : null; if(!t) return;
    var tab=t.closest("#tabs button"); if(tab){ setTab(tab.getAttribute("data-tab"),true); return; }
    if(!document.body.classList.contains("fo-mode")) return;
    if(t.closest("#foQx")){ st.q=""; render(); var qi=document.getElementById("foQ"); if(qi) qi.focus(); return; }
    if(t.closest("#foBrowse")){ st.browse=!st.browse; render(); return; }
    var chip=t.closest(".fo-chips button"); if(chip){ st.q=chip.getAttribute("data-tree"); st.browse=false; render();
      var r=document.querySelector(".fo-results"); if(r) r.scrollIntoView({behavior:"smooth",block:"start"}); return; }
    var zb=t.closest(".fo-zones button"); if(zb){ st.zone=zb.getAttribute("data-zone"); store("bl_fo_zone",st.zone); render(); return; }
    if(t.closest("#foToday")){ setDay(realToday); return; }
    if(t.closest("#foToGuide")){ var g=document.getElementById("foGuide"); if(g) g.scrollIntoView({behavior:"smooth",block:"start"}); return; }
    if(t.closest("#foToTop")){ window.scrollTo({top:0,behavior:"smooth"}); return; }
    var hd=t.closest(".fo-head"); if(hd){ var c=hd.parentNode, sci=c.getAttribute("data-sci");
      st.open[sci]=!st.open[sci]; c.classList.toggle("open",st.open[sci]); hd.setAttribute("aria-expanded",st.open[sci]); }
  });
  document.addEventListener("keydown",function(e){
    if(!document.body.classList.contains("fo-mode")) return;
    var t=e.target;
    if(t.id==="foLine"){
      if(e.key==="ArrowRight"){ e.preventDefault(); setDay(st.day+1); document.getElementById("foLine").focus(); }
      if(e.key==="ArrowLeft"){ e.preventDefault(); setDay(st.day-1); document.getElementById("foLine").focus(); }
    } else if((e.key==="Enter"||e.key===" ") && t.classList && t.classList.contains("fo-head")){ e.preventDefault(); t.click(); }
  });
  document.addEventListener("input",function(e){
    if(e.target.id!=="foQ") return;
    var pos=e.target.selectionStart; st.q=e.target.value; render();
    var qi=document.getElementById("foQ"); if(qi){ qi.focus(); try{ qi.setSelectionRange(pos,pos); }catch(x){} }
  });
  var dragging=false;
  document.addEventListener("pointerdown",function(e){
    var line=e.target.closest && e.target.closest("#foLine"); if(!line) return;
    dragging=true; setDay(dayFromX(line,e.clientX));
  });
  document.addEventListener("pointermove",function(e){
    if(!dragging) return; var line=document.getElementById("foLine"); if(line) setDay(dayFromX(line,e.clientX));
  });
  document.addEventListener("pointerup",function(){ dragging=false; });
  document.addEventListener("pointercancel",function(){ dragging=false; });

  /* start on the foliage tab when the link says so */
  var startFo = location.hash==="#foliage";
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){ setTab(startFo?"foliage":"bloom",false); });
  else setTab(startFo?"foliage":"bloom",false);

  window.addEventListener("hashchange",function(){ setTab(location.hash==="#foliage"?"foliage":"bloom",false); });
})();
