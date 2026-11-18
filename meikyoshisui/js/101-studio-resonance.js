/* ═══ Studio Link 専用機能 for Meikyoshisui (2026-11-19): STUDIO RESONANCE ═══
   Varelser Studio と接続中だけ現れる機能。Noise の実音量 RMS (Studio が
   session-bus で中継) が、Meikyoshisui のチャンネル音量を揺らす。
   音量の書き込みは console 受信と同じ正規経路 MidiPreview.setChVol を使い、
   基準値は Studio console の targets.meikyoshisui.amount (最後の受信値)。
   基準値が未受信の間は一切書かない。自分の Link が OFF の間は無効。
   切断時は基準値へ復元する。本体ファイルには触らない追加モジュール。 */
(function(){
'use strict';
var LSKEY='meikyoshisui.varelserLink.v1';
var FRESH_MS=6000;
var lastSeen=0, linked=false, busNoise=null;
var base=null, enabled=true, depthMul=1.0;
var rmsSm=0, factor=1, applied=false;
function ownOn(){ try{ return localStorage.getItem(LSKEY)==='1'; }catch(e){ return false; } }
var ch=null;
try{ ch=new BroadcastChannel('varelser-link-v1'); }catch(e){}
if(ch)ch.addEventListener('message',function(ev){
  var m=ev.data||{};
  if(m.app!=='studio')return;
  if(m.type==='presence'){ lastSeen=Date.now(); }
  else if(m.type==='session-bus'){ lastSeen=Date.now(); busNoise=m.noise||null; }
  else if(m.type==='studio-bye'){ lastSeen=0; busNoise=null; }
  else if(m.type==='console'){
    var t=m.targets&&m.targets.meikyoshisui;
    if(t&&typeof t.amount==='number'&&isFinite(t.amount))base=Math.max(0,Math.min(1,t.amount));
  }
});
function mp(){ try{ return (typeof MidiPreview!=='undefined'&&MidiPreview)?MidiPreview:null; }catch(e){ return null; } }
function isPlaying(){
  try{ var api=window.__varelserLink; if(api&&api.readState)return !!api.readState().playing; }catch(e){}
  return false;
}
function applyVols(f){
  var M=mp(); if(!M||typeof M.setChVol!=='function'||base==null)return false;
  var v=Math.max(0,Math.min(1,base*f));
  for(var i=0;i<16;i++){ try{ M.setChVol(i,v); }catch(e){} }
  return true;
}
/* ── UI ── */
var st=document.createElement('style');
st.textContent='#studioResBadge{position:fixed;top:10px;right:10px;z-index:9999;display:none;'
 +'padding:4px 10px;border:1px solid var(--border,#444);border-radius:999px;background:var(--panel2,#1a1a1f);'
 +'color:var(--text,#e8e8ec);font-size:11.5px;letter-spacing:.14em}'
 +'#studioResPanel{display:none;margin-top:8px;padding:10px 12px;border:1px solid var(--border,#444);'
 +'border-radius:6px;background:var(--panel2,#1a1a1f);color:var(--text,#e8e8ec);font-size:12.5px;line-height:1.6}'
 +'#studioResPanel.sr-fixed{position:fixed;right:12px;bottom:12px;z-index:9999;width:280px;max-width:calc(100vw - 24px)}'
 +'#studioResPanel .sr-t{letter-spacing:.08em}'
 +'#studioResPanel .sr-s{font-size:11.5px;color:var(--text-dim,#aaa)}'
 +'#studioResPanel label{display:flex;align-items:center;gap:6px;margin-top:6px;cursor:pointer}'
 +'#studioResPanel select{background:transparent;color:inherit;border:1px solid var(--border,#444);border-radius:6px;font-size:12px;padding:2px 4px}';
document.head.appendChild(st);
var badge=document.createElement('div'); badge.id='studioResBadge'; badge.textContent='STUDIO LINKED';
document.body.appendChild(badge);
var panel=document.createElement('div'); panel.id='studioResPanel';
panel.innerHTML='<div class="sr-t">STUDIO RESONANCE — Noise 共鳴</div>'
 +'<div class="sr-s" id="srStatus">Studio の接続を待っています</div>'
 +'<label><input type="checkbox" id="srEnable" checked> 共鳴有効</label>'
 +'<label>深さ <select id="srDepth"><option value="0.6">弱</option><option value="1" selected>中</option><option value="1.5">強</option></select></label>';
var placed=false;
function placePanel(){
  if(placed)return;
  var sec=document.getElementById('varelserLinkSec');
  if(sec&&sec.parentNode){ sec.parentNode.insertBefore(panel,sec.nextSibling); placed=true; }
  else if(document.body){ panel.classList.add('sr-fixed'); document.body.appendChild(panel); placed=true; }
}
panel.querySelector('#srEnable').addEventListener('change',function(){ enabled=this.checked; });
panel.querySelector('#srDepth').addEventListener('change',function(){ depthMul=parseFloat(this.value)||1; });
function setStatus(){
  var el=document.getElementById('srStatus'); if(!el)return;
  if(!linked){ el.textContent='Studio の接続を待っています'; return; }
  if(base==null){ el.textContent='接続中 — Studio から音量を受けると共鳴が始まります'; return; }
  if(!busNoise){ el.textContent='接続中 — Noise の状態を待っています (基準 '+base.toFixed(2)+')'; return; }
  el.textContent='共鳴中 — Noise RMS '+rmsSm.toFixed(2)+' / 係数 '+factor.toFixed(2)+' / 基準 '+base.toFixed(2);
}
setInterval(function(){
  placePanel();
  var now=linked;
  linked=ownOn()&&(Date.now()-lastSeen<FRESH_MS);
  if(linked!==now){
    badge.style.display=linked?'block':'none';
    panel.style.display=linked?'block':'none';
  }
  var active=linked&&enabled&&base!=null&&isPlaying()&&busNoise&&typeof busNoise.rms==='number';
  if(active){
    rmsSm+=(busNoise.rms-rmsSm)*0.25;
    factor=Math.max(0.6,Math.min(1.4,1+(rmsSm-0.25)*1.4*depthMul));
    if(applyVols(factor))applied=true;
  }else if(applied){
    if(base!=null)applyVols(1);
    applied=false; factor=1;
  }
  if(linked)setStatus();
},200);
window.__studioResonance={version:'PhaseI-1',
  get linked(){return linked;},
  get factor(){return factor;},
  get base(){return base;},
  get rms(){return rmsSm;},
  get applied(){return applied;}};
})();
