/* Finish Line: exam week planner.
   Home = calendar of the days until the exam + map. Setup in four steps (exam and travel, places, fixed week, study slots),
   then a check page with flagged trips and trade-off cards (always one recommended option, the learner decides),
   then "the line to the exam": the confirmed plan as a map and a train line of study stations. */
(function(){
"use strict";
var FL = window.FL; if(!FL) return;
var esc = FL.esc;
function S(){ return FL.S; }

/* ---------- empty plan for a new learner ---------- */
function seed(){
  /* a blank plan: the learner fills in their own places and week. Personal plans live in the learner's account, never in this file. */
  var d = new Date(); d.setDate(d.getDate()+7);
  return {
    v:1, confirmed:false, mode:"car", stepMin:50,
    exam:{date:d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2), time:"10:00", place:"home"},
    sleep:{bed:"23:30", wake:"07:30"},
    places:[{id:"home", name:"Home", kind:"home", addr:"", lat:52.52, lon:13.405, park:5}],
    events:[], travel:{}, decisions:{}, done:{}, geo:{home:"none"}
  };
}
function P(){ var s = S(); if(!s.plan) s.plan = seed(); return s.plan; }
function save(){ FL.save(); }

/* ---------- time helpers ---------- */
function m(t){ var a = String(t||"0:0").split(":"); return (+a[0])*60 + (+a[1]||0); }
function hm(x){ x = Math.round(x); var h = Math.floor(((x%1440)+1440)%1440/60), mm = ((x%60)+60)%60; return ("0"+h).slice(-2)+":"+("0"+mm).slice(-2); }
function iso(d){ return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); }
function todayIso(){ return iso(new Date()); }
function addDays(s, n){ var d = new Date(s+"T12:00:00"); d.setDate(d.getDate()+n); return iso(d); }
function dayName(s, long){ var d = new Date(s+"T12:00:00"); return d.toLocaleDateString("en-GB", long ? {weekday:"long", day:"numeric", month:"long"} : {weekday:"short", day:"numeric"}); }
function days(){ var p = P(), out = [], d = todayIso(); if(d > p.exam.date) d = p.exam.date; var n = 0; while(d <= p.exam.date && n++ < 21){ out.push(d); d = addDays(d,1); } return out; }
function place(id){ return P().places.filter(function(x){ return x.id===id; })[0]; }
function rush(t){ return (t>=420 && t<570) || (t>=960 && t<1140); }
var MODE = {car:"Car", transit:"Public transport", bike:"Bike", walk:"On foot"};
var KIND = {home:"Home", uni:"Uni", work:"Work", training:"Training", cafe:"Café", library:"Library", other:"Other"};
var QUIET = {home:true, uni:true, library:true, cafe:false, work:false, training:false, other:false};

/* ---------- travel: real times from the routing function, estimates until then ---------- */
var pending = {}, fetching = false;
function tkey(a, b, mode){ return a+">"+b+">"+mode; }
function km(a, b){ var R = 6371, dLa = (b.lat-a.lat)*Math.PI/180, dLo = (b.lon-a.lon)*Math.PI/180, x = Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLo/2)*Math.sin(dLo/2); return 2*R*Math.asin(Math.sqrt(x)); }
function travel(a, b){
  var p = P(), k = tkey(a, b, p.mode), t = p.travel[k], A = place(a), B = place(b);
  if(t && t.manual) return {min:t.manual, src:"checked", line:t.line};
  if(t && t.min) return {min:t.min, src:"route", line:t.line};
  if(A && B && !pending[k]) pending[k] = {a:A, b:B, mode:p.mode, key:k};
  var d = A && B ? km(A, B)*1.3 : 10, speed = {car:(d > 12 ? 45 : 26), transit:20, bike:15, walk:4.8}[p.mode] || 25;
  return {min:Math.round(d/speed*60 + (p.mode==="transit" ? 8 : 4)), src:"estimate", line:A && B ? [[A.lat,A.lon],[B.lat,B.lon]] : null};
}
function fetchTravel(){
  if(fetching) return; var keys = Object.keys(pending); if(!keys.length) return;
  fetching = true; var job = pending[keys[0]]; delete pending[keys[0]];
  fetch("api/route?from="+job.a.lon+","+job.a.lat+"&to="+job.b.lon+","+job.b.lat+"&mode="+job.mode).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){
    if(j && j.minutes){ P().travel[job.key] = {min:j.minutes, line:j.line||null, src:j.source}; save(); FL.render(); }
    else P().travel[job.key] = P().travel[job.key] || {failed:true};
  }).catch(function(){ P().travel[job.key] = {failed:true}; }).then(function(){ fetching = false; setTimeout(fetchTravel, 350); });
}
function geocodeSeeds(){
  var p = P();
  p.places.forEach(function(pl){
    if(pl.addr && !p.geo[pl.id]){ p.geo[pl.id] = "asked";
      fetch("api/geocode?q="+encodeURIComponent(pl.addr)).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){
        var x = j && j.results && j.results[0]; if(!x) return;
        if(km(pl, x) < 3){ pl.lat = x.lat; pl.lon = x.lon; p.geo[pl.id] = "ok"; save(); }
      }).catch(function(){});
    }
  });
}

