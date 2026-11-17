/* ═══════════════════════════════════════════════════
   v13.0: MARKOV CHAIN MUSIC ENGINE
   確率的遷移行列 — MIDI統合レイヤー
   ─────────────────────────────────────────────────
   ソース: markov-music-engine.jsx (ported to vanilla JS)

   JSXで発見・修正した問題:
     ① generateSequence() の midiNote 計算:
        (octave+1)*12 + root + interval → 0-127 クランプ追加
        （例: oct=7, large interval → 127越え）
     ② nextNote() の温度0除算ガード:
        Math.max(temperature, 0.01) は正しいが
        sum===0 の場合のフォールバックを追加
     ③ buildTransitionMatrix() の bias="static" 時:
        i===j のみ weight*=3.0 だが全て正規化されるため
        他音への遷移が極端に低くなりすぎる問題 →
        staticモードのベース weight を 0.05 に引き上げ
     ④ Web Audio setTimeout タイマードリフト:
        MIDI生成では無関係。ここではMIDI tick変換のみ行う。
   ─────────────────────────────────────────────────
   公開API:
     MarkovEngine.buildMatrix(scaleNotes, bias, tension)
     MarkovEngine.nextNote(currentIdx, matrix, temperature)
     MarkovEngine.generateSequence(length, startIdx, matrix, scaleNotes, rootNote, octave, temperature)
     MarkovEngine.makeMarkovTrack(rootMidi, scaleIv, p, prg)
     MarkovEngine.SCALE_PRESETS
     MarkovEngine.buildUI()   ← UIリビルド
     MarkovEngine.getState()  ← 現在パラメータ取得
═══════════════════════════════════════════════════ */
const MarkovEngine=(()=>{
'use strict';

/* ── スケールプリセット（JSXより移植） ── */
const SCALE_PRESETS={
  pentatonicMinor:{name:'Penta Minor',notes:[0,3,5,7,10]},
  pentatonic:     {name:'Penta Major',notes:[0,2,4,7,9]},
  blues:          {name:'Blues',notes:[0,3,5,6,7,10]},
  dorian:         {name:'Dorian',notes:[0,2,3,5,7,9,10]},
  phrygian:       {name:'Phrygian',notes:[0,1,3,5,7,8,10]},
  lydian:         {name:'Lydian',notes:[0,2,4,6,7,9,11]},
  mixolydian:     {name:'Mixolydian',notes:[0,2,4,5,7,9,10]},
  minor:          {name:'Nat. Minor',notes:[0,2,3,5,7,8,10]},
  major:          {name:'Major',notes:[0,2,4,5,7,9,11]},
  wholeTone:      {name:'Whole Tone',notes:[0,2,4,6,8,10]},
  octatonic_hw:   {name:'Octatonic HW',notes:[0,1,3,4,6,7,9,10]},
  hungarian:      {name:'Hungarian Min',notes:[0,2,3,6,7,8,11]},
  chromatic:      {name:'Chromatic',notes:[0,1,2,3,4,5,6,7,8,9,10,11]},
};

const NF=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

/* ── 遷移確率行列を生成（JSX bugfix: staticモードのbase weight修正） ── */
function buildMatrix(scaleNotes,bias,tension){
  const n=scaleNotes.length;
  const matrix=[];
  for(let i=0;i<n;i++){
    const row=[];
    for(let j=0;j<n;j++){
      const interval=Math.abs(scaleNotes[j]-scaleNotes[i]);
      const wI=Math.min(interval,12-interval);
      // ① static モードのデッドロック防止: base weight を 0.05 に引き上げ
      let w=bias==='static'?0.05:1.0;
      if(wI<=2)      w*=(2.0-tension*1.2);
      else if(wI<=5) w*=(1.0-tension*0.3);
      else           w*=(0.3+tension*0.9);
      if(bias==='ascending'  && scaleNotes[j]>scaleNotes[i]) w*=1.8;
      if(bias==='ascending'  && scaleNotes[j]<scaleNotes[i]) w*=0.4;
      if(bias==='descending' && scaleNotes[j]<scaleNotes[i]) w*=1.8;
      if(bias==='descending' && scaleNotes[j]>scaleNotes[i]) w*=0.4;
      if(bias==='static'     && i===j) w=3.0;
      if(bias==='leap'       && wI>=5) w*=2.5;
      if(wI===7||wI===5) w*=(1.0+tension*0.5);
      row.push(Math.max(w,0.001));
    }
    const sum=row.reduce((a,b)=>a+b,0);
    matrix.push(row.map(v=>v/sum));
  }
  return matrix;
}

/* ── マルコフ連鎖で次音インデックスを選択 ── */
function nextNote(currentIdx,matrix,temperature){
  if(!matrix||!matrix[currentIdx])return 0;
  const row=matrix[currentIdx];
  const adj=row.map(p=>Math.pow(Math.max(p,1e-10),1/Math.max(temperature,0.01)));
  const sum=adj.reduce((a,b)=>a+b,0);
  // ② sum===0 ガード（全確率が極小だった場合）
  if(sum<=0)return Math.floor(rng()*row.length);
  const norm=adj.map(p=>p/sum);
  let rand=rng();
  for(let i=0;i<norm.length;i++){rand-=norm[i];if(rand<=0)return i;}
  return norm.length-1;
}

/* ── シーケンス生成（JSX bugfix: midiNote クランプ追加） ── */
function generateSequence(length,startIdx,matrix,scaleNotes,rootNote,oct,temperature){
  const seq=[];
  let cur=startIdx!=null?startIdx:Math.floor(rng()*scaleNotes.length);
  for(let i=0;i<length;i++){
    // ③ midiNote オーバーフロー修正: (octave+1)*12 → clamp to 0-127
    const raw=(oct+1)*12+rootNote+scaleNotes[cur];
    const midiNote=Math.max(12,Math.min(115,raw));
    const noteName=NF[(rootNote+scaleNotes[cur])%12];
    seq.push({scaleIdx:cur,midiNote,noteName});
    cur=nextNote(cur,matrix,temperature);
  }
  return seq;
}

/* ── 内部状態 ── */
const STATE={
  scaleKey:'pentatonicMinor',
  bias:'neutral',
  tension:0.5,
  temperature:0.8,
  seqLength:16,
  octave:4,
  matrix:null,
  sequence:[],
  /* v7.0: mode = 'order1' (従来) | 'order2' | 'chord' (コード条件付き)。
     corpusUse/corpus = ドロップした .mid から学習した遷移コーパス */
  mode:'order1',
  corpusUse:false,
  corpus:null,
};

/* ═══ v7.0: コーパス学習 ═══
   学習した遷移カウントはトニック相対 (12×12) で保持し、
   localStorage の新規キー 'meikyoshisui_corpus_v1' に保存する。
   コーパスが無い / OFF のときは完全に不活性 (従来動作)。 */
const CORPUS_KEY='meikyoshisui_corpus_v1';
function learnCorpus(notes,name){
  if(!notes||notes.length<2)return null;
  const sorted=[...notes].sort((a,b)=>a.start-b.start);
  const freq=new Array(12).fill(0);
  for(const n of sorted)freq[((n.note%12)+12)%12]++;
  let tonicPc=0;for(let i=1;i<12;i++)if(freq[i]>freq[tonicPc])tonicPc=i;
  const counts=[];for(let i=0;i<12;i++)counts.push(new Array(12).fill(0));
  for(let i=0;i<sorted.length-1;i++){
    const a=((sorted[i].note%12)-tonicPc+12)%12;
    const b=((sorted[i+1].note%12)-tonicPc+12)%12;
    counts[a][b]++;
  }
  const corpus={v:1,name:String(name||'dropped.mid'),notes:sorted.length,tonicPc,counts};
  try{localStorage.setItem(CORPUS_KEY,JSON.stringify(corpus));}catch(e){}
  STATE.corpus=corpus;
  return corpus;
}
function loadCorpus(){
  try{const raw=localStorage.getItem(CORPUS_KEY);if(raw){const c=JSON.parse(raw);if(c&&c.counts&&c.counts.length===12)STATE.corpus=c;}}catch(e){}
  return STATE.corpus;
}
function clearCorpus(){
  STATE.corpus=null;
  try{localStorage.removeItem(CORPUS_KEY);}catch(e){}
}
function getCorpus(){return STATE.corpus;}
/* コーパスを行列化: 現在のスケール音列 sn に対する遷移確率。
   学習データのある行はコーパスから、無い行は基本行列 (baseMat) から取る。
   コーパス自体が無ければ null (呼び出し側は基本行列を使う) */
function corpusMatrix(sn,baseMat){
  const c=STATE.corpus;if(!c)return null;
  const n=sn.length,out=[];
  for(let i=0;i<n;i++){
    const crow=c.counts[((sn[i]%12)+12)%12]||[];
    let sum=0;const row=[];
    for(let j=0;j<n;j++){const v=(crow[((sn[j]%12)+12)%12]||0);row.push(v);sum+=v;}
    if(sum<=0){out.push(baseMat?baseMat[i]:row.map(()=>1/n));continue;}
    const sm=sum+0.05*n;
    out.push(row.map(v=>(v+0.05)/sm));
  }
  return out;
}
/* コード条件付き: 現在のコードトーン列を強め、それ以外を弱めて再正規化 */
function reweightChord(mat,sn,chordIv){
  const pcs=new Set((chordIv||[]).map(v=>((v%12)+12)%12));
  if(!pcs.size)return mat;
  return mat.map(row=>{
    const w=row.map((v,j)=>v*(pcs.has(((sn[j]%12)+12)%12)?1.8:0.7));
    const s=w.reduce((a,b)=>a+b,0)||1;
    return w.map(v=>v/s);
  });
}
/* 2次マルコフ近似: 直前音の行も投票させる履歴重み付け遷移 */
function nextNote2(prevIdx,curIdx,matrix,temperature){
  if(!matrix||!matrix[curIdx])return 0;
  const cur=matrix[curIdx],prev=prevIdx!=null?matrix[prevIdx]:null;
  const w=cur.map((p,j)=>Math.max(p,1e-10)*(prev?0.45+0.55*Math.max(prev[j],0):1));
  const adj=w.map(p=>Math.pow(p,1/Math.max(temperature,0.01)));
  const sum=adj.reduce((a,b)=>a+b,0);
  if(sum<=0)return Math.floor(rng()*cur.length);
  let rand=rng();
  for(let i=0;i<adj.length;i++){rand-=adj[i]/sum;if(rand<=0)return i;}
  return adj.length-1;
}
function generateSequence2(length,startIdx,matrix,scaleNotes,rootNote,oct,temperature){
  const seq=[];
  let prev=null,cur=startIdx!=null?startIdx:Math.floor(rng()*scaleNotes.length);
  for(let i=0;i<length;i++){
    const raw=(oct+1)*12+rootNote+scaleNotes[cur];
    const midiNote=Math.max(12,Math.min(115,raw));
    seq.push({scaleIdx:cur,midiNote,noteName:NF[(rootNote+scaleNotes[cur])%12]});
    const nx=nextNote2(prev,cur,matrix,temperature);
    prev=cur;cur=nx;
  }
  return seq;
}

function rebuildMatrix(){
  const sn=SCALE_PRESETS[STATE.scaleKey].notes;
  STATE.matrix=buildMatrix(sn,STATE.bias,STATE.tension);
  rebuildSequence();
}

function rebuildSequence(){
  if(!STATE.matrix)return;
  const sn=SCALE_PRESETS[STATE.scaleKey].notes;
  STATE.sequence=generateSequence(STATE.seqLength,0,STATE.matrix,sn,0,STATE.octave,STATE.temperature);
  renderMatrix();
  renderSequence();
  updateInfo();
}

/* ── MIDI トラック生成（VOID SYNTHESISのレイヤーシステムに統合） ── */
function makeMarkovTrack(rootMidi,scaleIv,p,prg){
  const{ppq,bars,genre,humanize,velocity,tensionCurve,gateBase,gateHumanize,lorenz,pcAnalysis}=p;
  const bt=ppq*4,total=bt*bars;
  const hum=humanize/100;
  /* v7.0: レイヤー別 velocity 倍率 (既定 1 = 従来と同一) */
  const vB=Math.round(velocity*0.88*(p.mkvVelMul!=null?p.mkvVelMul:1));

  const sn=SCALE_PRESETS[STATE.scaleKey].notes;
  /* v7.0: 実効行列 — コーパス使用時はコーパス行列、コード条件付きモードでは
     スライスのコードトーンで重み付け。既定 (order1 / コーパスOFF) は従来行列 */
  const baseMat=STATE.matrix||buildMatrix(sn,STATE.bias,STATE.tension);
  let mat=baseMat;
  if(STATE.corpusUse&&STATE.corpus){const cm=corpusMatrix(sn,baseMat);if(cm)mat=cm;}
  if(STATE.mode==='chord'&&p.chordIv)mat=reweightChord(mat,sn,p.chordIv);
  const rootPc=rootMidi%12;
  const oct=STATE.octave+(p.mkvOctOff||0);

  // マルコフシーケンスをbars*seqLengthぶん生成してMIDIに変換
  // seqLength を bars に比例させて十分な長さを確保
  const totalSteps=Math.max(4,Math.round(Math.max(STATE.seqLength,bars*4)*(p.mkvDenMul!=null?p.mkvDenMul:1)));
  const seq=STATE.mode==='order2'
    ?generateSequence2(totalSteps,0,mat,sn,rootPc,oct,STATE.temperature)
    :generateSequence(totalSteps,0,mat,sn,rootPc,oct,STATE.temperature);

  // stepサイズ: seqLength個を bars小節に分配
  const noteStep=Math.round((total/totalSteps));
  const ae=[];
  let seqIdx=0;

  for(let c=0;c<total;seqIdx++){
    const entry=seq[seqIdx%seq.length];
    const t=typeof getTension==='function'?getTension(c,ppq,tensionCurve):0.5;
    /* PCSetEngine: IVキャラクターで velocity を変調 */
    const pcVelScale=pcAnalysis?Math.max(0.7,1-(pcAnalysis.dissonanceScore/100)*0.25):1.0;
    /* Lorenz: velocity 変調 */
    if(lorenz)lorenz.step();
    const ln=lorenz?lorenz.normalized():{x:64,y:64,z:64};
    const lVelShift=Math.round((ln.x-64)/64*14);
    const vel=Math.max(1,Math.min(127,
      Math.round((vB+Math.round((rng()-0.5)*hum*28)+lVelShift)*pcVelScale
        *(typeof modulateVel==='function'?1+(t-0.5)*0.7:1))
    ));
    const mg=Math.min(noteStep,total-c);
    const gt=typeof calcGateTime==='function'
      ?calcGateTime(noteStep,'lead',genre,t,p.dissonance,gateBase,gateHumanize,mg)
      :Math.round(noteStep*0.8);
    // ch8 (0x98/0x88) — Markov = MIDI ch9 (0-indexed: 8)
    ae.push({pos:c,v:[0x98,entry.midiNote,vel]});
    ae.push({pos:c+gt,v:[0x88,entry.midiNote,0]});
    c+=noteStep;
  }
  return typeof safeAbsToTrack==='function'
    ?safeAbsToTrack(ae,[typeof tname==='function'?tname('Markov'):[],(typeof pc==='function'?pc(8,prg.lead||81):[])])
    :[];
}

/* ── UIレンダリング ── */
function renderMatrix(){
  const el=document.getElementById('mkvMatrix');
  if(!el||!STATE.matrix)return;
  const sn=SCALE_PRESETS[STATE.scaleKey].notes;
  const n=sn.length;
  el.style.gridTemplateColumns=`22px repeat(${n},22px)`;
  let html='<div></div>';
  // 列ラベル
  sn.forEach((_,i)=>{html+=`<div class="mkv-axis">${NF[sn[i]%12]}</div>`;});
  STATE.matrix.forEach((row,ri)=>{
    html+=`<div class="mkv-axis">${NF[sn[ri]%12]}</div>`;
    row.forEach(val=>{
      const hue=Math.round(180-val*120);
      const light=Math.round(20+val*50);
      const alpha=(0.25+val*0.75).toFixed(2);
      const txt=val>0.09?Math.round(val*100):'';
      html+=`<div class="mkv-cell" title="${(val*100).toFixed(1)}%" style="background:hsla(${hue},70%,${light}%,${alpha});color:rgba(255,255,255,${alpha})">${txt}</div>`;
    });
  });
  el.innerHTML=html;
}

function renderSequence(){
  const el=document.getElementById('mkvSeqDisplay');
  if(!el)return;
  if(!STATE.sequence.length){el.innerHTML='<span style="font-family:Share Tech Mono,monospace;font-size:9px;color:var(--text-dim)">— シーケンスを生成してください —</span>';return;}
  el.innerHTML=STATE.sequence.map(s=>`<div class="mkv-note-pill">${s.noteName}<span style="font-size:8px;opacity:.5;margin-left:3px">${s.midiNote}</span></div>`).join('');
}

function updateInfo(){
  const el=document.getElementById('mkvInfo');
  if(!el)return;
  const sn=SCALE_PRESETS[STATE.scaleKey];
  el.textContent=`SCALE: ${sn.name} | BIAS: ${STATE.bias.toUpperCase()} | TENSION: ${STATE.tension.toFixed(2)} | TEMP: ${STATE.temperature.toFixed(2)} | ${STATE.seqLength} steps`;
}

function buildUI(){
  // スケールグリッド
  const sg=document.getElementById('mkvScaleGrid');
  if(sg){
    sg.innerHTML='';
    Object.entries(SCALE_PRESETS).forEach(([k,v])=>{
      const btn=document.createElement('button');
      btn.className='mkv-scale-btn'+(STATE.scaleKey===k?' on':'');
      btn.textContent=v.name;
      btn.addEventListener('click',()=>{STATE.scaleKey=k;buildUI();rebuildMatrix();});
      sg.appendChild(btn);
    });
  }
  // Bias グループ
  const bg=document.getElementById('mkvBiasGroup');
  if(bg){
    bg.innerHTML='';
    [{k:'neutral',l:'中立'},{k:'ascending',l:'上昇↑'},{k:'descending',l:'下降↓'},{k:'static',l:'保持='},{k:'leap',l:'跳躍⤴'}].forEach(({k,l})=>{
      const btn=document.createElement('button');
      btn.className='mkv-bias-btn'+(STATE.bias===k?' on':'');
      btn.textContent=l;
      btn.addEventListener('click',()=>{STATE.bias=k;buildUI();rebuildMatrix();});
      bg.appendChild(btn);
    });
  }
}

function getState(){return{...STATE};}

loadCorpus();

return{SCALE_PRESETS,buildMatrix,nextNote,generateSequence,generateSequence2,makeMarkovTrack,rebuildMatrix,rebuildSequence,buildUI,getState,STATE,learnCorpus,loadCorpus,clearCorpus,getCorpus,corpusMatrix,reweightChord};
})();

