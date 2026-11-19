/* Varelser Studio — Side Dock (Phase O)
   既存の追加パネル (Studio Link / STUDIO FLUID / FREEDOM CONSOLE) を
   右端の縦タブ・レールに集約する。パネルの中身・id・保存キーには触らず、
   DOM の置き場所と見せ方だけを引き受ける。
   Phase Q: ラップを Popover (manual) 化してトップレイヤー表示にし、
   ページ遷移の View Transitions を opt-in する。未対応環境では従来動作。 */
(function(){
'use strict';
var CFG = {"app": "meikyo", "tabs": [{"key": "link", "label": "連携", "panel": "studioResPanel", "badge": "studioResBadge", "api": "__studioResonance"}, {"key": "free", "label": "自由化", "panel": "fdPanel-meikyo", "badge": null, "api": "__studioFreedom"}]};
var LSKEY = CFG.app + '.studioDock.v1';
var state = { open: null };
try { var raw = localStorage.getItem(LSKEY); if (raw) { var p = JSON.parse(raw); if (p && typeof p.open === 'string') state.open = p.open; } } catch (e) {}
function save(){ try { localStorage.setItem(LSKEY, JSON.stringify({ open: state.open })); } catch (e) {} }

var css = ''
+ '#sdockRail{position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:99997;display:flex;flex-direction:column;gap:6px;font-family:inherit;}'
+ '.sdock-tab{writing-mode:vertical-rl;letter-spacing:.14em;font-size:11.5px;padding:12px 6px;background:rgba(14,14,17,.93);color:#d7d7db;border:1px solid #3a3a40;border-right:none;border-radius:9px 0 0 9px;cursor:pointer;user-select:none;display:flex;align-items:center;gap:7px;}'
+ '.sdock-tab:hover{color:#fff;border-color:#6a6a72;}'
+ '.sdock-tab.active{background:#e9e9ec;color:#101013;border-color:#e9e9ec;font-weight:700;}'
+ '.sdock-tab .sdot{width:7px;height:7px;border-radius:50%;background:#8a8a91;flex:none;}'
+ '.sdock-tab .sdot.on{background:#f2f2f4;box-shadow:0 0 0 2px rgba(255,255,255,.22);}'
+ '.sdock-tab.active .sdot{background:#8a8a91;} .sdock-tab.active .sdot.on{background:#101013;box-shadow:none;}'
+ '.sdock-wrap{position:fixed;right:31px;top:50%;transform:translateY(-50%) translateX(118%);transition:transform .3s ease;z-index:99996;pointer-events:none;}'
+ '.sdock-wrap.open{transform:translateY(-50%) translateX(0);pointer-events:auto;}'
+ '.sdock-wrap>*{max-width:calc(100vw - 52px);}'
+ '.sdock-wrap[popover]{left:auto;bottom:auto;width:auto;height:auto;margin:0;padding:0;border:none;background:transparent;overflow:visible;color:inherit;}'
+ '@starting-style{.sdock-wrap[popover]:popover-open{transform:translateY(-50%) translateX(118%);}}'
+ '@media (max-width:640px){.sdock-tab{font-size:11px;padding:10px 5px;}}';
var POP = ('showPopover' in HTMLElement.prototype);
var VT_CSS = '@view-transition{navigation:auto}::view-transition-old(root),::view-transition-new(root){animation-duration:.28s}';

var rail = null, tabs = {}, wraps = {};
function ensureChrome(){
  if (document.getElementById('sdockStyle')) return;
  var st = document.createElement('style'); st.id = 'sdockStyle'; st.textContent = css; document.head.appendChild(st);
  var vt = document.createElement('style'); vt.id = 'sdockVt'; vt.textContent = VT_CSS; document.head.appendChild(vt);
  rail = document.createElement('div'); rail.id = 'sdockRail'; rail.setAttribute('role', 'tablist'); rail.setAttribute('aria-label', 'Studio panels');
  document.body.appendChild(rail);
  CFG.tabs.forEach(function(t){
    var b = document.createElement('button'); b.type = 'button'; b.className = 'sdock-tab'; b.id = 'sdockTab-' + t.key;
    b.setAttribute('role', 'tab'); b.setAttribute('aria-expanded', 'false');
    b.innerHTML = '<span class="sdot"></span>' + t.label;
    b.style.display = 'none';
    b.addEventListener('click', function(){ toggle(t.key); });
    rail.appendChild(b); tabs[t.key] = b;
  });
}
function adopt(t){
  var panel = document.getElementById(t.panel);
  if (!panel || panel.dataset.docked) return !!panel;
  ensureChrome();
  var wrap = document.createElement('div'); wrap.className = 'sdock-wrap'; wrap.id = 'sdockWrap-' + t.key;
  if (POP) wrap.setAttribute('popover', 'manual');
  document.body.appendChild(wrap);
  wrap.appendChild(panel);
  panel.dataset.docked = '1';
  ['position','left','right','top','bottom','margin','float'].forEach(function(prop){
    panel.style.setProperty(prop, prop === 'position' ? 'static' : 'auto', 'important');
  });
  panel.style.setProperty('margin', '0', 'important');
  wraps[t.key] = wrap;
  if (t.badge) { var bg = document.getElementById(t.badge); if (bg) bg.style.setProperty('display', 'none', 'important'); }
  return true;
}
function panelAvail(t){
  var panel = document.getElementById(t.panel);
  if (!panel) return false;
  return getComputedStyle(panel).display !== 'none';
}
function linkedNow(t){
  try { var a = t.api && window[t.api]; return !!(a && a.linked); } catch (e) { return false; }
}
var hideTimers = {};
function applyOpen(){
  CFG.tabs.forEach(function(t){
    var w = wraps[t.key], b = tabs[t.key];
    var open = (state.open === t.key);
    if (w) {
      w.classList.toggle('open', open);
      if (POP) {
        var isOpen = false; try { isOpen = w.matches(':popover-open'); } catch (e) {}
        if (open) {
          if (hideTimers[t.key]) { clearTimeout(hideTimers[t.key]); hideTimers[t.key] = null; }
          if (!isOpen) { try { w.showPopover(); } catch (e) {} }
        } else if (isOpen && !hideTimers[t.key]) {
          hideTimers[t.key] = setTimeout(function(){
            hideTimers[t.key] = null;
            if (state.open !== t.key) { try { w.hidePopover(); } catch (e) {} }
          }, 330);
        }
      }
    }
    if (b) { b.classList.toggle('active', open); b.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  });
}
function toggle(key){
  state.open = (state.open === key) ? null : key;
  save(); applyOpen();
}
function tick(){
  ensureChrome();
  var anyAvail = false;
  CFG.tabs.forEach(function(t){
    adopt(t);
    var av = panelAvail(t);
    var b = tabs[t.key];
    if (b) {
      b.style.display = av ? '' : 'none';
      var dot = b.querySelector('.sdot');
      if (dot) dot.classList.toggle('on', linkedNow(t));
    }
    if (t.badge) { var bg = document.getElementById(t.badge); if (bg && bg.style.getPropertyValue('display') !== 'none') bg.style.setProperty('display', 'none', 'important'); }
    if (av) anyAvail = true;
    if (state.open === t.key && !av) { state.open = null; save(); }
  });
  if (rail) rail.style.display = anyAvail ? '' : 'none';
  applyOpen();
}
document.addEventListener('keydown', function(ev){
  if (ev.key === 'Escape' && state.open) { state.open = null; save(); applyOpen(); return; }
  if (ev.altKey && /^[1-9]$/.test(ev.key)) {
    var avail = CFG.tabs.filter(function(t){ return panelAvail(t); });
    var t = avail[parseInt(ev.key, 10) - 1];
    if (t) { ev.preventDefault(); toggle(t.key); }
  }
});
document.addEventListener('pointerdown', function(ev){
  if (!state.open) return;
  var w = wraps[state.open];
  if (w && w.contains(ev.target)) return;
  if (rail && rail.contains(ev.target)) return;
  state.open = null; save(); applyOpen();
}, true);
function boot(){ tick(); setInterval(tick, 700); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 300); });
else setTimeout(boot, 300);
window.__studioDock = { version: 'PhaseO-3', app: CFG.app, pop: POP, open: function(){ return state.open; }, toggle: toggle };
})();