/* ---------- the day model: fixed events, travel legs with leave / park / inside, free slots ---------- */
function removed(ev){ var d = P().decisions["ev-"+ev.id]; return d === "drop"; }
function dayModel(date){
  var p = P(), wake = m(p.sleep.wake), bed = m(p.sleep.bed); if(bed < wake) bed += 1440;
  if(p.decisions.sleep === "late" && date !== p.exam.date && date !== addDays(p.exam.date,-1)) bed = Math.max(bed, 1470);
  var evs = p.events.filter(function(e){ return e.date===date && !removed(e); }).map(function(e){ return {id:e.id, title:e.title, kind:e.kind, place:e.place, s:m(e.start), e:m(e.end), flex:e.flex}; });
  if(date === p.exam.date) evs.push({id:"exam", title:"IFRS exam", kind:"exam", place:p.exam.place, s:m(p.exam.time), e:m(p.exam.time)+120, flex:"fixed"});
  evs.sort(function(a,b){ return a.s-b.s; });
  var items = [], legs = [], at = "home", free = wake, issues = [];
  evs.forEach(function(ev){
    if(ev.place && ev.place !== at){
      var t = travel(at, ev.place), B = place(ev.place), park = B ? (+B.park||0) : 0;
      var buffer = 0, drive = t.min, inside = ev.s - (ev.kind==="exam" ? 15 : 0), leave = inside - drive - park;
      if(p.mode==="car" && rush(leave)) { buffer = Math.round(drive*0.25); leave -= buffer; }
      if(!items.length && leave - 30 < wake){ issues.push({type:"early", date:date, text:"To be at "+ev.title+" on time you leave at "+hm(leave)+". Set your alarm for about "+hm(leave-45)+" that day (normally "+hm(wake)+")."}); free = leave - 45; }
      else if(leave < free) issues.push({type:"tight", date:date, text:"Tight: from "+(place(at)||{}).name+" to "+ev.title+" you would need to leave at "+hm(leave)+", but you are only free at "+hm(free)+". Check this drive below."});
      legs.push({from:at, to:ev.place, leave:leave, park:inside-park, inside:inside, drive:drive, buffer:buffer, src:t.src, line:t.line, date:date, key:tkey(at, ev.place, p.mode), forEvent:ev.title});
      items.push({type:"travel", s:leave, e:inside, leg:legs[legs.length-1]});
      at = ev.place;
    }
    items.push({type:"event", s:ev.s, e:ev.e, ev:ev});
    free = ev.e;
  });
  if(at !== "home"){
    var back = travel(at, "home"), lv = free + 10;
    legs.push({from:at, to:"home", leave:lv, park:lv+back.min, inside:lv+back.min+5, drive:back.min, buffer:0, src:back.src, line:back.line, date:date, key:tkey(at,"home",p.mode), forEvent:"home"});
    items.push({type:"travel", s:lv, e:lv+back.min+5, leg:legs[legs.length-1]});
  }
  items.sort(function(a,b){ return a.s-b.s; });
  /* free gaps between wake and bed, minus everything above; 15 min to settle in after arriving; no deep work after a late shift */
  var busy = items.map(function(x){ return [x.s, x.e, x]; }), slots = [], cur = wake + 30, where = "home";
  busy.forEach(function(b){
    var gapEnd = b[0] - (b[2].type==="travel" ? 15 : 0);
    if(gapEnd - cur >= 20) slots.push({s:cur, e:gapEnd, place:where});
    if(b[2].type==="event"){ where = b[2].ev.place; }
    if(b[2].type==="travel"){ where = b[2].leg.to; }
    var after = b[1] + (b[2].type==="travel" ? 15 : 0);
    if(b[2].type==="event" && (b[2].ev.kind==="work" || b[2].ev.kind==="training") && b[1] >= 1260) after = bed;
    cur = Math.max(cur, after);
  });
  var stopStudy = Math.min(bed - 60, date === addDays(p.exam.date,-1) ? Math.min(bed-60, 1290) : bed - 60);
  if(stopStudy - cur >= 20) slots.push({s:cur, e:stopStudy, place:where});
  [[750,795],[1140,1185]].forEach(function(meal){
    var out = []; slots.forEach(function(sl){
      if(sl.e <= meal[0] || sl.s >= meal[1]) out.push(sl);
      else { if(meal[0]-sl.s >= 20) out.push({s:sl.s, e:meal[0], place:sl.place}); if(sl.e-meal[1] >= 20) out.push({s:meal[1], e:sl.e, place:sl.place}); }
    }); slots = out;
  });
  slots = slots.filter(function(sl){ return sl.e - sl.s >= 20; }).map(function(sl, i){ sl.id = date+"-"+i; sl.date = date; sl.len = sl.e - sl.s; return sl; });
  var restDay = evs.some(function(ev){ return ev.e - ev.s >= 480; });
  if(restDay) slots = [];
  if(date === p.exam.date) slots = slots.filter(function(sl){ return sl.e <= m(p.exam.time) - 30; }).map(function(sl){ sl.cardsOnly = true; return sl; });
  return {date:date, items:items, legs:legs, slots:slots, issues:issues, wake:wake, bed:bed, rest:restDay};
}

