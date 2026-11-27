/* Finish Line: HRM (HM01) exam section. Exam-first: practice papers in the exam's format
   (20 MCQ + a case with a 4-point and a 6-point question), cards, and a theory overview on the side. */
(function(){
"use strict";
var FL = window.FL; if(!FL) return;
var esc = FL.esc;
var D = {"qs": [], "papers": {}, "pcase": {}, "sess": [], "topics": {}, "th": {}, "classc": [], "cc": [], "dr": [], "sessn": {}, "cases": [{"id": "insight", "title": "Practice paper 1 · Insight Timer (Dec 2023 exam)", "src": "Real ESCP exam, Main Track, Dec 2023 (Prof. Huynh). 6 questions, 20 points, 2 hours. Your time with extra time: 2h40.", "text": "Read the full case first (8 pages plus 7 exhibits): tap \"Open the exam paper\" above. Reading it carefully takes about 20–25 minutes.\n\nThe case in brief: Insight Timer is a meditation app with 25 million registered users and the largest share of usage. It offers 180k free guided meditations from 16k teachers, no advertising, live group sessions and 12,000+ community groups. A paid subscription ($60 a year) unlocks offline listening and a few courses. Revenue is split: 30% to Apple or Google, then teachers keep half of the rest. Donations carry a 20% fee, which it waived on Stripe. It has 70 employees (Headspace has 800+, Calm 300), costs about $1M a month to run, isn't profitable yet, never advertises and grows by word of mouth. Its CEO, Christopher Plowman, keeps a low profile. Content is in 47 languages and 37 confessions, with spiritual depth. It has refused heavy gamification. It struck a deal with Walmart+ (60m members). Rivals: Headspace (science, gamification, B2B 'Headspace for Work', bought Ginger, seeking FDA approval) and Calm (sleep stories, celebrities, entertainment), both $69.99 a year. There are 20,000+ apps, an app costs $10k–100k to build, teaching meditation is unregulated, and YouTube offers free content. Apple Watch has free mindfulness features. The future brings generative AI, privacy rules and possible scandals.", "doc": "st-exam-2023", "qs": [{"pts": 5, "mins": 30, "q": "Using Porter's Five Forces framework, assess the attractiveness of the meditation application industry.", "check": ["Covers all five forces by name (rivalry, threat of entry, substitutes, buyer power, supplier power)", "Rates each force (high / medium / low) with a fact from the case for each", "Uses specific numbers or facts (20,000+ apps, $10k–100k development, free YouTube and Apple content, 30% app store fee, $69.99 pricing, nobody profitable)", "Ends with an overall verdict on attractiveness", "No padding: every point is tied to the industry, not general text"], "model": "Overall verdict: low to moderate attractiveness. That's why none of the big players is profitable.\n\n1. Rivalry: high. There are 20,000+ apps. Headspace and Calm both charge $69.99 a year and compete on content and celebrities (Calm's Sleep Stories with Matthew McConaughey). Many players price close together, and none is profitable (Insight Timer, Headspace and Calm all lose money).\n\n2. Threat of new entrants: high. Building an app costs only $10k–100k, teaching meditation isn't regulated, and there's no recognised professional body. Barriers are brand, content libraries and communities, but new players 'with little credential' are expected to enter as demand grows.\n\n3. Threat of substitutes: high. Free YouTube channels (Great Meditation, the Mindful Moment), Apple Watch's free mindfulness features, fitness platforms with meditation (Glo, Alo Moves, Apple Fitness+), in-person classes, books and therapy. And once trained, a student no longer needs the app at all.\n\n4. Buyer power: medium to high. Switching costs are low and much content is free. Individual buyers are fragmented, but large corporate clients (Headspace for Work, Calm's 3,500 corporate clients) and partners like Walmart+ (60m users) can negotiate hard.\n\n5. Supplier power: medium to high. Apple and Google take 30% of revenue as distribution gatekeepers. Star teachers and celebrities (Calm's narrators, Universal Music) can ask for a lot: Insight Timer gives teachers half of the remaining 70%. Cloud hosting (Google Cloud, AWS) is a commodity with low power.\n\nConclusion: strong forces on almost every side keep margins low. Profitability depends on differentiating, for example Insight Timer's community, which raises switching costs."}, {"pts": 4, "mins": 25, "q": "Using a VRIO analysis, determine two resources or capabilities providing Insight Timer with a competitive advantage.", "check": ["Picks exactly two specific resources or capabilities (not vague 'brand')", "Runs each through all four VRIO tests: Valuable, Rare, Inimitable, Organised", "Uses case facts for each test", "Concludes the type of advantage (sustained, temporary, parity)"], "model": "Resource 1: the community of teachers and students (16k teachers, 12,000+ groups, live sessions)\n- Valuable: yes. It keeps even advanced users on the platform (they'd otherwise leave once trained) and attracts teachers who earn up to $100k+. Network effects: more students attract more teachers, and vice versa.\n- Rare: yes. Headspace and Calm offer convenient, asynchronous, mostly in-house content. YouTube has audiences but no structured live community.\n- Inimitable: hard to copy. It was built organically since 2011 (Fullmer's group features), with social complexity, trust and path dependency. Rivals' business models (in-house content, celebrities) conflict with it.\n- Organised: yes. Revenue sharing with teachers (half after the store fee), donations requested by the community, decisions taken by consulting the community.\n→ Sustained competitive advantage.\n\nResource 2: a low-cost, word-of-mouth operating model\n- Valuable: yes. 70 employees vs 800+ (Headspace), no advertising, cheap Google Cloud hosting (~$1M a month): growth to 25m users without marketing costs.\n- Rare: yes. Competitors spend heavily on marketing and celebrities.\n- Inimitable: partly. Rivals could cut costs, but their brands depend on advertising and public figures, so copying it would undermine their own positioning.\n- Organised: yes. A lean structure and a discreet founder fit the model.\n→ Competitive advantage, possibly temporary if rivals restructure.\n\n(Other defensible options: the breadth of the content library in 47 languages and 37 confessions; free access as a positioning choice.)"}, {"pts": 3, "mins": 20, "q": "What are the factors in the macroenvironment influencing the development of the meditation application industry? Propose two factors fostering and two factors hindering the development and discuss how incumbent players are interrelated through some of the suggested factors.", "check": ["Names the framework (PESTEL) and gives 2 fostering and 2 hindering factors, each labelled (social, technological, legal…)", "Each factor is backed by a case fact", "Discusses how incumbents are interrelated through a factor (e.g. app stores, regulation or AI affect all; one scandal hurts all)"], "model": "Framework: PESTEL.\n\nFostering\n1. Social: rising awareness of mental health. Covid pushed first-time installs from 115m to 238m (March to April 2020); 800m people live with a mental condition; the wellness market is worth $1.5T and growing 5–10% a year; there's scientific recognition (MBSR).\n2. Technological: smartphones and wearables make practice easy to fit into daily life; cheap cloud hosting; AI can personalise and enable new services (Woebot).\n\nHindering\n1. Legal/regulatory: data privacy (the FTC's proposed order against BetterHelp sharing health data) and possible requirements for regulatory approval when health benefits are claimed (FDA).\n2. Social/cultural: scandals and the 'mysticism' image could damage trust; unsupervised AI chatbots may harm users; there are adoption gaps in low-income countries.\n\nInterrelation: incumbents share these factors, so one firm's actions affect all. A privacy scandal or harmful AI chatbot at one app would hurt trust in the whole category. Regulation such as FDA approval would raise barriers for everyone: Headspace's pursuit of it would set the bar. All depend on Apple and Google's app stores and policies. All benefit together from rising awareness, which also attracts more entrants."}, {"pts": 3, "mins": 20, "q": "Give an example of vertical integration that Insight Timer can engage with and discuss its strategic consequences.", "check": ["Gives a concrete example and says whether it's backward (upstream) or forward (downstream)", "Explains the logic: transaction costs, control, capturing margin", "Discusses at least one benefit and one cost or risk, linked to Insight Timer's model or identity"], "model": "Example: forward integration into distribution, i.e. selling subscriptions directly through its own website and payment system (as it began doing with Stripe for donations) instead of through Apple and Google's app stores.\n\nBenefits\n- It captures the 30% app store margin. Revenue per subscriber rises sharply, which matters for a firm aiming at profitability in 2024.\n- Direct customer relationship and data, plus less dependence on a powerful supplier (lower supplier power in Five Forces terms).\n\nCosts and risks\n- Users are used to paying in the app; friction may lower conversion. Apple and Google restrict links to outside payment, so there's a risk of conflict with the gatekeepers it still needs for distribution.\n- It needs payment, billing and customer service capabilities: more staff in a 70-person firm.\n\nAlternative example: backward integration by producing in-house content (like Headspace). Insight Timer shouldn't do this: it would conflict with its identity as an open platform for many teachers and weaken the community advantage.\n\nConclusion: partial forward integration (direct web subscriptions alongside the stores) keeps reach while capturing margin."}, {"pts": 2, "mins": 13, "q": "What could be the motives for Insight Timer to expand internationally and are Insight Timer's resources and capabilities consistent with international expansion? Build your argumentation on a model studied in class.", "check": ["Gives 1–2 motives (market seeking: growth in big markets; spreading fixed costs)", "Names a model and applies it (e.g. CAGE distance, or the link between firm resources and country factors)", "Judges fit: 47 languages, 37 confessions, cultural adaptability and low-cost platform vs. local preferences and regulation"], "model": "Motives\n- Market seeking: demand varies by country (Exhibits 5–6). Countries with meditation traditions (India, Thailand) or high stress (Japan, South Korea) offer growth as Western markets mature.\n- Economies of scale: the platform's costs (~$1M a month) are mostly fixed, so more users spread them out.\n\nModel (⚠ use the model from your slides; here Ghemawat's CAGE distance framework as an example)\n- Cultural distance is the key barrier for meditation, which is tied to religion and local practice. Insight Timer is well equipped: 47 languages, 37 confessions, spiritual content and local teachers who create content for their own culture. That's better than Headspace or Calm's single, functional, Western approach.\n- Administrative distance: health-data and privacy rules differ by country, so compliance is needed.\n- Economic distance: low income limits paid subscriptions, but a free model fits.\n\nConclusion: resources fit well. The community of local teachers is a platform that internationalises 'by itself', but monetisation in poorer markets is weak."}, {"pts": 3, "mins": 20, "q": "Propose two ways for Insight Timer to improve profitability in the long term. What would be the tradeoffs for Insight Timer? In particular, explain how these actions undermine or reinforce the company's competitive advantage and how the proposed strategic moves relate to the company's identity.", "check": ["Proposes two concrete moves (e.g. B2B offer for employers, premium tier or courses, direct payments, partnerships like Walmart+)", "For each: the trade-off (revenue vs. reach, community, free access)", "Links each to the competitive advantage from Q2 (reinforce or undermine)", "Links to identity: free, community, spiritual depth, no gamification, 'a force for good'"], "model": "Move 1: a B2B offer for employers and partnerships (like Walmart+), e.g. 'Insight Timer for Teams' with group live sessions.\n- Profit: recurring, larger contracts, while the platform's low cost keeps margins high.\n- Trade-off: corporate clients prefer neutral, functional content (as Plowman says, rivals avoid spirituality for this reason); it needs a sales team and analytics.\n- Advantage: reinforces the community (groups for companies), but risks diluting the spiritual depth that differentiates it.\n- Identity: acceptable if it keeps the open catalogue and adds a corporate track, rather than reshaping the whole platform.\n\nMove 2: deepen paid features for advanced practitioners (premium courses, teacher-led programmes, live retreats) with revenue sharing, while keeping basic content free.\n- Profit: monetises engaged users, who are the ones who stay for the community.\n- Trade-off: a bigger paywall could reduce reach (when it removed registration, subscriptions plummeted, showing how sensitive the model is).\n- Advantage: reinforces it, since teachers earn more, attracting more and better teachers (network effects).\n- Identity: consistent with the master-student tradition and with 'free basics for all' if the core stays free.\n\nAvoid: advertising or heavy gamification. They'd bring money but contradict the identity (no ads, no 'performance' in meditation) and weaken the trust that holds the community together."}]}], "meta": {"title": "Strategy exam · Mon 14 Dec, 10:00", "fmtTitle": "The format (2h + 40 min, closed book)", "fmtBody": "One long case (about 8 pages plus exhibits), then about 6 open questions worth 20 points. Each question names a framework to apply (Five Forces, VRIO, macro-environment, vertical integration, internationalisation, profitability trade-offs). The exam is 50% of your grade; below 8/20 you fail the whole course.", "fmtTip": "Timing with your extra time: 20–25 min to read the case, then about 6–7 minutes per point. Only the reasoning counts and irrelevant arguments lose points: name the framework, go through it, back every point with a case fact, and end with a verdict.", "casePapers": true, "note": "Practice paper 1 is a real ESCP exam, but from the Main Track (Prof. Huynh), not Prof. Knyphausen-Aufseß's. The model answers are mine. Theories, class cases, drills and cards come when you send the slides.", "back": "Strategy exam", "markTitle": "What markers look for in each answer", "markBody": "1. The framework named and used completely (all five forces, all four VRIO tests). 2. Every point backed by a fact or number from the case. 3. A clear verdict or recommendation. 4. Nothing off-topic: irrelevant arguments cost points."}};
var QI = {}; D.qs.forEach(function(q){ QI[q.id] = q; });
var CI = {}; D.cases.forEach(function(c){ CI[c.id] = c; });
var LET = "abcd";
var tick = null, CQ = null;

function H(){ var s = FL.S; if(!s.st) s.st = {p:{}, c:{}, log:{}}; ["p","c","log"].forEach(function(k){ if(!s.st[k]) s.st[k] = {}; }); return s.st; }
function P(n){ var h = H(); if(!h.p[n]) h.p[n] = {ans:{}, done:false}; return h.p[n]; }
function C(id){ var h = H(); if(!h.c[id]) h.c[id] = {a:{}, mk:{}, shown:{}}; return h.c[id]; }
function save(){ FL.save(); }
function tname(t){ return D.topics[t] || t; }
function para(s){ return esc(s).split(/\n\n+/).map(function(p){ return "<p>"+p.replace(/\n/g,"<br>")+"</p>"; }).join(""); }
function words(s){ return (String(s||"").trim().match(/\S+/g)||[]).length; }

/* ---------- styles ---------- */
var css = document.createElement("style");
css.textContent = [
".hr .opt{display:flex;gap:10px;align-items:flex-start;text-align:left;font:inherit;width:100%;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:10px 12px;cursor:pointer;margin-top:6px}",
".hr .opt b{min-width:1.2em}",
".hr .opt.sel{border-color:var(--deep);box-shadow:inset 0 0 0 2px var(--deep)}",
".hr .opt.right{background:var(--good-bg);border-color:var(--good)}",
".hr .opt.wrong{background:var(--warn-bg);border-color:var(--warn)}",
".hr .why{font-size:14px;background:var(--bg);border-left:3px solid var(--deep);padding:8px 10px;border-radius:6px}",
".hr .qn{font-size:13px;color:var(--muted);font-weight:600}",
".hr .sticky{position:sticky;top:0;z-index:5;background:var(--bg);padding:8px 0;border-bottom:1px solid var(--line)}",
".hr textarea{min-height:220px;line-height:1.45}",
".hr .ck{display:flex;gap:10px;align-items:flex-start;text-align:left;font:inherit;width:100%;background:transparent;color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:9px 11px;cursor:pointer}",
".hr .ck.on{background:var(--good-bg);border-color:var(--good)}",
".hr .model{white-space:pre-wrap;font-size:14.5px;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:12px}",
".hr .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
".hr .tile{display:block;text-decoration:none;color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px}",
".hr .tile small{display:block;color:var(--muted)}",
".hr details{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 12px}",
".hr details summary{cursor:pointer;font-weight:600}",
".hr .th{border-top:1px solid var(--line);padding-top:8px;margin-top:8px;font-size:14.5px}",
".hr .th .use{color:var(--deep);font-weight:600}",
".hr .chips{display:flex;flex-wrap:wrap;gap:6px}",
".hr .chips a{font-size:13px;padding:5px 10px;border:1px solid var(--line);border-radius:999px;text-decoration:none;color:var(--ink);background:var(--surface)}",
".hr .casebox{font-size:15px}",
".hr .casebox p{margin:0 0 10px}",
".hr .big{font-size:28px;font-weight:700}",
".hr .hook{background:var(--warn-bg);border-radius:8px;padding:8px 10px;margin:6px 0}",
".hr .exs{background:var(--good-bg);border-radius:8px;padding:8px 10px;margin:6px 0;font-style:italic}",
".hr .exs b,.hr .hook b{font-style:normal;display:block;font-size:13px}"
].join("\n");
document.head.appendChild(css);

/* ---------- home ---------- */
function paperScore(n){ var p = P(n), ids = D.papers[n], r = 0; ids.forEach(function(id, i){ if(p.ans[i]===QI[id].a) r++; }); return r; }
function caseScore(id){ var c = C(id), cs = CI[id], s = 0, any = false;
  cs.qs.forEach(function(q, i){ var mk = c.mk[i]||{}, n = 0; q.check.forEach(function(_, j){ if(mk[j]) n++; }); if(c.shown[i]) any = true; s += q.pts * n / q.check.length; });
  return any ? Math.round(s*10)/10 : null; }

function vHome(){
  var h = H(), M = D.meta, seen = Object.keys(h.log).length, miss = Object.keys(h.log).filter(function(k){ return h.log[k].miss; }).length;
  var pp = Object.keys(D.papers||{}).map(function(n){
    var p = P(n), cid = D.pcase[n], cs = cid ? caseScore(cid) : null, lab = (M.paperLabels && M.paperLabels[n]) || ("Paper "+n);
    var st = p.done ? '<span class="pill solid">MCQ '+paperScore(n)+'/20</span>' : (Object.keys(p.ans).length ? '<span class="pill prog">MCQ in progress</span>' : '<span class="pill todo">MCQ not started</span>');
    var st2 = cs!==null ? '<span class="pill solid">case ≈ '+cs+'/10</span>' : '';
    return '<div class="card"><div class="row"><b>'+esc(lab)+'</b><span>'+st+' '+st2+'</span></div>'+
      '<div class="grid2"><a class="btn" href="#st/paper/'+n+'">20 MCQs</a>'+(cid ? '<a class="btn ghost" href="#st/case/'+cid+'">Case: '+esc(CI[cid].title)+'</a>' : '<a class="btn ghost" href="#st/cases">Reuse any case</a>')+'</div></div>';
  }).join("");
  if(!pp && M.casePapers){
    pp = D.cases.map(function(c){ var cs = caseScore(c.id), tot = c.qs.reduce(function(a, q){ return a+q.pts; }, 0);
      return '<a class="tile" href="#st/case/'+c.id+'"><div class="row"><b>'+esc(c.title)+'</b>'+(cs!==null?'<span class="pill solid">≈ '+cs+'/'+tot+'</span>':'<span class="pill todo">'+c.qs.length+' questions · '+tot+' pts</span>')+'</div><small>'+esc(c.src)+'</small></a>'; }).join("");
  }
  var out = '<div class="hr stack"><h1>'+esc(M.title)+'</h1>'+
  '<div class="card"><b>'+esc(M.fmtTitle)+'</b><div>'+esc(M.fmtBody)+'</div><div class="lead">'+esc(M.fmtTip)+'</div></div>';
  if(pp) out += '<h2>Practice papers</h2>'+pp;
  if(D.dr && D.dr.length) out += '<h2>Case drills</h2><a class="tile" href="#st/drill" style="border-color:var(--deep)"><b>'+D.dr.length+' new cases, answered the exam way</b><small>'+esc(M.drillTip||"Theory applied to case facts, a second theory, a class case, then a recommendation. Write yours, then compare with the answer key.")+'</small></a>';
  if(D.qs && D.qs.length) out += '<h2>Cards</h2><div class="card"><div class="lead">'+D.qs.length+' exam-style questions. '+seen+' seen, '+miss+' to redo.</div>'+
   '<a class="btn" href="#st/cards/mixed">Mixed cards (10)</a>'+(miss?'<a class="btn ghost" href="#st/cards/missed">Redo the '+miss+' I got wrong</a>':'')+
   '<div class="chips">'+Object.keys(D.topics).map(function(t){ return '<a href="#st/cards/'+t+'">'+esc(tname(t))+'</a>'; }).join("")+'</div></div>';
  var side = [];
  if(D.sess && D.sess.length) side.push('<a class="tile" href="#st/overview"><b>Sessions & theories</b><small>Each session with its theories: a story or memory trick, and an exam sentence</small></a>');
  if(D.cc && D.cc.length) side.push('<a class="tile" href="#st/cases"><b>Class cases</b><small>'+esc(M.ccTip||"")+'</small></a>');
  if(side.length) out += '<h2>On the side</h2><div class="grid2">'+side.join("")+'</div>';
  if(M.note) out += '<p class="lead" style="font-size:13px">'+esc(M.note)+'</p>';
  return out+'</div>';
}

/* ---------- MCQ paper ---------- */
function whyHtml(q, pk){
  if(pk===q.a) return '<div class="why">✓ Right: '+LET[q.a]+'. '+esc(q.w)+'</div>';
  var s = '<div class="why">';
  if(pk<0) s += '<b>Not answered.</b><br>';
  else s += '<b>✗ You picked '+LET[pk]+') '+esc(q.o[pk])+'.</b><br>Why not: '+esc((q.wn && q.wn[pk]) || "it doesn't match the concept the question describes; compare it with the right answer below.")+'<br><br>';
  return s + '<b>Right answer: '+LET[q.a]+') '+esc(q.o[q.a])+'.</b><br>'+esc(q.w)+'</div>';
}
function optBtns(q, picked, reveal, attr){
  return q.o.map(function(o, k){
    var cls = "opt" + (picked===k ? " sel" : "") + (reveal ? (k===q.a ? " right" : (picked===k ? " wrong" : "")) : "");
    return '<button class="'+cls+'" '+(reveal?'disabled ':'')+attr(k)+'><b>'+LET[k]+')</b><span>'+esc(o)+'</span></button>';
  }).join("");
}
function vPaper(n){
  var ids = D.papers[n]; if(!ids) return '<p>No such paper.</p>';
  var p = P(n), got = Object.keys(p.ans).length;
  if(!p.start && !p.done){ p.start = Date.now(); save(); }
  var head = p.done
    ? '<div class="card"><div class="big">'+paperScore(n)+' / 20</div><div class="lead">= '+(paperScore(n)/2)+' of 10 points. Wrong answers are marked; read the why under each one.</div>'+
      '<div class="grid2"><a class="btn" href="'+(D.pcase[n]?'#st/case/'+D.pcase[n]:'#st')+'">Now the case</a><button class="btn ghost" data-st="redo|'+n+'">Redo this paper</button></div></div>'
    : '<div class="sticky row"><span><b>Paper '+n+'</b> · '+got+'/20 answered</span><span class="pill prog" id="hr-clock">25:00</span></div>';
  var body = ids.map(function(id, i){
    var q = QI[id], pk = p.ans[i]; if(pk===undefined) pk = -1;
    return '<div class="card" id="q'+i+'"><div class="qn">'+(i+1)+' · '+esc(tname(q.t))+'</div><div>'+esc(q.q)+'</div>'+
      optBtns(q, pk, p.done, function(k){ return 'data-st="ans|'+n+'|'+i+'|'+k+'"'; })+
      (p.done ? whyHtml(q, pk) : '')+'</div>';
  }).join("");
  var foot = p.done ? '' : '<button class="btn" data-st="submit|'+n+'">Hand in and see my score</button>';
  return '<div class="hr stack"><a href="#st" class="lead">‹ '+esc(D.meta.back||"Exam home")+'</a><h1>'+(n==="1"?"Paper 1 · 2025 exam":"Paper "+n)+': multiple choice</h1>'+head+body+foot+'</div>';
}

/* ---------- case ---------- */
function vCase(id){
  var cs = CI[id]; if(!cs) return '<p>No such case.</p>';
  var c = C(id);
  var qh = cs.qs.map(function(q, i){
    var txt = c.a[i]||"", shown = c.shown[i], mk = c.mk[i]||{}, n = 0; q.check.forEach(function(_, j){ if(mk[j]) n++; });
    var mins = q.mins || (q.pts===4 ? 25 : 35);
    var s = '<div class="card"><div class="row"><b>Q'+(i+1)+' ('+q.pts+' points)</b><span class="pill prog" id="hr-ct'+i+'">'+mins+' min</span></div><div>'+esc(q.q)+'</div>'+
      '<textarea data-stta="'+id+'|'+i+'" placeholder="Write as you would on paper: short paragraphs, name the theory, apply it to a case fact, say what it means.">'+esc(txt)+'</textarea>'+
      '<div class="row"><span class="lead" id="hr-wc'+i+'">'+words(txt)+' words (one page ≈ 300–350)</span><button class="btn ghost" style="width:auto" data-st="ctimer|'+i+'|'+mins+'">Start '+mins+'-min timer</button></div>';
    if(!shown) s += '<button class="btn" data-st="show|'+id+'|'+i+'">I\'m done: mark my answer</button>';
    else {
      s += '<b>Tick what your answer does</b>'+q.check.map(function(t, j){ return '<button class="ck'+(mk[j]?' on':'')+'" data-st="mk|'+id+'|'+i+'|'+j+'"><span>'+(mk[j]?'☑':'☐')+'</span><span>'+esc(t)+'</span></button>'; }).join("")+
        '<div class="row"><span>Rough score</span><b>'+(Math.round(q.pts*n/q.check.length*10)/10)+' / '+q.pts+'</b></div>'+
        '<details><summary>Model answer</summary><div class="model">'+esc(q.model)+'</div></details>';
    }
    return s+'</div>';
  }).join("");
  return '<div class="hr stack"><a href="#st" class="lead">‹ '+esc(D.meta.back||"Exam home")+'</a><h1>Case: '+esc(cs.title)+'</h1><div class="lead">'+esc(cs.src)+'</div>'+
    (cs.doc ? '<a class="btn" href="#doc/'+cs.doc+'/1">Open the exam paper (full case and exhibits)</a>' : '')+'<details open><summary>'+(cs.doc?'The case in brief':'The case')+'</summary><div class="casebox">'+para(cs.text)+'</div></details>'+qh+
    '<div class="card"><b>'+esc(D.meta.markTitle)+'</b><div>'+esc(D.meta.markBody)+'</div></div></div>';
}

/* ---------- cards ---------- */
function pool(sel){
  var h = H();
  if(sel==="missed") return D.qs.filter(function(q){ return h.log[q.id] && h.log[q.id].miss; });
  return D.qs.filter(function(q){ return sel==="mixed" || q.t===sel; });
}
function newRound(sel){
  var h = H(), ps = pool(sel).slice();
  ps.forEach(function(q){ var l = h.log[q.id]; q._k = (l ? (l.miss ? 1 : 2) : 0) + Math.random(); });
  ps.sort(function(a, b){ return a._k - b._k; });
  CQ = {sel:sel, items:ps.slice(0, 10), i:0, picked:-1, right:0};
}
function vCards(sel){
  if(!CQ || CQ.sel!==sel) newRound(sel);
  var chips = '<div class="chips"><a href="#st/cards/mixed">Mixed</a>'+Object.keys(D.topics).map(function(t){ return '<a href="#st/cards/'+t+'">'+esc(tname(t))+'</a>'; }).join("")+'</div>';
  var title = sel==="mixed" ? "Mixed cards" : sel==="missed" ? "Cards I got wrong" : tname(sel);
  if(!CQ.items.length) return '<div class="hr stack"><a href="#st" class="lead">‹ '+esc(D.meta.back||"Exam home")+'</a><h1>'+esc(title)+'</h1><p>Nothing here right now.</p>'+chips+'</div>';
  if(CQ.i >= CQ.items.length){
    return '<div class="hr stack"><a href="#st" class="lead">‹ '+esc(D.meta.back||"Exam home")+'</a><h1>'+esc(title)+'</h1><div class="card"><div class="big">'+CQ.right+' / '+CQ.items.length+'</div>'+
      '<button class="btn" data-st="more">Keep going: 10 more</button></div>'+chips+'</div>';
  }
  var q = CQ.items[CQ.i], done = CQ.picked>=0;
  return '<div class="hr stack"><a href="#st" class="lead">‹ '+esc(D.meta.back||"Exam home")+'</a><div class="row"><h1 style="margin:0">'+esc(title)+'</h1><span class="pill prog">'+(CQ.i+1)+' / '+CQ.items.length+'</span></div>'+
    '<div class="card"><div class="qn">'+esc(tname(q.t))+(q.src?' · '+esc(q.src):'')+'</div><div>'+esc(q.q)+'</div>'+
    optBtns(q, CQ.picked, done, function(k){ return 'data-st="pick|'+k+'"'; })+
    (done ? whyHtml(q, CQ.picked)+'<button class="btn" data-st="next">Next</button>' : '')+'</div>'+chips+'</div>';
}

/* ---------- overview ---------- */
function thHtml(k){ var t = D.th[k]; if(!t) return "";
  var st = String(t.story||""), lab = /^Story:/.test(st) ? "📖 The story" : "🧠 Memory trick"; st = st.replace(/^(Story|Trick):\s*/,"");
  return '<div class="th"><b>'+esc(t.n)+'</b> <span class="lead">('+esc(t.who)+')</span>'+
    (st ? '<div class="hook"><b>'+lab+'</b><div>'+esc(st)+'</div></div>' : '')+
    '<div><b>What it says: </b>'+esc(t.what)+'</div>'+
    (t.ex ? '<div class="exs"><b>✍️ Exam sentence</b><div>'+esc(t.ex)+'</div></div>' : '<div><span class="use">In a case answer: </span>'+esc(t.use)+'</div>')+'</div>'; }
function vOverview(){
  return '<div class="hr stack"><a href="#st" class="lead">‹ '+esc(D.meta.back||"Exam home")+'</a><h1>Sessions & theories</h1>'+
    '<p class="lead">Tap a session. Each theory says what it is and how to use it in a case answer.</p>'+
    D.sess.map(function(s){
      return '<details><summary>S'+s.n+' · '+esc(s.title)+'</summary><div class="stack" style="margin-top:8px">'+
        '<div><b>Key question:</b> '+esc(s.q)+'</div><div><b>Class case:</b> '+esc(s.case)+'</div><div><b>Reading:</b> '+esc(s.read)+'</div>'+
        s.theory.map(thHtml).join("")+'<a class="btn ghost" href="#st/cards/'+s.t+'">Cards for this session</a></div></details>';
    }).join("")+'</div>';
}
function vClassCases(){
  return '<div class="hr stack"><a href="#st" class="lead">‹ '+esc(D.meta.back||"Exam home")+'</a><h1>Class cases</h1>'+
    '<p class="lead">Tap a case: the idea, the problem, what they did, whether it worked and why, the lessons, and the theories behind it.</p>'+
    D.cc.map(function(c){ return '<a class="tile" href="#st/cc/'+c.id+'"><div class="row"><b>'+esc(c.name)+'</b><span class="pill todo">'+esc(c.sess.split(" · ")[0])+'</span></div><small>'+esc(c.idea)+'</small></a>'; }).join("")+'</div>';
}
function vCC(id){
  var i = -1; D.cc.forEach(function(c, k){ if(c.id===id) i = k; }); if(i<0) return vClassCases();
  var c = D.cc[i], pv = D.cc[i-1], nx = D.cc[i+1];
  function sec(t, body){ return '<div class="card"><b>'+t+'</b><div>'+body+'</div></div>'; }
  return '<div class="hr stack"><a href="#st/cases" class="lead">‹ All class cases</a><h1>'+esc(c.name)+'</h1><div class="lead">'+esc(c.sess)+'</div>'+
    sec("The idea in one line", esc(c.idea))+
    sec("The main problem", esc(c.problem))+
    sec("What they did (the plan)", esc(c.plan))+
    sec("Did it work? Why or why not", esc(c.result))+
    sec("Lessons learnt", '<ul style="margin:0;padding-left:20px">'+c.lessons.map(function(l){ return '<li>'+esc(l)+'</li>'; }).join("")+'</ul>')+
    '<div class="card"><b>The theories behind it</b>'+c.th.map(thHtml).join("")+'</div>'+
    '<div class="card" style="border-color:var(--deep)"><b>One sentence for your exam answer</b><div class="why">'+esc(c.line)+'</div><div class="lead" style="font-size:13px">Swap X for the company in the exam case.</div></div>'+
    '<div class="grid2">'+(pv?'<a class="btn ghost" href="#st/cc/'+pv.id+'">‹ '+esc(pv.name)+'</a>':'<span></span>')+(nx?'<a class="btn ghost" href="#st/cc/'+nx.id+'">'+esc(nx.name)+' ›</a>':'')+'</div></div>';
}

/* ---------- case drills: the answer formula ---------- */
var STARTERS = [["Theory 1","According to [theory, author], … In this case, [fact from the case] shows … This leads to …"],["Theory 2","A second lens is [theory, author]: … Here, [another fact] means …"],["Class case","This is similar to [class case], where … "],["Recommendation","Therefore X should (1) …, (2) …, (3) … This would …, although [trade-off]."]];
function DD(id){ var h = H(); if(!h.d) h.d = {}; if(!h.d[id]) h.d[id] = {a:"", rv:0, ok:{}}; return h.d[id]; }
function vDrills(){
  var h = H();
  return '<div class="hr stack"><a href="#st" class="lead">‹ '+esc(D.meta.back||"Exam home")+'</a><h1>Case drills</h1>'+
    '<div class="card"><b>The formula for every case answer</b><div>1. Name a theory and apply it to facts from the case.<br>2. Name a second theory and apply it too.<br>3. Cite a class case.<br>4. End with a recommendation.</div><div class="lead">Each drill is a short case. Write your answer, then reveal the model answer one part at a time and compare.</div></div>'+
    D.dr.map(function(x){ var st = h.d && h.d[x.id], done = st && st.rv>=4;
      return '<a class="tile" href="#st/drill/'+x.id+'"><div class="row"><b>'+esc(x.title)+'</b><span class="pill '+(done?'solid':'todo')+'">'+(done?'done':esc(tname(x.t)).split(" ")[0])+'</span></div><small>'+esc(x.q)+'</small></a>'; }).join("")+'</div>';
}
function vDrill(id){
  var i = -1; D.dr.forEach(function(x, k){ if(x.id===id) i = k; }); if(i<0) return vDrills();
  var x = D.dr[i], st = DD(id), nx = D.dr[i+1];
  var parts = x.parts.map(function(p, k){
    if(k >= st.rv) return '';
    return '<div class="card"><div class="row"><b>'+(k+1)+'. '+esc(p[0])+'</b><button class="ck'+(st.ok[k]?' on':'')+'" style="width:auto" data-st="dok|'+id+'|'+k+'">'+(st.ok[k]?'☑ I had this':'☐ I had this')+'</button></div><div class="why" style="font-size:15px">'+esc(p[1])+'</div></div>';
  }).join("");
  var nOk = Object.keys(st.ok).filter(function(k){ return st.ok[k]; }).length;
  return '<div class="hr stack"><a href="#st/drill" class="lead">‹ All case drills</a><h1>'+esc(x.title)+'</h1><div class="lead">'+esc(tname(x.t))+'</div>'+
    '<div class="card casebox">'+para(x.text)+'</div>'+
    '<div class="card"><b>Question</b><div>'+esc(x.q)+'</div>'+
    '<details><summary>Sentence starters (if you\'re stuck)</summary>'+STARTERS.map(function(s){ return '<div class="th"><b>'+s[0]+'</b><div>'+esc(s[1])+'</div></div>'; }).join("")+'</details>'+
    '<textarea data-stdr="'+id+'" placeholder="Theory 1 + case facts… Theory 2 + case facts… Class case… Recommendation…">'+esc(st.a)+'</textarea>'+
    '<div class="lead" id="hr-dwc">'+words(st.a)+' words</div></div>'+
    parts+
    (st.rv<4 ? '<div class="grid2"><button class="btn" data-st="drv|'+id+'">Reveal '+(st.rv===0?'part 1':'next part')+'</button><button class="btn ghost" data-st="dall|'+id+'">Show all</button></div>'
             : '<div class="card"><div class="row"><b>You had</b><b>'+nOk+' / 4 parts</b></div>'+(nx?'<a class="btn" href="#st/drill/'+nx.id+'">Next drill: '+esc(nx.title)+'</a>':'<a class="btn" href="#st/drill">Back to all drills</a>')+'<button class="btn ghost" data-st="dreset|'+id+'">Hide answer and try again</button></div>')+
  '</div>';
}

/* ---------- case drills ---------- */
var SKEL = "Theory 1 (name + author):\nApplied to the case:\n\nTheory 2 (name + author):\nApplied to the case:\n\nClass case:\n\nRecommendation (+ trade-off):\n";
function Dd(id){ var h = H(); if(!h.d) h.d = {}; if(!h.d[id]) h.d[id] = {a:"", shown:false, mk:{}}; return h.d[id]; }
var DCK = ["Named at least 2 theories with authors","Applied each theory to specific facts from this case (numbers, quotes, events)","Cited a class case and said why it's similar","Ended with a concrete recommendation (and a trade-off)"];
function vDrills(){
  return '<div class="hr stack"><a href="#st" class="lead">‹ '+esc(D.meta.back||"Exam home")+'</a><h1>Case drills</h1>'+
    '<div class="card"><b>The answer pattern, every time</b><div>1. Name a theory (and author). 2. Apply it to facts from the case. 3. Repeat with a second theory. 4. Cite a class case. 5. Recommendation with a trade-off.</div><div class="lead">New cases you haven\'t seen in class. The answer key uses only theories from your course.</div></div>'+
    D.dr.map(function(d){ var x = Dd(d.id), st = x.shown ? '<span class="pill solid">done</span>' : (x.a ? '<span class="pill prog">started</span>' : '<span class="pill todo">'+d.pts+' pts</span>');
      return '<a class="tile" href="#st/drill/'+d.id+'"><div class="row"><b>'+esc(d.title)+'</b>'+st+'</div><small>'+esc(d.tag)+'</small></a>'; }).join("")+'</div>';
}
function vDrill(id){
  var i = -1; D.dr.forEach(function(d, k){ if(d.id===id) i = k; }); if(i<0) return vDrills();
  var d = D.dr[i], x = Dd(id), nx = D.dr[i+1], mins = d.pts===4 ? 25 : 35, n = 0; DCK.forEach(function(_, j){ if(x.mk[j]) n++; });
  var s = '<div class="hr stack"><a href="#st/drill" class="lead">‹ All case drills</a><h1>'+esc(d.title)+'</h1><div class="lead">'+esc(d.tag)+'</div>'+
    '<details open><summary>The case</summary><div class="casebox">'+para(d.text)+'</div></details>'+
    '<div class="card"><div class="row"><b>Question ('+d.pts+' points)</b><span class="pill prog" id="hr-ct0">'+mins+' min</span></div><div>'+esc(d.q)+'</div>'+
    '<textarea data-stdr="'+id+'" placeholder="Tap \'Insert the 4-part skeleton\' to start.">'+esc(x.a)+'</textarea>'+
    '<div class="row"><span class="lead" id="hr-wc0">'+words(x.a)+' words</span></div>'+
    '<div class="grid2"><button class="btn ghost" data-st="skel|'+id+'">Insert the 4-part skeleton</button><button class="btn ghost" data-st="ctimer|0|'+mins+'">Start '+mins+'-min timer</button></div>';
  if(!x.shown) s += '<button class="btn" data-st="dshow|'+id+'">I\'m done: show the answer key</button></div>';
  else {
    s += '<b>Tick what your answer does</b>'+DCK.map(function(t, j){ return '<button class="ck'+(x.mk[j]?' on':'')+'" data-st="dmk|'+id+'|'+j+'"><span>'+(x.mk[j]?'☑':'☐')+'</span><span>'+esc(t)+'</span></button>'; }).join("")+
      '<div class="row"><span>Rough score</span><b>'+(Math.round(d.pts*n/4*10)/10)+' / '+d.pts+'</b></div></div>'+
      '<h2>Answer key</h2>'+d.parts.map(function(p){
        var kind = /^Theory/.test(p[0]) ? "var(--deep)" : /^Class/.test(p[0]) ? "var(--info)" : "var(--accent)";
        return '<div class="card" style="border-left:4px solid '+kind+'"><b>'+esc(p[0])+'</b><div>'+esc(p[2])+'</div>'+(p[1] && D.th[p[1]] ? '<details><summary>Theory card</summary>'+thHtml(p[1])+'</details>' : '')+'</div>';
      }).join("")+
      (d.cites||[]).map(function(c){ return '<a class="btn ghost" href="#st/cc/'+c+'">Open the class case page: '+esc((D.cc.filter(function(z){ return z.id===c; })[0]||{}).name||c)+'</a>'; }).join("");
  }
  s += (nx ? '<a class="btn" href="#st/drill/'+nx.id+'">Next drill: '+esc(nx.title)+' ›</a>' : '<a class="btn" href="#st/drill">All drills</a>')+'</div>';
  return s;
}

/* ---------- router ---------- */
function view(r){
  if(tick){ clearInterval(tick); tick = null; }
  var m;
  if((m = r.match(/^st\/paper\/(\d)$/))) return vPaper(m[1]);
  if((m = r.match(/^st\/case\/([a-z]+)$/))) return vCase(m[1]);
  if((m = r.match(/^st\/cards\/([a-z]+)$/))) return vCards(m[1]);
  if(r==="st/overview") return vOverview();
  if(r==="st/cases") return vClassCases();
  if(r==="st/drill") return vDrills();
  if((m = r.match(/^st\/drill\/([a-z]+)$/))) return vDrill(m[1]);
  if(r==="st/drill") return vDrills();
  if((m = r.match(/^st\/drill\/([a-z0-9]+)$/))) return vDrill(m[1]);
  if((m = r.match(/^st\/cc\/([a-z]+)$/))) return vCC(m[1]);
  return vHome();
}
var ctimer = null;
function after(r){
  var m = r.match(/^st\/paper\/(\d)$/);
  if(m && !P(m[1]).done){
    var p = P(m[1]);
    var up = function(){ var el = document.getElementById("hr-clock"); if(!el) return; var l = 25*60 - Math.floor((Date.now()-(p.start||Date.now()))/1000);
      el.textContent = l>=0 ? Math.floor(l/60)+":"+("0"+l%60).slice(-2) : "+"+Math.floor(-l/60)+" min over"; };
    up(); tick = setInterval(up, 1000);
  }
  if(/^st\/(case|drill)\//.test(r) && ctimer){
    var upc = function(){ var el = document.getElementById("hr-ct"+ctimer.i); if(!el) return; var l = ctimer.secs - Math.floor((Date.now()-ctimer.start)/1000);
      el.textContent = l>=0 ? Math.floor(l/60)+":"+("0"+l%60).slice(-2) : "time's up"; };
    upc(); tick = setInterval(upc, 1000);
  }
}

/* ---------- events ---------- */
var app = document.getElementById("app");
app.addEventListener("click", function(e){
  var b = e.target.closest("[data-st]"); if(!b) return;
  e.stopPropagation();
  var a = b.dataset.st.split("|"), y = window.scrollY;
  if(a[0]==="ans"){ var p = P(a[1]); if(p.done) return; p.ans[+a[2]] = +a[3]; save(); FL.render(); window.scrollTo(0, y); return; }
  if(a[0]==="submit"){ var p2 = P(a[1]), ids = D.papers[a[1]], h = H();
    ids.forEach(function(id, i){ h.log[id] = {t:Date.now(), miss:p2.ans[i]!==QI[id].a}; });
    p2.done = true; p2.at = Date.now(); save(); FL.render(); window.scrollTo(0,0); if(paperScore(a[1])>=16 && FL.confetti) FL.confetti(); return; }
  if(a[0]==="redo"){ H().p[a[1]] = {ans:{}, done:false}; save(); FL.render(); window.scrollTo(0,0); return; }
  if(a[0]==="show"){ C(a[1]).shown[+a[2]] = true; save(); FL.render(); window.scrollTo(0, y); return; }
  if(a[0]==="mk"){ var c = C(a[1]), mk = c.mk[+a[2]] = c.mk[+a[2]] || {}; mk[+a[3]] = !mk[+a[3]]; save(); FL.render(); window.scrollTo(0, y); return; }
  if(a[0]==="ctimer"){ ctimer = {i:+a[1], secs:(+a[2])*60, start:Date.now()}; FL.render(); window.scrollTo(0, y); return; }
  if(a[0]==="drv"){ var dd = DD(a[1]); dd.rv = Math.min(4, dd.rv+1); save(); FL.render(); window.scrollTo(0, y); return; }
  if(a[0]==="dall"){ DD(a[1]).rv = 4; save(); FL.render(); window.scrollTo(0, y); return; }
  if(a[0]==="dreset"){ var d2 = DD(a[1]); d2.rv = 0; d2.ok = {}; save(); FL.render(); window.scrollTo(0,0); return; }
  if(a[0]==="dok"){ var d3 = DD(a[1]); d3.ok[+a[2]] = !d3.ok[+a[2]]; save(); FL.render(); window.scrollTo(0, y); return; }
  if(a[0]==="skel"){ var dd = Dd(a[1]); if(!dd.a.trim()) dd.a = SKEL; else if(dd.a.indexOf("Theory 1")<0) dd.a = SKEL+"\n"+dd.a; save(); FL.render(); window.scrollTo(0, y); return; }
  if(a[0]==="dshow"){ Dd(a[1]).shown = true; save(); FL.render(); window.scrollTo(0, y); return; }
  if(a[0]==="dmk"){ var dm = Dd(a[1]).mk; dm[+a[2]] = !dm[+a[2]]; save(); FL.render(); window.scrollTo(0, y); return; }
  if(a[0]==="pick" && CQ){ if(CQ.picked>=0) return; var q = CQ.items[CQ.i]; CQ.picked = +a[1]; var ok = CQ.picked===q.a; if(ok) CQ.right++;
    H().log[q.id] = {t:Date.now(), miss:!ok}; save(); FL.render(); window.scrollTo(0, y); return; }
  if(a[0]==="next" && CQ){ CQ.i++; CQ.picked = -1; FL.render(); window.scrollTo(0,0); return; }
  if(a[0]==="more" && CQ){ newRound(CQ.sel); FL.render(); window.scrollTo(0,0); return; }
}, true);
var tmo = null;
app.addEventListener("input", function(e){
  var t = e.target; if(!t.dataset) return;
  if(t.dataset.stdr){ DD(t.dataset.stdr).a = t.value; var dw = document.getElementById("hr-dwc"); if(dw) dw.textContent = words(t.value)+" words"; clearTimeout(tmo); tmo = setTimeout(save, 800); return; }
  if(!t.dataset.stta) return;
  var a = t.dataset.stta.split("|"); C(a[0]).a[+a[1]] = t.value;
  var wc = document.getElementById("hr-wc"+a[1]); if(wc) wc.textContent = words(t.value)+" words (one page ≈ 300–350)";
  clearTimeout(tmo); tmo = setTimeout(save, 800);
});

window.FLST = {view:view, after:after};
window.FLC = window.FLC || {}; window.FLC.st = {view:view, after:after, meta:D.meta};
if(/^#?st/.test(location.hash||"") || !location.hash) FL.render();
})();
