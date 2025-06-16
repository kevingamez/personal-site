import { useEffect, useRef, useState } from 'preact/hooks';

/* ── Parameters you might tweak ─────────────────────────── */
const CELL_SIZE   = 16;          // size of one logical square (px)
const FPS         = 7;           // Life generations per second
const SEED_PERIOD = 10_000;      // ms between random pattern drops
const ROT_X = 50;                // deg  tilt toward "horizon"
const ROT_Z = 20;                // deg  diamond twist
/* -------------------------------------------------------- */

type Grid = Uint8Array;

/* 5×7 bitmap font (only needed glyphs) */
const FONT = {
  A:['01110','10001','10001','11111','10001','10001','10001'],
  E:['11111','10000','10000','11110','10000','10000','11111'],
  G:['01110','10001','10000','10111','10001','10001','01110'],
  I:['11111','00100','00100','00100','00100','00100','11111'],
  K:['10001','10010','10100','11000','10100','10010','10001'],
  M:['10001','11011','10101','10101','10001','10001','10001'],
  N:['10001','11001','10101','10011','10001','10001','10001'],
  V:['10001','10001','10001','10001','10001','01010','00100'],
  Z:['11111','00001','00010','00100','01000','10000','11111'],
  ' ':['000','000','000','000','000','000','000'],
} as Record<string,string[]>;

/* classic seed patterns */
const PATTERNS: Record<string,[number,number][]> = {
  GUN:  [ [24,0],[22,1],[24,1],[12,2],[13,2],[20,2],[21,2],[34,2],[35,2],
          [11,3],[15,3],[20,3],[21,3],[34,3],[35,3],
          [0,4],[1,4],[10,4],[16,4],[20,4],[21,4],
          [0,5],[1,5],[10,5],[14,5],[16,5],[17,5],[22,5],[24,5],
          [10,6],[16,6],[24,6],[11,7],[15,7],[12,8],[13,8] ],
  ACORN:[ [0,0],[1,0],[1,2],[3,1],[4,0],[5,0],[6,0] ],
  R:    [ [1,0],[2,0],[0,1],[1,1],[1,2] ],
};

/* widths of logo lines */
const widthOf = (txt:string,gap=2)=>
  [...txt].reduce((w,ch,i,a)=>w+FONT[ch][0].length+(i===a.length-1?0:gap),0);

/* logo cell list */
function logoCells(w:number,h:number,gap=2,vGap=2){
  const l1='KEVIN',l2='GAMEZ',gh=FONT['A'].length;
  const sy=Math.floor((h-(gh*2+vGap))/2);
  const sx1=Math.floor((w-widthOf(l1,gap))/2);
  const sx2=Math.floor((w-widthOf(l2,gap))/2);
  const out:[number,number][]= [];
  [l1,l2].forEach((ln,row)=>{
    let cx=row?sx2:sx1;
    [...ln].forEach((ch,i,a)=>{
      FONT[ch].forEach((bits,gy)=>
        [...bits].forEach((b,gx)=>{
          if(b==='1') out.push([cx+gx, sy+gy + row*(gh+vGap)]);
        }));
      cx += FONT[ch][0].length + (i===a.length-1?0:gap);
    });
  });
  return out;
}