/* ---------- topics into slots: highest exam points first, reviews in short slots ---------- */
function stepQueue(){
  var p = P(), order = [2,3,1,4,5], q = [], dec = p.decisions.coverage;
  order.forEach(function(n){
    var t = FL.TOPICS[n-1];
    t.steps.forEach(function(st){
      var mins = +p.stepMin || 50;
      if(dec === "focus" && (n===1 || n===4 || n===5)) mins = Math.round(mins*0.45);
      if(dec === "once") mins = Math.round(mins*0.7);
      if(dec === "dropT4" && n===4) return;
      q.push({topic:n, id:st[0], name:st[1], slides:st[3] ? "slides "+st[3]+"–"+st[4] : "cases", mins:mins});
    });
  });
  return q;
}
function plan(){
  var p = P(), ds = days(), models = ds.map(dayModel), q = stepQueue(), qi = 0, left = q.length ? q[0].mins : 0, learned = [], allSlots = [];
  var lastDay = addDays(p.exam.date, -1);
  models.forEach(function(md){
    md.slots.forEach(function(sl){
      var eff = Math.round(sl.len * 50/60), parts = [];
      if(sl.cardsOnly){ sl.kind = "cards"; sl.what = "Question cards only: calm review, nothing new"; }
      else if(md.date === lastDay){ sl.kind = "review"; sl.what = "Mixed review of everything learned, timed like the exam"; }
      else if(sl.len < 45 || sl.s >= 1230 || (!QUIET[(place(sl.place)||{}).kind] && p.decisions.noise !== "noisy")){
        sl.kind = "cards"; sl.what = learned.length ? "Question cards: "+learned.slice(-3).map(function(x){ return "T"+x.topic+" "+x.name; }).join(", ") : "Question cards: Topic 2 basics";
      } else {
        sl.kind = "learn";
        while(eff > 10 && qi < q.length){
          var use = Math.min(eff, left); parts.push({step:q[qi], mins:use, cont:left < q[qi].mins}); eff -= use; left -= use;
          if(left <= 0){ learned.push(q[qi]); qi++; left = qi < q.length ? q[qi].mins : 0; }
        }
        if(!parts.length){ sl.kind = "review"; sl.what = "Everything is scheduled: spaced review"; }
        sl.parts = parts;
      }
      allSlots.push(sl);
    });
  });
  var minsLeft = (qi < q.length ? left : 0) + q.slice(qi+1).reduce(function(a,b){ return a+b.mins; }, 0);
  return {models:models, slots:allSlots, total:q.length, covered:qi, minsLeft:minsLeft, queue:q};
}

/* ---------- shared rendering pieces ---------- */
var STEPS = [["1","Exam & travel"],["2","Places"],["3","Fixed week"],["4","Study slots"]];
function stepper(cur){
  return '<ol class="pl-steps">'+STEPS.map(function(s){ return '<li'+(s[0]===cur?' aria-current="step"':'')+'><a href="#plan/setup/'+s[0]+'">'+s[0]+'. '+s[1]+'</a></li>'; }).join("")+'<li'+(cur==="check"?' aria-current="step"':'')+'><a href="#plan/check">5. Check</a></li></ol>';
}
function countdown(){
  var p = P(), d = Math.round((new Date(p.exam.date+"T"+p.exam.time) - new Date())/86400000);
  return '<div class="pl-count"><span class="big">'+Math.max(0,d)+'</span><span>day'+(d===1?"":"s")+' until the IFRS exam<br><b>'+dayName(p.exam.date,true)+' · '+esc(p.exam.time)+'</b> · '+esc((place(p.exam.place)||{}).name||"")+'</span></div>';
}
function legText(l){
  var A = place(l.from)||{}, B = place(l.to)||{};
  return '<b>Leave '+hm(l.leave)+'</b> → park '+hm(l.park)+' → inside '+hm(l.inside)+'<br><span class="note">'+esc(A.name||"")+' → '+esc(B.name||"")+' · '+l.drive+' min '+(l.src==="estimate"?"(estimate)":l.src==="checked"?"(checked by you)":"")+(l.buffer?' + '+l.buffer+' min rush hour':'')+'</span>';
}
function slotText(sl){
  var pl = place(sl.place)||{}, qt = QUIET[pl.kind] ? "quiet" : "noisy";
  var body = sl.kind==="learn" && sl.parts && sl.parts.length ? 'Topic '+sl.parts[0].step.topic+': '+esc(sl.parts[0].step.name)+(sl.parts.length>1?' <span class="note">· then '+(sl.parts.length-1)+' more</span>':'') : esc(sl.what||"");
  return '<b>'+hm(sl.s)+'–'+hm(sl.e)+'</b> · '+esc(pl.name||"")+' <span class="pill '+(qt==="quiet"?"solid":"todo")+'">'+qt+'</span><br>'+body;
}
function timeline(md){
  var rows = [];
  md.items.forEach(function(x){
    if(x.type==="travel") rows.push([x.s, '<div class="pl-row tr">'+legText(x.leg)+'</div>']);
    else rows.push([x.s, '<div class="pl-row ev"><b>'+hm(x.s)+'–'+hm(x.e)+'</b> · '+esc(x.ev.title)+' <span class="note">· '+esc((place(x.ev.place)||{}).name||"")+'</span></div>']);
  });
  md.slots.forEach(function(sl){ rows.push([sl.s, '<div class="pl-row st'+(P().done[sl.id]?" done":"")+'">'+slotText(sl)+'</div>']); });
  rows.sort(function(a,b){ return a[0]-b[0]; });
  return '<div class="pl-tl"><div class="pl-row wake">'+hm(md.wake)+' · wake up · lunch 12:30 and dinner 19:00 are kept free · 15 min to get ready before each departure</div>'+rows.map(function(r){ return r[1]; }).join("")+'<div class="pl-row wake">'+hm(md.bed)+' · sleep</div></div>';
}
var selDay = null, moreOpen = false;

