/* ═══ STARS ═══ */

/* ═══ OSCILLOSCOPE ═══ */
/* 2026-11-10 高速化: 見えていない間は描画を止める。
   従来は rAF で常時描画しており、画面外にあっても CPU を使い続けていた
   (アイドル時 TaskDuration 約0.59s/6s の主因)。IntersectionObserver +
   document.hidden + 非表示パネル (offsetParent) で可視判定し、見えない間は
   250ms 間隔の再確認に落とす。描画の数式と t の進み方は可視時そのまま。 */
(()=>{const cv=document.getElementById('osc');if(!cv)return;const cx=cv.getContext('2d');let t=0;let inView=true;const resize=()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;};resize();window.addEventListener('resize',resize);if('IntersectionObserver' in window){new IntersectionObserver(es=>{inView=es[0].isIntersecting;},{threshold:0.01}).observe(cv);}(function draw(){if(document.hidden||!inView||cv.offsetParent===null){setTimeout(()=>requestAnimationFrame(draw),250);return;}if(cv.offsetWidth&&cv.width!==cv.offsetWidth)resize();cx.clearRect(0,0,cv.width,cv.height);[[.018,.016,16,'rgba(255,255,255,0.5)'],[.031,.022,10,'rgba(255,255,255,0.28)'],[.009,.008,22,'rgba(255,255,255,0.15)']].forEach(([f,f2,a,col])=>{cx.strokeStyle=col;cx.lineWidth=1.2;cx.beginPath();for(let x=0;x<cv.width;x++){const y=cv.height/2+Math.sin(x*f+t)*a+Math.sin(x*f2+t*1.4)*(a*.6);x===0?cx.moveTo(x,y):cx.lineTo(x,y);}cx.stroke();});t+=.014;requestAnimationFrame(draw);})();})();
