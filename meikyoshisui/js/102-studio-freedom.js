/* ═══ FREEDOM CONSOLE 共通エンジン (2026-11-19, Phase N) ═══
   各アプリの id 付き入力を自動発見し、ピン留めスライダー/拡張レンジ/
   プリセット/モーフィング/ショートカットを提供する。本体コードと
   既存の保存キーには触らない。設定は localStorage の専用キーへ。 */
(function(){
'use strict';
var CFG = {"app":"meikyo","title":"Meikyoshisui","pins":["vizSens", "midiCaptureHoldMs", "midiCaptureMinVel", "seedInput"],"randomText":null,"exclude":[/[Ll]inkToggle/,/vl-toggle/,/vlToggle/,/^uiSearch$/,/^oscWsUrl$/,/^mePfx$/,/^spSlotName$/]};
var SETKEY = CFG.app + '.studioFreedom.v1';
var DEF = { extRange:false, pins:null, presets:{} };
var S = {};
(function load(){ var raw=null; try{ raw=localStorage.getItem(SETKEY); }catch(e){}
  S = JSON.parse(JSON.stringify(DEF));
  if(raw){ try{ var p=JSON.parse(raw);
    if(typeof p.extRange==='boolean')S.extRange=p.extRange;
    if(Array.isArray(p.pins))S.pins=p.pins;
    if(p.presets&&typeof p.presets==='object')S.presets=p.presets;
  }catch(e){} } })();
function save(){ try{ localStorage.setItem(SETKEY,JSON.stringify(S)); }catch(e){} }
function gel(id){ return document.getElementById(id); }
var writing=false;
function setVal(id,v){ var e=gel(id); if(!e)return; writing=true;
  e.value=(typeof v==='number')?String(Math.round(v*10000)/10000):String(v);
  e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true}));
  writing=false; }
function setCheck(id,on){ var e=gel(id); if(!e)return; writing=true; e.checked=!!on;
  e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); writing=false; }
function getNum(id){ var e=gel(id); if(!e)return null; var v=parseFloat(e.value); return isFinite(v)?v:null; }
/* ── 自動発見 ── */
var SKIP_TYPE={file:1,button:1,submit:1,image:1,search:1,password:1,hidden:1};
function inAux(e){ return !!e.closest('[data-fd-panel],[id^="sxPanel"],[id^="sfPanel"],[id^="fdPanel"],[id^="studioSync"],[id^="studioRes"]'); }
var REG={}; /* id -> {kind:'num'|'sel'|'chk'|'col'|'txt', min,max,step,label} */
function labelOf(e){ var id=e.id, t='';
  if(id){ var l=document.querySelector('label[for="'+id+'"]'); if(l)t=l.textContent.trim().slice(0,26); }
  if(!t&&e.closest('label'))t=e.closest('label').textContent.trim().slice(0,26);
  if(!t)t=id; return t; }
function discover(){ REG={};
  var els=document.querySelectorAll('input,select,textarea');
  for(var i=0;i<els.length;i++){ var e=els[i]; if(!e.id||inAux(e))continue;
    if(CFG.exclude&&CFG.exclude.some(function(rx){ return rx.test(e.id); }))continue;
    var tag=e.tagName, type=(e.type||'').toLowerCase();
    if(tag==='SELECT')REG[e.id]={kind:'sel',label:labelOf(e)};
    else if(type==='checkbox')REG[e.id]={kind:'chk',label:labelOf(e)};
    else if(type==='color')REG[e.id]={kind:'col',label:labelOf(e)};
    else if(type==='number'||type==='range'){ var mn=parseFloat(e.min), mx=parseFloat(e.max), st=parseFloat(e.step);
      REG[e.id]={kind:'num',label:labelOf(e),min:isFinite(mn)?mn:0,max:isFinite(mx)?mx:100,step:isFinite(st)&&st>0?st:1,type:type}; }
    else if(type==='text'||tag==='TEXTAREA')REG[e.id]={kind:'txt',label:labelOf(e)};
  }
  return Object.keys(REG).length; }
