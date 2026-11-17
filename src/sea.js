/* ===== Background sea: the page sinks as you scroll =====
   A fixed canvas behind the content: light rays near the surface, schools of fish,
   reef outcrops on the sides and a reef floor at the very bottom. Kept dim and
   low-contrast so it never competes with the text; the middle column is quieter still.
   No libraries. Without WebGL the CSS gradient on .ocean stays.
   Switch it off in public/config.js: SEA_BACKGROUND: false (the page then looks as before, plain gradient). */
(function(){
  if((window.SITE_CONFIG || {}).SEA_BACKGROUND === false) return;
  let still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cv = document.createElement("canvas");
  cv.id = "sea"; cv.setAttribute("aria-hidden", "true");
  let gl = null;
  try{ gl = cv.getContext("webgl", {antialias:false, alpha:false, depth:false, stencil:false, powerPreference:"low-power"}); }catch(e){}
  if(!gl) return;

  const VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 R;uniform float T;uniform float Y;uniform float D;uniform float M;uniform float C;uniform float F;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return v;}
vec3 W;
// one fish, nose to +x; returns coverage and a 0..1 top-to-belly shade
vec2 fish(vec2 f,float dir,float t){
 f.x*=dir;
 float tw=smoothstep(.3,-1.4,f.x);
 f.y-=sin(t*7.)*.16*tw*tw;
 float body=smoothstep(1.,.86,length(f*vec2(1.,2.7)));
 vec2 tp=f-vec2(-.82,0.);
 float tail=smoothstep(.07,0.,abs(tp.y)+tp.x*.8)*smoothstep(-.62,-.5,tp.x)*step(tp.x,.02);
 return vec2(max(body,tail),smoothstep(-.3,.3,f.y));
}
// a school layer at distance z: returns colour premultiplied in rgb, alpha in a
// par = how fast the layer slides compared with the page (1 = same speed)
vec4 school(vec2 uv,float z,float par,float dir,float sp,float seed,float size){
 vec2 p=uv*z;p.y-=Y*par*z;p.x-=dir*sp*T;
 vec2 cs=vec2(.42,.2)*size;
 vec2 g=p/cs;vec2 id=floor(g);vec2 f=(fract(g)-.5)*cs;
 float r=h(id+seed);
 float grp=n(id*vec2(.16,.3)+seed*3.7);
 float on=step(.3,r)*smoothstep(.52,.62,grp);
 if(on<.01)return vec4(0.);
 vec2 o=(vec2(h(id+seed+1.3),h(id+seed+2.7))-.5)*vec2(.16,.08)*size;
 o.y+=sin(T*.9+r*6.28)*.02*size;
 float s=.085*size*(.8+.35*h(id+seed+4.1));
 vec2 c=fish((f-o)/s,dir,T*1.3+r*10.);
 float warm=step(.55,n(id*.07+seed));
 vec3 col=mix(W*1.5+vec3(.05,.1,.11),W*2.+vec3(.12,.16,.1),c.y);
 col=mix(col,col+vec3(.1,.08,-.02),warm*.6);
 float fog=1.-exp(-.32*z-1.6*D);
 col=mix(col,W,fog);
 return vec4(col,1.)*c.x*on;
}
vec3 pal(float r){
 vec3 c=vec3(.88,.4,.44);
 c=mix(c,vec3(.96,.62,.34),step(.24,r));
 c=mix(c,vec3(.6,.4,.82),step(.48,r));
 c=mix(c,vec3(.78,.8,.42),step(.7,r));
 c=mix(c,vec3(.38,.76,.7),step(.86,r));
 return c;}
// coral heads and sea fans growing out of a reef line.
// so.x runs along the reef, so.y is height above it (negative = inside the rock); L = light in that frame
// sea floor: pale sand with ripples and moving sun glints
vec3 sandCol(vec2 so){
 float rip=sin(so.x*34.+n(so*vec2(2.,6.))*7.+so.y*10.);
 vec3 c=mix(vec3(.78,.68,.5),vec3(.92,.82,.62),fbm(so*3.));
 c*=.86+.1*rip;
 float cg=n(so*7.+vec2(T*.12,-T*.09))*n(so*5.3-vec2(T*.1,T*.05)+3.);
 c+=vec3(.5,.7,.65)*pow(cg,2.)*1.4*smoothstep(-.35,0.,so.y);
 c*=.9+.15*smoothstep(-.3,0.,so.y);
 return c;
}
vec4 heads(vec2 so,float seed,vec2 L,float sand){
 float s=so.x,o=so.y;
 vec3 rock=mix(vec3(.13,.17,.18),vec3(.3,.27,.24),fbm(so*4.+seed));
 if(sand>.5)rock=sandCol(so);
 vec4 res=vec4(rock,smoothstep(.006,-.006,o));
 if(o>.5)return vec4(0.);
 float id0=floor(s/.34);
 for(int k=-1;k<=1;k++){
  float id=id0+float(k);
  float r=h(vec2(id,seed)),R=.07+.12*h(vec2(id,seed+2.));
  float cy=(id+.5+(h(vec2(id,seed+1.))-.5)*.4)*.34;
  vec2 d=vec2(s-cy,o+.02);
  float dl=length(d);
  vec3 hue=pal(h(vec2(id,seed+3.)));
  // on sand the corals stand apart, with bare patches between them
  if(sand>.5&&h(vec2(id,seed+9.))<.55)continue;
  if(sand>.5)R*=.55;
  if(r<.7){
   // rounded boulder coral with grooves, lit from above; on sand a low wide mound
   if(sand>.5){d.y*=1.9;dl=length(d);}
   float c=smoothstep(R,R-.012,dl);
   float lit=.4+.6*clamp(dot(d/R,L),0.,1.);
   float tex=.78+.22*sin(dl*70.+n(d*18.+id)*5.);
   vec3 col=hue*lit*tex;
   if(c>.01)res=vec4(mix(res.rgb,col,c),max(res.a,c));
  }else{
   // sea fan: a swaying lace of ribs and rings
   float R2=R*2.1;
   float ang=atan(d.x,d.y)+sin(T*.7+id)*.12*dl/R2;
   float oe=R2*(.7+.3*n(vec2(ang*3.,id)));
   // branches wander and split; a fine mesh fills the gaps
   float br=ang*3.2+(n(vec2(dl*14.,id))-.5)*.9;
   float rib=smoothstep(.17,.05,abs(fract(br)-.5)*(.4+dl*4.));
   float mesh=.22+.2*n(d*60.+id);
   float c=max(rib,mesh)*smoothstep(oe,oe-.03,dl)*step(-.02,d.y)*smoothstep(1.35,1.,abs(ang))*.75;
   vec3 col=hue*(.55+.45*dl/R2);
   if(c>.01)res=vec4(mix(res.rgb,col,c),max(res.a,c));
  }
 }
 return res;
}
// reef outcrops on both sides at distance z; at the end of the page a reef floor rises
vec4 reef(vec2 uv,float z,float par,float seed,float edge,float floorH){
 vec2 p=uv*z;p.y-=Y*par*z;
 float sd=seed+step(0.,uv.x)*17.3;
 float pres=smoothstep(.3,.6,n(vec2(p.y*.3,sd)));
 float base=edge*z+(fbm(vec2(p.y*.7,sd))-.5)*.35+(1.-pres)*1.4;
 vec4 r=heads(vec2(p.y,base-abs(p.x)),sd,normalize(vec2(1.,.45)),0.);
 // the bottom stays hidden until the "your message" card has scrolled past (F = the scroll left
 // after that, in screen heights), then rises into place; nearer layers rise faster
 float off=clamp((M-Y)/F,0.,2.)*(floorH+.06+.3/z);
 float ft=z*(floorH-.5-off-Y*par)+(fbm(vec2(p.x*.6,seed+5.))-.5)*.14+.025*sin(p.x*1.7+seed);
 vec4 f=heads(vec2(p.x,p.y-ft),seed+31.,normalize(vec2(.25,1.)),1.);
 float fl=step(r.a,f.a);
 if(fl>.5)r=f;
 if(r.a<.01)return vec4(0.);
 vec3 col=r.rgb;
 col.r*=mix(1.,.5,D*(1.-.6*fl));
 col=mix(col,vec3(dot(col,vec3(.3,.5,.2))),.2+.3*D-.15*fl);
 // the sand keeps more of its light so the bottom reads as a bright floor
 col*=mix(.62,.85,fl);
 col=mix(col,W,1.-exp(-(.26*z+.7*D)*mix(1.,.45,fl)));
 return vec4(col,1.)*r.a;
}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;
 float A=.5*R.x/R.y;
 W=mix(vec3(.039,.2,.255),vec3(.016,.072,.1),smoothstep(0.,1.,D));
 vec3 col=W*(1.+.4*uv.y);
 // quieter in the column where the text sits
 float cm=mix(.45,1.,smoothstep(C-.04,C+.14,abs(uv.x)));
 // on a phone the text spans the whole width: corals hug the edges and fade more
 float mob=1.-smoothstep(.3,.55,A);
 float edge=mix(min(C+.07,A-.05),A-.01,mob);
 float ra=1.-.45*mob;
 // sun rays and caustic shimmer, gone by mid-page
 float sh=pow(1.-D,1.6);
 if(sh>.01){
  float ang=uv.x/(1.4-uv.y);
  float rays=n(vec2(ang*7.+T*.05,T*.07))*n(vec2(ang*19.-T*.08,3.));
  col+=vec3(.45,.8,.85)*pow(rays,2.)*smoothstep(-.6,.5,uv.y)*.2*sh*cm;
 }
 vec4 L;
 L=reef(uv,3.4,.14,7.1,edge+.04,.28+.08*mob);col=mix(col,L.rgb/max(L.a,.001),L.a*.8*ra);
 L=school(uv,4.2,.18,-1.,.05,3.3,1.);col=mix(col,L.rgb/max(L.a,.001),L.a*cm*.8);
 L=reef(uv,2.2,.32,1.9,edge,.245+.08*mob);col=mix(col,L.rgb/max(L.a,.001),L.a*.9*ra);
 L=school(uv,2.6,.4,1.,.07,8.8,1.);col=mix(col,L.rgb/max(L.a,.001),L.a*cm*.75);
 L=school(uv,1.6,.6,-1.,.09,5.2,1.25);col=mix(col,L.rgb/max(L.a,.001),L.a*cm*.6);
 L=reef(uv,1.25,.85,4.4,edge+.02,.2+.08*mob);col=mix(col,L.rgb/max(L.a,.001),L.a*.8*ra);
 // drifting particles
 vec2 q=uv*2.5;q.y-=Y*1.1*2.5;q+=vec2(T*.01,T*.015);
 vec2 g=q*9.;vec2 id=floor(g);vec2 f=fract(g)-.5;
 vec2 o=vec2(h(id+1.7),h(id+5.3))-.5;
 col+=vec3(.6,.8,.8)*smoothstep(.07,0.,length(f-o*.6))*step(.9,h(id))*.1*cm;
 col*=1.-.25*dot(uv,uv);
 gl_FragColor=vec4(col,1.);
}`;
  function sh(type, src){ const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
  const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if(!vs || !fs) return;
  const pr = gl.createProgram();
  gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ["R","T","Y","D","M","C","F"].forEach(k => U[k] = gl.getUniformLocation(pr, k));

  document.body.prepend(cv);
  document.body.classList.add("sea-on");
  const hero = document.querySelector(".hero");

  // a soft background does not need many pixels; slow devices get fewer still
  // the mobile URL bar changes innerHeight while scrolling; keep the largest height for the
  // current width so the scene neither rescales nor jumps (a new width, e.g. rotation, resets it)
  let VW = 0, VH = 0;
  function view(){
    if(innerWidth !== VW){ VW = innerWidth; VH = innerHeight; } else VH = Math.max(VH, innerHeight);
    cv.style.height = VH + "px";
  }
  let quality = 1, W = 0, H = 0;
  function size(){
    view();
    const w = VW, h = VH;
    const k = Math.min(1, (devicePixelRatio || 1) * .6, Math.sqrt(420000 * quality / (w * h)));
    const cw = Math.max(1, Math.round(w * k)), ch = Math.max(1, Math.round(h * k));
    if(cw === W && ch === H) return;
    W = cv.width = cw; H = cv.height = ch;
    gl.viewport(0, 0, W, H);
    dirty = true;
  }

  // the camera is locked to the scroll position (read every frame, no easing), so the water moves
  // exactly with the finger; page measurements are cached and refreshed only when the layout changes
  let cam = 0, dep = 0, maxCam = 1, floorRun = 1, maxScroll = 1, docH = 0, lastY = -1, dirty = true;
  function measure(){
    docH = document.documentElement.scrollHeight;
    maxScroll = Math.max(1, docH - innerHeight); maxCam = maxScroll / VH;
    // the sandy bottom starts rising once the bottom of the chat preview reaches the screen bottom
    // (on desktop the card is sticky, so measure where it sits in the layout, not where it is stuck)
    const card = document.querySelector(".chat-win"), chat = card && card.closest(".chat");
    let start = maxScroll - VH;
    if(card){
      const bottom = chat && getComputedStyle(chat).position === "sticky"
        ? chat.parentElement.getBoundingClientRect().top + scrollY + card.offsetTop + card.offsetHeight
        : card.getBoundingClientRect().bottom + scrollY;
      start = bottom - innerHeight;
    }
    floorRun = Math.max(.25, (maxScroll - start) / VH);
    dirty = true;
  }
  function follow(){
    const y = scrollY;
    if(document.documentElement.scrollHeight !== docH) measure();
    if(y === lastY) return false;
    lastY = y; cam = y / VH; dep = Math.min(1, y / maxScroll);
    return true;
  }
  size(); measure(); follow();
  addEventListener("resize", () => { size(); measure(); });
  addEventListener("load", measure);

  let last = 0, t = 0, slow = 0, frames = 0;
  function frame(now){
    requestAnimationFrame(frame);
    // the intro owns the GPU first; the hero photo covers everything at the top
    if(!document.body.classList.contains("intro-done")) return;
    if(hero && hero.getBoundingClientRect().bottom > innerHeight + 40){ last = now; return; }
    const moved = follow();
    const dt = last ? Math.min(.1, (now - last) / 1000) : 0;
    // while scrolling draw every frame; idle water only needs ~30 fps
    if(!moved && dt && dt < .03) return;
    if(still && !moved && !dirty) return;
    last = now; dirty = false;
    if(!still) t += dt;
    gl.uniform2f(U.R, W, H); gl.uniform1f(U.T, t); gl.uniform1f(U.Y, cam);
    gl.uniform1f(U.D, dep); gl.uniform1f(U.M, maxCam); gl.uniform1f(U.F, floorRun);
    gl.uniform1f(U.C, Math.min(1180, VW) / 2 / VH);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // a GPU that cannot keep ~20 fps drops resolution, then stops animating
    if(dt > .05) slow++;
    if(++frames === 90){
      if(slow > 30){ if(quality > .3){ quality *= .55; W = 0; size(); } else still = true; }
      frames = slow = 0;
    }
  }
  requestAnimationFrame(frame);
  cv.addEventListener("webglcontextlost", e => e.preventDefault());
})();