export default function GameOfLifeIsland(){
  const [playing,setPlaying]=useState(false);
  const playRef=useRef(false);
  const seedId =useRef<number>();
  const invMat =useRef<DOMMatrix>();
  const [hoverCell, setHoverCell] = useState<{x: number, y: number} | null>(null);

  const canvasRef=useRef<HTMLCanvasElement>(null);
  const gridRef =useRef<Grid>();   const nextRef=useRef<Grid>();
  const W=useRef(0); const H=useRef(0);

  /* place centred logo */
  const logo = ()=>{gridRef.current?.fill(0);
    logoCells(W.current,H.current).forEach(([x,y])=>{
      gridRef.current![y*W.current+x]=1;});};

  /* random pattern drop */
  const seed =()=>{
    const pat=PATTERNS[ Object.keys(PATTERNS)[Math.random()*3|0] ];
    const maxX=W.current-Math.max(...pat.map(([x])=>x))-1;
    const maxY=H.current-Math.max(...pat.map(([,y])=>y))-1;
    if(maxX<1||maxY<1) return;   // tiny screens: skip
    const ox=Math.random()*maxX|0, oy=Math.random()*maxY|0;
    pat.forEach(([x,y])=>gridRef.current![ (oy+y)*W.current+ox+x ]=1);
  };
  const startSeeds=()=>{clearInterval(seedId.current);
    seedId.current = window.setInterval(seed,SEED_PERIOD);};
  const stopSeeds =()=>clearInterval(seedId.current);

  /* main canvas life-cycle */
  useEffect(()=>{
    const canvas = canvasRef.current!, ctx = canvas.getContext('2d')!;

    const resize =()=>{
      canvas.width = innerWidth;
      canvas.height= innerHeight;
      W.current=Math.ceil(canvas.width /CELL_SIZE);
      H.current=Math.ceil(canvas.height/CELL_SIZE);
      gridRef.current = new Uint8Array(W.current*H.current);
      nextRef.current = new Uint8Array(W.current*H.current);
      logo(); draw();

      /* capture inverse CSS matrix for pointer correction - with delay to ensure styles are applied */
      setTimeout(() => {
        invMat.current = new DOMMatrix(getComputedStyle(canvas).transform).invertSelf();
      }, 0);
    };

    const draw =()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#111';
      for(let y=0;y<H.current;y++)
        for(let x=0;x<W.current;x++)
          if(gridRef.current![y*W.current+x])
            ctx.fillRect(x*CELL_SIZE,y*CELL_SIZE,CELL_SIZE,CELL_SIZE);
      
      // Draw hover cell highlight
      if(hoverCell && hoverCell.x >= 0 && hoverCell.x < W.current && hoverCell.y >= 0 && hoverCell.y < H.current) {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.strokeRect(hoverCell.x * CELL_SIZE, hoverCell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    };

    const step =()=>{
      const w=W.current,h=H.current,g=gridRef.current!,n=nextRef.current!;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const i=y*w+x;
        let s=0;
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)
          if(dx||dy) s+=g[((y+dy+h)%h)*w + ((x+dx+w)%w)];
        n[i]=(s===3||s===2&&g[i])?1:0;
      }
      gridRef.current = n.slice();
    };

    let last=0; const loop=(t:number)=>{
      if(playRef.current && t-last>1000/FPS){step();draw();last=t;}
      requestAnimationFrame(loop);
    };

    const paint =(e:PointerEvent)=>{
      // Recalculate inverse matrix if needed (for better accuracy)
      if(!invMat.current) {
        invMat.current = new DOMMatrix(getComputedStyle(canvas).transform).invertSelf();
      }
      
      const rect = canvas.getBoundingClientRect();
      
      // More precise coordinate calculation
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      
      // Apply inverse transform
      const p = new DOMPoint(canvasX, canvasY).matrixTransform(invMat.current);
      
      // Calculate grid coordinates with bounds checking
      const cx = Math.floor(p.x / CELL_SIZE);
      const cy = Math.floor(p.y / CELL_SIZE);
      
      // More strict bounds checking
      if(cx >= 0 && cx < W.current && cy >= 0 && cy < H.current){
        gridRef.current![cy * W.current + cx] = 1; 
        draw();
      }
    };

    const trackHover = (e: PointerEvent) => {
      // Recalculate inverse matrix if needed (for better accuracy)
      if(!invMat.current) {
        invMat.current = new DOMMatrix(getComputedStyle(canvas).transform).invertSelf();
      }
      
      const rect = canvas.getBoundingClientRect();
      
      // More precise coordinate calculation
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      
      // Apply inverse transform
      const p = new DOMPoint(canvasX, canvasY).matrixTransform(invMat.current);
      
      // Calculate grid coordinates with bounds checking
      const cx = Math.floor(p.x / CELL_SIZE);
      const cy = Math.floor(p.y / CELL_SIZE);
      
      // Update hover state and redraw
      if(cx >= 0 && cx < W.current && cy >= 0 && cy < H.current){
        setHoverCell({x: cx, y: cy});
      } else {
        setHoverCell(null);
      }
      draw();
    };

    resize(); requestAnimationFrame(loop);
    addEventListener('resize',resize);
    canvas.addEventListener('pointermove',trackHover);
    canvas.addEventListener('pointerdown',paint);
    canvas.addEventListener('pointerenter',()=>{playRef.current=true;setPlaying(true);startSeeds();});
    canvas.addEventListener('pointerleave',()=>{playRef.current=false;setPlaying(false);stopSeeds();setHoverCell(null);});
    return ()=>{removeEventListener('resize',resize);
      canvas.removeEventListener('pointermove',trackHover); 
      canvas.removeEventListener('pointerdown',paint); 
      stopSeeds();};
  },[]);

  /* UI handlers */
  const toggle=()=>{playRef.current=!playRef.current;
    setPlaying(playRef.current);
    playRef.current?startSeeds():stopSeeds();};
  const reset =()=>{playRef.current=false;setPlaying(false);
    stopSeeds(); gridRef.current?.fill(0); logo();};

  /* render */
  return(
    <div style={{height:'100vh',width:'100vw',overflow:'hidden'}}>
      <canvas ref={canvasRef} style={{
        display:'block',
        cursor:'crosshair',
        transform:`rotateX(${ROT_X}deg) rotateZ(${ROT_Z}deg)`,
        transformOrigin:'top left',
        boxShadow:'0 10px 28px rgba(0,0,0,.25)'
      }}/>
      <div style={{
        position:'fixed',bottom:14,left:'50%',transform:'translateX(-50%)',
        background:'rgba(255,255,255,.8)',padding:'4px 10px',
        borderRadius:6,fontSize:14,
        boxShadow:'0 4px 12px rgba(0,0,0,.15)',userSelect:'none'}}>
        <button onClick={toggle}>{playing?'Pause':'Play'}</button>
        <button onClick={reset } style={{marginLeft:6}}>Reset</button>
      </div>
    </div>
  );
}