/* ---------- views ---------- */
function nextThing(pl){
  var p = P(), now = new Date(), t = now.getHours()*60+now.getMinutes(), ds = days();
  for(var i=0;i<pl.models.length;i++){
    var md = pl.models[i], list = [];
    md.items.forEach(function(x){ if(x.type==="travel" && x.leg.to!=="home") list.push({s:x.leg.leave, kind:"leave", x:x}); });
    md.slots.forEach(function(sl){ if(!p.done[sl.id]) list.push({s:sl.s, kind:"slot", x:sl}); });
    list.sort(function(a,b){ return a.s-b.s; });
    var up = list.filter(function(n){ return i>0 || n.s >= t - 5; })[0];
    if(up) return {day:md.date, n:up, rest:md.rest && i===0};
    if(i===0 && md.rest) return {day:md.date, rest:true};
  }
  return null;
}
function vHome(){
  var p = P(), ds = days(), pl = plan(); if(!selDay || ds.indexOf(selDay)<0) selDay = ds[0];
  var nx = nextThing(pl), today = ds[0];
  var h = '<p class="note">'+countdownLine()+'</p>';
  var line = "", sub = "";
  if(nx && nx.rest && nx.day===today && (!nx.n || nx.day!==today)){ line = "Today: no studying. Rest after the hackathon."; sub = "Long day. The plan starts tomorrow."; }
  else if(nx && nx.n && nx.n.kind==="leave"){ var l = nx.n.x.leg; line = (nx.day===today?"":dayName(nx.day)+": ")+"Leave at "+hm(l.leave)+" for "+((place(l.to)||{}).name||""); sub = "Park "+hm(l.park)+" · inside "+hm(l.inside); }
  else if(nx && nx.n){ var sl = nx.n.x; line = (nx.day===today?"Next":dayName(nx.day))+": "+hm(sl.s)+" · "+(sl.kind==="learn" && sl.parts && sl.parts[0] ? "Topic "+sl.parts[0].step.topic+", "+sl.parts[0].step.name : sl.kind==="cards" ? "question cards" : "review"); sub = ((place(sl.place)||{}).name||"")+" · "+Math.round(sl.len)+" min"; }
  else { line = "Nothing planned right now."; }
  h += '<section class="card pl-next"><div class="eyebrow">Only this</div><p class="pl-one">'+esc(line)+'</p>'+(sub?'<p class="note">'+esc(sub)+'</p>':'')+'</section>';
  h += '<details class="pl-more"><summary>Show my whole day</summary>';
  h += '<div class="pl-days" role="tablist">'+ds.map(function(d){ return '<button role="tab" class="pl-day'+(d===selDay?" on":"")+(d===p.exam.date?" exam":"")+'" data-pday="'+d+'"><span>'+dayName(d)+'</span></button>'; }).join("")+'</div>';
  var md = pl.models[ds.indexOf(selDay)];
  h += '<section class="card"><h2>'+dayName(selDay,true)+'</h2>'+(md.rest?'<p class="note">Rest day: no study slots.</p>':'')+'<div id="pl-map" class="pl-map" aria-label="Map of this day"></div>'+timeline(md)+'</section></details>';
  h += p.confirmed ? '<a class="btn ghost" href="#plan/line">My line to the exam</a>' : '<a class="btn ghost" href="#plan/setup/1">Set up or change the plan</a>';
  return h;
}
function countdownLine(){ var p = P(), d = Math.round((new Date(p.exam.date+"T"+p.exam.time) - new Date())/86400000); return Math.max(0,d)+" days to the IFRS exam · "+dayName(p.exam.date)+" "+p.exam.time; }
function vStep1(){
  var p = P();
  var h = stepper("1")+'<div class="stack"><h1>Exam and travel</h1><p class="lead">Set this once. Everything else is calculated from it.</p></div>';
  h += '<section class="card"><h2>The exam</h2><div class="two"><label class="f">Date<input type="date" data-pf="exam.date" value="'+esc(p.exam.date)+'"></label><label class="f">Time<input type="text" inputmode="numeric" data-pf="exam.time" value="'+esc(p.exam.time)+'"></label></div>'+
    '<label class="f">Where<select data-pf="exam.place">'+p.places.map(function(x){ return '<option value="'+x.id+'"'+(x.id===p.exam.place?" selected":"")+'>'+esc(x.name)+'</option>'; }).join("")+'</select></label><p class="note">On exam day the plan aims for you to be inside 15 minutes early.</p></section>';
  h += '<section class="card"><h2>How do you usually get around?</h2><div class="opts">'+Object.keys(MODE).map(function(k){ return '<button type="button" class="opt" data-pmode="'+k+'" aria-pressed="'+(p.mode===k)+'">'+MODE[k]+'</button>'; }).join("")+'</div>'+
    '<p class="note">Car, bike and walking times come from OpenStreetMap routing. Public transport times come from the BVG timetable. In rush hour (7:00–9:30, 16:00–19:00) driving gets 25% extra.</p></section>';
  h += '<section class="card"><h2>Your usual sleep</h2><p class="note">Every night from now until the exam. The plan keeps these hours free on all days and never puts studying in them.</p><div class="two"><label class="f">Usually in bed by<input type="text" inputmode="numeric" data-pf="sleep.bed" value="'+esc(p.sleep.bed)+'"></label><label class="f">Usually up at<input type="text" inputmode="numeric" data-pf="sleep.wake" value="'+esc(p.sleep.wake)+'"></label></div>'+
    '<label class="f">Minutes per ladder step, first pass<input type="number" min="15" max="120" data-pf="stepMin" value="'+esc(p.stepMin)+'"></label><p class="note">Your measured pace from practice will replace this later.</p></section>';
  return h+'<a class="btn" href="#plan/setup/2">Next: your places</a>';
}
var searchRes = [], searchMsg = "";
function vStep2(){
  var p = P();
  var h = stepper("2")+'<div class="stack"><h1>Your places</h1><p class="lead">Pins on the map. For each place, how long it really takes from the car to inside the building.</p></div>';
  h += '<div id="pl-map" class="pl-map tall" aria-label="Map of your places"></div>';
  h += '<section class="card"><h2>Add a place</h2><form id="pl-search" class="two"><input type="text" id="pl-q" placeholder="Address or name, e.g. a café"><button class="btn small" type="submit">Search</button></form>'+
    (searchMsg?'<p class="note">'+esc(searchMsg)+'</p>':'')+searchRes.map(function(r,i){ return '<button type="button" class="opt" data-padd="'+i+'">'+esc(r.label)+'</button>'; }).join("")+'</section>';
  h += p.places.map(function(x){
    return '<section class="card pl-place"><div class="row"><input type="text" data-pp="'+x.id+'.name" value="'+esc(x.name)+'" aria-label="Name"><select data-pp="'+x.id+'.kind" aria-label="Kind">'+Object.keys(KIND).map(function(k){ return '<option value="'+k+'"'+(x.kind===k?" selected":"")+'>'+KIND[k]+'</option>'; }).join("")+'</select></div>'+
      '<span class="note">'+esc(x.addr||"")+'</span><label class="f">Car (or stop) to inside, minutes<input type="number" min="0" max="60" data-pp="'+x.id+'.park" value="'+esc(x.park)+'"></label>'+
      (x.id!=="home"?'<button type="button" class="btn small ghost" data-pdel="'+x.id+'">Remove place</button>':'')+'</section>';
  }).join("");
  return h+'<a class="btn" href="#plan/setup/3">Next: your fixed week</a>';
}
var FLEX = {fixed:"Must happen", skip:"Could skip", swap:"Could swap or cancel"};
function vStep3(){
  var p = P(), ds = days();
  var h = stepper("3")+'<div class="stack"><h1>Your fixed week</h1><p class="lead">Work, training, classes and anything else. Mark what could move: the check page uses it for the trade-offs.</p></div>';
  ds.forEach(function(d){
    var evs = p.events.filter(function(e){ return e.date===d; }).sort(function(a,b){ return m(a.start)-m(b.start); });
    h += '<section class="card"><h2>'+dayName(d,true)+'</h2>'+(evs.length?evs.map(function(e){
      return '<div class="pl-ev"><div class="row"><input type="text" data-pe="'+e.id+'.title" value="'+esc(e.title)+'" aria-label="What"><button type="button" class="btn small ghost" data-pedel="'+e.id+'" aria-label="Delete">✕</button></div>'+
        '<div class="three"><input type="text" inputmode="numeric" data-pe="'+e.id+'.start" value="'+esc(e.start)+'" aria-label="Start"><input type="text" inputmode="numeric" data-pe="'+e.id+'.end" value="'+esc(e.end)+'" aria-label="End">'+
        '<select data-pe="'+e.id+'.place" aria-label="Where">'+p.places.map(function(x){ return '<option value="'+x.id+'"'+(x.id===e.place?" selected":"")+'>'+esc(x.name)+'</option>'; }).join("")+'</select></div>'+
        '<div class="two"><select data-pe="'+e.id+'.kind" aria-label="Type">'+["work","training","class","other"].map(function(k){ return '<option value="'+k+'"'+(e.kind===k?" selected":"")+'>'+k[0].toUpperCase()+k.slice(1)+'</option>'; }).join("")+'</select>'+
        '<select data-pe="'+e.id+'.flex" aria-label="Can it move?">'+Object.keys(FLEX).map(function(k){ return '<option value="'+k+'"'+(e.flex===k?" selected":"")+'>'+FLEX[k]+'</option>'; }).join("")+'</select></div></div>';
    }).join(""):'<p class="note">Nothing fixed.</p>')+'<button type="button" class="btn small ghost" data-peadd="'+d+'">Add something on this day</button></section>';
  });
  return h+'<a class="btn" href="#plan/setup/4">Next: see your study slots</a>';
}
function vStep4(){
  var pl = plan(), tot = pl.slots.reduce(function(a,b){ return a+b.len; },0);
  var h = stepper("4")+'<div class="stack"><h1>Potential study slots</h1><p class="lead">'+(Math.round(tot/6)/10)+' hours of free time across '+pl.models.length+' days. Long quiet slots get new ladder steps, highest exam points first. Short or noisy slots get question cards.</p></div>';
  pl.models.forEach(function(md){
    h += '<section class="card"><div class="row"><h2>'+dayName(md.date,true)+'</h2><span class="note">'+md.slots.length+' slot'+(md.slots.length===1?"":"s")+'</span></div>'+(md.slots.length?md.slots.map(function(sl){ return '<div class="pl-row st">'+slotText(sl)+'</div>'; }).join(""):'<p class="note">No study slot on this day.</p>')+'</section>';
  });
  h += '<section class="card"><h2>Coverage</h2><p>'+pl.covered+' of '+pl.total+' ladder steps fit'+(pl.minsLeft>0?', about '+Math.round(pl.minsLeft/6)/10+' hours are missing.':'.')+'</p></section>';
  return h+'<a class="btn" href="#plan/check">Next: check the plan</a>';
}