/* ── パネル ── */
var st=document.createElement('style');
st.textContent='#fdPanel-'+CFG.app+'{position:fixed;left:10px;bottom:10px;z-index:9988;width:284px;max-height:74vh;overflow-y:auto;padding:10px 12px;border:1px solid #3a3a40;border-radius:10px;background:rgba(14,14,17,.94);color:#e8e8ec;font-size:12.5px;line-height:1.55}'
 +'#fdPanel-'+CFG.app+' .t{letter-spacing:.08em}#fdPanel-'+CFG.app+' .sec{margin-top:9px;border-top:1px solid #2c2c31;padding-top:7px}'
 +'#fdPanel-'+CFG.app+' .sec b{font-size:12px;letter-spacing:.06em}#fdPanel-'+CFG.app+' .s{opacity:.85;font-size:11.5px}'
 +'#fdPanel-'+CFG.app+' .row{display:flex;align-items:center;gap:6px;margin-top:5px}'
 +'#fdPanel-'+CFG.app+' .row label{flex:0 0 96px;font-size:11.5px;opacity:.9;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
 +'#fdPanel-'+CFG.app+' .row output{flex:0 0 46px;text-align:right;font-size:11.5px}'
 +'#fdPanel-'+CFG.app+' input[type=range]{flex:1;accent-color:#e8e8ec;height:14px;min-width:60px}'
 +'#fdPanel-'+CFG.app+' input[type=text],#fdPanel-'+CFG.app+' input[type=number]{background:#1c1c20;color:#e8e8ec;border:1px solid #3a3a40;border-radius:6px;font-size:12px;padding:3px 6px}'
 +'#fdPanel-'+CFG.app+' select{background:#1c1c20;color:#e8e8ec;border:1px solid #3a3a40;border-radius:6px;font-size:12px;padding:2px 4px;max-width:130px}'
 +'#fdPanel-'+CFG.app+' button{background:#1c1c20;color:#e8e8ec;border:1px solid #3a3a40;border-radius:6px;font-size:12px;padding:4px 8px;cursor:pointer}'
 +'#fdPanel-'+CFG.app+' .chip{display:inline-flex;gap:4px;align-items:center;margin:3px 4px 0 0}'
 +'#fdPanel-'+CFG.app+' .chk{display:flex;align-items:center;gap:6px;margin-top:5px;cursor:pointer}'
 +'#fdPanel-'+CFG.app+' .keys{font-size:11.5px;opacity:.88;line-height:1.7}';
document.head.appendChild(st);
var panel=document.createElement('div'); panel.id='fdPanel-'+CFG.app; panel.setAttribute('data-fd-panel','1');
panel.innerHTML='<div class="t">FREEDOM CONSOLE — '+CFG.title+'</div>'
 +'<div class="sec"><b>コンソール（スライダー）</b>'
 +'<label class="chk"><input type="checkbox" id="fdExt-'+CFG.app+'"> 拡張レンジ（上限を解放）</label>'
 +'<div id="fdPins-'+CFG.app+'"></div>'
 +'<div class="row"><label>項目を追加</label><select id="fdAddPin-'+CFG.app+'"></select><button type="button" id="fdAddPinBtn-'+CFG.app+'">追加</button></div></div>'
 +'<div class="sec"><b>プリセット</b>'
 +'<div class="row"><input type="text" id="fdPresetName-'+CFG.app+'" placeholder="名前" style="flex:1"><button type="button" id="fdPresetSave-'+CFG.app+'">保存</button></div>'
 +'<div id="fdPresetList-'+CFG.app+'"></div>'
 +'<div class="row"><label>モーフィング</label><input type="number" id="fdMorphSec-'+CFG.app+'" min="1" max="60" step="1" value="5" style="width:52px"><span class="s">秒で選択したプリセットへ</span></div>'
 +'<div class="s">クリック=即適用、M=モーフィング、×=削除。数字キー 1〜9 でも適用。</div></div>'
 +'<div class="sec"><b>ショートカット</b><div class="keys">'
 +(CFG.randomText?('R='+CFG.randomText+' / '):'')+'1〜9=プリセット適用 / F=このパネルの表示切替</div>'
 +'<div class="row"><button type="button" id="fdRediscover-'+CFG.app+'">項目を再発見</button><span class="s" id="fdCount-'+CFG.app+'"></span></div></div>';
document.body.appendChild(panel);
function $(id){ return panel.querySelector('#'+id+'-'+CFG.app); }
/* ── コンソール ── */
var origMax={};
function extMaxOf(id){ var r=REG[id]; if(!r||r.kind!=='num')return null;
  var span=r.max-r.min; if(!(span>0))return null; return r.max+span; }
function applyExtRange(){ Object.keys(REG).forEach(function(id){ var r=REG[id]; if(r.kind!=='num')return;
  var e=gel(id); if(!e)return; var em=extMaxOf(id); if(em===null)return;
  if(origMax[id]===undefined)origMax[id]=e.max;
  e.max=S.extRange?String(em):(origMax[id]||String(r.max)); }); }
