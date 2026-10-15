/* foliage.js : renders the Northeast Foliage tab and the Blooms / Foliage tab switch.
   Data comes from foliage-data.js (window.FOLIAGE_DATA). */
(function(){
  "use strict";
  var D = window.FOLIAGE_DATA;
  if(!D) return;

  var AX0 = doy(9,1), AX1 = doy(11,30);          // Sep 1 .. Nov 30 axis
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var STAGES = [
    {k:"peak",     title:"At peak now",            sub:"Full color this week"},
    {k:"turning",  title:"Turning now",            sub:"Color coming in, best still ahead"},
    {k:"coming",   title:"Coming next",            sub:"Still mostly green; watch for these"},
    {k:"dropping", title:"Past peak, dropping",    sub:"Fading and falling"}
  ];
  var STAGE_LABEL = {peak:"At peak", turning:"Turning", coming:"Still green", dropping:"Dropping", bare:"Bare"};

  function doy(m,d){ var t=new Date(2025,m-1,d), s=new Date(2025,0,0); return Math.round((t-s)/864e5); }
  function fromDoy(n){ var t=new Date(2025,0,n); return MON[t.getMonth()]+" "+t.getDate(); }
  function todayDoy(){ var n=new Date(); return doy(n.getMonth()+1,n.getDate()); }
  function pct(n){ return Math.max(0,Math.min(100,(n-AX0)/(AX1-AX0)*100)); }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  function store(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v);}catch(e){ return null; } }

  /* ---------- state ---------- */
  var realToday = todayDoy();
  var inSeason = realToday>=AX0 && realToday<=AX1;
  var defaultDay = inSeason ? realToday : doy(10,20);
  var st = { zone: store("bl_fo_zone") || "south", day: defaultDay, open:{} };
  if(!D.zones.some(function(z){return z.id===st.zone;})) st.zone="south";
  function zone(){ for(var i=0;i<D.zones.length;i++) if(D.zones[i].id===st.zone) return D.zones[i]; return D.zones[0]; }

  function win(sp){
    var sh=zone().shift;
    return { s:doy(sp.win.s[0],sp.win.s[1])+sh, p:doy(sp.win.p[0],sp.win.p[1])+sh, e:doy(sp.win.e[0],sp.win.e[1])+sh };
  }
  function stageOf(sp,d){
    var w=win(sp);
    if(d<w.s) return "coming";
    if(d<w.p-4) return "turning";
    if(d<=w.p+5) return "peak";
    if(d<=w.e) return "dropping";
    return "bare";
  }

  /* ---------- tab switch ---------- */
  function setTab(t, push){
    var fo = t==="foliage";
    document.body.classList.toggle("fo-mode", fo);
    var bs=document.querySelectorAll("#tabs button");
    for(var i=0;i<bs.length;i++){ var on=bs[i].getAttribute("data-tab")===t; bs[i].classList.toggle("on",on); bs[i].setAttribute("aria-selected",on); }
    var tag=document.querySelector("header .tag");
    if(tag){ if(!tag.getAttribute("data-bloom")) tag.setAttribute("data-bloom",tag.textContent);
      tag.textContent = fo ? "what's turning color in the Northeast" : tag.getAttribute("data-bloom"); }
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
  function badges(sp,stg){
    var cls = sp.status==="invasive"?"invasive":sp.status==="planted"?"planted":"native";
    return '<div class="fo-badges"><span class="fo-b stage '+stg+'">'+STAGE_LABEL[stg]+'</span>'+
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
        badges(sp,stg)+track(sp)+
      '</div>'+
      '<div class="fo-body"><div class="fo-inner">'+
        '<div class="fo-layer"><div class="lh">Where it turns first</div><p>'+esc(sp.where)+'</p></div>'+
        '<div class="fo-layer"><div class="lh">How to identify it</div><p>'+esc(sp.id)+'</p></div>'+
        '<div class="fo-layer"><div class="lh">Color window here</div><p>First color around '+fromDoy(w.s)+
          ', peak around '+fromDoy(w.p)+', mostly bare by '+fromDoy(w.e)+'.</p></div>'+
        '<div class="fo-layer"><div class="lh">Worth knowing</div><p>'+esc(sp.also)+'</p></div>'+
      '</div></div></div>';
  }

  function render(){
    var host=document.getElementById("foPanel"); if(!host) return;
    var z=zone(), d=st.day;
    var groups={peak:[],turning:[],coming:[],dropping:[],bare:[]};
    D.species.forEach(function(sp){ if(sp.only && sp.only.indexOf(z.id)<0) return; groups[stageOf(sp,d)].push(sp); });
    // order within a group by peak date
    Object.keys(groups).forEach(function(k){ groups[k].sort(function(a,b){ return win(a).p-win(b).p; }); });

    var peakNames = groups.peak.slice(0,3).map(function(s){return s.common;});
    var summary;
    if(d<doy(9,10)+z.shift) summary="Still summer green. The first color comes from black gum, sumac and Virginia creeper.";
    else if(groups.peak.length) summary="Brightest now: <b>"+esc(peakNames.join(", "))+"</b>"+(groups.peak.length>3?" and "+(groups.peak.length-3)+" more":"")+".";
    else if(groups.turning.length) summary="Color is coming in. Watch the <b>"+esc(groups.turning[0].common)+"</b> first.";
    else summary="Mostly past. The oaks and beeches carry the last of it.";

    var h='';
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
       '<div class="fo-hint">Drag along the color line to move through the season</div></section>';

    var idx=0;
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

    h+='<section class="fo-sec"><h2>Why the colors</h2><p class="fo-sub">Four pigments make every fall color you see</p><div class="fo-pig">'+
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
  function setDay(n){ st.day=Math.max(AX0,Math.min(AX1,Math.round(n))); render(); }
  function dayFromX(line,clientX){ var r=line.getBoundingClientRect(); return AX0+(clientX-r.left)/r.width*(AX1-AX0); }

  document.addEventListener("click",function(e){
    var t=e.target.closest ? e.target : null; if(!t) return;
    var tab=t.closest("#tabs button"); if(tab){ setTab(tab.getAttribute("data-tab"),true); return; }
    if(!document.body.classList.contains("fo-mode")) return;
    var zb=t.closest(".fo-zones button"); if(zb){ st.zone=zb.getAttribute("data-zone"); store("bl_fo_zone",st.zone); render(); return; }
    if(t.closest("#foToday")){ setDay(realToday); return; }
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