/* ---------- check: flagged trips and trade-off cards ---------- */
function gmaps(l){ var A = place(l.from), B = place(l.to); return "https://www.google.com/maps/dir/?api=1&origin="+A.lat+","+A.lon+"&destination="+B.lat+","+B.lon+"&travelmode="+({car:"driving",transit:"transit",bike:"bicycling",walk:"walking"}[P().mode]); }
function cards(pl){
  var p = P(), out = [], lastDay = addDays(p.exam.date,-1), short = pl.minsLeft > 0;
  p.events.forEach(function(e){
    if(e.flex==="fixed") return;
    var dur = m(e.end)-m(e.start), gain = Math.round((dur + 2*travel("home", e.place).min)/6)/10, before = e.date === lastDay;
    var rec = before || (e.kind==="class" && short) ? "drop" : "keep";
    var why = before
      ? "It is the day before the exam. Removing it frees about "+gain+" h for the final review and an evening to calm down and sleep early. Asking now is easier on your colleagues than a sick call on the day."
      : rec==="drop" ? "The plan is about "+Math.round(pl.minsLeft/6)/10+" h short and this frees about "+gain+" h. If the class covers IFRS exam material, keep it instead."
      : "The plan fits without it, so keeping it costs you nothing important.";
    out.push({id:"ev-"+e.id, title:e.title+", "+dayName(e.date)+" "+e.start+"–"+e.end, rec:rec, why:why,
      opts:[["keep", e.kind==="work"?"Keep the shift":"Go"],["drop", e.flex==="swap" ? (e.kind==="work"?"Swap or cancel the shift":"Move it") : "Skip it and study"]],
      cost:{keep:"No change.", drop:"Frees about "+gain+" h including travel."}});
  });
  out.push({id:"sleep", title:"Sleep this week", rec:"protect",
    why:"Losing a night of sleep before learning cuts how much you remember by a medium amount (Newbury et al. 2021). Steady sleep in the days before matters more than one good last night.",
    opts:[["protect","Protect sleep: last slot ends an hour before bed"],["late","Allow late study until about 00:30 on days without an early start"]],
    cost:{protect:"Fewer hours, sharper hours.", late:"More hours now, slower learning the next day. The night before the exam stays protected."}});
  out.push({id:"noise", title:"Where you study", rec:"split",
    why:"For people with ADHD, steady background noise such as pink noise helped a little in lab tasks, while it hurt people without ADHD (Nigg et al. 2024). So new steps go to quiet places and reviews can go anywhere.",
    opts:[["split","Quiet for new steps, noise is fine for reviews"],["quiet","Always somewhere quiet"],["noisy","I focus better with background noise"]],
    cost:{split:"Recommended balance.", quiet:"Short slots at the café become cards only.", noisy:"New steps can also go to noisy places."}});
  var tr = p.events.filter(function(e){ return e.kind==="training"; });
  if(tr.length) out.push({id:"training", title:"Training this week ("+tr.length+" sessions)", rec:"keep",
    why:"Pole vault is a goal of yours as well, and each session is a fixed break you already know how to keep. Dropping one only frees time if you would really study in it.",
    opts:[["keep","Keep all sessions"],["drop1","Drop one session (I'll mark it in the fixed week)"]],
    cost:{keep:"Same week.", drop1:"Set that session to 'Could skip' in step 3 and decide it there."}});
  if(short || p.decisions.coverage) out.push({id:"coverage", title:"Not everything fits", rec:"focus",
    why:"Topics 2 and 3 were 44 of 75 points in the 2023 exam. Learning them properly and keeping the rest as question cards gives the most points per hour. This year's exam can be weighted differently.",
    opts:[["focus","Deep on Topics 2 and 3, question cards for 1, 4 and 5"],["once","Everything once, nothing twice"],["dropT4","Leave out Topic 4 practice (9 points in 2023)"]],
    cost:{focus:"Best points per hour.", once:"Wider but shallower.", dropT4:"Most time for the rest, a known gap."}});
  return out;
}
function vCheck(){
  var p = P(), pl = plan(), risky = [], issues = [];
  pl.models.forEach(function(md){ issues = issues.concat(md.issues); md.legs.forEach(function(l){ if((l.drive >= 30 || (p.mode==="car" && rush(l.leave) && l.drive >= 15)) && l.to!=="home" && (l.date > todayIso() || l.leave > new Date().getHours()*60+new Date().getMinutes())) risky.push(l); }); });
  var h = stepper("check")+'<div class="stack"><h1>Check and decide</h1><p class="lead">First the trips worth a second look, then the trade-offs. Each card has a recommendation and why. You decide.</p></div>';
  if(issues.length) h += '<section class="card"><h2>Problems</h2>'+issues.map(function(x){ return '<p class="exam">'+dayName(x.date)+': '+esc(x.text)+'</p>'; }).join("")+'</section>';
  if(risky.length){
    h += '<section class="card"><h2>Long or rush-hour drives</h2><p class="note">Want to double-check these in Google Maps? It opens with the route filled in. Set "Leave at" to the day and time shown, then type the minutes here.</p>'+risky.map(function(l){
      var t = p.travel[l.key] || {}, state = t.checkedState;
      return '<div class="pl-row tr">'+dayName(l.date)+' · '+legText(l)+'<div class="row" style="justify-content:flex-start;flex-wrap:wrap">'+
        (state==="no" ? '<span class="note">Kept the estimate.</span>' : state==="yes" || t.manual ? '<a class="btn small ghost" href="'+gmaps(l)+'" target="_blank" rel="noopener">Open in Google Maps</a><label class="f" style="max-width:150px">Minutes<input type="number" min="1" data-pman="'+l.key+'" value="'+esc(t.manual||"")+'"></label>'
          : '<button class="btn small ghost" data-pchk="'+l.key+'|yes">Yes, double-check</button><button class="btn small ghost" data-pchk="'+l.key+'|no">No, keep it</button>')+'</div></div>';
    }).join("")+'</section>';
  }
  var cs = cards(pl), open = cs.filter(function(c){ return !p.decisions[c.id]; }).length;
  h += cs.map(function(c){
    var cur = p.decisions[c.id];
    return '<section class="card pl-card"><h2>'+esc(c.title)+'</h2><p class="pl-rec"><b>Recommended:</b> '+esc(c.opts.filter(function(o){ return o[0]===c.rec; })[0][1])+'.<br><span>'+esc(c.why)+'</span></p><div class="opts">'+
      c.opts.map(function(o){ return '<button type="button" class="opt" data-pdec="'+c.id+'|'+o[0]+'" aria-pressed="'+(cur===o[0])+'">'+esc(o[1])+(o[0]===c.rec?' · recommended':'')+'</button>'; }).join("")+'</div>'+
      (cur?'<p class="note">Your choice: '+esc(c.cost[cur]||"")+'</p>':'<p class="note">Your call. The recommendation is a default, not a rule.</p>')+'</section>';
  }).join("");
  h += '<section class="card"><h2>Result</h2><p>'+pl.covered+' of '+pl.total+' ladder steps fit'+(pl.minsLeft>0?'; about '+Math.round(pl.minsLeft/6)/10+' h still missing.':'.')+'</p></section>';
  h += open ? '<button class="btn" disabled>Decide the '+open+' open card'+(open===1?"":"s")+' to confirm</button><button class="btn ghost" id="pl-acceptrec">Take all recommendations</button>' : '<button class="btn" id="pl-confirm">Confirm my plan</button>';
  h += '<p class="note">Sources: Newbury CR et al. Psychol Bull. 2021;147(11):1215–40. Nigg JT et al. J Am Acad Child Adolesc Psychiatry. 2024;63(8):778–88.</p>';
  return h;
}

