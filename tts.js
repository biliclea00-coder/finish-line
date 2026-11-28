/* Read aloud: uses the device's built-in voice (Web Speech API). No server, no account. */
(function(){
  var S = window.speechSynthesis;
  if(!S || !window.SpeechSynthesisUtterance) return;

  var SKIP = /(^|\s)(phead|row|sdots|mtog|pnav|tts-bar)(\s|$)/;
  var EXPAND = /(^|\s)(tl|facts|flips|tapq-wrap)(\s|$)/;
  var RATES = [0.8, 1, 1.15, 1.3, 1.5];
  var st = {on:false, playing:false, i:0, parts:[], p:0, key:'', rate:1, voice:null};
  try { var r = parseFloat(localStorage.getItem('fl-tts-rate')); if(r) st.rate = r; } catch(e){}

  function root(){ return document.querySelector('.pathv') || document.querySelector('#app .stack') || document.querySelector('.stack'); }
  function stepKey(){ var r = root(); if(!r) return ''; var b = r.querySelector('.row b'); return location.hash + '|' + (b ? b.textContent : ''); }

  function blocks(){
    var r = root(); if(!r) return [];
    var out = [];
    (function walk(el){
      for(var k=0; k<el.children.length; k++){
        var c = el.children[k], cls = c.className || '';
        if(typeof cls !== 'string') cls = '';
        if(SKIP.test(cls) || c.tagName==='SCRIPT' || c.tagName==='STYLE') continue;
        if(EXPAND.test(cls) && c.children.length > 1){ walk(c); continue; }
        if(textOf(c).length > 2) out.push(c);
      }
    })(r);
    return out;
  }

  function textOf(el){
    var parts = [];
    (function walk(n){
      if(n.nodeType === 3){ parts.push(n.nodeValue); return; }
      if(n.nodeType !== 1) return;
      var t = n.tagName, cls = (typeof n.className==='string') ? n.className : '';
      if(t==='TEXTAREA' || t==='IMG' || t==='SVG' || t==='INPUT' || t==='SCRIPT' || t==='STYLE') return;
      if(t==='BUTTON' && !/tchip/.test(cls)) return;
      if(/tchip/.test(cls)){ parts.push(n.textContent + ', '); return; }
      if(/tapo/.test(cls)) parts.push('. Options: ');
      if(t==='DETAILS' && !n.open){ var sm = n.querySelector('summary'); if(sm) parts.push('. ' + sm.textContent + ' (closed). '); return; }
      if(t==='SMALL' && /tap to flip/i.test(n.textContent)) return;
      if(/sdot|plane|fic|ic\b/.test(cls) && n.children.length===0 && n.textContent.length < 4) return;
      var block = /^(DIV|P|LI|B|SUMMARY|DETAILS|H\d|I)$/.test(t);
      if(block) parts.push('. ');
      for(var k=0; k<n.childNodes.length; k++){ walk(n.childNodes[k]); if(n.childNodes[k].nodeType===1) parts.push(' '); }
      if(block) parts.push('. ');
    })(el);
    var s = parts.join('');
    try { s = s.replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️‍]/gu, ''); } catch(e){}
    var CUR = {'$':'dollars','€':'euros','£':'pounds'}, SC = {bn:'billion', m:'million', tn:'trillion', k:'thousand'};
    s = s.replace(/([$€£])\s?(\d[\d.,]*)\s?(bn|tn|m|k)?\b/g, function(_, c, n, k){ return n + (k ? ' ' + SC[k] : '') + ' ' + CUR[c]; })
         .replace(/(\d)\s?(bn|tn)\b/g, function(_, d, k){ return d + ' ' + SC[k]; })
         .replace(/\s·\s/g, ', ').replace(/(\d)–(\d)/g, '$1 to $2').replace(/\bvs\.?\s/g, 'versus ').replace(/\bp{1,2}\.\s/g, 'page ')
         .replace(/‹|›|·|→|✍️/g, ' ').replace(/\s+/g, ' ')
         .replace(/(\s*\.\s*){2,}/g, '. ').replace(/([!?:;,])\s*\.\s/g, '$1 ')
         .replace(/^\s*\.\s*/, '').trim();
    return s;
  }

  function split(text){
    var sent = text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [text], out = [], cur = '';
    sent.forEach(function(x){
      if((cur + x).length > 220 && cur){ out.push(cur.trim()); cur = ''; }
      cur += x;
    });
    if(cur.trim()) out.push(cur.trim());
    return out;
  }

  function quality(v){ var t = (v.name + ' ' + (v.voiceURI||'')).toLowerCase(); return /premium/.test(t) ? 2 : (/enhanced|neural|natural/.test(t) ? 1 : 0); }
  function label(v){ var q = quality(v); return v.name.replace(/\s*\((enhanced|premium)\)/i,'') + (q===2 ? ' (Premium)' : q===1 ? ' (Enhanced)' : '') + ' · ' + v.lang; }
  function englishVoices(){
    var vs = S.getVoices().filter(function(v){ return /^en/i.test(v.lang); });
    function score(v){
      var n = v.name, s = quality(v) * 10;
      if(v.default) s += 4;
      if(/allison|ava|zoe|evan|nathan|joelle|noelle|serena|samantha|daniel|karen|moira|google uk english female|google us english/i.test(n)) s += 2;
      if(/compact/i.test(v.voiceURI||'')) s -= 3;
      if(/novelty|whisper|bells|zarvox|bad news|good news|jester|bubbles|boing|cellos|organ|trinoids|albert|fred|junior|ralph|kathy|bahh|wobble|superstar|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley/i.test(n)) s -= 20;
      return s;
    }
    return vs.filter(function(v){ return score(v) > -10; }).sort(function(a,b){ return score(b) - score(a); });
  }
  function pickVoice(){
    var vs = englishVoices(); if(!vs.length) return null;
    var want = null; try { want = localStorage.getItem('fl-tts-voice'); } catch(e){}
    if(want){ for(var k=0; k<vs.length; k++) if(vs[k].voiceURI === want || vs[k].name === want) return vs[k]; }
    return vs[0];
  }
  S.onvoiceschanged = function(){ st.voice = pickVoice(); };
  st.voice = pickVoice();

  function mark(){
    var bs = blocks();
    Array.prototype.forEach.call(document.querySelectorAll('.tts-on'), function(e){ e.classList.remove('tts-on'); });
    var b = bs[st.i];
    if(b && st.on){ b.classList.add('tts-on'); try { b.scrollIntoView({behavior:'smooth', block:'center'}); } catch(e){ b.scrollIntoView(); } }
    return b;
  }

  function speakPart(){
    if(!st.playing) return;
    if(st.p >= st.parts.length){ st.i++; startBlock(); return; }
    var u = new SpeechSynthesisUtterance(st.parts[st.p]);
    if(st.voice) u.voice = st.voice;
    u.lang = st.voice ? st.voice.lang : 'en-GB';
    u.rate = st.rate;
    var mine = st.token;
    u.onend = function(){ if(mine !== st.token) return; st.p++; speakPart(); };
    u.onerror = function(){ if(mine !== st.token) return; st.p++; speakPart(); };
    S.speak(u);
  }

  function startBlock(){
    var bs = blocks();
    if(st.i >= bs.length){ stop(); return; }
    var b = mark();
    st.parts = split(textOf(b)); st.p = 0; st.token = Math.random();
    S.cancel();
    setTimeout(speakPart, 60);
    render();
  }

  function play(){ st.voice = pickVoice() || st.voice; st.i = 0; st.on = true; st.playing = true; st.key = stepKey(); startBlock(); }
  function pause(){ st.playing = false; st.token = Math.random(); S.cancel(); render(); }
  function resume(){ st.playing = true; st.token = Math.random(); S.cancel(); setTimeout(speakPart, 60); render(); }
  function stop(){
    st.on = false; st.playing = false; st.token = Math.random(); S.cancel();
    Array.prototype.forEach.call(document.querySelectorAll('.tts-on'), function(e){ e.classList.remove('tts-on'); });
    render();
  }
  function jump(d){ st.i = Math.max(0, st.i + d); st.playing = true; startBlock(); }
  function cycleRate(){
    var k = RATES.indexOf(st.rate); st.rate = RATES[(k + 1) % RATES.length];
    try { localStorage.setItem('fl-tts-rate', String(st.rate)); } catch(e){}
    if(st.playing){ st.token = Math.random(); S.cancel(); setTimeout(speakPart, 60); }
    render();
  }

  var bar = document.createElement('div');
  bar.className = 'tts-bar';
  bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Read aloud');
  function btn(act, label, aria){ return '<button type="button" data-tts="'+act+'" aria-label="'+aria+'">'+label+'</button>'; }
  function render(){
    if(!root()){ bar.style.display = 'none'; return; }
    bar.style.display = '';
    var h;
    if(!st.on){ h = btn('play','🔊 Read aloud','Read this page aloud'); }
    else h = btn('prev','⏮','Previous part') + (st.playing ? btn('pause','⏸','Pause') : btn('resume','▶️','Resume')) +
      btn('next','⏭','Next part') + btn('rate', st.rate + '×', 'Change speed') + btn('voice','🗣','Choose voice') + btn('stop','✕','Stop reading');
    bar.className = st.on ? 'tts-bar open' : 'tts-bar';
    if(bar.innerHTML !== h) bar.innerHTML = h;
  }
  bar.addEventListener('click', function(e){
    var b = e.target.closest('[data-tts]'); if(!b) return;
    var a = b.getAttribute('data-tts');
    if(a==='play') play(); else if(a==='pause') pause(); else if(a==='resume') resume();
    else if(a==='stop') stop(); else if(a==='next') jump(1); else if(a==='prev') jump(-1); else if(a==='rate') cycleRate(); else if(a==='voice') openMenu();
  });

  var menu = document.createElement('div'); menu.className = 'tts-menu';
  function openMenu(){
    var vs = englishVoices(), cur = st.voice ? st.voice.voiceURI : '';
    if(!vs.length){ menu.innerHTML = '<p>No English voices found yet. Try again in a second.</p><button type="button" data-ttsv="">Close</button>'; }
    else menu.innerHTML = '<b>Choose a voice</b><p>Downloaded Enhanced or Premium voices sound best.</p>' + vs.map(function(v){
      return '<button type="button" class="'+(v.voiceURI===cur?'on':'')+'" data-ttsv="'+v.voiceURI.replace(/"/g,'&quot;')+'">'+label(v).replace(/</g,'&lt;')+'</button>'; }).join('') + '<button type="button" data-ttsv="">Close</button>';
    if(!menu.parentNode) document.body.appendChild(menu);
    menu.style.display = 'block';
  }
  menu.addEventListener('click', function(e){
    var b = e.target.closest('[data-ttsv]'); if(!b) return;
    var uri = b.getAttribute('data-ttsv'); menu.style.display = 'none';
    if(!uri) return;
    var v = englishVoices().filter(function(x){ return x.voiceURI === uri; })[0];
    if(v){ st.voice = v; try { localStorage.setItem('fl-tts-voice', uri); } catch(e){}
      if(st.playing){ st.token = Math.random(); S.cancel(); setTimeout(speakPart, 60); } }
  });
  var css = document.createElement('style');
  css.textContent =
    '.tts-bar{position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:9999;display:flex;gap:4px;' +
    'background:#1f2a24;color:#fff;border-radius:999px;padding:6px;box-shadow:0 6px 20px rgba(0,0,0,.25);font:600 15px/1 system-ui,sans-serif}' +
    '.tts-bar button{background:transparent;border:0;color:#fff;font:inherit;padding:9px 12px;border-radius:999px;cursor:pointer;min-width:40px}' +
    '.tts-bar button:active{background:rgba(255,255,255,.15)}' +
    '.tts-menu{display:none;position:fixed;left:12px;right:12px;bottom:calc(72px + env(safe-area-inset-bottom));max-height:60vh;overflow:auto;z-index:10000;background:#fff;color:#1f2a24;border-radius:16px;padding:14px;box-shadow:0 10px 30px rgba(0,0,0,.3);font:15px/1.35 system-ui,sans-serif}' +
    '.tts-menu p{margin:4px 0 10px;color:#666;font-size:13px}.tts-menu button{display:block;width:100%;text-align:left;border:0;background:#f3f3ef;border-radius:10px;padding:11px 12px;margin:6px 0;font:inherit;color:inherit}' +
    '.tts-menu button.on{background:#1f2a24;color:#fff}' +
    '.tts-on{outline:3px solid #e0a526;outline-offset:3px;border-radius:10px;transition:outline-color .2s}';
  document.head.appendChild(css);

  function mount(){ if(!bar.parentNode) document.body.appendChild(bar); render(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();

  // Stop when the user moves to another step or page; keep going if the same step just re-rendered.
  var last = '';
  new MutationObserver(function(){
    var k = stepKey();
    if(st.on && k !== st.key){ stop(); }
    if(k !== last){ last = k; render(); }
    if(st.on){ var bs = blocks(), b = bs[st.i]; if(b && !b.classList.contains('tts-on')){ Array.prototype.forEach.call(document.querySelectorAll('.tts-on'), function(e){ e.classList.remove('tts-on'); }); b.classList.add('tts-on'); } }
  }).observe(document.body, {childList:true, subtree:true});
  window.addEventListener('hashchange', function(){ if(st.on) stop(); setTimeout(render, 50); });
  document.addEventListener('visibilitychange', function(){ if(document.hidden && st.playing) pause(); });
})();
