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
    sleepNow:{bed:"00:30", wake:"08:30"},
    places:[{id:"home", name:"Home", kind:"home", addr:"", lat:52.52, lon:13.405, park:5}],
    events:[], travel:{}, decisions:{}, done:{}, geo:{home:"none"}
  };
}
function P(){ var s = S(); if(!s.plan) s.plan = seed(); if(!s.plan.sleepNow) s.plan.sleepNow = {bed:"00:30", wake:"08:30"}; return s.plan; }
function save(){ FL.save(); }

/* ---------- time helpers ---------- */
function m(t){ var a = String(t||"0:0").split(":"); return (+a[0])*60 + (+a[1]||0); }
function fmtDur(x){ x = Math.round(x); var h = Math.floor(x/60), mm = x%60; return (h?h+" h":"")+(h&&mm?" ":"")+(mm||!h?mm+" min":""); }
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
var pending = {}, fetching = false, travelDirty = false;
function tkey(a, b, mode){ return a+">"+b+">"+mode; }
function km(a, b){ var R = 6371, dLa = (b.lat-a.lat)*Math.PI/180, dLo = (b.lon-a.lon)*Math.PI/180, x = Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLo/2)*Math.sin(dLo/2); return 2*R*Math.asin(Math.sqrt(x)); }
function travel(a, b){
  var p = P(), k = tkey(a, b, p.mode), t = p.travel[k], A = place(a), B = place(b);
  if(t && t.manual && !implausible(t.manual, A, B, t.min)) return {min:t.manual, src:"checked", line:t.line};
  if(t && t.min) return {min:t.min, src:"route", line:t.line};
  if(A && B && !pending[k]) pending[k] = {a:A, b:B, mode:p.mode, key:k};
  var d = A && B ? km(A, B)*1.3 : 10, speed = {car:(d > 12 ? 45 : 26), transit:20, bike:15, walk:4.8}[p.mode] || 25;
  return {min:Math.round(d/speed*60 + (p.mode==="transit" ? 8 : 4)), src:"estimate", line:A && B ? [[A.lat,A.lon],[B.lat,B.lon]] : null};
}
function implausible(min, A, B, routed){ var ref = routed || (A && B ? km(A, B)*1.3/45*60 : 0); return ref > 15 && min < ref*0.5; }
function parseMin(v){ v = String(v||"").toLowerCase().replace(",","."); var h = v.match(/(\d+(?:\.\d+)?)\s*(h|hr|hour|std)/), mm = v.match(/(\d+)\s*(m|min)/), c = v.match(/^\s*(\d+):(\d{1,2})\s*$/);
  if(c) return (+c[1])*60 + (+c[2]); if(h || mm) return Math.round((h ? +h[1]*60 : 0) + (mm ? +mm[1] : 0)); var n = parseFloat(v); return isNaN(n) ? null : Math.round(n); }
function fetchTravel(){
  if(fetching) return; var keys = Object.keys(pending); if(!keys.length) return;
  fetching = true; var job = pending[keys[0]]; delete pending[keys[0]];
  fetch("api/route?from="+job.a.lon+","+job.a.lat+"&to="+job.b.lon+","+job.b.lat+"&mode="+job.mode).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){
    if(j && j.minutes){ var old = P().travel[job.key] || {}; P().travel[job.key] = {min:j.minutes, line:j.line||null, src:j.source, manual:old.manual, checkedState:old.checkedState}; save(); travelDirty = true; }
    else P().travel[job.key] = P().travel[job.key] || {failed:true};
  }).catch(function(){ P().travel[job.key] = {failed:true}; }).then(function(){ fetching = false;
    if(Object.keys(pending).length) setTimeout(fetchTravel, 350);
    else if(travelDirty){ travelDirty = false; var ae = document.activeElement; if(!ae || !/INPUT|TEXTAREA|SELECT/.test(ae.tagName)) FL.render(); }
  });
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

/* ---------- sleep, one night at a time: from when you fall asleep now towards what exam morning needs ---------- */
function leaveFor(date){
  var p = P(), evs = p.events.filter(function(e){ return e.date===date && !removed(e) && e.place && e.place!=="home"; }).map(function(e){ return {place:e.place, s:m(e.start), exam:false}; });
  if(date === p.exam.date) evs.push({place:p.exam.place, s:m(p.exam.time)-15, exam:true});
  evs.sort(function(a,b){ return a.s-b.s; }); var ev = evs[0]; if(!ev) return null;
  var t = travel("home", ev.place), B = place(ev.place), lv = ev.s - t.min - (B ? +B.park||0 : 0);
  if(p.mode==="car" && rush(lv)) lv -= Math.round(t.min*0.25);
  return lv;
}
function bedMin(t){ var x = m(t); return x < 720 ? x + 1440 : x; }
var nightCache = null;
function nights(){
  var p = P(), ds = days(), n = ds.length - 1, start = bedMin(p.sleepNow.bed), out = {bed:{}, wake:{}, natural:{}};
  var exLeave = leaveFor(p.exam.date); var end = (exLeave === null ? 480 : exLeave - 60) + 1440 - 480;
  for(var i=0;i<n;i++){
    var b = n ? start + (end - start) * (i+1) / n : end; b = Math.round(b/15)*15;
    var nl = leaveFor(ds[i+1]); if(nl !== null) b = Math.min(b, nl - 60 + 1440 - 450);
    out.bed[ds[i]] = b;
  }
  out.bed[ds[n]] = start;
  ds.forEach(function(d, i){
    var nat = i === 0 ? m(p.sleepNow.wake) : out.bed[ds[i-1]] - 1440 + 480, lv = leaveFor(d);
    out.natural[d] = nat; out.wake[d] = lv !== null ? Math.min(nat, lv - 60) : nat;
  });
  return out;
}
var KIND_WORDS = ["One night at a time.", "Small steps count.", "You don't have to be perfect, just a little earlier than last night.", "Future you on Tuesday morning says thank you.", "Lights off is the whole task. Sleep follows."];
function tonightLine(date){
  var p = P(), nt = nights(), ds = days(), i = ds.indexOf(date), b = nt.bed[date]; if(b === undefined || date === p.exam.date) return "";
  var prev = i > 0 ? nt.bed[ds[i-1]] : bedMin(p.sleepNow.bed), diff = prev - b;
  var w = KIND_WORDS[i % KIND_WORDS.length];
  return "Tonight: in bed by "+hm(b)+". "+(diff > 0 ? diff+" min earlier than "+(i>0?"last night":"lately")+". " : diff===0 ? "Same as last night. " : "")+w;
}