/* ---------- the line to the exam: day map + stations ---------- */
var lineView = "day";
function vLine(){
  var p = P(), pl = plan(), ds = days(); if(!selDay || ds.indexOf(selDay)<0) selDay = ds[0];
  var all = pl.slots, lit = all.filter(function(s){ return p.done[s.id]; }).length;
  var h = countdown()+'<div class="stack"><h1>Your line to the exam</h1><p class="lead">Every study slot is a station. Finish one and it lights up. Missing one is fine: the line re-routes when you change the plan.</p></div>';
  h += '<div class="pl-progress" aria-label="'+lit+' of '+all.length+' stations lit"><i style="width:'+(all.length?Math.round(lit/all.length*100):0)+'%"></i></div><p class="note">'+lit+' of '+all.length+' stations lit.</p>';
  h += '<div class="two"><button class="opt" data-pview="day" aria-pressed="'+(lineView==="day")+'">Day</button><button class="opt" data-pview="week" aria-pressed="'+(lineView==="week")+'">Week</button></div>';
  if(lineView==="week"){
    h += '<section class="card"><div class="pl-metro">'+pl.models.map(function(md){
      return '<div class="pl-mrow"><span class="d">'+dayName(md.date)+'</span><span class="ln">'+md.slots.map(function(s){ return '<i class="st '+(p.done[s.id]?"on":"")+' '+s.kind+'" title="'+hm(s.s)+'"></i>'; }).join("")+(md.date===p.exam.date?'<i class="st exam" title="Exam"></i>':'')+'</span></div>'; }).join("")+'</div>'+
      '<p class="note">Big dots: new ladder steps. Small dots: question cards and review. The last stop is the exam.</p></section>';
  } else {
    h += '<div class="pl-days">'+ds.map(function(d){ return '<button class="pl-day'+(d===selDay?" on":"")+(d===p.exam.date?" exam":"")+'" data-pday="'+d+'"><span>'+dayName(d)+'</span></button>'; }).join("")+'</div>';
    var md = pl.models[ds.indexOf(selDay)];
    h += '<div id="pl-map" class="pl-map tall" aria-label="Route of this day"></div>';
    var stops = [];
    md.items.forEach(function(x){ if(x.type==="travel") stops.push([x.s, '<li class="go"><span class="dot"></span><div>'+legText(x.leg)+'</div></li>']); else stops.push([x.s, '<li class="fx"><span class="dot"></span><div><b>'+hm(x.s)+'</b> '+esc(x.ev.title)+'</div></li>']); });
    md.slots.forEach(function(s){ stops.push([s.s, '<li class="sl'+(p.done[s.id]?" on":"")+'"><span class="dot"></span><div>'+slotText(s)+'<br>'+(p.done[s.id]?'<span class="pill solid">Lit</span>':'<button class="btn small" data-pdone="'+s.id+'">Done: light this station</button>')+'</div></li>']); });
    stops.sort(function(a,b){ return a[0]-b[0]; });
    h += '<ol class="pl-line">'+stops.map(function(x){ return x[1]; }).join("")+(selDay===p.exam.date?'<li class="ex"><span class="dot"></span><div><b>'+esc(p.exam.time)+'</b> IFRS exam. You made it here.</div></li>':'')+'</ol>';
  }
  return h+'<a class="btn ghost" href="#plan">Back to the calendar</a>';
}