function sliderMax(id){ var r=REG[id]; var em=extMaxOf(id); return (S.extRange&&em!==null)?em:r.max; }
function currentPins(){ var nums=Object.keys(REG).filter(function(id){ return REG[id].kind==='num'; });
  if(S.pins&&S.pins.length)return S.pins.filter(function(id){ return REG[id]&&REG[id].kind==='num'; });
  var pref=(CFG.pins||[]).filter(function(id){ return REG[id]&&REG[id].kind==='num'; });
  return pref.length?pref:nums.slice(0,6); }
function buildPins(){ var wrap=$('fdPins'); wrap.innerHTML='';
  currentPins().forEach(function(id){ var r=REG[id]; if(!r)return;
    var row=document.createElement('div'); row.className='row';
    var lab=document.createElement('label'); lab.textContent=r.label; lab.title=id; row.appendChild(lab);
    var sl=document.createElement('input'); sl.type='range'; sl.min=r.min; sl.max=sliderMax(id); sl.step=r.step; sl.id='fdPin-'+CFG.app+'-'+id;
    var cur=getNum(id); if(cur!==null)sl.value=Math.max(r.min,Math.min(sliderMax(id),cur));
    var o=document.createElement('output'); o.id='fdPinV-'+CFG.app+'-'+id; o.textContent=(cur===null?'—':String(cur));
    var x=document.createElement('button'); x.type='button'; x.textContent='×'; x.title='外す';
    x.addEventListener('click',function(){ var pins=currentPins().filter(function(i){ return i!==id; }); S.pins=pins; save(); buildPins(); });
    sl.addEventListener('input',function(){ cancelMorph(); setVal(id,parseFloat(sl.value)); o.textContent=sl.value; });
    row.appendChild(sl); row.appendChild(o); row.appendChild(x); wrap.appendChild(row);
    var src=gel(id);
    if(src&&!src.__fdFollow){ src.__fdFollow=true;
      src.addEventListener('input',function(){ if(writing)return; var v=getNum(id);
        var s2=gel('fdPin-'+CFG.app+'-'+id), o2=gel('fdPinV-'+CFG.app+'-'+id);
        if(s2&&v!==null)s2.value=Math.max(r.min,Math.min(sliderMax(id),v));
        if(o2&&v!==null)o2.textContent=String(v); }); }
  });
  var sel=$('fdAddPin'); sel.innerHTML='';
  Object.keys(REG).filter(function(id){ return REG[id].kind==='num'; }).forEach(function(id){
    var op=document.createElement('option'); op.value=id; op.textContent=REG[id].label; sel.appendChild(op); });
  $('fdCount').textContent='発見 '+Object.keys(REG).length+' 項目';
}
$('fdAddPinBtn').addEventListener('click',function(){ var id=$('fdAddPin').value;
  if(id){ var pins=currentPins(); if(pins.indexOf(id)<0)pins.push(id); S.pins=pins; save(); buildPins(); } });
var extChk=$('fdExt'); extChk.checked=!!S.extRange;
extChk.addEventListener('change',function(){ S.extRange=this.checked; save(); applyExtRange(); buildPins(); });
$('fdRediscover').addEventListener('click',function(){ discover(); applyExtRange(); buildPins(); buildPresetList(); });
/* ── プリセット＋モーフィング ── */
function snapshot(){ var o={};
  Object.keys(REG).forEach(function(id){ var e=gel(id); if(!e)return; var r=REG[id];
    o[id]=(r.kind==='chk')?e.checked:e.value; });
  return o; }
function applySnap(o){ if(!o)return;
  Object.keys(REG).forEach(function(id){ if(o[id]===undefined)return; var r=REG[id];
    if(r.kind==='chk')setCheck(id,!!o[id]);
    else if(r.kind==='num')setVal(id,parseFloat(o[id]));
    else setVal(id,o[id]); });
  /* 一部のアプリは他項目の変更で全コントロールを内部状態から再同期するため、
     400ms 後にもう一度、目標値と違う数値項目だけを書き直す。 */
  setTimeout(function(){
    Object.keys(REG).forEach(function(id){ if(o[id]===undefined)return; var r=REG[id];
      if(r.kind!=='num')return; var want=parseFloat(o[id]); var cur=getNum(id);
      if(isFinite(want)&&cur!==null&&Math.abs(cur-want)>1e-9)setVal(id,want); });
  },400); }