/* ---------- the day model: fixed events, travel legs with leave / park / inside, free slots ---------- */
function removed(ev){ var d = P().decisions["ev-"+ev.id]; return d === "drop"; }
function dayModel(date){
  var p = P(), nt = nights(), wake = nt.wake[date], bed = nt.bed[date] !== undefined ? nt.bed[date] : 1440 + 0;
  if(date === p.exam.date) bed = 1380;
  var evs = p.events.filter(function(e){ return e.date===date && !removed(e); }).map(function(e){ return {id:e.id, title:e.title, kind:e.kind, place:e.place, s:m(e.start), e:m(e.end), flex:e.flex}; });
  if(date === p.exam.date) evs.push({id:"exam", title:"IFRS exam", kind:"exam", place:p.exam.place, s:m(p.exam.time), e:m(p.exam.time)+120, flex:"fixed"});
  evs.sort(function(a,b){ return a.s-b.s; });
  var items = [], legs = [], at = "home", free = wake, issues = [];
  evs.forEach(function(ev){
    if(ev.place && ev.place !== at){
      var t = travel(at, ev.place), B = place(ev.place), park = B ? (+B.park||0) : 0;
      var buffer = 0, drive = t.min, inside = ev.s - (ev.kind==="exam" ? 15 : 0), leave = inside - drive - park;
      if(p.mode==="car" && rush(leave)) { buffer = Math.round(drive*0.25); leave -= buffer; }
      if(!items.length && nt.natural[date] > wake + 45){ var slept = Math.round((wake + 1440 - (nt.bed[addDays(date,-1)] || bedMin(p.sleepNow.bed)))/30)/2; issues.push({type:"early", date:date, text:"Early start: you leave at "+hm(leave)+", so your alarm is "+hm(wake)+". That is about "+slept+" h of sleep if you're in bed by the target the night before. The plan already moved that bedtime earlier for you.", calm:"Good to know now, not that morning."}); }
      else if(leave < free) issues.push({type:"tight", date:date, text:"From "+(place(at)||{}).name+" to "+ev.title+" you would need to leave at "+hm(leave)+", but you're only free at "+hm(free)+". The double-check on this drive will tell you if it's really that tight.", calm:"Estimates are often too careful. Let's check it."});
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
  var stopStudy = date === addDays(p.exam.date,-1) ? Math.min(bed-60, 1290) : bed - 60;
  if(stopStudy - cur >= 20) slots.push({s:cur, e:stopStudy, place:where});
  [[750,795],[1140,1185]].forEach(function(meal){
    var out = []; slots.forEach(function(sl){
      if(sl.e <= meal[0] || sl.s >= meal[1]) out.push(sl);
      else { if(meal[0]-sl.s >= 20) out.push({s:sl.s, e:meal[0], place:sl.place}); if(sl.e-meal[1] >= 20) out.push({s:meal[1], e:sl.e, place:sl.place}); }
    }); slots = out;
  });
  /* long gaps become 90-minute blocks with a 15-minute break, so no block runs for hours */
  var blocks = []; slots.forEach(function(sl){ var a = sl.s; while(sl.e - a > 105){ blocks.push({s:a, e:a+90, place:sl.place}); a += 105; } blocks.push({s:a, e:sl.e, place:sl.place}); }); slots = blocks;
  slots = slots.filter(function(sl){ return sl.e - sl.s >= 20; }).map(function(sl, i){ sl.id = date+"-"+i; sl.date = date; sl.len = sl.e - sl.s; return sl; });
  var restDay = evs.some(function(ev){ return ev.e - ev.s >= 480; });
  if(restDay) slots = [];
  if(date === p.exam.date) slots = slots.filter(function(sl){ return sl.e <= m(p.exam.time) - 30; }).map(function(sl){ sl.cardsOnly = true; return sl; });
  return {date:date, items:items, legs:legs, slots:slots, issues:issues, wake:wake, bed:bed, rest:restDay};
}

/* ---------- topics into slots: highest exam points first, reviews in short slots ---------- */
function stepQueue(){
  var p = P(), order = [2,3,4,5,1], q = [], dec = p.decisions.coverage;
  order.forEach(function(n){
    var t = FL.TOPICS[n-1];
    t.steps.forEach(function(st){
      var mins = +p.stepMin || 50;
      if(dec === "focus" && (n===1 || n===4 || n===5)) mins = Math.round(mins*0.45);
      if(dec === "once") mins = Math.round(mins*0.7);
      if(dec === "dropT4" && n===4) return;
      q.push({topic:n, id:st[0], name:st[1], slides:st[3] ? "slides "+st[3]+"–"+st[4] : "cases", mins:mins});
    });
    if(p.decisions.books === "read23" && (n===2 || n===3)) bookReads(n).forEach(function(r){ q.push(r); });
  });
  return q;
}
function readRate(){ return Math.max(+FL.S.speed || 0, 1.5); }
function bookReads(n){ return ((FL.BOOKMAP||{})[n]||[]).map(function(r, i){ return [r, i]; }).filter(function(x){ return x[0][0]==="melville"; }).map(function(x){ var pg = x[0][3]-x[0][2]+1;
  return {topic:n, id:"bm-"+n+"-"+x[1], name:"Read Melville "+x[0][1], slides:"pp. "+x[0][2]+"–"+x[0][3], mins:Math.round(pg*readRate()), read:true}; }); }
/* work already done, from the stations you lit: [stepId, minutes, topic] per part */
function doneMins(){ var p = P(), o = {}; Object.keys(p.log||{}).forEach(function(id){ if(!p.done[id]) return; ((p.log[id]||{}).parts||[]).forEach(function(x){ o[x[0]] = (o[x[0]]||0) + x[1]; }); }); return o; }
function nowMin(){ var d = new Date(); return d.getHours()*60 + d.getMinutes(); }
function plan(opts){
  opts = opts || {};
  var p = P(); p.log = p.log || {};
  var ds = days(), models = ds.map(dayModel), full = stepQueue(), dm = doneMins(), learned = [], allSlots = [];
  var lastDay = addDays(p.exam.date, -1), lastN = 0, tot = {}, got = {}, today = todayIso(), tnow = nowMin();
  full.forEach(function(x){ tot[x.topic] = (tot[x.topic]||0) + x.mins; got[x.topic] = (got[x.topic]||0) + Math.min(x.mins, dm[x.id]||0); });
  var q = full.map(function(x){ var y = {}; for(var k in x) y[k] = x[k]; y.full = x.mins; y.mins = x.mins - Math.min(x.mins, dm[x.id]||0); return y; }).filter(function(x){ return x.mins > 0; });
  var qi = 0, left = q.length ? q[0].mins : 0;
  var doneT = {}, quizzed = {}, hasQuiz = FL.TQUIZ || {}, seenT = {};
  full.forEach(function(x){ if(dm[x.id]) seenT[x.topic] = 1; });
  Object.keys(tot).forEach(function(n){ if(got[n] >= tot[n]) doneT[n] = 1; });
  Object.keys(p.log).forEach(function(id){ var lg = p.log[id]; if(p.done[id] && lg && lg.quiz) quizzed[lg.quiz] = 1; });
  function touched(){ var o = Object.keys(seenT).map(Number); learned.forEach(function(x){ if(o.indexOf(x.topic)<0) o.push(x.topic); }); return o.length ? o.sort() : [q.length ? q[0].topic : 2]; }
  models.forEach(function(md){
    md.slots.forEach(function(sl){
      var eff = Math.round(sl.len * 50/60), parts = [];
      if(p.done[sl.id] && sl.id !== opts.avail){ var lg = p.log[sl.id] || {}; sl.lit = true; sl.kind = lg.kind || "done"; sl.what = lg.what || "Done"; sl.prog = lg.prog; sl.parts = []; sl.quiz = lg.quiz; if(md.date===lastDay) lastN++; allSlots.push(sl); return; }
      if(md.date === today && sl.e <= tnow && sl.id !== opts.avail && !opts.nomiss){ sl.kind = "missed"; sl.missed = true; sl.what = "Missed. Its work moved on to your next stations."; allSlots.push(sl); return; }
      var lowDay = p.journal && p.journal[md.date] && p.journal[md.date].low && md.date !== lastDay && !opts.nomiss;
      if(sl.cardsOnly || lowDay){ sl.kind = "cards"; sl.what = lowDay ? "Low-energy day: question cards only, nothing new" : "Question cards only: calm review, nothing new"; }
      else if(md.date === lastDay){ sl.kind = "review"; lastN++;
        sl.what = lastN===1 ? "Write your 2 cheat sheets (4 pages): formulas and the steps of each ladder" : lastN===2 && sl.len >= 75 ? "The Nov 2023 exam, timed: 75 minutes, calculator and cheat sheets only" : "Mixed review: question cards from every topic"; }
      else if(sl.len < 45 || sl.s >= 1230 || (!QUIET[(place(sl.place)||{}).kind] && p.decisions.noise !== "noisy")){
        var qn = Object.keys(doneT).filter(function(n){ return hasQuiz[n] && !quizzed[n]; })[0];
        if(qn && sl.len >= 24){ quizzed[qn] = 1; sl.kind = "quiz"; sl.quiz = +qn; sl.what = "Your Topic "+qn+" quiz, timed: 24 minutes"; }
        else { sl.kind = "cards"; sl.cards = touched(); sl.what = "Question cards: Topic"+(sl.cards.length>1?"s ":" ")+sl.cards.join(", ")+" (8 mixed questions, missed ones first)"; }
      } else {
        sl.kind = "learn";
        while(eff > 10 && qi < q.length){
          var use = Math.min(eff, left); parts.push({step:q[qi], mins:use, cont:left < q[qi].full}); eff -= use; left -= use; got[q[qi].topic] += use;
          if(left <= 0){ learned.push(q[qi]); if((!q[qi+1] || q[qi+1].topic !== q[qi].topic) && got[q[qi].topic] >= tot[q[qi].topic]) doneT[q[qi].topic] = 1; qi++; left = qi < q.length ? q[qi].mins : 0; }
        }
        if(!parts.length){ sl.kind = "review"; sl.what = "Everything is scheduled: spaced review"; }
        sl.parts = parts;
        sl.prog = parts.map(function(pt){ return pt.step.topic; }).filter(function(v,i,a){ return a.indexOf(v)===i; }).map(function(n){ return {topic:n, pct:Math.round(got[n]/tot[n]*100)}; });
      }
      allSlots.push(sl);
    });
  });
  var minsLeft = (qi < q.length ? left : 0) + q.slice(qi+1).reduce(function(a,b){ return a+b.mins; }, 0);
  return {models:models, slots:allSlots, total:q.length, covered:qi, minsLeft:minsLeft, queue:q};
}

/* ---------- shared rendering pieces ---------- */
var STEPS = [["1","Exam & travel"],["2","Places"],["3","Fixed week"],["4","Study days"]];
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
function slotLink(sl){
  if(sl.kind==="learn" && sl.parts && sl.parts[0]) return '<button class="btn small" data-pgo="'+sl.parts[0].step.topic+'|'+sl.parts[0].step.id+'">Start: Topic '+sl.parts[0].step.topic+', '+esc(sl.parts[0].step.name)+'</button>';
  if(sl.kind==="cards") return '<a class="btn small" href="#cards/'+(sl.cards||[2]).join(",")+'">Start the question cards</a>';
  if(sl.kind==="quiz") return '<a class="btn small" href="#cards/quiz-'+sl.quiz+'">Start the timed quiz</a>';
  if(/2023 exam/.test(sl.what||"")) return '<a class="btn small" href="#doc/exam-2023/1">Open the 2023 exam</a>';
  return "";
}
function slotText(sl){
  var pl = place(sl.place)||{}, qt = QUIET[pl.kind] ? "quiet" : "noisy";
  var body = sl.kind==="learn" && sl.prog && sl.prog.length ? sl.prog.map(function(g){ return '<span class="pl-prog"><b>Topic '+g.topic+'</b> → '+g.pct+'% <i><b style="width:'+g.pct+'%"></b></i></span>'; }).join("") : esc(sl.what||"");
  return '<b>'+hm(sl.s)+'–'+hm(sl.e)+'</b> · '+esc(pl.name||"")+' <span class="pill '+(qt==="quiet"?"solid":"todo")+'">'+qt+'</span><br>'+body;
}
function timeline(md){
  var rows = [];
  md.items.forEach(function(x){
    if(x.type==="travel") rows.push([x.s, '<div class="pl-row tr">'+legText(x.leg)+'</div>']);
    else rows.push([x.s, '<div class="pl-row ev"><b>'+hm(x.s)+'–'+hm(x.e)+'</b> · '+esc(x.ev.title)+' <span class="note">· '+esc((place(x.ev.place)||{}).name||"")+'</span></div>']);
  });
  md.slots.forEach(function(sl){ rows.push([sl.s, '<div class="pl-row st'+(P().done[sl.id]||sl.missed?" done":"")+'">'+slotText(sl)+'</div>']); });
  rows.sort(function(a,b){ return a[0]-b[0]; });
  return '<div class="pl-tl"><div class="pl-row wake">'+hm(md.wake)+' · wake up</div>'+rows.map(function(r){ return r[1]; }).join("")+'<div class="pl-row wake">'+hm(md.bed)+' · in bed</div></div>';
}
var selDay = null, moreOpen = false;

/* ---------- before-tomorrow checklist and phone reminders ---------- */
function tomorrowInfo(){
  var ds = days(), nt = nights(), d = new Date().getHours() < 5 ? ds[0] : ds[1]; if(!d) return null;
  var lv = leaveFor(d); return {date:d, wake:nt.wake[d], leave:lv};
}
function jr(date){ var p = P(); p.journal = p.journal || {}; return p.journal[date] = p.journal[date] || {mood:{}, ifthen:{}, food:{}, vent:"", checks:{}}; }
function checklist(){
  var t = tomorrowInfo(); if(!t) return "";
  var j = jr(t.date), items = [["alarm", "Alarm set for "+hm(t.wake)+(t.leave!==null?" (you leave at "+hm(t.leave)+")":"")],["food","I know what I'll eat "+(new Date().getHours()<5?"today":"tomorrow")],["bag","Bag packed: laptop, charger, water, snack"]];
  return '<section class="card"><h2>Before '+(new Date().getHours()<5?"today":"tomorrow")+', '+dayName(t.date)+'</h2>'+items.map(function(it){ return '<label class="check"><input type="checkbox" data-pjc="'+t.date+'|'+it[0]+'"'+(j.checks[it[0]]?" checked":"")+'><span>'+esc(it[1])+'</span></label>'; }).join("")+
    '<button class="btn small ghost" data-pics="'+t.date+'">Put alarm, leave times and meals in my phone calendar</button><p class="note">Downloads a calendar file. On iPhone tap it, then "Add all". Each entry has a reminder.</p></section>';
}
function icsFor(date){
  var md = dayModel(date), j = jr(date), lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Finish Line//Planner//EN"];
  var stamp = new Date().toISOString().replace(/[-:]/g,"").split(".")[0]+"Z", n = 0;
  function dt(min){ var d = new Date(date+"T00:00:00"); d.setMinutes(min); return d.getFullYear()+("0"+(d.getMonth()+1)).slice(-2)+("0"+d.getDate()).slice(-2)+"T"+("0"+d.getHours()).slice(-2)+("0"+d.getMinutes()).slice(-2)+"00"; }
  function ev(s, e, title, alarmMin){ lines.push("BEGIN:VEVENT","UID:fl-"+date+"-"+(n++)+"@finishline","DTSTAMP:"+stamp,"DTSTART:"+dt(s),"DTEND:"+dt(e),"SUMMARY:"+title.replace(/[,;]/g," "),"BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+title.replace(/[,;]/g," "),"TRIGGER:-PT"+alarmMin+"M","END:VALARM","END:VEVENT"); }
  ev(md.wake, md.wake+15, "Wake up: Finish Line", 0);
  md.legs.forEach(function(l){ if(l.to!=="home") ev(l.leave, l.inside, "Leave now for "+((place(l.to)||{}).name||""), 10); });
  ev(750, 795, "Lunch"+(j.food.l?": "+j.food.l:""), 5); ev(1140, 1185, "Dinner"+(j.food.d?": "+j.food.d:""), 5);
  if(md.bed) ev(md.bed - 30, md.bed, "Wind down: in bed by "+hm(md.bed), 0);
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/* ---------- journal: one page per day, if-then plans, food, a place to write ---------- */
var MOODS = [["badsleep","I slept badly"],["anxious","I'm anxious"],["overwhelmed","It's too much"],["cantstart","I can't start"],["missed","I missed a slot"],["ok","I'm okay"]];
var IFTHEN = {
  badsleep:[["nap","If I slept badly, then I take a 10-minute nap before 15:00, and only after that I start.","A 10-minute afternoon nap after a short night improved alertness and performance straight away, for up to about 2.5 hours (Brooks and Lack 2006)."],
            ["swap","If I slept badly, then today's new steps become question cards, and I still eat at 12:30.","Tired days are for review. New material can wait one day."]],
  anxious:[["write","If anxiety spikes, then I write my worries down for 10 minutes before I start.","Students who wrote about their exam worries for 10 minutes right before a test did better than those who didn't (Ramirez and Beilock 2011)."],
           ["reframe","If my heart races, then I tell myself: my body is getting ready to perform.","People told that arousal helps performance scored higher on the GRE maths section (Jamieson et al. 2010)."]],
  overwhelmed:[["only","If it all feels like too much, then I only look at 'Only this' and do that one thing.","Plans of the form 'if X, then I do Y' had a medium-to-large effect on reaching goals across 94 studies (Gollwitzer and Sheeran 2006)."]],
  cantstart:[["ten","If I can't start, then I open one question card and set a 10-minute timer. Stopping after 10 minutes is allowed.","Starting is the hardest part, and a fixed if-then cue helps most exactly there (Gollwitzer and Sheeran 2006)."]],
  missed:[["kind","If I miss a slot, then I say 'this happens to everyone' and do one card set at the next slot.","Students who treated a failure with self-compassion studied longer for the next test than those who didn't (Breines and Chen 2012)."]],
  ok:[["keep","If today goes okay, then I light the station and stop on time.","Stopping on time protects tomorrow's energy and sleep."]]
};
var KIND_REPLIES = ["Thank you for writing it down. That already takes some weight off your working memory.", "That sounds hard. You are still here and still planning, which is what counts.", "Exams make everyone feel this way. You're not behind as a person, only on a to-do list.", "Written down, it's on the page and not only in your head. Next step: just 'Only this'."];
var jDay = null, ventSaved = "";
function jToday(){ var d = new Date(); if(d.getHours() < 5) d.setDate(d.getDate()-1); return iso(d); }
function jDays(){ var p = P(), out = [], d = addDays(p.exam.date, -8), t = jToday(); if(t < d) d = t; while(d <= p.exam.date && out.length < 30){ out.push(d); d = addDays(d,1); } return out; }
function vJournal(){
  var p = P(), ds = jDays(); if(!jDay || ds.indexOf(jDay)<0) jDay = ds.indexOf(jToday())>=0 ? jToday() : ds[0];
  var j = jr(jDay), lit = plan().slots.filter(function(sl){ return p.done[sl.id]; }).length;
  var h = '<div class="stack"><h1>Journal</h1><p class="lead">One page per day until the exam. Private to your account.</p></div>';
  h += '<div class="pl-days">'+ds.map(function(d){ return '<button class="pl-day'+(d===jDay?" on":"")+(d===p.exam.date?" exam":"")+'" data-jday="'+d+'"><span>'+dayName(d)+'</span></button>'; }).join("")+'</div>';
  h += '<p class="note">'+(jDay===jToday()?'Today':dayName(jDay,true))+(new Date().getHours()<5 && jDay===jToday()?' (it\'s after midnight, so this still counts as your '+dayName(jDay).split(" ")[0]+')':'')+'</p>';
  h += '<section class="card"><h2>How is it going?</h2><div class="pl-chips">'+MOODS.map(function(mo){ return '<button type="button" class="opt" data-jmood="'+mo[0]+'" aria-pressed="'+(!!j.mood[mo[0]])+'">'+mo[1]+'</button>'; }).join("")+'</div></section>';
  var picked = Object.keys(j.mood).filter(function(k){ return j.mood[k]; });
  if(picked.length){
    h += '<section class="card"><h2>Your if-then plans</h2><p class="note">Pick the ones you want for today.</p>';
    picked.forEach(function(k){ (IFTHEN[k]||[]).forEach(function(it){ var on = j.ifthen[it[0]];
      h += '<div class="pl-if'+(on?" on":"")+'"><p><b>'+esc(it[1])+'</b></p><p class="note">'+esc(it[2])+'</p><button class="btn small '+(on?"":"ghost")+'" data-jif="'+it[0]+'">'+(on?"My plan today ✓":"Make this my plan")+'</button></div>'; }); });
    h += '</section>';
  }
  h += '<section class="card"><h2>Food</h2><p class="note">Lunch 12:30 and dinner 19:00 are kept free in your plan.</p>'+
    [["b","Breakfast"],["l","Lunch"],["d","Dinner"],["s","Snack to take with me"]].map(function(f){ return '<label class="f">'+f[1]+'<input type="text" data-jfood="'+f[0]+'" value="'+esc(j.food[f[0]]||"")+'" placeholder="e.g. '+({b:"oats and a banana",l:"leftover pasta",d:"something quick",s:"nuts, an apple"})[f[0]]+'"></label>'; }).join("")+
    '<label class="f">To buy or prep<input type="text" data-jfood="buy" value="'+esc(j.food.buy||"")+'" placeholder="e.g. bread, cook rice the night before"></label>'+
    '<label class="check"><input type="checkbox" data-jfoodok="1"'+(j.food.ok?" checked":"")+'><span>Bought / prepped</span></label></section>';
  h += '<section class="card"><h2>Write it out</h2><p class="note">Vent, worry, complain. Nobody reads this. Writing worries down before studying or an exam frees up headspace (Ramirez and Beilock 2011).</p><textarea id="j-vent" placeholder="What\'s on your mind?">'+esc(j.vent||"")+'</textarea><button class="btn small" data-jsave="1">Save</button>'+(ventSaved===jDay?'<p class="pl-calm">'+esc(KIND_REPLIES[(ds.indexOf(jDay)+(j.vent||"").length)%KIND_REPLIES.length])+'</p>':'')+'</section>';
  h += lowSwitch(jDay) + habitsCard(jDay);
  h += '<section class="card"><h2>Things that are true</h2><ul class="plain">'+
    '<li>You made a plan for a whole week with work, training and an exam in it. That is the hard part most people skip.</li>'+
    '<li>'+(lit ? 'You have already lit '+lit+' station'+(lit===1?"":"s")+'.' : 'Your first station is waiting. One is enough to start.')+'</li>'+
    '<li>Nerves before an exam are your body getting ready, not a sign you will fail (Jamieson et al. 2010).</li>'+
    '<li>Being kind to yourself after a bad day makes you more likely to try again, not less (Breines and Chen 2012).</li></ul>'+
    '<p class="note">If this ever feels like more than exam stress, talk to someone you trust or a doctor.</p></section>';
  h += '<p class="note">Sources: Brooks A, Lack L. Sleep. 2006;29(6):831–40. Ramirez G, Beilock SL. Science. 2011;331(6014):211–3. Jamieson JP et al. J Exp Soc Psychol. 2010;46(1):208–12. Breines JG, Chen S. Pers Soc Psychol Bull. 2012;38(9):1133–43. Gollwitzer PM, Sheeran P. Adv Exp Soc Psychol. 2006;38:69–119.</p>';
  return h;
}

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
  if(!FL.signedOut && p.confirmed && !jr(jToday()).checkin && ds.indexOf(jToday()) >= 0) return vCheckin(pl);
  var nx = nextThing(pl), today = ds[0];
  var h = FL.signedOut ? '<section class="card pl-rec"><b>You\'re not signed in.</b><span>This is an empty plan on this device. Sign in to see yours.</span><a class="btn small" href="#account">Sign in</a></section>' : '';
  h += '<p class="note">'+countdownLine()+'<br>75 minutes · 75 points · calculator and 2 cheat sheets (4 pages), per the 2026/27 syllabus.</p>';
  var line = "", sub = "";
  if(nx && nx.rest && nx.day===today && (!nx.n || nx.day!==today)){ line = "Today: no studying. Rest after the hackathon."; sub = "Long day. The plan starts tomorrow."; }
  else if(nx && nx.n && nx.n.kind==="leave"){ var l = nx.n.x.leg; line = (nx.day===today?"":dayName(nx.day)+": ")+"Leave at "+hm(l.leave)+" for "+((place(l.to)||{}).name||""); sub = "Park "+hm(l.park)+" · inside "+hm(l.inside); }
  else if(nx && nx.n){ var sl = nx.n.x; line = (nx.day===today?"Next":dayName(nx.day))+": "+hm(sl.s)+" · "+(sl.kind==="learn" && sl.parts && sl.parts[0] ? "Topic "+sl.parts[0].step.topic+", "+sl.parts[0].step.name : sl.kind==="cards" ? "question cards" : sl.kind==="quiz" ? "Topic "+sl.quiz+" quiz, timed" : (sl.what||"review")); sub = ((place(sl.place)||{}).name||"")+" · "+Math.round(sl.len)+" min"; }
  else { line = "Nothing planned right now."; }
  var tl = tonightLine(today);
  var nowH = p.confirmed && !FL.signedOut ? vNow(pl) : '';
  if(nowH) h += nowH + '<details class="pl-more"><summary>See the whole week</summary>';
  else h += '<section class="card pl-next"><div class="eyebrow">Only this</div><p class="pl-one">'+esc(line)+'</p>'+(sub?'<p class="note">'+esc(sub)+'</p>':'')+(nx && nx.n && nx.n.kind==="slot" ? slotLink(nx.n.x) : '')+'</section>';
  if(tl) h += '<section class="card pl-sleep"><span aria-hidden="true">🌙</span><p>'+esc(tl)+'</p></section>';
  h += checklist();
  h += '<details class="pl-more"><summary>Show my whole day</summary>';
  h += '<div class="pl-days" role="tablist">'+ds.map(function(d){ return '<button role="tab" class="pl-day'+(d===selDay?" on":"")+(d===p.exam.date?" exam":"")+'" data-pday="'+d+'"><span>'+dayName(d)+'</span></button>'; }).join("")+'</div>';
  var md = pl.models[ds.indexOf(selDay)];
  h += '<section class="card"><h2>'+dayName(selDay,true)+'</h2>'+(md.rest?'<p class="note">Rest day: no study slots.</p>':'')+'<div id="pl-map" class="pl-map" aria-label="Map of this day"></div>'+timeline(md)+'</section></details>';
  h += p.confirmed ? '<a class="btn ghost" href="#plan/line">My line to the exam</a>' : '<a class="btn ghost" href="#plan/setup/1">Set up or change the plan</a>';
  if(nowH) h += '</details>';
  return h;
}

/* ---------- Now: only the stretch you are in, up to your next study station ---------- */
var nowOff = false;
function vNow(pl){
  var p = P(), t = nowMin(), md = pl.models[0]; if(!md || md.date !== todayIso()) return "";
  var list = [];
  md.items.forEach(function(x){
    if(x.type==="travel"){ var l = x.leg, to = (place(l.to)||{}).name || "";
      var hm0 = l.to==="home"; list.push({s:l.leave, e:l.inside, now:(hm0?'On your way home · home by ':'On your way to '+to+' · inside by ')+hm(l.inside), then:(hm0?'Leave for home · home by ':'Leave for '+to+' · inside by ')+hm(l.inside)}); }
    else list.push({s:x.ev.s, e:x.ev.e, now:x.ev.title+' · until '+hm(x.ev.e), then:x.ev.title+' · '+hm(x.ev.s)+'–'+hm(x.ev.e)});
  });
  md.slots.forEach(function(sl){ if(p.done[sl.id] || sl.missed || sl.lit) return;
    var w = sl.kind==="learn" && sl.parts && sl.parts[0] ? "Topic "+sl.parts[0].step.topic+", "+sl.parts[0].step.name : sl.kind==="quiz" ? "Topic "+sl.quiz+" quiz, timed" : (sl.what||"Question cards");
    list.push({s:sl.s, e:sl.e, slot:sl, now:'Study station · until '+hm(sl.e)+': '+w, then:'Study station · '+hm(sl.s)+'–'+hm(sl.e)+': '+w}); });
  list.sort(function(a,b){ return a.s-b.s; });
  var cur = list.filter(function(x){ return x.s <= t && t < x.e; })[0], after = list.filter(function(x){ return x.s > t; });
  var then = []; for(var i=0;i<after.length && then.length<4;i++){ then.push(after[i]); if(after[i].slot) break; }
  if(cur && cur.slot) then = [];
  var h = '<section class="card pl-next"><div class="eyebrow">Now · '+hm(t)+'</div>';
  if(cur){ h += '<p class="pl-one">'+esc(cur.now)+'</p>'; if(cur.slot) h += '<p>'+slotLink(cur.slot)+'</p><p>'+doneBtn(cur.slot)+'</p>'; }
  else if(then.length) h += '<p class="pl-one">Free until '+hm(then[0].s)+'</p><p class="note">Rest, eat, or get ready. Nothing to do yet.</p>';
  else { var b = nights().bed[md.date]; h += '<p class="pl-one">That\'s it for today.</p>'+(b!==undefined?'<p class="note">In bed by '+hm(b)+'. Tomorrow is planned already.</p>':''); }
  if(then.length) h += '<div class="eyebrow" style="margin-top:12px">Then</div><ul class="plain">'+then.map(function(x){ return '<li><b>'+hm(x.s)+'</b> '+esc(x.then)+(x.slot?'<br>'+slotLink(x.slot):'')+'</li>'; }).join("")+'</ul>';
  h += '</section>';
  h += '<div class="two"><a class="btn ghost" href="#journal">What\'s on my mind</a><button class="btn ghost" data-nowoff="1">'+(nowOff?'Close':'Something\'s off')+'</button></div>';
  if(nowOff){
    var missed = md.slots.filter(function(s){ return s.missed; }), j = jr(jToday());
    h += '<section class="card"><h2>Something\'s off</h2>';
    missed.forEach(function(s){ h += '<div class="pl-row st"><b>'+hm(s.s)+'–'+hm(s.e)+'</b> · missed<br>'+doneBtn(s)+'</div>'; });
    h += lowSwitch(jToday());
    h += movedSummary(pl);
    h += '<p><a href="#plan/setup/3">Change a fixed plan</a> (a shift, training, an appointment) and the stations move around it.</p></section>';
  }
  return h;
}
function lowSwitch(date){ var on = !!jr(date).low;
  return '<div class="pl-if'+(on?" on":"")+'"><p><b>Low-energy day</b></p><p class="note">Pain, a bad night, a hard day. New steps wait; today becomes question cards only.</p><button class="btn small '+(on?"":"ghost")+'" data-jlow="'+date+'">'+(on?"Low-energy day is on ✓":"Make today a low-energy day")+'</button></div>'; }

/* ---------- habits: notice what sets you back and what is self-care, without judging ---------- */
var HABIT_SUGG = {watch:[["smoke","Smoked"],["series","Lost an evening to a series"],["phonebed","Phone in bed"],["latebed","Went to bed late"],["skipmeal","Skipped a meal"]],
  care:[["cooked","Cooked a proper meal"],["rest","Rested when my body needed it"],["outside","Got outside or moved"],["slept","Slept enough"]]};
var HABIT_TIP = {smoke:"Start by only counting, not quitting: tap it each day this week and look at the pattern on Sunday.",
  series:"If-then: if I start an episode on a study evening, then I set a timer for one episode.",
  phonebed:"If-then: if I go to bed, then the phone charges outside the bedroom.",
  latebed:"Your plan has a bedtime every night. Try aiming for that one only, nothing else.",
  skipmeal:"Food is part of the plan: write tomorrow's meals in the Food box the evening before.",
  cooked:"Cooking takes you real time, and it's worth it. If it happens often, add a cooking slot as a fixed plan so the stations move around it."};
function habits(){ var p = P(); p.habits = p.habits || []; return p.habits; }
function habitsCard(date){
  var hs = habits(), j = jr(date); j.hab = j.hab || {};
  var h = '<section class="card"><h2>Notice your patterns</h2><p class="note">After writing it out: what set you back today, and where did you look after yourself? Only you see this.</p>';
  if(hs.length){ h += '<div class="pl-chips">'+hs.map(function(x){ var on = !!j.hab[x.id];
    return '<button type="button" class="opt" data-htog="'+date+'|'+x.id+'" aria-pressed="'+on+'">'+(x.kind==="care"?"💚 ":"")+esc(x.name)+'</button>'; }).join("")+'</div><p class="note">Tap what happened today. 💚 means you looked after yourself; that never counts against you.</p>'; }
  var have = {}; hs.forEach(function(x){ have[x.id] = 1; });
  var sw = HABIT_SUGG.watch.filter(function(s){ return !have[s[0]]; }), sc = HABIT_SUGG.care.filter(function(s){ return !have[s[0]]; });
  h += '<details'+(hs.length?'':' open')+'><summary>'+(hs.length?'Add another':'Add what you want to notice')+'</summary>';
  if(sw.length) h += '<p class="note">Things that might set you back</p><div class="pl-chips">'+sw.map(function(s){ return '<button type="button" class="opt" data-hadd="watch|'+s[0]+'|'+date+'">'+esc(s[1])+'</button>'; }).join("")+'</div>';
  if(sc.length) h += '<p class="note">Ways you look after yourself</p><div class="pl-chips">'+sc.map(function(s){ return '<button type="button" class="opt" data-hadd="care|'+s[0]+'|'+date+'">💚 '+esc(s[1])+'</button>'; }).join("")+'</div>';
  h += '<label class="f">Your own<input type="text" id="h-new" placeholder="e.g. Coffee after 16:00"></label><div class="two"><button class="btn small ghost" data-hcustom="watch|'+date+'">Add: sets me back</button><button class="btn small ghost" data-hcustom="care|'+date+'">Add: 💚 self-care</button></div></details>';
  h += patterns() + '<button class="btn small ghost" data-reflect="1">'+(reflectCopied?'Copied ✓ Paste it into Claude':'Reflect with Claude')+'</button><p class="note">Copies your last 7 journal days into a message for Claude, which can help you sort out patterns. It is not a therapist; for anything heavy, talk to someone you trust or a doctor.</p></section>';
  return h;
}
function litOn(date){ var p = P(); return Object.keys(p.done||{}).filter(function(id){ return p.done[id] && id.indexOf(date+"-")===0; }).length; }
function patterns(){
  var p = P(), js = p.journal || {}, dates = Object.keys(js).filter(function(d){ return js[d].hab && Object.keys(js[d].hab).length; }).sort().slice(-7);
  if(dates.length < 2) return '<p class="note">After a few days of tapping, patterns show up here.</p>';
  var out = [];
  habits().forEach(function(x){
    var yes = dates.filter(function(d){ return js[d].hab[x.id]; }), no = dates.filter(function(d){ return !js[d].hab[x.id]; });
    if(!yes.length) return;
    var line = (x.kind==="care"?"💚 ":"")+'<b>'+esc(x.name)+'</b>: '+yes.length+' of the last '+dates.length+' days.';
    if(x.kind==="watch" && no.length){ var a = yes.reduce(function(s,d){ return s+litOn(d); },0)/yes.length, b = no.reduce(function(s,d){ return s+litOn(d); },0)/no.length;
      if(b > a) line += ' On those days you lit '+a.toFixed(1)+' stations, on the others '+b.toFixed(1)+'.'; }
    if(x.kind==="care") line += ' That counts.';
    if(HABIT_TIP[x.id] && yes.length >= 2) line += '<br><span class="note">'+esc(HABIT_TIP[x.id])+'</span>';
    out.push('<li>'+line+'</li>');
  });
  return out.length ? '<h3>Your week so far</h3><ul class="plain">'+out.join("")+'</ul>' : '';
}
var reflectCopied = false;
function reflectPrompt(){
  var p = P(), js = p.journal || {}, dates = Object.keys(js).sort().slice(-7), hs = habits(), mood = {}; MOODS.forEach(function(m0){ mood[m0[0]] = m0[1]; });
  var txt = "I'm a student preparing for an IFRS exam on "+p.exam.date+". These are my last journal days from my study app.\n\n";
  dates.forEach(function(d){ var j = js[d], ms = Object.keys(j.mood||{}).filter(function(k){ return j.mood[k]; }).map(function(k){ return mood[k]; }), hb = hs.filter(function(x){ return (j.hab||{})[x.id]; }).map(function(x){ return (x.kind==="care"?"[self-care] ":"[sets me back] ")+x.name; });
    if(!ms.length && !hb.length && !j.vent && !j.intent) return;
    txt += "## "+d+"\n"+(ms.length?"Mood: "+ms.join(", ")+"\n":"")+(hb.length?"Habits: "+hb.join("; ")+"\n":"")+(j.low?"Low-energy day\n":"")+(j.intent?"Intention: "+j.intent+"\n":"")+(j.vent?"Wrote: "+j.vent+"\n":"")+"Study stations done: "+litOn(d)+"\n\n"; });
  txt += "Please help me reflect, kindly and honestly:\n1. Which patterns do you see?\n2. Which things are habits that genuinely set me back, and which are things I'm too harsh on myself about (needs, not failures)?\n3. Suggest one small experiment for the next few days, not a big plan.\nAsk me questions if something is unclear. You're not my therapist; if something sounds like more than exam stress, tell me to talk to someone.";
  return txt;
}
function countdownLine(){ var p = P(), d = Math.round((new Date(p.exam.date+"T"+p.exam.time) - new Date())/86400000); return Math.max(0,d)+" days to the IFRS exam · "+dayName(p.exam.date)+" "+p.exam.time; }
function vStep1(){
  var p = P();
  var h = stepper("1")+'<div class="stack"><h1>Exam and travel</h1><p class="lead">Set this once. Everything else is calculated from it.</p></div>';
  h += '<section class="card"><h2>The exam</h2><div class="two"><label class="f">Date<input type="date" data-pf="exam.date" value="'+esc(p.exam.date)+'"></label><label class="f">Time<input type="time" data-pf="exam.time" value="'+esc(p.exam.time)+'"></label></div>'+
    '<label class="f">Where<select data-pf="exam.place">'+p.places.map(function(x){ return '<option value="'+x.id+'"'+(x.id===p.exam.place?" selected":"")+'>'+esc(x.name)+'</option>'; }).join("")+'</select></label><p class="note">On exam day the plan aims for you to be inside 15 minutes early.</p></section>';
  h += '<section class="card"><h2>How do you usually get around?</h2><div class="opts">'+Object.keys(MODE).map(function(k){ return '<button type="button" class="opt" data-pmode="'+k+'" aria-pressed="'+(p.mode===k)+'">'+MODE[k]+'</button>'; }).join("")+'</div>'+
    '<p class="note">Car, bike and walking times come from OpenStreetMap routing. Public transport times come from the BVG timetable. In rush hour (7:00–9:30, 16:00–19:00) driving gets 25% extra.</p></section>';
  h += '<section class="card"><h2>Sleep, honestly</h2><p class="lead">When do you fall asleep these days? No judgement. Lots of people with ADHD drift late. This only tells the plan where to start.</p>'+
    '<div class="two"><label class="f">Lately I fall asleep around<input type="time" data-pf="sleepNow.bed" value="'+esc(p.sleepNow.bed)+'"></label><label class="f">and wake up around<input type="time" data-pf="sleepNow.wake" value="'+esc(p.sleepNow.wake)+'"></label></div>'+
    '<p class="note">From there the plan moves bedtime a little earlier each night, so that on exam morning you wake up rested without a shock. You only ever see tonight\'s target.</p>'+
    '<label class="f">Minutes per ladder step, first pass<input type="number" min="15" max="120" data-pf="stepMin" value="'+esc(p.stepMin)+'"></label></section>';
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
    var examRow = d===p.exam.date ? '<div class="pl-row ev"><b>'+esc(p.exam.time)+'</b> · IFRS exam · '+esc((place(p.exam.place)||{}).name||"")+' <span class="note">· change it in step 1</span></div>' : '';
    h += '<section class="card"><h2>'+dayName(d,true)+'</h2>'+examRow+(evs.length?evs.map(function(e){
      return '<div class="pl-ev"><div class="row"><input type="text" data-pe="'+e.id+'.title" value="'+esc(e.title)+'" aria-label="What"><button type="button" class="btn small ghost" data-pedel="'+e.id+'" aria-label="Delete">✕</button></div>'+
        '<div class="three"><input type="time" data-pe="'+e.id+'.start" value="'+esc(e.start)+'" aria-label="Start"><input type="time" data-pe="'+e.id+'.end" value="'+esc(e.end)+'" aria-label="End">'+
        '<select data-pe="'+e.id+'.place" aria-label="Where">'+p.places.map(function(x){ return '<option value="'+x.id+'"'+(x.id===e.place?" selected":"")+'>'+esc(x.name)+'</option>'; }).join("")+'</select></div>'+
        '<div class="two"><select data-pe="'+e.id+'.kind" aria-label="Type">'+["work","training","class","other"].map(function(k){ return '<option value="'+k+'"'+(e.kind===k?" selected":"")+'>'+k[0].toUpperCase()+k.slice(1)+'</option>'; }).join("")+'</select>'+
        '<select data-pe="'+e.id+'.flex" aria-label="Can it move?">'+Object.keys(FLEX).map(function(k){ return '<option value="'+k+'"'+(e.flex===k?" selected":"")+'>'+FLEX[k]+'</option>'; }).join("")+'</select></div></div>';
    }).join(""):(examRow?'':'<p class="note">Nothing fixed.</p>'))+'<button type="button" class="btn small ghost" data-peadd="'+d+'">Add something on this day</button></section>';
  });
  return h+'<a class="btn" href="#plan/setup/4">Next: see your study slots</a>';
}
function vStep4(){
  var pl = plan(), tot = pl.slots.reduce(function(a,b){ return a+b.len; },0), doneSteps = {}, count = 0;
  var h = stepper("4")+'<div class="stack"><h1>Your study days</h1><p class="lead">'+(Math.round(tot/6)/10)+' free hours until the exam. Topics with the most exam points come first. Tap a day for its details.</p></div>';
  var per = {}; pl.queue.forEach(function(q){ per[q.topic] = (per[q.topic]||0)+1; });
  pl.models.forEach(function(md){
    var touched = {};
    md.slots.forEach(function(sl){ (sl.parts||[]).forEach(function(x){ touched[x.step.topic] = 1; if(!x.cont && !doneSteps[x.step.id]){ doneSteps[x.step.id] = 1; count++; } }); });
    var byTopic = {}; Object.keys(doneSteps).forEach(function(id){ pl.queue.forEach(function(q){ if(q.id===id) byTopic[q.topic] = (byTopic[q.topic]||0)+1; }); });
    var chips = Object.keys(touched).map(function(t){ var pc = Math.round((byTopic[t]||0)/per[t]*100); return '<span class="pill '+(pc>=100?"solid":"prog")+'">Topic '+t+(pc>=100?" ✓":" "+pc+"%")+'</span>'; }).join(" ");
    var hrs = Math.round(md.slots.reduce(function(a,b){ return a+b.len; },0)/6)/10, pct = Math.round(count/pl.total*100);
    h += '<details class="card pl-dayrow"><summary><div class="row"><b>'+dayName(md.date)+'</b><span class="note">'+(md.rest?"rest day":md.date===P().exam.date?"exam":hrs+" h")+'</span></div><div class="mat">'+(chips||'<span class="note">'+(md.rest?"No studying today.":"Review and question cards.")+'</span>')+'</div>'+
      '<div class="pl-progress small"><i style="width:'+pct+'%"></i></div><span class="note">By tonight: '+pct+'% of the course</span></summary>'+
      md.slots.map(function(sl){ return '<div class="pl-row st">'+slotText(sl)+'</div>'; }).join("")+'</details>';
  });
  return h+'<a class="btn" href="#plan/check">Next: check the week, one thing at a time</a>';
}

/* ---------- check: flagged trips and trade-off cards ---------- */
function gmaps(l){ var A = place(l.from), B = place(l.to); return "https://www.google.com/maps/dir/?api=1&origin="+A.lat+","+A.lon+"&destination="+B.lat+","+B.lon+"&travelmode="+({car:"driving",transit:"transit",bike:"bicycling",walk:"walking"}[P().mode]); }
function cards(pl){
  var p = P(), out = [], lastDay = addDays(p.exam.date,-1);
  /* recommendations are judged against the week before any of these choices, so they don't flip once you choose */
  var keep = {}; Object.keys(p.decisions).forEach(function(k){ if(/^ev-|^coverage|^books/.test(k)){ keep[k] = p.decisions[k]; delete p.decisions[k]; } });
  var base = plan(); Object.keys(keep).forEach(function(k){ p.decisions[k] = keep[k]; });
  var short = base.minsLeft > 0, nowShort = pl.minsLeft > 0; pl = {minsLeft:base.minsLeft};
  p.events.forEach(function(e){
    if(e.flex==="fixed") return;
    var dur = m(e.end)-m(e.start), before = e.date === lastDay;
    var mdW = dayModel(e.date), withIt = mdW.slots.reduce(function(a,b){ return a+b.len; },0), keepD = p.decisions["ev-"+e.id]; p.decisions["ev-"+e.id] = "drop";
    var mdO = dayModel(e.date), without = mdO.slots.reduce(function(a,b){ return a+b.len; },0), sleepMore = mdO.wake - mdW.wake;
    if(keepD === undefined) delete p.decisions["ev-"+e.id]; else p.decisions["ev-"+e.id] = keepD;
    var gainMin = Math.max(0, without - withIt);
    var how = "The "+e.title.toLowerCase()+" itself is "+fmtDur(dur)+" ("+e.start+"–"+e.end+"). With the drive and the time around it, your study time that day grows by about "+fmtDur(gainMin)+(sleepMore>=20?", and you can sleep until "+hm(mdO.wake)+" instead of "+hm(mdW.wake):"")+".";
    var rec = before || (e.kind==="class" && short) ? "drop" : "keep";
    var why = before
      ? "It is the day before the exam. "+how+" That time goes to the final review and an early, calm evening. Asking now is easier on your colleagues than a sick call on the day."
      : rec==="drop" ? "Your week is about "+fmtDur(pl.minsLeft)+" short. "+how+" If the class covers IFRS exam material, go instead."
      : "The plan fits without it, so keeping it costs you nothing important.";
    out.push({id:"ev-"+e.id, day:dayName(e.date,true), title:e.title+" · "+e.start+"–"+e.end, rec:rec, why:why,
      opts:[["keep", e.kind==="work"?"Keep the shift":"Go"],["drop", e.flex==="swap" ? (e.kind==="work"?"Swap or cancel the shift":"Move it") : "Skip it and study"]],
      cost:{keep:"No change to your week.", drop:"About "+fmtDur(gainMin)+" more study time on "+dayName(e.date)+(sleepMore>=20?" and "+fmtDur(sleepMore)+" more sleep":"")+"."}});
  });
  out.push({id:"noise", title:"Where you study", rec:"split",
    why:"For people with ADHD, steady background noise such as pink noise helped a little in lab tasks, while it hurt people without ADHD (Nigg et al. 2024). So new steps go to quiet places and reviews can go anywhere.",
    opts:[["split","Quiet for new steps, noise is fine for reviews"],["quiet","Always somewhere quiet"],["noisy","I focus better with background noise"]],
    cost:{split:"Recommended balance.", quiet:"Short slots at the café become cards only.", noisy:"New steps can also go to noisy places."}});
  var all = 0; Object.keys(FL.BOOKMAP||{}).forEach(function(n){ FL.BOOKMAP[n].forEach(function(r){ all += r[3]-r[2]+1; }); });
  var extra = bookReads(2).concat(bookReads(3)).reduce(function(a,b){ return a+b.mins; }, 0);
  out.push({id:"books", title:"Textbook reading", rec:"lookup",
    why:"All the Elliott and Melville chapters for your five topics are about "+all+" pages, roughly "+fmtDur(all*readRate())+" at "+(Math.round(readRate()*10)/10)+" min per page, which is more than your free time this week. Testing yourself helps learning much more than rereading (Dunlosky et al. 2013). So the books are best for looking up a step when you are stuck: each ladder step has a button to the right pages.",
    opts:[["lookup","Look things up when stuck"],["read23","Also read the Melville chapters for Topics 2 and 3"]],
    cost:{lookup:"No extra time in the plan.", read23:"About "+fmtDur(extra)+" more in the plan. It goes after the steps of each topic."}});
  if(nowShort || p.decisions.coverage) out.push({id:"coverage", title:"Not everything fits", rec:"focus",
    why:"Topics 2 and 3 were 47 of 75 points in the 2023 exam. Learning them properly and keeping the rest as question cards gives the most points per hour. This year's exam can be weighted differently.",
    opts:[["focus","Deep on Topics 2 and 3, question cards for 1, 4 and 5"],["once","Everything once, nothing twice"],["dropT4","Leave out Topic 4 practice (13 points in 2023)"]],
    cost:{focus:"Best points per hour.", once:"Wider but shallower.", dropT4:"Most time for the rest, a known gap."}});
  return out;
}
var checkIdx = 0, curLeg = null, copied = "";
function checkItems(){
  var p = P(), pl = plan(), items = [{t:"intro"}];
  pl.models.forEach(function(md){ md.issues.forEach(function(x){ items.push({t:"issue", x:x, id:"i:"+x.date+x.type}); }); });
  var seen = {};
  pl.models.forEach(function(md){ md.legs.forEach(function(l){
    if(!((l.drive >= 40 || (p.mode==="car" && rush(l.leave) && l.drive >= 25)) && l.to!=="home" && (l.date > todayIso() || l.leave > new Date().getHours()*60+new Date().getMinutes()))) return;
    var g = l.key+"@"+Math.round(l.leave/30);
    if(seen[g]){ seen[g].days.push(l.date); return; }
    seen[g] = {t:"drive", l:l, days:[l.date], id:"d:"+g}; items.push(seen[g]);
  }); });
  cards(pl).forEach(function(c){ items.push({t:"card", c:c, id:"c:"+c.id}); });
  items.push({t:"done", pl:pl, id:"done"}); items[0].id = "intro";
  return items;
}
function vCheck(){
  var p = P(), items = checkItems(); checkIdx = Math.max(0, Math.min(checkIdx, items.length-1)); var it = items[checkIdx]; curLeg = null;
  var h = '<div class="row"><a class="back" href="#plan">← Calendar</a><span class="note">'+(checkIdx+1)+' of '+items.length+'</span></div><div class="pl-progress"><i style="width:'+Math.round((checkIdx+1)/items.length*100)+'%"></i></div>';
  var nav = function(next, label){ return '<div class="two">'+(checkIdx>0?'<button class="btn ghost" data-pck="-1">Back</button>':'<span></span>')+(next?'<button class="btn" data-pck="1">'+(label||"Next")+'</button>':'<span></span>')+'</div>'; };
  if(it.t==="intro"){
    var n = items.length - 2;
    h += '<section class="card pl-big"><h1>Let\'s check your week</h1><p class="lead">'+n+' small things, one at a time. About '+Math.max(2, Math.round(n/2))+' minutes. Nothing here is a test, and every choice can be changed later.</p></section>'+nav(true, "Start");
  }
  if(it.t==="issue"){
    h += '<section class="card pl-big"><div class="eyebrow">'+dayName(it.x.date, true)+'</div><p class="pl-calm">'+esc(it.x.calm||"Good that this shows up now.")+'</p><p>'+esc(it.x.text)+'</p></section>'+nav(true, "Okay");
  }
  if(it.t==="drive"){
    var l = it.l, t = p.travel[l.key] || {}; curLeg = l;
    h += '<section class="card pl-big"><div class="eyebrow">'+it.days.map(function(d){ return dayName(d); }).join(" & ")+' · a longer drive</div><div id="pl-map" class="pl-map" aria-label="This drive"></div><p>'+legText(l)+'</p>';
    if(t.checkedState==="yes" || t.manual){
      h += '<p class="note">In Google Maps, tap "Leave at" and pick '+dayName(l.date)+' '+hm(l.leave)+'. Then type the time it shows, for example 55 min or 1 h 5 min.</p><a class="btn ghost" href="'+gmaps(l)+'" target="_blank" rel="noopener">Open in Google Maps</a><label class="f">Time Google Maps shows<input type="text" inputmode="text" autocomplete="off" placeholder="e.g. 1 h 5 min" data-pman="'+l.key+'" value="'+esc(t.manual?fmtDur(t.manual):"")+'"></label>'+(manWarn?'<p class="pl-calm">'+esc(manWarn)+'</p>':'')+'</section>'+nav(true, t.manual?"Saved, next":"Next");
    } else {
      h += '<p class="lead">Want to double-check this one in Google Maps?</p><div class="two"><button class="btn ghost" data-pchk="'+l.key+'|no">No, it\'s fine</button><button class="btn" data-pchk="'+l.key+'|yes">Yes, check</button></div></section>'+nav(false);
    }
  }
  if(it.t==="card"){
    var c = it.c, cur = p.decisions[c.id], recO = c.opts.filter(function(o){ return o[0]===c.rec; })[0];
    h += '<section class="card pl-big"><div class="eyebrow">Decide'+(c.day?' · '+esc(c.day):'')+'</div><h1>'+esc(c.title)+'</h1><div class="pl-rec"><b>I\'d go with: '+esc(recO[1])+'</b><br><span>'+esc(c.why)+'</span></div>'+
      c.opts.map(function(o){ return '<button type="button" class="btn '+(o[0]===c.rec?"":"ghost")+(cur===o[0]?" picked":"")+'" data-pdec="'+c.id+'|'+o[0]+'">'+esc(o[1])+(cur===o[0]?" ✓":"")+'</button><p class="note pl-cost">'+esc(c.cost[o[0]]||"")+'</p>'; }).join("")+
      '<p class="note">Your call. Either way the plan adjusts.</p>';
    if(cur==="drop" && /^ev-/.test(c.id)){ var ev = p.events.filter(function(e){ return "ev-"+e.id===c.id; })[0];
      if(ev && ev.kind==="work") h += '<button class="btn ghost" data-pcopy="'+ev.id+'">'+(copied===ev.id?"Copied ✓":"Copy a message for your manager")+'</button>'; }
    h += '</section>'+nav(!!cur);
  }
  if(it.t==="done"){
    var pl = it.pl, pct = Math.round(pl.covered/pl.total*100);
    h += '<section class="card pl-big"><h1>That\'s everything</h1><p class="lead">With your choices, '+pct+'% of the ladder steps fit before the exam'+(pl.minsLeft>0?'. The rest becomes question cards, so nothing is left completely untouched.':'.')+'</p><p>You only ever need to look at the next thing. The calendar will show it.</p></section><button class="btn" id="pl-confirm">Confirm my plan</button>'+nav(false);
  }
  return h;
}

/* ---------- lighting a station: two taps, and it remembers what you did so the rest of the plan moves on ---------- */
var armed = "", armT = null;
function lightSlot(id){
  var p = P(); p.log = p.log || {};
  var sl = plan({avail:id}).slots.filter(function(s){ return s.id===id; })[0] || {};
  p.log[id] = {kind:sl.kind||"done", what:sl.what||"", prog:sl.prog||null, quiz:sl.kind==="quiz" ? sl.quiz : null,
    parts:(sl.parts||[]).map(function(pt){ return [pt.step.id, pt.mins, pt.step.topic]; }), at:new Date().toISOString()};
  p.done[id] = true;
}
function doneBtn(s){
  var p = P();
  if(p.done[s.id]) return '<span class="pill solid">Lit</span> <button class="btn small ghost" data-pundo="'+s.id+'">Undo</button>';
  var arm = armed === s.id;
  if(s.missed) return '<span class="pill todo">Missed</span> <button class="btn small ghost" data-pdone="'+s.id+'">'+(arm?"Tap again: I did it":"I did it after all")+'</button>';
  return slotLink(s)+'<button class="btn small '+(arm?"":"ghost")+'" data-pdone="'+s.id+'">'+(arm?"Tap again to light it":"Done: light this station")+'</button>';
}

/* ---------- start of the day: a one-minute check-in before the plan ---------- */
var ciSaved = "", showMoved = false;
/* in plain sentences: what the missed stations held, and where that work went */
function movedSummary(pl){
  var base = plan({nomiss:true}), td = pl.models[0] || {slots:[]}, out = [], gone = [];
  function whereIs(id){ for(var i=0;i<pl.slots.length;i++){ var s = pl.slots[i]; if(s.missed || s.lit) continue; if((s.parts||[]).some(function(pt){ return pt.step.id===id; })) return s; } return null; }
  td.slots.filter(function(s){ return s.missed; }).forEach(function(s){
    var b = base.slots.filter(function(x){ return x.id===s.id; })[0] || {};
    if(b.kind==="learn" && b.parts && b.parts.length){ b.parts.forEach(function(pt){ var to = whereIs(pt.step.id);
      out.push('<li>'+hm(s.s)+': <b>Topic '+pt.step.topic+', '+esc(pt.step.name)+'</b> → '+(to ? (to.date===td.date?'today':esc(dayName(to.date)))+' at '+hm(to.s) : 'later in the week, as question cards')+'.</li>'); }); }
    else out.push('<li>'+hm(s.s)+': '+esc(b.what||"question cards")+' → skipped. There are more question cards later, so nothing is lost.</li>');
  });
  base.slots.forEach(function(s){ (s.parts||[]).forEach(function(pt){ if(!whereIs(pt.step.id) && gone.indexOf(pt.step)<0 && !td.slots.some(function(m){ return m.missed && m.id===s.id; })) gone.push(pt.step); }); });
  var h = '<div class="pl-calm"><p><b>What moved</b></p><ul>'+(out.join("")||'<li>Nothing moved.</li>')+'</ul>';
  if(gone.length) h += '<p>To make room, '+gone.map(function(st){ return 'Topic '+st.topic+' '+esc(st.name); }).join(", ")+' '+(gone.length===1?'becomes':'become')+' question cards instead of a full step.</p>';
  h += '<p>Your bedtime and your fixed plans stay the same. Only the study stations shifted.</p></div>';
  return h;
}
function vCheckin(pl){
  var p = P(), today = jToday(), j = jr(today), tnow = nowMin(); jDay = today;
  var td = pl.models[0] || {slots:[]}, missed = td.slots.filter(function(s){ return s.missed; }), lit = td.slots.filter(function(s){ return s.lit; });
  var hr = new Date().getHours(), hi = hr < 12 ? "Good morning" : hr < 18 ? "Hi" : "Good evening";
  var h = '<div class="stack"><div class="eyebrow">Start of the day · 1 minute</div><h1>'+hi+'. How are you arriving today?</h1><p class="lead">First a quick check-in, then the plan, so it plans for the day you really have.</p></div>';
  h += '<section class="card"><h2>1. How is it going?</h2><div class="pl-chips">'+MOODS.map(function(mo){ return '<button type="button" class="opt" data-jmood="'+mo[0]+'" aria-pressed="'+(!!j.mood[mo[0]])+'">'+mo[1]+'</button>'; }).join("")+'</div>';
  var picked = Object.keys(j.mood).filter(function(k){ return j.mood[k]; });
  picked.forEach(function(k){ (IFTHEN[k]||[]).forEach(function(it){ var on = j.ifthen[it[0]];
    h += '<div class="pl-if'+(on?" on":"")+'"><p><b>'+esc(it[1])+'</b></p><p class="note">'+esc(it[2])+'</p><button class="btn small '+(on?"":"ghost")+'" data-jif="'+it[0]+'">'+(on?"My plan today ✓":"Make this my plan")+'</button></div>'; }); });
  h += '<label class="f">Anything on your mind? (optional, only you see this)<textarea id="ci-vent" placeholder="Write it out">'+esc(j.vent||"")+'</textarea></label><button class="btn small" data-cisave="1">Save to my journal</button>'+(ciSaved===today?' <span class="note">Saved in today\'s journal ✓</span>':'')+lowSwitch(today)+'</section>'+habitsCard(today);
  h += '<section class="card"><h2>2. What already happened today</h2>';
  if(!missed.length && !lit.length) h += '<p>Nothing yet. Your day starts fresh.</p>';
  missed.forEach(function(s){ h += '<div class="pl-row st"><b>'+hm(s.s)+'–'+hm(s.e)+'</b> · '+esc((place(s.place)||{}).name||"")+'<br>'+doneBtn(s)+'</div>'; });
  lit.forEach(function(s){ h += '<div class="pl-row st done"><b>'+hm(s.s)+'–'+hm(s.e)+'</b> · '+esc(s.what||"")+'<br>'+doneBtn(s)+'<span class="note"> Lit by mistake? Undo puts its work back in the plan.</span></div>'; });
  if(missed.length) h += '<p class="pl-calm">That happens to everyone. The plan has already moved that work to your next stations, so you don\'t have to redo anything in your head.</p>';
  var pct = pl.total ? Math.round(pl.covered/pl.total*100) : 100;
  h += '<p class="note">'+(pl.minsLeft > 0 ? 'A few steps now become question cards instead, so the essentials still fit. <button class="btn small ghost" data-pmoved="1">'+(showMoved?'Hide':'What moved?')+'</button>' : 'Everything still fits before the exam.')+'</p>'+(showMoved ? movedSummary(pl) : '')+'</section>';
  var nx = nextThing(pl), first = "";
  if(nx && nx.n && nx.n.kind==="slot"){ var sl = nx.n.x; first = (nx.day===pl.models[0].date ? "Today " : dayName(nx.day)+" ")+hm(sl.s)+": "+(sl.kind==="learn" && sl.parts && sl.parts[0] ? "Topic "+sl.parts[0].step.topic+", "+sl.parts[0].step.name : sl.kind==="quiz" ? "Topic "+sl.quiz+" quiz, timed" : "question cards"); }
  else if(nx && nx.n && nx.n.kind==="leave"){ first = "Leave at "+hm(nx.n.x.leg.leave)+" for "+((place(nx.n.x.leg.to)||{}).name||""); }
  h += '<section class="card"><h2>3. Your intention</h2>'+(first?'<p>Your first station: <b>'+esc(first)+'</b></p>':'')+'<label class="f">One sentence for today<input type="text" id="ci-intent" value="'+esc(j.intent||"")+'" placeholder="e.g. Just the first station, then we see"></label></section>';
  h += '<button class="btn" data-pcheckin="go">Start my day</button>';
  h += '<p class="note" style="text-align:center"><button class="btn small ghost" data-pcheckin="skip">Skip the check-in today</button></p>';
  return h;
}

/* ---------- the line to the exam: day map + stations ---------- */
var lineView = "day";
function vLine(){
  var p = P(), pl = plan(), ds = days(); if(!selDay || ds.indexOf(selDay)<0) selDay = ds[0];
  var all = pl.slots, lit = all.filter(function(s){ return p.done[s.id]; }).length;
  var h = countdown()+'<div class="stack"><h1>Your line to the exam</h1><p class="lead">Every study slot is a station. Finish one and it lights up. Missing one is fine: its work moves on to your next stations by itself.</p></div>';
  h += '<div class="pl-progress" aria-label="'+lit+' of '+all.length+' stations lit"><i style="width:'+(all.length?Math.round(lit/all.length*100):0)+'%"></i></div><p class="note">'+lit+' of '+all.length+' stations lit.</p>';
  h += '<div class="two"><button class="opt" data-pview="day" aria-pressed="'+(lineView==="day")+'">Day</button><button class="opt" data-pview="week" aria-pressed="'+(lineView==="week")+'">Week</button></div>';
  if(lineView==="week"){
    h += '<section class="card"><div class="pl-metro">'+pl.models.map(function(md){
      return '<div class="pl-mrow"><span class="d">'+dayName(md.date)+'</span><span class="ln">'+md.slots.map(function(s){ return '<i class="st '+(p.done[s.id]?"on":"")+' '+(s.missed?"missed":s.kind)+'" title="'+hm(s.s)+'"></i>'; }).join("")+(md.date===p.exam.date?'<i class="st exam" title="Exam"></i>':'')+'</span></div>'; }).join("")+'</div>'+
      '<p class="note">Big dots: new ladder steps. Small dots: question cards and review. The last stop is the exam.</p></section>';
  } else {
    h += '<div class="pl-days">'+ds.map(function(d){ return '<button class="pl-day'+(d===selDay?" on":"")+(d===p.exam.date?" exam":"")+'" data-pday="'+d+'"><span>'+dayName(d)+'</span></button>'; }).join("")+'</div>';
    var md = pl.models[ds.indexOf(selDay)];
    h += '<div id="pl-map" class="pl-map tall" aria-label="Route of this day"></div>';
    var stops = [];
    md.items.forEach(function(x){ if(x.type==="travel") stops.push([x.s, '<li class="go"><span class="dot"></span><div>'+legText(x.leg)+'</div></li>']); else stops.push([x.s, '<li class="fx"><span class="dot"></span><div><b>'+hm(x.s)+'</b> '+esc(x.ev.title)+'</div></li>']); });
    md.slots.forEach(function(s){ stops.push([s.s, '<li class="sl'+(p.done[s.id]?" on":"")+(s.missed?" missed":"")+'"><span class="dot"></span><div>'+slotText(s)+'<br>'+doneBtn(s)+'</div></li>']); });
    stops.sort(function(a,b){ return a[0]-b[0]; });
    h += '<ol class="pl-line">'+stops.map(function(x){ return x[1]; }).join("")+(selDay===p.exam.date?'<li class="ex"><span class="dot"></span><div><b>'+esc(p.exam.time)+'</b> IFRS exam. You made it here.</div></li>':'')+'</ol>';
  }
  return h+'<a class="btn ghost" href="#plan">Back to the calendar</a>';
}

/* ---------- maps ---------- */
var map = null, manWarn = "";
function drawMap(r){
  var el = document.getElementById("pl-map"); if(map){ try{ map.remove(); }catch(e){} map = null; }
  if(!el || !window.L) return;
  var p = P(), L = window.L;
  map = L.map(el, {zoomControl:false, dragging:!L.Browser.mobile, tap:false, scrollWheelZoom:false, attributionControl:true, fadeAnimation:false, zoomAnimation:false, markerZoomAnimation:false}).setView([52.49, 13.33], 10);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom:18, attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
  var pts = [], icon = function(txt, cls){ return L.divIcon({className:"pl-pin "+(cls||""), html:'<span>'+txt+'</span>', iconSize:null}); };
  if(r==="plan/check" && curLeg){
    var A0 = place(curLeg.from), B0 = place(curLeg.to), ln0 = curLeg.line || [[A0.lat,A0.lon],[B0.lat,B0.lon]];
    L.polyline(ln0, {color:"#D9482B", weight:5}).addTo(map); pts = ln0.slice();
    L.marker([A0.lat,A0.lon], {icon:icon(esc(A0.name), A0.kind)}).addTo(map); L.marker([B0.lat,B0.lon], {icon:icon(esc(B0.name), B0.kind)}).addTo(map);
  } else if(r==="plan/check"){ if(map){ map.remove(); map = null; } return; }
  else if(/^plan\/setup\/2/.test(r)){
    p.places.forEach(function(x){ L.marker([x.lat,x.lon], {icon:icon(esc(x.name), x.kind)}).addTo(map); pts.push([x.lat,x.lon]); });
  } else {
    var md = dayModel(selDay), used = {};
    md.legs.forEach(function(l){ var ln = l.line || [[place(l.from).lat,place(l.from).lon],[place(l.to).lat,place(l.to).lon]]; L.polyline(ln, {color:"#D9482B", weight:4, opacity:.85, dashArray:l.src==="estimate"?"6 6":null}).addTo(map); pts = pts.concat(ln);
      if(!used[l.to]){ used[l.to] = 1; var B = place(l.to); L.marker([B.lat,B.lon], {icon:icon((l.to==="home"?"":"Leave "+hm(l.leave)+" → ")+esc(B.name), B.kind)}).addTo(map); } });
    var H = place("home"); L.marker([H.lat,H.lon], {icon:icon("Home","home")}).addTo(map); pts.push([H.lat,H.lon]);
  }
  if(pts.length > 1) map.fitBounds(pts, {padding:[24,24], animate:false}); else if(pts.length) map.setView(pts[0], 13, {animate:false});
}

/* ---------- routing hooks used by the main app ---------- */
window.FLPlan = {
  match: function(r){ return r==="plan" || r==="journal" || /^plan\//.test(r); },
  view: function(r){
    P(); geocodeSeeds();
    if(r==="plan") return vHome();
    if(r==="journal") return vJournal();
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
  if(d.pgo){ var pg2 = d.pgo.split("|"), st = FL.S; st.tg = st.tg || {}; var g0 = st.tg[pg2[0]] = st.tg[pg2[0]] || {stage:"q", ri:0, cur:"", guess:-1, done:{}};
    if(g0.stage==="step" || g0.stage==="exam" || g0.guess>=0) { g0.stage = "step"; g0.cur = pg2[1]; } else g0.cur = pg2[1];
    st.tview = st.tview || {}; st.tview[pg2[0]] = ""; save(); FL.go("topic-"+pg2[0]); return; }
  if(d.jday){ jDay = d.jday; ventSaved = ""; FL.render(); return; }
  if(d.jmood){ var jm = jr(jDay).mood; jm[d.jmood] = !jm[d.jmood]; save(); FL.render(); return; }
  if(d.jif){ var ji = jr(jDay).ifthen; ji[d.jif] = !ji[d.jif]; save(); FL.render(); return; }
  if(d.jsave){ jr(jDay).vent = (document.getElementById("j-vent")||{}).value || ""; ventSaved = jDay; save(); FL.render(); return; }
  if(d.pics){ var blob = new Blob([icsFor(d.pics)], {type:"text/calendar"}), a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "finish-line-"+d.pics+".ics"; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000); return; }
  if(d.pmode){ p.mode = d.pmode; save(); FL.render(); return; }
  if(d.pview){ lineView = d.pview; FL.render(); return; }
  if(d.pdel){ p.places = p.places.filter(function(x){ return x.id!==d.pdel; }); p.events.forEach(function(ev){ if(ev.place===d.pdel) ev.place = "home"; }); save(); FL.render(); return; }
  if(d.padd){ var r0 = searchRes[+d.padd]; if(r0){ var id = "p"+Date.now().toString(36); p.places.push({id:id, name:r0.label.split(",")[0], kind:"cafe", addr:r0.label, lat:r0.lat, lon:r0.lon, park:10}); p.geo[id] = "ok"; searchRes = []; searchMsg = ""; save(); FL.render(); } return; }
  if(d.pedel){ p.events = p.events.filter(function(x){ return x.id!==d.pedel; }); save(); FL.render(); return; }
  if(d.peadd){ p.events.push({id:"e"+Date.now().toString(36), title:"New", kind:"other", place:"home", date:d.peadd, start:"10:00", end:"11:00", flex:"fixed"}); save(); FL.render(); return; }
  if(d.pchk){ var a = d.pchk.split("|"), tt = p.travel[a[0]] = p.travel[a[0]] || {}; tt.checkedState = a[1]; save(); if(a[1]==="no") checkIdx++; FL.render(); window.scrollTo(0,0); return; }
  if(d.pdec){ var b = d.pdec.split("|"), before = checkItems(), stay = /^ev-/.test(b[0]) && b[1]==="drop" && (p.events.filter(function(e){ return "ev-"+e.id===b[0]; })[0]||{}).kind==="work";
    var target = before[Math.min(checkIdx + (stay?0:1), before.length-1)].id;
    p.decisions[b[0]] = b[1]; p.confirmed = false; save();
    var after = checkItems(), ni = after.map(function(x){ return x.id; }).indexOf(target); checkIdx = ni >= 0 ? ni : Math.min(checkIdx+1, after.length-1);
    FL.render(); window.scrollTo(0,0); return; }
  if(d.pck){ checkIdx += +d.pck; FL.render(); window.scrollTo(0,0); return; }
  if(d.pcopy){ var evc = p.events.filter(function(z){ return z.id===d.pcopy; })[0]; if(evc && navigator.clipboard){ navigator.clipboard.writeText("Hi! Could I swap or give away my shift on "+dayName(evc.date,true)+" ("+evc.start+"–"+evc.end+")? My exam is the next morning. Happy to take another shift next week instead. Thank you!").then(function(){ copied = evc.id; FL.render(); }); } return; }
  if(d.pdone){
    if(armed !== d.pdone){ armed = d.pdone; FL.render(); clearTimeout(armT); armT = setTimeout(function(){ armed = ""; FL.render(); }, 5000); return; }
    armed = ""; clearTimeout(armT); lightSlot(d.pdone); save(); FL.render(); if(window.FL.confetti) window.FL.confetti(); return; }
  if(d.cisave){ var tv = document.getElementById("ci-vent"); if(tv){ jr(jToday()).vent = tv.value; ciSaved = jToday(); save(); FL.render(); } return; }
  if(d.nowoff){ nowOff = !nowOff; FL.render(); return; }
  if(d.jlow){ var jl = jr(d.jlow); jl.low = !jl.low; save(); FL.render(); return; }
  if(d.htog){ var ht = d.htog.split("|"), jh = jr(ht[0]); jh.hab = jh.hab || {}; jh.hab[ht[1]] = !jh.hab[ht[1]]; save(); FL.render(); return; }
  if(d.hadd){ var ha = d.hadd.split("|"), sg = HABIT_SUGG[ha[0]].filter(function(s){ return s[0]===ha[1]; })[0]; if(sg && !habits().some(function(x){ return x.id===sg[0]; })){ habits().push({id:sg[0], name:sg[1], kind:ha[0]}); var jh2 = jr(ha[2]); jh2.hab = jh2.hab || {}; jh2.hab[sg[0]] = true; save(); } FL.render(); return; }
  if(d.hcustom){ var hc = d.hcustom.split("|"), nm = ((document.getElementById("h-new")||{}).value||"").trim(); if(nm){ var hid = "h"+Date.now().toString(36); habits().push({id:hid, name:nm.slice(0,60), kind:hc[0]}); var jh3 = jr(hc[1]); jh3.hab = jh3.hab || {}; jh3.hab[hid] = true; save(); } FL.render(); return; }
  if(d.reflect){ var rt = reflectPrompt(), fin = function(){ reflectCopied = true; FL.render(); window.open("https://claude.ai/new", "_blank"); }; if(navigator.clipboard) navigator.clipboard.writeText(rt).then(fin, fin); else fin(); return; }
  if(d.pmoved){ showMoved = !showMoved; FL.render(); return; }
  if(d.pundo){ delete p.done[d.pundo]; if(p.log) delete p.log[d.pundo]; save(); FL.render(); return; }
  if(d.pcheckin){ var jc = jr(jToday()), ta = document.getElementById("ci-vent"), ti = document.getElementById("ci-intent");
    if(ta) jc.vent = ta.value; if(ti) jc.intent = ti.value; jc.checkin = d.pcheckin === "skip" ? "skipped" : new Date().toISOString(); save(); FL.render(); window.scrollTo(0,0); return; }
  if(t.id==="pl-acceptrec"){ cards(plan()).forEach(function(c){ if(!p.decisions[c.id]) p.decisions[c.id] = c.rec; }); save(); FL.render(); return; }
  if(t.id==="pl-confirm"){ p.confirmed = true; save(); FL.go("plan/line"); return; }
});
app.addEventListener("change", function(e){
  var t = e.target, p = P(), d = t.dataset;
  if(d.pf){ setPath(p, d.pf, d.pf==="stepMin" ? +t.value : t.value); save(); FL.render(); }
  if(d.pp){ var a = d.pp.split("."), x = place(a[0]); if(x){ x[a[1]] = a[1]==="park" ? +t.value : t.value; save(); FL.render(); } }
  if(d.pe){ var b = d.pe.split("."), ev = p.events.filter(function(z){ return z.id===b[0]; })[0]; if(ev){ ev[b[1]] = t.value; save(); FL.render(); } }
  if(d.pjc){ var c2 = d.pjc.split("|"); jr(c2[0]).checks[c2[1]] = t.checked; save(); return; }
  if(d.jfood){ jr(jDay).food[d.jfood] = t.value; save(); return; }
  if(t.id==="ci-vent"){ jr(jToday()).vent = t.value; save(); return; }
  if(t.id==="ci-intent"){ jr(jToday()).intent = t.value; save(); return; }
  if(d.jfoodok){ jr(jDay).food.ok = t.checked; save(); return; }
  if(d.pman){ var tr = p.travel[d.pman] = p.travel[d.pman] || {}, ks = d.pman.split(">"), v = parseMin(t.value);
    if(v && implausible(v, place(ks[0]), place(ks[1]), tr.min)){ manWarn = "Google Maps probably said something like \"1 h "+v+" min\". Type it just like that, with the h."; tr.manual = null; }
    else { manWarn = ""; tr.manual = v || null; }
    save(); FL.render(); }
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
