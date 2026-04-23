
(function () {
'use strict';

/* ══════════════════════════════════════════════════════════════
   1. CSS
══════════════════════════════════════════════════════════════ */
document.head.insertAdjacentHTML('beforeend', `<style id="tut-style">

/* ── Info overlay (blocks clicks during info slides) ─────────── */
#tut-ov {
  position:fixed; inset:0; z-index:9000;
  display:flex; align-items:center; justify-content:center;
  font-family:'Crimson Text', Georgia, serif;
  background:rgba(4,2,14,0.88);
  backdrop-filter:blur(6px);
  opacity:0; visibility:hidden;
  transition:opacity .35s ease, visibility .35s ease;
  pointer-events:none;
}
#tut-ov.on { opacity:1; visibility:visible; pointer-events:auto; }

/* ── Floating card for interactive steps (outside overlay!) ──── */
#tut-float {
  position:fixed;
  left:50%; bottom:28px;
  transform:translateX(-50%);
  z-index:9200;
  display:none;
  pointer-events:auto;
}
#tut-float.on { display:block; }

/* ── Dim mask (interactive steps only) ──────────────────────── */
#tut-dim {
  position:fixed; inset:0;
  z-index:9100;
  pointer-events:none;
  opacity:0; visibility:hidden;
  transition:opacity .3s ease, visibility .3s ease;
  /* background updated live via JS */
}
#tut-dim.on { opacity:1; visibility:visible; }

/* ── Spotlight ring ──────────────────────────────────────────── */
#tut-ring {
  position:fixed; border-radius:50%;
  pointer-events:none; z-index:9150;
  border:2.5px solid rgba(233,196,106,.9);
  box-shadow:0 0 28px 8px rgba(233,196,106,.55), 0 0 55px 14px rgba(168,85,247,.3);
  opacity:0; transition:opacity .3s;
  animation:ring-pulse 2s ease-in-out infinite;
}
#tut-ring.on { opacity:1; }
@keyframes ring-pulse {
  0%,100%{ box-shadow:0 0 28px 8px rgba(233,196,106,.55),0 0 55px 14px rgba(168,85,247,.3); }
  50%    { box-shadow:0 0 42px 14px rgba(233,196,106,.85),0 0 80px 20px rgba(168,85,247,.5); }
}

/* ── Bouncing arrow ──────────────────────────────────────────── */
#tut-arrow {
  position:fixed; pointer-events:none; z-index:9151;
  font-size:28px; color:#FFD700;
  filter:drop-shadow(0 0 10px rgba(233,196,106,1));
  opacity:0; transition:opacity .3s;
  animation:tut-bounce .85s ease-in-out infinite;
}
#tut-arrow.on { opacity:1; }
@keyframes tut-bounce {
  0%,100%{ transform:translateY(0); }
  50%    { transform:translateY(-12px); }
}

/* ══ SHARED CARD STYLES ═══════════════════════════════════════ */
.tc {
  width:min(460px,90vw);
  background:linear-gradient(168deg,#140830 0%,#0a0420 100%);
  border:1px solid rgba(233,196,106,.35);
  border-top:2px solid rgba(233,196,106,.65);
  border-radius:22px; overflow:hidden; position:relative;
  box-shadow:0 0 0 1px rgba(168,85,247,.12),0 28px 70px rgba(0,0,0,.95),0 0 80px rgba(168,85,247,.12);
}

/* Illustration panel */
.tc-illus {
  width:100%; height:190px;
  background:linear-gradient(180deg,#0d0528 0%,#1a0840 100%);
  border-bottom:1px solid rgba(233,196,106,.15);
  position:relative; overflow:hidden;
}
.tc-illus::before {
  content:''; position:absolute; top:0; left:0; right:0; height:1px;
  background:linear-gradient(90deg,transparent,rgba(233,196,106,.5),transparent);
}
.tc-canvas { position:absolute; inset:0; }
.illus-enter { animation:illus-in .45s cubic-bezier(.4,0,.2,1) both; }
@keyframes illus-in {
  from{opacity:0;transform:translateX(30px);}
  to  {opacity:1;transform:translateX(0);}
}

/* Body */
.tc-body { padding:20px 24px 14px; }

.tc-step {
  font-size:.58rem; letter-spacing:3px; text-transform:uppercase;
  color:rgba(168,85,247,.65); margin-bottom:8px;
  display:flex; align-items:center; gap:6px;
}
.tc-step::before{ content:''; width:14px; height:1px; background:rgba(168,85,247,.5); display:inline-block; }

.tc-title {
  font-family:'Cinzel Decorative',serif;
  font-size:clamp(.88rem,2.3vw,1.18rem);
  color:#FFE97A; margin:0 0 10px; line-height:1.2;
  text-shadow:0 0 20px rgba(233,196,106,.3);
}
.tc-desc {
  font-size:clamp(.88rem,1.9vw,1rem);
  color:rgba(215,205,240,.88); line-height:1.65; margin:0 0 14px;
}
.tc-desc em    { color:#FFE97A; font-style:normal; font-weight:600; }
.tc-desc strong{ color:#c4b5fd; font-weight:700; }

.tc-rule {
  display:flex; align-items:flex-start; gap:10px;
  background:rgba(168,85,247,.08); border:1px solid rgba(168,85,247,.20);
  border-radius:10px; padding:9px 13px; margin-bottom:8px;
  font-size:.88rem; color:rgba(215,205,240,.90); line-height:1.5;
}
.tc-rule .ri{ font-size:1.2rem; flex-shrink:0; line-height:1.2; }
.tc-rule em{ color:#FFE97A; font-style:normal; font-weight:600; }

/* Footer */
.tc-footer{ display:flex; align-items:center; justify-content:space-between; padding:0 24px 18px; }

/* Dots */
.tc-dots{ display:flex; gap:7px; }
.td {
  width:7px; height:7px; border-radius:50%;
  background:rgba(255,255,255,.12); border:1px solid rgba(233,196,106,.22);
  transition:all .3s;
}
.td.done{ background:rgba(168,85,247,.55); border-color:rgba(168,85,247,.5); }
.td.cur { background:#E9C46A; border-color:#E9C46A; transform:scale(1.5); box-shadow:0 0 8px rgba(233,196,106,.7); }

/* Next button */
.tc-next {
  display:inline-flex; align-items:center; gap:7px;
  padding:10px 26px;
  font-family:'Cinzel Decorative',serif; font-size:.70rem; font-weight:700;
  letter-spacing:2px; text-transform:uppercase; color:#1a0800;
  background:linear-gradient(180deg,#FFE878 0%,#E9C046 50%,#C07A10 100%);
  border:none; border-radius:10px; cursor:pointer;
  box-shadow:0 3px 0 #6a3a04,0 6px 20px rgba(233,192,70,.35),inset 0 1px 0 rgba(255,255,200,.5);
  transition:transform .12s, box-shadow .12s;
}
.tc-next:hover  { transform:translateY(-2px); box-shadow:0 5px 0 #6a3a04,0 10px 28px rgba(233,192,70,.5),inset 0 1px 0 rgba(255,255,200,.5); }
.tc-next:active { transform:translateY(2px);  box-shadow:0 1px 0 #6a3a04; }

/* Skip */
.tc-skip {
  position:absolute; top:13px; right:14px; z-index:2;
  font-size:.62rem; letter-spacing:1.5px; text-transform:uppercase;
  color:rgba(180,160,220,.55); background:rgba(255,255,255,.04);
  border:1px solid rgba(180,160,220,.18); border-radius:8px;
  cursor:pointer; padding:5px 10px;
  transition:color .2s, background .2s, border-color .2s;
}
.tc-skip:hover{
  color:rgba(239,68,68,.80);
  background:rgba(239,68,68,.08);
  border-color:rgba(239,68,68,.30);
}
/* Back button — left side of card header */
.tc-back {
  position:absolute; top:13px; left:14px; z-index:2;
  font-size:.62rem; letter-spacing:1.5px; text-transform:uppercase;
  color:rgba(180,160,220,.55); background:rgba(255,255,255,.04);
  border:1px solid rgba(180,160,220,.18); border-radius:8px;
  cursor:pointer; padding:5px 10px;
  transition:color .2s, background .2s, border-color .2s;
  display:none; /* hidden on slide 0 */
}
.tc-back.visible { display:inline-block; }
.tc-back:hover{
  color:rgba(168,85,247,.80);
  background:rgba(168,85,247,.08);
  border-color:rgba(168,85,247,.30);
}

/* Card entrance */
.card-enter { animation:card-enter .45s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes card-enter {
  from{opacity:0;transform:scale(.90) translateY(14px);}
  to  {opacity:1;transform:scale(1)   translateY(0);}
}

/* Interactive step "tap hint" */
#tut-tap-hint {
  position:fixed; left:50%; z-index:9201;
  transform:translateX(-50%);
  font-family:'Cinzel Decorative',serif; font-size:.7rem;
  letter-spacing:2px; text-transform:uppercase;
  color:#FFE97A;
  text-shadow:0 0 16px rgba(233,196,106,.8),0 0 32px rgba(233,196,106,.4);
  pointer-events:none; white-space:nowrap;
  opacity:0; transition:opacity .3s;
}
#tut-tap-hint.on { opacity:1; }

</style>`);

/* ══════════════════════════════════════════════════════════════
   2. DOM
══════════════════════════════════════════════════════════════ */
document.body.insertAdjacentHTML('beforeend', `
<!-- INFO overlay card -->
<div id="tut-ov">
  <div class="tc" id="tut-info-card">
    <button class="tc-back" id="tut-back-info">← Back</button>
    <button class="tc-skip" id="tut-skip-info">✕ Skip Tutorial</button>
    <div class="tc-illus" id="tut-illus"><canvas class="tc-canvas" id="tut-cnv"></canvas></div>
    <div class="tc-body">
      <div class="tc-step"  id="ti-step"></div>
      <div class="tc-title" id="ti-title"></div>
      <div class="tc-desc"  id="ti-desc"></div>
    </div>
    <div class="tc-footer">
      <div class="tc-dots" id="ti-dots"></div>
      <button class="tc-next" id="tut-next-btn">Next <span>→</span></button>
    </div>
  </div>
</div>

<!-- INTERACTIVE floating card (no overlay, game canvas fully clickable) -->
<div id="tut-float">
  <div class="tc" id="tut-act-card">
    <button class="tc-back" id="tut-back-act">← Back</button>
    <button class="tc-skip" id="tut-skip-act">✕ Skip Tutorial</button>
    <div class="tc-body" style="padding-top:22px">
      <div class="tc-step"  id="ta-step"></div>
      <div class="tc-title" id="ta-title"></div>
      <div class="tc-desc"  id="ta-desc"></div>
    </div>
    <div class="tc-footer" style="padding-top:0">
      <div class="tc-dots" id="ta-dots"></div>
      <span style="font-size:.75rem;color:rgba(233,196,106,.5);font-family:'Crimson Text',serif">
        ↑ click highlighted vial
      </span>
    </div>
  </div>
</div>

<!-- Dim mask + ring + arrow -->
<div id="tut-dim"></div>
<div id="tut-ring"></div>
<div id="tut-arrow">▼</div>
`);

document.getElementById('tut-next-btn').addEventListener('click', onNext);
document.getElementById('tut-skip-info').addEventListener('click', function(){ endTutorial(); });
document.getElementById('tut-skip-act').addEventListener('click', function(){ endTutorial(); });
document.getElementById('tut-back-info').addEventListener('click', function(){ goBack(); });
document.getElementById('tut-back-act').addEventListener('click', function(){ goBack(); });

var OV       = document.getElementById('tut-ov');
var FLOAT    = document.getElementById('tut-float');
var DIM      = document.getElementById('tut-dim');
var RING     = document.getElementById('tut-ring');
var ARROW    = document.getElementById('tut-arrow');
var INFO_C   = document.getElementById('tut-info-card');
var ACT_C    = document.getElementById('tut-act-card');

/* ══════════════════════════════════════════════════════════════
   3. SLIDES
══════════════════════════════════════════════════════════════ */
var SLIDES = [
  { title:'Welcome, Apprentice!', desc:'Sort the potions so every vial holds <em>only one color</em>. Let\'s walk through your first move!', draw:drawWelcome },
  { title:'Tap to Pour', desc:'Select a vial, then tap another to pour the top potion into it.', draw:drawPourDemo },
  { title:'Same Color Only', rules:[{icon:'❌',text:'You <em>cannot</em> pour onto a different color.'},{icon:'✅',text:'You <em>can</em> pour onto the same color — they stack!'}], draw:drawColorRule },
  { title:'They Stack As One!', desc:'Matching colors on top of each other form a <em>single block</em> and move together.', draw:drawStackRule },
  { title:'Use Empty Vials', desc:'Empty vials are your <em>buffer</em> — any color can go in. Use them to unblock stuck potions.', draw:drawEmptyRule },
  { title:'Sealed with a Cork!', desc:'A vial filled with <em>one color</em> gets sealed automatically — earning you <strong>+10 🪙</strong>!', draw:drawSealRule },
  { title:'Power-Ups', rules:[{icon:'⟲',text:'<em>Undo</em> reverses your last move. You have <em>5 undos</em> total.'},{icon:'⌬',text:'<em>+Vial</em> adds an empty buffer vial for <em>300 🪙</em>.'}], draw:drawPowerups },
  /* Interactive steps — targets patched at start() time */
  { title:'Your Turn — Select!', desc:'Click the <em>highlighted vial</em> to select it.', type:'click-vial', target:'_from_' },
  { title:'Now Pour!', desc:'Click the <em>highlighted empty vial</em> to pour into it. Watch the colors move!', type:'click-vial', target:'_to_' },
  /* Second pour — completes a color and triggers a seal */
  { title:'Keep Sorting!', desc:'Nice! Now select the <em>highlighted vial</em> for one more pour.', type:'click-vial', target:'_from2_' },
  { title:'Complete the Color!', desc:'Pour it in — fill the vial with <em>one color</em> and watch what happens!', type:'click-vial', target:'_to2_' },
  /* Seal witness — static slide showing sealed vial with cork */
  { title:'The Cork Seals It!', desc:'When a vial holds only <em>one color</em> it seals automatically with a cork. You earn <strong>+10</strong> coins!', draw:drawSealWitness },
  /* Final */
  { title:"You're Ready!", desc:'Sort every vial to a single color to complete the level. Good luck, Apprentice!', draw:drawReady, isFinal:true },
];

/* ══════════════════════════════════════════════════════════════
   4. ILLUSTRATION PAINTERS
══════════════════════════════════════════════════════════════ */
var COL = { red:[239,68,68], blue:[59,130,246], green:[34,197,94], yellow:[234,179,8], purple:[168,85,247] };
function rgbaC(c,a){ return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'; }

function rrC(ctx,x,y,w,h,tl,tr,br,bl){
  tl=tl||6; tr=tr||tl; br=br||tl; bl=bl||tl;
  ctx.beginPath(); ctx.moveTo(x+tl,y);
  ctx.lineTo(x+w-tr,y); ctx.quadraticCurveTo(x+w,y,x+w,y+tr);
  ctx.lineTo(x+w,y+h-br); ctx.quadraticCurveTo(x+w,y+h,x+w-br,y+h);
  ctx.lineTo(x+bl,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-bl);
  ctx.lineTo(x,y+tl); ctx.quadraticCurveTo(x,y,x+tl,y); ctx.closePath();
}
function rrTop(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h); ctx.lineTo(x,y+h); ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); ctx.fill();
}

function dVial(ctx,x,cy,layers,maxL,sealed,sel,W,H){
  maxL=maxL||4; sealed=sealed||false; sel=sel||false; W=W||50; H=H||130;
  var top=cy-H/2, LH=H/maxL;
  if(sel){
    ctx.save(); ctx.shadowBlur=22; ctx.shadowColor='rgba(249,196,100,0.85)';
    ctx.strokeStyle='rgba(249,196,100,0.95)'; ctx.lineWidth=2.5;
    rrC(ctx,x-W/2-3,top-3,W+6,H+6,8); ctx.stroke(); ctx.restore();
  }
  ctx.save();
  if(sealed){ ctx.shadowBlur=18; ctx.shadowColor='rgba(34,197,94,0.5)'; }
  ctx.fillStyle='rgba(15,10,30,0.88)'; rrC(ctx,x-W/2,top,W,H,5,5,14,14); ctx.fill(); ctx.restore();
  var fh=layers.length*LH, lt=top+H-fh;
  layers.forEach(function(c,i){
    var ly=lt+(layers.length-1-i)*LH, isTop=i===layers.length-1;
    var col=COL[c]||[150,150,150];
    ctx.fillStyle=rgbaC(col,0.9);
    if(isTop&&layers.length<maxL){ rrTop(ctx,x-W/2+2,ly,W-4,LH,4); }
    else { ctx.fillRect(x-W/2+2,ly,W-4,LH); }
    ctx.fillStyle='rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.roundRect(x-W/2+5,ly+4,7,LH-8,2); ctx.fill();
  });
  ctx.strokeStyle=sealed?'rgba(80,200,100,0.9)':'rgba(70,55,110,0.85)';
  ctx.lineWidth=sealed?2:1.5; rrC(ctx,x-W/2,top,W,H,5,5,14,14); ctx.stroke();
  if(sealed){
    var sc=COL[layers[0]]||[150,150,150];
    ctx.fillStyle='#b48c50'; rrC(ctx,x-W/2+7,top-17,W-14,20,5,5,2,2); ctx.fill();
    ctx.fillStyle='#8c6432'; rrC(ctx,x-W/2+11,top-22,W-22,8,3); ctx.fill();
    ctx.save(); ctx.shadowBlur=12; ctx.shadowColor=rgbaC(sc,0.9);
    ctx.fillStyle=rgbaC(sc,0.92); ctx.beginPath(); ctx.arc(x,top-12,7,0,Math.PI*2); ctx.fill(); ctx.restore();
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(x-2,top-14,3,0,Math.PI*2); ctx.fill();
  } else {
    ctx.fillStyle='rgba(50,35,80,1)'; rrC(ctx,x-W/2-4,top-8,W+8,12,3); ctx.fill();
  }
}

var _F=0; (function tick(){ _F++; requestAnimationFrame(tick); })();
var _slideF = 0; // frame counter that resets each slide

function drawWelcome(ctx,W,H){
  var solved=(_F%240)/240>0.5;
  var g=ctx.createRadialGradient(W/2,H/2,10,W/2,H/2,W/2);
  g.addColorStop(0,'rgba(168,85,247,0.12)'); g.addColorStop(1,'transparent');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  var vx=[W/2-70,W/2,W/2+70];
  if(!solved){
    dVial(ctx,vx[0],H/2+10,['blue','red','green','blue']);
    dVial(ctx,vx[1],H/2+10,['green','blue','red','red']);
    dVial(ctx,vx[2],H/2+10,[]);
  } else {
    dVial(ctx,vx[0],H/2+10,['blue','blue','blue','blue'],4,true);
    dVial(ctx,vx[1],H/2+10,['red','red','red','red'],4,true);
    dVial(ctx,vx[2],H/2+10,['green','green','green','green'],4,true);
  }
  ctx.fillStyle='rgba(215,205,240,0.6)'; ctx.font='13px Crimson Text,serif'; ctx.textAlign='center';
  ctx.fillText(solved?'✨ Sorted!':'Mixed...',W/2,H-10);
}

function blerp(a,b,c,t){ var t2=t*t,t3=t*t*t; return a*(2*t3-3*t2+1)+b*(-4*t3+4*t2)+c*(2*t3-t2); }

function drawPourDemo(ctx,W,H){
  // Play once (180 frames) then hold the final poured state
  var raw = Math.min(_slideF, 179);
  var t   = raw/180;
  var pouring = t>0.15 && t<0.85;
  var pt  = pouring ? (t-0.15)/0.7 : (t>=0.85 ? 1 : 0);
  var done = t >= 0.85;
  var fx=W/2-55, tx=W/2+55, fy=H/2+10;
  dVial(ctx,fx,fy,done||pt>0.95?['blue','green']:['red','blue','green'],4,false,false,46,120);
  dVial(ctx,tx,fy,done||pt>0.95?['red']:[],4,false,false,46,120);
  if(pouring && !done){
    var p2=Math.min(1,pt*1.2),cxB=(fx+tx)/2,cyB=fy-55;
    var bx=blerp(fx,cxB,tx,p2),by=blerp(fy-30,cyB,fy-40,p2);
    ctx.save(); ctx.shadowBlur=14; ctx.shadowColor=rgbaC(COL.red,0.8);
    ctx.fillStyle=rgbaC(COL.red,0.9); ctx.beginPath(); ctx.arc(bx,by,7,0,Math.PI*2); ctx.fill();
    for(var i=1;i<=4;i++){
      var tp2=Math.max(0,p2-i*0.06), bx2=blerp(fx,cxB,tx,tp2), by2=blerp(fy-30,cyB,fy-40,tp2);
      ctx.globalAlpha=0.25/i; ctx.beginPath(); ctx.arc(bx2,by2,5-i,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1; ctx.restore();
  }
  ctx.fillStyle=rgbaC([168,85,247],0.7); ctx.font='12px Crimson Text,serif'; ctx.textAlign='center';
  ctx.fillText(done ? '✓ poured!' : 'tap  →  tap', W/2, H-10);
}

function drawColorRule(ctx,W,H){
  var l=W/2-65,m=W/2,r=W/2+65,cy=H/2+8;
  dVial(ctx,l,cy,['red','purple'],4,false,false,46,115);
  ctx.save(); ctx.strokeStyle='rgba(239,68,68,0.9)'; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(l-14,cy-70); ctx.lineTo(l-4,cy-60); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(l-4,cy-70); ctx.lineTo(l-14,cy-60); ctx.stroke(); ctx.restore();
  dVial(ctx,m,cy,['purple','purple','purple'],4,false,false,46,115);
  ctx.save(); ctx.strokeStyle='rgba(34,197,94,0.9)'; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(m-12,cy-66); ctx.lineTo(m-4,cy-60); ctx.lineTo(m+8,cy-74); ctx.stroke(); ctx.restore();
  ctx.fillStyle='rgba(233,196,106,0.7)'; ctx.font='bold 18px serif'; ctx.textAlign='center'; ctx.fillText('→',r-20,cy-5);
  dVial(ctx,r+18,cy,['purple','purple','purple'],4,false,false,46,115);
}

function drawStackRule(ctx,W,H){
  var lx=W/2-55,rx=W/2+55,cy=H/2+10;
  var VW=46,VH=120,maxL=4,LH=VH/maxL; // LH=30
  // Red layers occupy positions i=1 (top of bottom half) and i=2 (second from top)
  // fh=3*LH=90, lt=cy-VH/2+VH-fh = cy-60+30 = cy-30
  var lt=cy-VH/2+VH-(3*LH);          // lt = cy-30
  var redTop    = lt + (3-1-2)*LH;   // layer i=2 top: lt+0 = cy-30
  var redBottom = lt + (3-1-1)*LH + LH; // layer i=1 bottom: lt+LH+LH = cy+30... wait
  // layer i=2 (topmost red): ly = lt + (layers.length-1-2)*LH = lt+0 = cy-30
  // layer i=1 (lower red):   ly = lt + (layers.length-1-1)*LH = lt+LH = cy-30+30 = cy
  // lower red bottom = cy+LH = cy+30
  redTop    = lt;           // cy-30
  redBottom = lt + 2*LH;   // cy-30+60 = cy+30
  dVial(ctx,lx,cy,['blue','red','red'],4,false,false,VW,VH);
  var pulse=0.7+0.3*Math.sin(_F*0.06);
  ctx.save(); ctx.strokeStyle='rgba(233,196,106,'+pulse*0.85+')'; ctx.lineWidth=2;
  var bx=lx+VW/2+4; // just right of vial edge
  ctx.beginPath(); ctx.moveTo(bx,redTop);   ctx.lineTo(bx+8,redTop);   ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx+8,redTop); ctx.lineTo(bx+8,redBottom); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx,redBottom);ctx.lineTo(bx+8,redBottom); ctx.stroke();
  ctx.fillStyle='rgba(233,196,106,'+(pulse*0.85)+')'; ctx.font='bold 11px Crimson Text,serif'; ctx.textAlign='left';
  ctx.fillText('×2',bx+11,(redTop+redBottom)/2+4); ctx.restore();
  ctx.fillStyle='rgba(233,196,106,0.7)'; ctx.font='bold 18px serif'; ctx.textAlign='center'; ctx.fillText('→',W/2,cy+4);
  dVial(ctx,rx,cy,(_F%200)/200>0.5?['red','red']:[],4,false,false,VW,VH);
  ctx.fillStyle='rgba(215,205,240,0.6)'; ctx.font='12px Crimson Text,serif'; ctx.textAlign='center'; ctx.fillText('Both layers move together!',W/2,H-8);
}

function drawEmptyRule(ctx,W,H){
  var lx=W/2-55,rx=W/2+55,cy=H/2+10;
  dVial(ctx,lx,cy,['green','red'],4,false,false,46,120);
  ctx.fillStyle='rgba(233,196,106,0.7)'; ctx.font='bold 18px serif'; ctx.textAlign='center'; ctx.fillText('→',W/2,cy+4);
  ctx.save(); ctx.shadowBlur=14; ctx.shadowColor='rgba(168,85,247,0.4)';
  dVial(ctx,rx,cy,[],4,false,false,46,120); ctx.restore();
  ctx.fillStyle='rgba(168,85,247,0.7)'; ctx.font='11px Crimson Text,serif'; ctx.textAlign='center'; ctx.fillText('✨ any color welcome',rx,cy+80);
}

function drawSealRule(ctx,W,H){
  var t=(_F%180)/180,cx=W/2,cy=H/2+14;
  dVial(ctx,cx,cy,['purple','purple','purple','purple'],4,t>0.3,false,54,130);
  if(t>0.3){
    var pt=(t-0.3)/0.7,coinY=cy-80-pt*40;
    ctx.globalAlpha=pt<0.8?1:(1-pt)/0.2; ctx.fillStyle='#FFE97A';
    ctx.font='bold 15px Cinzel Decorative,serif'; ctx.textAlign='center';
    ctx.shadowBlur=12; ctx.shadowColor='rgba(233,196,106,0.9)';
    ctx.fillText('+10 🪙',cx,coinY); ctx.shadowBlur=0; ctx.globalAlpha=1;
  }
}

function drawPowerups(ctx,W,H){
  var ux=W/4,ry=H/2-10;
  ctx.fillStyle='rgba(168,85,247,0.15)'; ctx.strokeStyle='rgba(168,85,247,0.4)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.roundRect(ux-34,ry-26,68,52,10); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#c4b5fd'; ctx.font='bold 22px serif'; ctx.textAlign='center'; ctx.fillText('↩',ux,ry+6);
  for(var i=0;i<5;i++){ ctx.fillStyle=i<3?'rgba(168,85,247,0.8)':'rgba(100,80,130,0.4)'; ctx.beginPath(); ctx.arc(ux-16+i*8,ry+24,4,0,Math.PI*2); ctx.fill(); }
  ctx.fillStyle='rgba(215,205,240,0.6)'; ctx.font='11px Crimson Text,serif'; ctx.fillText('5 undos',ux,ry+42);
  var vx=W*3/4,vy=H/2-10;
  ctx.fillStyle='rgba(233,196,106,0.12)'; ctx.strokeStyle='rgba(233,196,106,0.4)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.roundRect(vx-34,vy-26,68,52,10); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#E9C46A'; ctx.font='bold 14px serif'; ctx.textAlign='center'; ctx.fillText('+🧪',vx,vy+7);
  ctx.fillStyle='rgba(215,205,240,0.6)'; ctx.font='11px Crimson Text,serif'; ctx.fillText('300 🪙',vx,vy+42);
}

function drawSealWitness(ctx,W,H){
  // Shows a vial sealing in real time — cork drops in with animation
  var cy = H/2+10;
  var t  = _slideF;

  // Left vial: fully sealed (blue), cork already closed
  dVial(ctx, W/2-75, cy, ['blue','blue','blue','blue'], 4, true, false, 46, 118);

  // Right vial: red, animates cork dropping in over ~60 frames
  var sealProgress = Math.min(1, t / 60);
  var redSealed    = sealProgress >= 1;
  dVial(ctx, W/2+75, cy, ['red','red','red','red'], 4, redSealed, false, 46, 118);

  // Animate the cork sliding down onto the red vial
  if (!redSealed) {
    var vTop  = cy - 118/2;
    var corkY = vTop - 30 + sealProgress * 22; // slides from above into position
    var alpha = 0.4 + sealProgress * 0.6;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#b48c50';
    rrC(ctx, W/2+75 - 46/2+7, corkY, 46-14, 20, 5,5,2,2);
    ctx.fill();
    ctx.fillStyle = '#8c6432';
    rrC(ctx, W/2+75 - 46/2+11, corkY-5, 46-22, 8, 3);
    ctx.fill();
    ctx.restore();

    // Coin pop effect when sealing
    if (t > 55) {
      var popAlpha = Math.min(1, (t-55)/10);
      ctx.save();
      ctx.globalAlpha = popAlpha;
      ctx.font = 'bold 14px Crimson Text, serif';
      ctx.fillStyle = '#FFE97A';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 12; ctx.shadowColor = 'rgba(233,196,106,0.9)';
      ctx.fillText('+10 🪙', W/2+75, cy - 118/2 - 40 - (t-55)*1.2);
      ctx.restore();
    }
  } else {
    // Finished — show sparkling coin reward
    var sparkA = 0.7 + 0.3*Math.sin(t*0.12);
    ctx.save();
    ctx.globalAlpha = sparkA;
    ctx.font = 'bold 14px Crimson Text, serif';
    ctx.fillStyle = '#FFE97A';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(233,196,106,0.9)';
    ctx.fillText('+10 🪙', W/2+75, cy - 118/2 - 46);
    ctx.restore();
  }

  // Label
  ctx.font = '13px Crimson Text, serif';
  ctx.fillStyle = 'rgba(180,255,160,0.75)';
  ctx.textAlign = 'center';
  ctx.fillText('Sealed!', W/2-75, cy + 118/2 + 18);
  ctx.fillStyle = sealProgress < 0.3 ? 'rgba(255,180,80,0.6)' : 'rgba(180,255,160,0.75)';
  ctx.fillText(redSealed ? 'Sealed!' : 'Sealing...', W/2+75, cy + 118/2 + 18);
}

function drawReady(ctx,W,H){
  var vx=[W/2-70,W/2,W/2+70],cy=H/2+15;
  dVial(ctx,vx[0],cy,['red','red','red','red'],4,true,false,44,115);
  dVial(ctx,vx[1],cy,['blue','blue','blue','blue'],4,true,false,44,115);
  dVial(ctx,vx[2],cy,['green','green','green','green'],4,true,false,44,115);
  ctx.font='28px serif'; ctx.textAlign='center';
  ctx.shadowBlur=16; ctx.shadowColor='rgba(233,196,106,0.9)'; ctx.fillText('⭐⭐⭐',W/2,H-14); ctx.shadowBlur=0;
}

/* ══════════════════════════════════════════════════════════════
   5. STATE
══════════════════════════════════════════════════════════════ */
var active        = false;
var slideIdx      = 0;
var _animId       = null;
var _spotRaf      = null;
var _emptyVialIdx  = -1;  // captured once at tutorial start, before any pour
var _filledVialIdx = -1;  // first non-empty vial, captured at start
var _from2VialIdx  = -1;  // source vial for second pour (resolved after first pour)
var _to2VialIdx    = -1;  // dest vial for second pour (resolved after first pour)

/* ══════════════════════════════════════════════════════════════
   6. PUBLIC API
══════════════════════════════════════════════════════════════ */
window.TutorialManager = {
  start: function() {
    if (active) return;
    console.log('[Tutorial] start');
    active=true; slideIdx=0;
    // Capture concrete from/to vial indices for the interactive steps.
    // fromIdx = first filled vial, toIdx = first empty vial.
    // Patch the SLIDES array directly with plain numbers so onVialClicked
    // never has to do any string-based lookup — just idx === target.
    _emptyVialIdx  = -1;
    _filledVialIdx = -1;
    var startVials = (window.Game && window.Game.vials) || [];
    for (var si = 0; si < startVials.length; si++) {
      var sv = startVials[si];
      if (!sv || !sv.layers) continue;
      if (sv.layers.length  >  0 && _filledVialIdx < 0) _filledVialIdx = si;
      if (sv.layers.length === 0 && _emptyVialIdx  < 0) _emptyVialIdx  = si;
    }
    // Patch the interactive slides with real numbers
    for (var ii = 0; ii < SLIDES.length; ii++) {
      if (SLIDES[ii].target === '_from_' || SLIDES[ii]._origTarget === '_from_') {
        SLIDES[ii]._origTarget = '_from_';
        SLIDES[ii].target = _filledVialIdx;
      }
      if (SLIDES[ii].target === '_to_' || SLIDES[ii]._origTarget === '_to_') {
        SLIDES[ii]._origTarget = '_to_';
        SLIDES[ii].target = _emptyVialIdx;
      }
      // _from2_ and _to2_ are resolved dynamically after the first pour
      // so we leave them as strings for now — onPourComplete will patch them
      if (SLIDES[ii].target === '_from2_' || SLIDES[ii]._origTarget === '_from2_') {
        SLIDES[ii]._origTarget = '_from2_';
        SLIDES[ii].target = '_from2_'; // will be patched after first pour
      }
      if (SLIDES[ii].target === '_to2_' || SLIDES[ii]._origTarget === '_to2_') {
        SLIDES[ii]._origTarget = '_to2_';
        SLIDES[ii].target = '_to2_'; // will be patched after first pour
      }
    }
    window._tutEmptyCached  = _emptyVialIdx;
    window._tutFilledCached = _filledVialIdx;
    console.log('[Tutorial] fromIdx='+_filledVialIdx+' toIdx='+_emptyVialIdx);
    buildDots();
    showSlide(0);
  },
  end: endTutorial,
  isActive: function(){ return active; },
  syncPositions: function(){},

  /* Returns true  → wrong vial, consume click
     Returns false → correct/pass through to game  */
  onVialClicked: function(idx) {
    if (!active) return false;
    var s = SLIDES[slideIdx];
    if (!s || s.type !== 'click-vial') return false;
    var target = resolveTarget(s.target);
    if (idx === target) {
      advance();   // advance tutorial
      return false; // return false = let caller also run Game.handleClick
    }
    shakeAct();  // wrong vial — shake card
    return true; // consume click, block game
  },

  onPourComplete: function() {
    if (!active) return;
    // After ANY pour, re-scan vials to figure out _from2_ and _to2_
    // _from2_: vial whose top run matches a vial that can accept it (non-empty, matching color)
    // _to2_:   the vial that can receive it (completing a single color)
    var vials = (window.Game && window.Game.vials) || [];
    _from2VialIdx = -1;
    _to2VialIdx   = -1;
    // Find best move: a pour that would complete a vial (make it all one color)
    for (var f = 0; f < vials.length; f++) {
      var vf = vials[f];
      if (!vf || !vf.layers || vf.layers.length === 0) continue;
      var topColor = vf.layers[vf.layers.length - 1];
      // Count how many top layers share this color
      var runLen = 0;
      for (var li = vf.layers.length - 1; li >= 0; li--) {
        if (vf.layers[li] === topColor) runLen++;
        else break;
      }
      for (var t = 0; t < vials.length; t++) {
        if (t === f) continue;
        var vt = vials[t];
        if (!vt || !vt.layers) continue;
        var space = (vt.maxLayers || 4) - vt.layers.length;
        if (space <= 0) continue;
        // Destination must be empty OR have matching top color
        if (vt.layers.length > 0 && vt.layers[vt.layers.length-1] !== topColor) continue;
        // Prefer moves that would make the destination all one color
        var destSameColor = vt.layers.length > 0 && vt.layers.every(function(c){ return c === topColor; });
        var wouldFill = (vt.layers.length + runLen) === (vt.maxLayers || 4);
        if (wouldFill || destSameColor) {
          _from2VialIdx = f;
          _to2VialIdx   = t;
          break;
        }
      }
      if (_from2VialIdx >= 0) break;
    }
    // Fallback: pick any valid pour
    if (_from2VialIdx < 0) {
      for (var f2 = 0; f2 < vials.length; f2++) {
        var vf2 = vials[f2];
        if (!vf2 || !vf2.layers || vf2.layers.length === 0) continue;
        var tc = vf2.layers[vf2.layers.length-1];
        for (var t2 = 0; t2 < vials.length; t2++) {
          if (t2 === f2) continue;
          var vt2 = vials[t2];
          if (!vt2 || !vt2.layers) continue;
          var sp2 = (vt2.maxLayers||4) - vt2.layers.length;
          if (sp2 <= 0) continue;
          if (vt2.layers.length === 0 || vt2.layers[vt2.layers.length-1] === tc) {
            _from2VialIdx = f2; _to2VialIdx = t2; break;
          }
        }
        if (_from2VialIdx >= 0) break;
      }
    }
    // Patch the _from2_ and _to2_ slides with real numbers
    for (var si = 0; si < SLIDES.length; si++) {
      if (SLIDES[si]._origTarget === '_from2_') SLIDES[si].target = _from2VialIdx;
      if (SLIDES[si]._origTarget === '_to2_')   SLIDES[si].target = _to2VialIdx;
    }
    window._tutFrom2Cached = _from2VialIdx;
    window._tutTo2Cached   = _to2VialIdx;
    // If currently on a _from2_ interactive step, refresh the highlight
    var cs = SLIDES[slideIdx];
    if (cs && cs.type === 'click-vial' && (cs._origTarget === '_from2_' || cs._origTarget === '_to2_')) {
      window._tutSpotTarget = resolveTarget(cs.target);
      window._tutSpotSpec   = window._tutSpotTarget;
    }
  },
};

/* ══════════════════════════════════════════════════════════════
   7. SHOW SLIDE
══════════════════════════════════════════════════════════════ */
function showSlide(i) {
  if (!active || i >= SLIDES.length) { endTutorial(); return; }
  slideIdx = i;
  var s = SLIDES[i];

  if (s.type === 'click-vial') {
    showInteractive(s);
  } else {
    showInfo(s);
  }
}

/* ── INFO slide ──────────────────────────────────────────────── */
function showInfo(s) {
  // Hide interactive layers + clear canvas highlight
  FLOAT.classList.remove('on');
  stopSpot();
  _slideF = 0; // reset per-slide animation frame

  // Show overlay
  OV.classList.add('on');

  // Illustration
  var illus = document.getElementById('tut-illus');
  var cnv   = document.getElementById('tut-cnv');
  if (s.draw) {
    illus.style.display = 'block';
    cnv.width  = illus.clientWidth  || 460;
    cnv.height = illus.clientHeight || 190;
    cancelAnimationFrame(_animId);
    var capIdx = slideIdx;
    function paint() {
      if (!active || slideIdx !== capIdx) return;
      _slideF++;
      var ctx = cnv.getContext('2d');
      ctx.clearRect(0,0,cnv.width,cnv.height);
      s.draw(ctx,cnv.width,cnv.height);
      _animId = requestAnimationFrame(paint);
    }
    paint();
    illus.classList.remove('illus-enter');
    void illus.offsetWidth;
    illus.classList.add('illus-enter');
  } else {
    illus.style.display = 'none';
    cancelAnimationFrame(_animId);
  }

  fillText('ti-step','ti-title','ti-desc',s);
  var nb = document.getElementById('tut-next-btn');
  nb.style.display = 'inline-flex';
  nb.innerHTML = s.isFinal ? "Let's Brew! <span>✦</span>" : "Next <span>→</span>";

  updateDots('ti-dots', slideIdx);
  // Show back button only when not on first slide
  var backInfoBtn = document.getElementById('tut-back-info');
  if (backInfoBtn) backInfoBtn.className = 'tc-back' + (slideIdx > 0 ? ' visible' : '');
  INFO_C.classList.remove('card-enter'); void INFO_C.offsetWidth; INFO_C.classList.add('card-enter');
}

/* ── INTERACTIVE slide ───────────────────────────────────────── */
function showInteractive(s) {
  // Hide the blocking info overlay completely — p5 canvas gets all mouse events
  OV.classList.remove('on');
  cancelAnimationFrame(_animId);

  fillText('ta-step','ta-title','ta-desc',s);
  updateDots('ta-dots', slideIdx);
  // Show back button (interactive slides are never slide 0)
  var backActBtn = document.getElementById('tut-back-act');
  if (backActBtn) backActBtn.className = 'tc-back visible';

  // Show floating card at bottom of screen
  FLOAT.classList.add('on');
  ACT_C.classList.remove('card-enter');
  void ACT_C.offsetWidth;
  ACT_C.classList.add('card-enter');

  // Target is always a plain number after start() patches the SLIDES array.
  var vi = (typeof s.target === 'number') ? s.target : resolveTarget(s.target);
  window._tutSpotSpec   = vi;   // number spec — draw loop uses directly
  window._tutSpotTarget = vi;
  console.log('[TUT] interactive vi=', vi, 'target=', s.target);
}

function stopSpot() {
  cancelAnimationFrame(_spotRaf);
  _spotRaf = null;
  window._tutSpotTarget = -1;
  window._tutSpotSpec   = null;
}


/* ══════════════════════════════════════════════════════════════
   9. NAVIGATION
══════════════════════════════════════════════════════════════ */
function advance() {
  stopSpot();
  showSlide(slideIdx + 1);
}

function goBack() {
  if (slideIdx <= 0) return;
  stopSpot();
  showSlide(slideIdx - 1);
}

function onNext() {
  var s = SLIDES[slideIdx];
  if (s && s.isFinal) { endTutorial(); return; }
  advance();
}

function endTutorial() {
  active = false;
  cancelAnimationFrame(_animId);
  stopSpot();
  OV.classList.remove('on');
  FLOAT.classList.remove('on');
  // Reset slide targets so start() can re-patch on next run
  for (var ri = 0; ri < SLIDES.length; ri++) {
    if (typeof SLIDES[ri].target === 'number') {
      SLIDES[ri].target = SLIDES[ri]._origTarget || SLIDES[ri].target;
    }
  }
  _from2VialIdx = -1;
  _to2VialIdx   = -1;
  console.log('[Tutorial] ended');
}

/* ══════════════════════════════════════════════════════════════
   10. HELPERS
══════════════════════════════════════════════════════════════ */
function resolveTarget(spec) {
  if (typeof spec === 'number') return spec;
  if (spec === '_from_' || spec === 'filled') return _filledVialIdx;
  if (spec === '_to_'   || spec === 'empty')  return _emptyVialIdx;
  if (spec === '_from2_') return _from2VialIdx;
  if (spec === '_to2_')   return _to2VialIdx;
  return -1;
}

function resolveSpotIdx(spec) {
  return typeof spec === 'number' ? spec : resolveTarget(spec);
}

function fillText(stepId, titleId, descId, s) {
  var stepEl  = document.getElementById(stepId);
  var titleEl = document.getElementById(titleId);
  var descEl  = document.getElementById(descId);
  var total   = SLIDES.length;
  var idx1    = SLIDES.indexOf(s)+1;
  if (stepEl)  stepEl.textContent  = 'Step '+idx1+' of '+total;
  if (titleEl) titleEl.textContent = s.title || '';
  if (descEl) {
    if (s.rules && s.rules.length) {
      descEl.innerHTML = (s.desc?'<p>'+s.desc+'</p>':'')+
        s.rules.map(function(r){
          return '<div class="tc-rule"><span class="ri">'+r.icon+'</span><span>'+r.text+'</span></div>';
        }).join('');
    } else {
      descEl.innerHTML = s.desc || '';
    }
  }
}

function buildDots() {
  ['ti-dots','ta-dots'].forEach(function(id){
    var c=document.getElementById(id); if(!c) return;
    c.innerHTML='';
    SLIDES.forEach(function(_,i){
      var d=document.createElement('div');
      d.className='td'+(i===0?' cur':'');
      c.appendChild(d);
    });
  });
}

function updateDots(containerId, idx) {
  var c=document.getElementById(containerId); if(!c) return;
  c.querySelectorAll('.td').forEach(function(d,i){
    d.className='td'+(i<idx?' done':i===idx?' cur':'');
  });
}

function shakeAct() {
  // Shake the floating wrapper (which has transform:translateX(-50%))
  var el = FLOAT;
  var offsets = [-10,8,-6,5,-2,0];
  el.style.transition = 'none';
  offsets.forEach(function(off,i){
    setTimeout(function(){
      el.style.transform = 'translateX(calc(-50% + '+off+'px))';
    }, i*55);
  });
  setTimeout(function(){
    el.style.transition='';
    el.style.transform='translateX(-50%)';
  }, offsets.length*55+40);
}

/* ══════════════════════════════════════════════════════════════
   11. TRIGGER
══════════════════════════════════════════════════════════════ */
window.addEventListener('loadLevel', function(e) {
  if (!e.detail) return;
  if (e.detail.levelId === 1) {
    var tries=0;
    function tryStart(){
      tries++;
      var el  = document.querySelector('#p5-canvas-wrapper canvas');
      var pos = window._tutPositions || [];
      if (el && el.offsetWidth>20 && pos.length>0) {
        window.TutorialManager.start();
      } else if (el && el.offsetWidth>20 && tries>=15) {
        window.TutorialManager.start();
      } else if (tries<60) { setTimeout(tryStart,100); }
    }
    setTimeout(tryStart, 400);
  } else {
    if (active) endTutorial();
  }
});

})();