var morphTimer=null;
function cancelMorph(){ if(morphTimer){ clearInterval(morphTimer); morphTimer=null; } }
function morphTo(name,sec){ var target=S.presets[name]; if(!target)return;
  cancelMorph(); var from=snapshot(); var t0=Date.now(), dur=Math.max(1,sec||5)*1000;
  var nums=Object.keys(REG).filter(function(id){ return REG[id].kind==='num'&&!/seed/i.test(id)&&from[id]!==undefined&&target[id]!==undefined; });
  var rest=Object.keys(REG).filter(function(id){ return nums.indexOf(id)<0; });
  morphTimer=setInterval(function(){ var t=Math.min(1,(Date.now()-t0)/dur); var e=t*t*(3-2*t);
    nums.forEach(function(id){ var a=parseFloat(from[id]), b=parseFloat(target[id]);
      if(isFinite(a)&&isFinite(b)&&a!==b)setVal(id,a+(b-a)*e); });
    if(t>=1){ cancelMorph(); rest.forEach(function(id){ if(target[id]===undefined)return; var r=REG[id];
      if(r.kind==='chk')setCheck(id,!!target[id]); else if(r.kind==='num')setVal(id,parseFloat(target[id])); else setVal(id,target[id]); }); }
  },60); }
function buildPresetList(){ var wrap=$('fdPresetList'); wrap.innerHTML='';
  var names=Object.keys(S.presets);
  names.forEach(function(name,idx){
    var chip=document.createElement('span'); chip.className='chip';
    var b=document.createElement('button'); b.type='button'; b.textContent=(idx+1)+'. '+name;
    b.addEventListener('click',function(){ cancelMorph(); applySnap(S.presets[name]); });
    var mb=document.createElement('button'); mb.type='button'; mb.textContent='M'; mb.title='モーフィングで遷移';
    mb.addEventListener('click',function(){ morphTo(name,parseFloat($('fdMorphSec').value)||5); });
    var x=document.createElement('button'); x.type='button'; x.textContent='×';
    x.addEventListener('click',function(){ delete S.presets[name]; save(); buildPresetList(); });
    chip.appendChild(b); chip.appendChild(mb); chip.appendChild(x); wrap.appendChild(chip);
  });
  if(!names.length)wrap.innerHTML='<span class="s">まだありません</span>';
}
$('fdPresetSave').addEventListener('click',function(){
  var name=($('fdPresetName').value||'').trim()||('プリセット'+(Object.keys(S.presets).length+1));
  S.presets[name]=snapshot(); save(); buildPresetList(); });
/* ── ショートカット ── */
function clickByText(txt){ var bs=document.querySelectorAll('button');
  for(var i=0;i<bs.length;i++){ if(bs[i].textContent.trim()===txt&&!panel.contains(bs[i])){ bs[i].click(); return true; } } return false; }
document.addEventListener('keydown',function(ev){
  var t=ev.target; if(!t)return; var tag=(t.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||tag==='select'||t.isContentEditable)return;
  if(ev.metaKey||ev.ctrlKey||ev.altKey)return;
  var k=ev.key.toLowerCase();
  if(k==='f')panel.style.display=(panel.style.display==='none')?'block':'none';
  else if(k==='r'&&CFG.randomText)clickByText(CFG.randomText);
  else if(/^[1-9]$/.test(k)){ var names=Object.keys(S.presets); var nm=names[parseInt(k,10)-1];
    if(nm){ cancelMorph(); applySnap(S.presets[nm]); } }
});
/* ── 起動 (遅れて構築される UI に備えて少し待つ) ── */
function boot(){ discover(); applyExtRange(); buildPins(); buildPresetList(); }
if(document.readyState==='complete')setTimeout(boot,1200);
else window.addEventListener('load',function(){ setTimeout(boot,1200); });
setTimeout(function(){ var before=Object.keys(REG).length; var after=discover();
  if(after!==before){ applyExtRange(); buildPins(); buildPresetList(); } },7000);
window.__studioFreedom={version:'PhaseN-1',app:CFG.app,
  settings:function(){ return JSON.parse(JSON.stringify(S)); },
  discovered:function(){ return Object.keys(REG).length; },
  rediscover:function(){ discover(); applyExtRange(); buildPins(); return Object.keys(REG).length; },
  savePreset:function(name){ S.presets[name]=snapshot(); save(); buildPresetList(); },
  applyPreset:function(name){ cancelMorph(); applySnap(S.presets[name]); },
  morphTo:function(name,sec){ morphTo(name,sec); },
  get morphing(){ return !!morphTimer; },
  setVal:setVal, getNum:getNum};
})();