/* ---------- maps ---------- */
var map = null;
function drawMap(r){
  var el = document.getElementById("pl-map"); if(map){ try{ map.remove(); }catch(e){} map = null; }
  if(!el || !window.L) return;
  var p = P(), L = window.L;
  map = L.map(el, {zoomControl:false, attributionControl:true}).setView([52.49, 13.33], 10);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom:18, attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
  var pts = [], icon = function(txt, cls){ return L.divIcon({className:"pl-pin "+(cls||""), html:'<span>'+txt+'</span>', iconSize:null}); };
  if(/^plan\/setup\/2/.test(r)){
    p.places.forEach(function(x){ L.marker([x.lat,x.lon], {icon:icon(esc(x.name), x.kind)}).addTo(map); pts.push([x.lat,x.lon]); });
  } else {
    var md = dayModel(selDay), used = {};
    md.legs.forEach(function(l){ var ln = l.line || [[place(l.from).lat,place(l.from).lon],[place(l.to).lat,place(l.to).lon]]; L.polyline(ln, {color:"#D9482B", weight:4, opacity:.85, dashArray:l.src==="estimate"?"6 6":null}).addTo(map); pts = pts.concat(ln);
      if(!used[l.to]){ used[l.to] = 1; var B = place(l.to); L.marker([B.lat,B.lon], {icon:icon((l.to==="home"?"":"Leave "+hm(l.leave)+" → ")+esc(B.name), B.kind)}).addTo(map); } });
    var H = place("home"); L.marker([H.lat,H.lon], {icon:icon("Home","home")}).addTo(map); pts.push([H.lat,H.lon]);
  }
  if(pts.length > 1) map.fitBounds(pts, {padding:[24,24]}); else if(pts.length) map.setView(pts[0], 13);
}

/* ---------- routing hooks used by the main app ---------- */
window.FLPlan = {
  match: function(r){ return r==="plan" || /^plan\//.test(r); },
  view: function(r){
    P(); geocodeSeeds();
    if(r==="plan") return vHome();
    if(r==="plan/check") return vCheck();
    if(r==="plan/line") return vLine();
    var s = (r.match(/^plan\/setup\/(\d)/)||[])[1];
    return ({"1":vStep1,"2":vStep2,"3":vStep3,"4":vStep4}[s] || vStep1)();
  },
  after: function(r){
    var det = document.querySelector(".pl-more");
    if(det){ if(moreOpen) det.open = true; det.addEventListener("toggle", function(){ moreOpen = det.open; if(det.open) drawMap(r); }); if(det.open) drawMap(r); }
    else drawMap(r);
    setTimeout(fetchTravel, 50);
  }
};

/* ---------- events ---------- */
function setPath(obj, path, v){ var a = path.split("."), o = obj; for(var i=0;i<a.length-1;i++) o = o[a[i]]; o[a[a.length-1]] = v; }
var app = document.getElementById("app");
app.addEventListener("click", function(e){
  var t = e.target.closest("button"); if(!t) return; var p = P(), d = t.dataset;
  if(d.pday){ selDay = d.pday; FL.render(); return; }
  if(d.pmode){ p.mode = d.pmode; save(); FL.render(); return; }
  if(d.pview){ lineView = d.pview; FL.render(); return; }
  if(d.pdel){ p.places = p.places.filter(function(x){ return x.id!==d.pdel; }); p.events.forEach(function(ev){ if(ev.place===d.pdel) ev.place = "home"; }); save(); FL.render(); return; }
  if(d.padd){ var r0 = searchRes[+d.padd]; if(r0){ var id = "p"+Date.now().toString(36); p.places.push({id:id, name:r0.label.split(",")[0], kind:"cafe", addr:r0.label, lat:r0.lat, lon:r0.lon, park:10}); p.geo[id] = "ok"; searchRes = []; searchMsg = ""; save(); FL.render(); } return; }
  if(d.pedel){ p.events = p.events.filter(function(x){ return x.id!==d.pedel; }); save(); FL.render(); return; }
  if(d.peadd){ p.events.push({id:"e"+Date.now().toString(36), title:"New", kind:"other", place:"home", date:d.peadd, start:"10:00", end:"11:00", flex:"fixed"}); save(); FL.render(); return; }
  if(d.pchk){ var a = d.pchk.split("|"), tt = p.travel[a[0]] = p.travel[a[0]] || {}; tt.checkedState = a[1]; save(); FL.render(); return; }
  if(d.pdec){ var b = d.pdec.split("|"); p.decisions[b[0]] = b[1]; p.confirmed = false; save(); FL.render(); return; }
  if(d.pdone){ p.done[d.pdone] = true; save(); FL.render(); if(window.FL.confetti) window.FL.confetti(); return; }
  if(t.id==="pl-acceptrec"){ cards(plan()).forEach(function(c){ if(!p.decisions[c.id]) p.decisions[c.id] = c.rec; }); save(); FL.render(); return; }
  if(t.id==="pl-confirm"){ p.confirmed = true; save(); FL.go("plan/line"); return; }
});
app.addEventListener("change", function(e){
  var t = e.target, p = P(), d = t.dataset;
  if(d.pf){ setPath(p, d.pf, d.pf==="stepMin" ? +t.value : t.value); save(); FL.render(); }
  if(d.pp){ var a = d.pp.split("."), x = place(a[0]); if(x){ x[a[1]] = a[1]==="park" ? +t.value : t.value; save(); FL.render(); } }
  if(d.pe){ var b = d.pe.split("."), ev = p.events.filter(function(z){ return z.id===b[0]; })[0]; if(ev){ ev[b[1]] = t.value; save(); FL.render(); } }
  if(d.pman){ var tr = p.travel[d.pman] = p.travel[d.pman] || {}; tr.manual = +t.value || null; save(); FL.render(); }
});
app.addEventListener("submit", function(e){
  if(e.target.id !== "pl-search") return; e.preventDefault();
  var q = (document.getElementById("pl-q")||{}).value || ""; if(!q.trim()) return;
  searchMsg = "Searching…"; FL.render();
  fetch("api/geocode?q="+encodeURIComponent(q)).then(function(r){ return r.ok ? r.json() : Promise.reject(); }).then(function(j){
    searchRes = j.results || []; searchMsg = searchRes.length ? "Tap the right one to add it." : "Nothing found. Try the street and number."; FL.render();
  }).catch(function(){ searchRes = []; searchMsg = "Search is not available right now."; FL.render(); });
});
FL.render();
})();
