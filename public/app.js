/* ===== Intro: the camera drops from the sea surface to the reef =====
   One fragment shader, no libraries. Skipped for reduced motion, on click, key or scroll. */
(function(){
  const el = document.getElementById("intro");
  const done = () => document.body.classList.add("intro-done");
  if(!el){ done(); return; }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce){ el.remove(); done(); return; }

  let ru = false;
  try{ const s = localStorage.getItem("lang"); ru = s ? s === "ru" : (navigator.language || "").toLowerCase().startsWith("ru"); }catch(e){}
  const cap = document.getElementById("intro-cap"), depth = document.getElementById("intro-d");
  if(cap) cap.textContent = ru ? "Погружаемся" : "Descending";
  document.documentElement.classList.add("intro-lock");

  const DUR = 4300;
  let finished = false, raf = 0, gl = null, t0 = 0;
  function finish(){
    if(finished) return; finished = true;
    cancelAnimationFrame(raf);
    el.classList.add("out");
    document.documentElement.classList.remove("intro-lock");
    done();
    ["click","keydown","wheel","touchmove"].forEach(t => removeEventListener(t, skip, true));
    setTimeout(() => {
      try{ const x = gl && gl.getExtension("WEBGL_lose_context"); if(x) x.loseContext(); }catch(e){}
      el.remove();
    }, 900);
  }
  function skip(e){ if(e.type === "keydown" && e.key === "Tab") return; finish(); }
  ["click","keydown","wheel","touchmove"].forEach(t => addEventListener(t, skip, {capture:true, passive:true}));

  // camera height over time, shared by the shader and the depth readout
  const camY = p => { const x = Math.min(1, Math.max(0, (p - .12) / .86)), s = x * x * (3 - 2 * x); return 1.8 - 11.8 * s; };
  const showDepth = p => { if(depth) depth.textContent = Math.max(0, -camY(p) * 1.3).toFixed(1); };

  const cv = document.getElementById("intro-gl");
  try{ gl = cv.getContext("webgl", {antialias:false, alpha:false, powerPreference:"high-performance"}) || cv.getContext("experimental-webgl"); }catch(e){ gl = null; }

  if(!gl){
    // no WebGL: CSS gradient stays, only the depth counter runs
    const tick = now => { if(!t0) t0 = now; const p = (now - t0) / 2200; showDepth(p); if(p < 1) raf = requestAnimationFrame(tick); else finish(); };
    raf = requestAnimationFrame(tick); return;
  }

  const VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  const FS = `precision highp float;
uniform vec2 R;uniform float T;uniform float P;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return v;}
float wv(vec2 p){return fbm(p*.25+vec2(T*.08,T*.05))+fbm(p*.9-vec2(T*.25,T*.1))*.3;}
vec3 wn(vec2 p,float amp){float e=.08;float c=wv(p);
 return normalize(vec3(-(wv(p+vec2(e,0.))-c)/e*amp,1.,-(wv(p+vec2(0.,e))-c)/e*amp));}
vec3 sky(vec3 d){vec3 sun=normalize(vec3(.35,.16,1.));float y=max(d.y,0.);
 vec3 c=mix(vec3(1.,.8,.62),vec3(.2,.46,.78),pow(y,.45));
 float s=max(dot(d,sun),0.);c+=vec3(1.,.86,.62)*(pow(s,600.)*6.+pow(s,12.)*.35);return c;}
float caus(vec2 p){float t=T*.5;vec2 w=vec2(fbm(p*.7+t*.4),fbm(p*.7+vec2(3.1,7.4)-t*.35));
 float v=fbm(p*1.3+w*3.);return pow(1.-abs(v*2.-1.),7.)*1.3;}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;
 float p=clamp(P,0.,1.);
 float x=clamp((p-.12)/.86,0.,1.);float cy=1.8-11.8*x*x*(3.-2.*x);
 float pit=mix(-.06,-.62,smoothstep(.04,.33,p));pit=mix(pit,-.2,smoothstep(.37,.75,p));
 vec3 ro=vec3(0.,cy,T*2.);
 vec3 rd=normalize(vec3(uv,1.3));
 float c=cos(pit),sn=sin(pit);rd.yz=mat2(c,-sn,sn,c)*rd.yz;
 float rl=sin(T*.8)*.03;rd.xy=mat2(cos(rl),-sin(rl),sin(rl),cos(rl))*rd.xy;
 vec3 deep=vec3(.016,.07,.1);
 float dep=max(-cy,0.);
 vec3 fogc=mix(vec3(.06,.48,.58),vec3(.02,.2,.28),clamp(dep/11.,0.,1.));
 vec3 col;
 if(cy>0.){
  if(rd.y>0.){col=sky(rd);}
  else{
   float t=-cy/rd.y;vec3 ps=ro+rd*t;vec3 nn=wn(ps.xz,.9);
   vec3 rf=reflect(rd,nn);rf.y=abs(rf.y);
   float fr=.03+.97*pow(1.-max(dot(-rd,nn),0.),5.);
   vec3 body=mix(vec3(.03,.36,.4),vec3(.01,.13,.2),clamp(-rd.y*2.,0.,1.));
   body+=vec3(0.,.3,.26)*pow(max(wv(ps.xz)-.45,0.),2.)*3.;
   col=mix(body,sky(rf),fr);
   col=mix(col,sky(vec3(rd.x,.02,rd.z)),1.-exp(-t*.012));
  }
 }else{
  if(rd.y>0.){
   float t=-cy/rd.y;vec3 ps=ro+rd*t;vec3 nn=wn(ps.xz*1.5,1.4);
   float win=smoothstep(.45,.8,rd.y+nn.x*.25+nn.z*.25);
   vec3 surf=mix(vec3(.05,.55,.6),vec3(.85,1.,.95),win);
   col=mix(fogc,surf,exp(-t*.09));
  }else{
   float t=(-14.-cy)/rd.y;vec3 ps=ro+rd*t;
   float sand=.55+.25*fbm(ps.xz*.6);
   vec3 sc=vec3(.75,.72,.55)*sand;
   sc+=vec3(.6,.95,.9)*caus(ps.xz*.6)*1.4*exp(-dep*.03);
   float rk=smoothstep(.6,.68,fbm(ps.xz*.18+3.));
   sc=mix(sc,vec3(.1,.2,.2)+vec3(.35,.16,.24)*fbm(ps.xz*2.),rk);
   col=mix(fogc,sc*vec3(.45,.8,.85),exp(-t*.06));
  }
  float ang=rd.x/(rd.y+1.25);
  float rays=n(vec2(ang*9.+T*.15,T*.1))*n(vec2(ang*23.-T*.2,1.));
  col+=vec3(.6,.95,1.)*pow(rays,2.)*smoothstep(-.4,.7,rd.y)*.55*exp(-dep*.08);
  vec2 g=uv*24.+vec2(T*.3,T*.6);vec2 id=floor(g);vec2 f=fract(g)-.5;
  vec2 o=vec2(h(id+1.7),h(id+5.3))-.5;
  col+=vec3(.7,.9,.9)*smoothstep(.06,0.,length(f-o*.6))*step(.88,h(id))*.35;
 }
 float ent=smoothstep(.3,.35,p)*(1.-smoothstep(.4,.8,p));
 if(ent>0.){
  for(int i=0;i<3;i++){
   float fi=float(i);float sc=5.+fi*4.;
   vec2 g=vec2(uv.x*sc+fi*3.1,uv.y*sc-(p-.3)*(26.+fi*18.));
   vec2 id=floor(g);vec2 f=fract(g)-.5;
   float r=.06+.2*h(id+3.3);
   vec2 o=(vec2(h(id+1.1),h(id+2.2))-.5)*.7;o.x+=sin(g.y*3.+fi)*.06;
   float d=length(f-o);
   float ring=smoothstep(r,r-.04,d)-smoothstep(r-.05,r-.12,d)*.75;
   float hl=smoothstep(.05,0.,length(f-o+vec2(r*.35,-r*.35)));
   col+=(vec3(.75,.95,1.)*ring*.5+hl*.7)*step(.62+fi*.08,h(id+fi*7.))*ent;
  }
 }
 col=mix(col,vec3(.82,.97,1.),exp(-pow(cy/.35,2.))*.6);
 col*=1.-.32*dot(uv,uv);
 col=mix(col,deep,smoothstep(.84,1.,p));
 gl_FragColor=vec4(col,1.);
}`;
  function sh(type, src){ const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
  const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  const pr = gl.createProgram();
  if(!vs || !fs){ finish(); return; }
  gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr, gl.LINK_STATUS)){ finish(); return; }
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, "R"), uT = gl.getUniformLocation(pr, "T"), uP = gl.getUniformLocation(pr, "P");

  function size(){
    const w = innerWidth, h = innerHeight;
    // keep the pixel count modest: a soft underwater picture does not need full resolution
    const k = Math.min(devicePixelRatio || 1, Math.sqrt(850000 / (w * h)), 1.5);
    cv.width = Math.max(1, Math.round(w * k)); cv.height = Math.max(1, Math.round(h * k));
    gl.viewport(0, 0, cv.width, cv.height);
  }
  size(); addEventListener("resize", size);

  let slow = 0, last = 0;
  function frame(now){
    if(finished) return;
    if(!t0) t0 = now;
    const p = (now - t0) / DUR;
    // a weak GPU that drops below ~20 fps gets the short version
    if(last && now - last > 50 && ++slow > 12){ finish(); return; }
    last = now;
    gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, (now - t0) / 1000); gl.uniform1f(uP, p);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    showDepth(p);
    el.style.setProperty("--p", Math.min(1, p).toFixed(3));
    if(p >= 1){ finish(); return; }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
})();

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

/* ===== EDIT HERE: contacts ===== */
const CONTACT = { telegram:"poopsickk", whatsapp:"84559110497", instagram:"nastya.dives" };

/* ===== EDIT HERE: glossary ===== */
const TERMS = {
 dsd:{t:"Discover Scuba",ru:"Пробное погружение для тех, кто ни разу не нырял. Инструктор всё время рядом, сертификат не нужен.",en:"A try dive for people who have never dived. The instructor stays with you; no certificate needed."},
 fun:{t:"Fun dives",ru:"Погружения для тех, у кого уже есть сертификат. Без обучения, просто ныряем с гидом и смотрим риф.",en:"Dives for certified divers. No training, just exploring the reef with a guide."},
 ow:{t:"Open Water",ru:"Первый курс PADI. После него можно нырять до 18 м с напарником в любой стране.",en:"The first PADI course. Afterwards you can dive to 18 m with a buddy anywhere in the world."},
 aow:{t:"Advanced",ru:"Следующий курс после Open Water: глубина до 30 м, навигация, плавучесть.",en:"The course after Open Water: depth to 30 m, navigation and buoyancy."},
 nitrox:{t:"Nitrox",ru:"Воздух с повышенным содержанием кислорода. Позволяет дольше оставаться на глубине.",en:"Air with extra oxygen. It lets you stay longer at depth."},
 refresh:{t:"Refresher",ru:"Короткое повторение навыков, если последнее погружение было давно.",en:"A short skills review if you haven't dived in a while."},
 elearn:{t:"eLearning",ru:"Онлайн-теория PADI: проходишь на телефоне до приезда.",en:"PADI online theory you do on your phone before you arrive."},
 rescue:{t:"Rescue Diver",ru:"Курс, где учишься помогать себе и напарнику в сложных ситуациях.",en:"The course where you learn to handle problems and help your buddy."},
 bubble:{t:"Bubblemaker",ru:"Первое знакомство с аквалангом для детей 8–9 лет, на глубине до 2 м.",en:"A first taste of scuba for kids aged 8–9, to 2 m."}
};

/* ===== EDIT HERE: prices (USD) ===== */
const GROUPS = [
 {id:"first", ru:"Первый раз", en:"First time", items:[
  {id:"dsd95", rec:true, term:"dsd", price:95, ru:"Пробное погружение", en:"Discover Scuba", meta_ru:["2 погружения с лодки","до 12 м"], meta_en:["2 boat dives","to 12 m"],
   d_ru:"Онлайн-теория, инструктаж и два погружения с инструктором. Сертификат не нужен.", d_en:"Online theory, a briefing and two boat dives with an instructor. No certificate needed."},
  {id:"dsd135", term:"dsd", price:135, ru:"Пробное + бассейн", en:"Discover Scuba + pool", meta_ru:["бассейн","2 погружения"], meta_en:["pool session","2 boat dives"],
   d_ru:"То же, но сначала занятие в бассейне. Лучший вариант, если волнуешься.", d_en:"Same, with a pool session first. Best if you're nervous."},
  {id:"dsd65", price:65, ru:"1 погружение + снорклинг", en:"1 try dive + snorkelling", meta_ru:["1 погружение"], meta_en:["1 dive"],
   d_ru:"Попробовать один раз и поплавать с маской.", d_en:"One try dive plus snorkelling."},
  {id:"bubble", term:"bubble", price:60, ru:"Bubblemaker, дети 8–9", en:"Bubblemaker, kids 8–9", meta_ru:["до 2 м"], meta_en:["to 2 m"],
   d_ru:"Первое знакомство с аквалангом для детей.", d_en:"A first taste of scuba for kids."}
 ]},
 {id:"courses", ru:"Курсы PADI", en:"PADI courses", items:[
  {id:"ow", rec:true, term:"ow", price:450, ru:"Open Water", en:"Open Water", meta_ru:["полдня бассейн","2 дня в море","4 погружения"], meta_en:["half-day pool","2 days at sea","4 dives"],
   d_ru:"Первый сертификат дайвера, до 18 м. $150 онлайн-теория PADI + $300 бассейн и море. Страховка DAN в подарок.", d_en:"Your first dive licence, to 18 m. $150 PADI eLearning + $300 pool and ocean training. Free DAN insurance."},
  {id:"aow", term:"aow", price:495, ru:"Advanced + Nitrox", en:"Advanced + Nitrox", meta_ru:["2 дня","5 погружений","до 30 м"], meta_en:["2 days","5 dives","to 30 m"],
   d_ru:"Следующий уровень плюс специализация на найтроксе.", d_en:"The next level plus the Nitrox specialty."},
  {id:"owaow", price:795, ru:"Open Water + Advanced + Nitrox", en:"Open Water + Advanced + Nitrox", meta_ru:["5 дней","9 погружений"], meta_en:["5 days","9 dives"],
   d_ru:"С нуля до Advanced за одну поездку. На $150 дешевле, чем по отдельности.", d_en:"From zero to Advanced in one trip, $150 less than booking separately."},
  {id:"rescue", term:"rescue", price:350, ru:"Rescue Diver", en:"Rescue Diver", meta_ru:["полдня бассейн","2 дня в море"], meta_en:["half-day pool","2 days at sea"],
   d_ru:"EFR (первая помощь) $150. Добавить Nitrox $175, Deco Chamber $150.", d_en:"EFR first aid $150. Add Nitrox $175, Deco Chamber $150."},
  {id:"pack", price:1000, ru:"Пакет: Advanced + Nitrox + Rescue + EFR + Deco Chamber", en:"Bundle: Advanced + Nitrox + Rescue + EFR + Deco Chamber", meta_ru:["всё вместе"], meta_en:["all in one"],
   d_ru:"Самый выгодный путь к Rescue.", d_en:"The best-value route to Rescue."},
  {id:"spec", price:125, from:true, ru:"Специализации", en:"Specialties", meta_ru:["с онлайн-теорией"], meta_en:["with eLearning"],
   d_ru:"Deep, Nitrox, Night, навигация, плавучесть и другие. Полный список ниже.", d_en:"Deep, Nitrox, Night, Navigation, Buoyancy and more. Full list below."}
 ]},
 {id:"cert", ru:"С сертификатом", en:"Certified", items:[
  {id:"fun2", rec:true, term:"fun", price:80, ru:"Fun dives: 2 погружения", en:"Fun dives: 2 dives", meta_ru:["с гидом","7:30–14:00"], meta_en:["guided","7:30am–2pm"],
   d_ru:"1 погружение $55, 3 погружения $100 (по расписанию).", d_en:"1 dive $55, 3 dives $100 (subject to schedule)."},
  {id:"night", price:75, ru:"Ночное погружение", en:"Night dive", meta_ru:["лодка, от 2 дайверов"], meta_en:["boat, 2+ divers"],
   d_ru:"С пляжа $50.", d_en:"From the beach $50."},
  {id:"refresh", term:"refresh", price:50, ru:"Рефрешер", en:"Refresher", meta_ru:["бассейн / пляж / лодка"], meta_en:["pool / beach / boat"],
   d_ru:"Если последнее погружение было давно. Проходит в рамках первого погружения, онлайн-теория +$50.", d_en:"If you haven't dived in a while. Done as part of your first dive; online theory +$50."},
  {id:"speed", price:75, unit:{ru:"/ чел. в день",en:"/ person / day"}, ru:"Частный катер", en:"Private speedboat", meta_ru:["2–4 человека","Electric Nose"], meta_en:["2–4 people","Electric Nose"],
   d_ru:"Гибкий график и дальние сайты: The Wall 42 м, Ray Plateau 30 м, The Freefall 40 м. Для курсов и fun dives.", d_en:"Flexible schedule and remote sites: The Wall 42 m, Ray Plateau 30 m, The Freefall 40 m. For courses and fun dives."}
 ]},
 {id:"snork", ru:"Не ныряют", en:"Non-divers", items:[
  {id:"snork40", price:40, ru:"Снорклинг / пассажир", en:"Snorkelling / passenger", meta_ru:["маска и трубка","обед"], meta_en:["mask & snorkel","lunch"],
   d_ru:"День на лодке для друзей и семьи. Дети до 5 лет бесплатно.", d_en:"A day on the boat for friends and family. Under-5s free."},
  {id:"snork50", price:50, ru:"Снорклинг PADI с гидом", en:"PADI snorkelling with guide", meta_ru:["с гидом"], meta_en:["guided"],
   d_ru:"Можно добавить пробное погружение всего за $30.", d_en:"Add a try dive for just $30."}
 ]}
];
const SPECIALTIES = [
 ["Dive Against Debris","2",125],["Nitrox","2",250],["Peak Performance Buoyancy","2",200],["Equipment","0",175],
 ["Deep","3–4",250],["Deep + Nitrox","3–4",450],["Navigation","3",200],["Search & Recovery","3",250],["Night","3",250],
 ["Vietnam Diver","3",225],["Vietnam Nudibranch","2",200],["Self-Reliant (Solo)","3",250],["VN Deco Chamber","—",150]
];
/* ================================ */

const MONTHS = {ru:["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],
                en:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]};

/* ===== EDIT HERE: the 2-question match ===== */
const QUIZ = {
 q1:{ru:"Был опыт с аквалангом?", en:"Have you dived with scuba before?", opts:[
  {path:"first", ru:"Пока нет", en:"Not yet", s_ru:"Попробуем вместе, сертификат не нужен", s_en:"We'll try it together, no certificate needed"},
  {path:"courses", ru:"Хочу научиться", en:"I want to learn", s_ru:"Курс PADI и сертификат на всю жизнь", s_en:"A PADI course and a licence for life"},
  {path:"cert", ru:"Да, есть сертификат", en:"Yes, I'm certified", s_ru:"Покажу лучшие сайты у островов", s_en:"I'll show you the best island sites"}]},
 first:{ru:"Как тебе в воде?", en:"How do you feel in the water?", opts:[
  {pick:"dsd95", ru:"Спокойно, плаваю уверенно", en:"Relaxed, I swim well", why_ru:"Раз в воде тебе спокойно, сразу едем в море. Два погружения до 12 м, инструктор всё время рядом и держит тебя в поле зрения.", why_en:"Since you're at ease in the water, we head straight out to sea. Two dives to 12 m with an instructor right beside you the whole time."},
  {pick:"dsd135", ru:"Немного волнуюсь", en:"A bit nervous", why_ru:"Сначала спокойно разберёмся со всем в бассейне, где можно встать на дно. К выходу в море ты уже будешь знать, что делать, и волнение уйдёт.", why_en:"First we sort everything out in a pool where you can stand up. By the time we're at sea you'll know what to do and the nerves fade."},
  {pick:"dsd65", ru:"Хочу попробовать чуть-чуть", en:"Just a taste", why_ru:"Одно погружение с инструктором, а потом плаваешь с маской над рифом. Хороший способ понять, твоё это или нет.", why_en:"One dive with an instructor, then snorkelling over the reef. A good way to find out if diving is for you."},
  {pick:"bubble", ru:"Это для ребёнка 8–9 лет", en:"It's for a child aged 8–9", why_ru:"Bubblemaker: ребёнок дышит из акваланга на глубине до 2 м под присмотром инструктора. Обычно после этого просят ещё.", why_en:"Bubblemaker: your child breathes from a real scuba set no deeper than 2 m, with an instructor watching. Most kids ask to go again."}]},
 courses:{ru:"Сколько дней есть на обучение?", en:"How many days do you have for training?", opts:[
  {pick:"ow", ru:"2–3 дня", en:"2–3 days", why_ru:"Open Water: теорию проходишь онлайн ещё дома, здесь бассейн и два дня в море. Дальше можно нырять с напарником в любой стране.", why_en:"Open Water: theory online before you fly, then a pool session and two days at sea. After that you can dive with a buddy anywhere."},
  {pick:"owaow", ru:"5 дней, хочу сразу больше", en:"5 days, I want more", why_ru:"С нуля до Advanced за одну поездку: 9 погружений и глубина до 30 м. Выходит на $150 дешевле, чем брать курсы по отдельности.", why_en:"From zero to Advanced in one trip: 9 dives and depth to 30 m, $150 less than booking the courses separately."},
  {pick:"aow", ru:"У меня уже есть Open Water", en:"I already have Open Water", why_ru:"Advanced + Nitrox за 2 дня: глубина до 30 м, навигация и дыхание найтроксом, чтобы дольше оставаться на глубине.", why_en:"Advanced + Nitrox in 2 days: depth to 30 m, navigation and nitrox so you can stay down longer."},
  {pick:"rescue", ru:"Хочу Rescue", en:"I want Rescue", why_ru:"Rescue Diver учит замечать проблемы раньше, чем они случились, и помогать напарнику. После него ныряешь заметно спокойнее.", why_en:"Rescue Diver teaches you to spot problems before they happen and help your buddy. You dive a lot calmer afterwards."}]},
 cert:{ru:"Когда был последний дайв?", en:"When was your last dive?", opts:[
  {pick:"fun2", ru:"Меньше полугода назад", en:"Less than 6 months ago", why_ru:"Два погружения с гидом у Хон Мун. Маршруты можно посмотреть на картах ниже и выбрать, куда хочется.", why_en:"Two guided dives around Hon Mun. Check the routes on the maps below and pick where you'd like to go."},
  {pick:"refresh", ru:"Больше года назад", en:"Over a year ago", why_ru:"Начнём с короткого рефрешера прямо в первый день: вспомним навыки без спешки, и дальше ныряем как обычно.", why_en:"We start with a short refresher on day one: we go over the skills without rushing, then dive as usual."},
  {pick:"speed", ru:"Хочу дальние сайты", en:"I want remote sites", why_ru:"Частный катер на 2–4 человека: The Wall 42 м, Ray Plateau 30 м, The Freefall 40 м, и график под вас.", why_en:"A private speedboat for 2–4 people: The Wall 42 m, Ray Plateau 30 m, The Freefall 40 m, on your schedule."},
  {pick:"night", ru:"Хочу ночной дайв", en:"I want a night dive", why_ru:"Ночью риф совсем другой: выходят охотники, а планктон светится от каждого движения руки.", why_en:"The reef is a different place at night: hunters come out and the plankton lights up when you move your hand."}]}
};

const ALL = GROUPS.flatMap(g => g.items.map(i => ({...i, group:g})));
let lang = "en", tab = "first", quiz = {step:"q1", path:null, pick:null};
try{ const s = localStorage.getItem("lang"); if(s==="ru"||s==="en") lang = s; else if((navigator.language||"").toLowerCase().startsWith("ru")) lang = "ru"; }catch(e){ if((navigator.language||"").toLowerCase().startsWith("ru")) lang = "ru"; }
try{ const q = JSON.parse(localStorage.getItem("quiz") || "null"); if(q && QUIZ[q.path] && q.pick) quiz = {step:"done", path:q.path, pick:q.pick}; }catch(e){}

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money = i => `${i.from ? (lang==="ru"?"от ":"from ") : ""}$${i.price.toLocaleString("en-US")}`;
const T = (ru, en) => lang === "ru" ? ru : en;

function renderTabs(){
  $("tabs").innerHTML = GROUPS.map(g => {
    const min = Math.min(...g.items.map(i => i.price));
    return `<button type="button" role="tab" id="tab-${g.id}" aria-controls="plist" aria-selected="${g.id===tab}" tabindex="${g.id===tab?0:-1}" data-tab="${g.id}">
      <b>${esc(g[lang])}</b><small>${T("от","from")} $${min} · ${g.items.length} ${T(g.items.length>4?"вариантов":"варианта", "options")}</small></button>`;
  }).join("");
  $("plist").setAttribute("aria-labelledby","tab-"+tab);
}
function title(i){
  const t = esc(i[lang]);
  return i.term ? `<button type="button" class="term" data-term="${i.term}">${t}</button>` : t;
}
function renderList(){
  const g = GROUPS.find(x=>x.id===tab) || GROUPS[0];
  $("plist").innerHTML = g.items.map(i => `
    <article class="item${i.rec?" rec":""}">
      <div class="name"><h3>${title(i)}</h3>${i.rec?`<span class="badge">${T("советую","my pick")}</span>`:""}</div>
      ${(i["meta_"+lang]||[]).length?`<div class="meta">${i["meta_"+lang].map(esc).join("  ·  ")}</div>`:"<div></div>"}
      <p>${esc(i["d_"+lang]||"")}</p>
      <div class="row"><span class="price">${money(i)}${i.unit?`<small>${esc(i.unit[lang])}</small>`:""}</span>
        <button type="button" class="btn sm${i.rec?" primary":""}" data-pick="${esc(i.id)}">${T("Записаться","Book this")}</button></div>
    </article>`).join("");
  $("spec-box").hidden = tab !== "courses";
  $("spec-table").innerHTML = SPECIALTIES.map(([n,d,p]) => `<tr><td>${esc(n)} <span class="muted">${d==="—"?"":"· "+d+T(" погр."," dives")}</span></td><td>$${p}</td></tr>`).join("");
}

/* ===== quiz: questions and the answer live in one card ===== */
function renderQuiz(){
  const body = $("q-body"), done = quiz.step === "done" && quiz.pick;
  if(done){ body.innerHTML = resultHTML(); return; }
  const q = QUIZ[quiz.step];
  body.innerHTML = `<h3 class="q-title">${esc(q[lang])}</h3><div class="q-opts">${q.opts.map((o,k) => {
    if(o.path) return `<button type="button" class="q-opt" data-path="${o.path}"><span class="ic">${k+1}</span><span><b>${esc(o[lang])}</b><small>${esc(o["s_"+lang])}</small></span><i aria-hidden="true">→</i></button>`;
    const it = ALL.find(i => i.id === o.pick);
    return `<button type="button" class="q-opt" data-q="${o.pick}"><span class="ic">${k+1}</span><span><b>${esc(o[lang])}</b>${it?`<small>${esc(it[lang])} · ${money(it)}</small>`:""}</span><i aria-hidden="true">→</i></button>`;
  }).join("")}</div>${quiz.step!=="q1"?`<button type="button" class="q-link" data-qback>← ${T("Назад","Back")}</button>`:""}`;
}
function resultHTML(){
  const it = ALL.find(i => i.id === quiz.pick); if(!it) return "";
  const p = QUIZ.q1.opts.find(o => o.path === quiz.path), opt = (QUIZ[quiz.path]?.opts || []).find(o => o.pick === it.id);
  return `<div class="q-result">
    <p class="q-ans">${T("Твои ответы","Your answers")}: ${p?esc(p[lang]):""}${opt?` · ${esc(opt[lang])}`:""}</p>
    <div class="q-head"><div><h3>${title(it)}</h3></div>
      <div class="q-price">${money(it)}${it.unit?`<small>${esc(it.unit[lang])}</small>`:""}</div></div>
    ${opt?`<p class="q-why">${esc(opt["why_"+lang])}</p>`:""}
    <ul class="q-meta">${(it["meta_"+lang]||[]).map(m=>`<li>${esc(m)}</li>`).join("")}<li>${T("снаряжение и обед включены","gear and lunch included")}</li></ul>
    <div class="q-act">
      <button type="button" class="btn primary" data-pick="${esc(it.id)}">${T("Записаться","Book this dive")}</button>
      <button type="button" class="q-link" data-qredo>↺ ${T("Пройти заново","Start over")}</button>
    </div></div>`;
}
function saveQuiz(){ try{ localStorage.setItem("quiz", JSON.stringify({path:quiz.path, pick:quiz.pick})); }catch(e){} }

/* program picker: a styled listbox in front of the native <select>, which stays the source of truth */
function renderSelect(){
  renderNativeSelect();
  $("prog-list").innerHTML = GROUPS.map(g => `<li role="presentation" class="pk-g">${esc(g[lang])}</li>` + g.items.map(i =>
    `<li role="option" id="pk-${i.id}" data-v="${i.id}" aria-selected="false"><span>${esc(i[lang])}</span><em>${money(i)}</em></li>`).join("")).join("");
  syncProg();
}
function syncProg(){
  const v = $("f-prog").value, it = ALL.find(i => i.id === v);
  $("prog-btn-t").innerHTML = it ? `<span>${esc(it[lang])}</span><em>${money(it)}</em>` : "";
  $("prog-list").querySelectorAll("[data-v]").forEach(li => li.setAttribute("aria-selected", li.dataset.v === v));
}
function progOpen(open){
  const box = $("prog"), list = $("prog-list");
  box.classList.toggle("open", open); $("prog-btn").setAttribute("aria-expanded", open);
  if(open){
    const cur = list.querySelector('[aria-selected="true"]') || list.querySelector("[data-v]");
    progFocus(cur); list.focus({preventScroll:true});
    // open upwards when there is no room below
    const r = $("prog-btn").getBoundingClientRect();
    box.classList.toggle("up", innerHeight - r.bottom < 300 && r.top > innerHeight - r.bottom);
  }
}
function progFocus(li){
  if(!li) return;
  $("prog-list").querySelectorAll(".hl").forEach(x => x.classList.remove("hl"));
  li.classList.add("hl"); $("prog-list").setAttribute("aria-activedescendant", li.id);
  const l = $("prog-list"); if(li.offsetTop < l.scrollTop) l.scrollTop = li.offsetTop - 30; else if(li.offsetTop + li.offsetHeight > l.scrollTop + l.clientHeight) l.scrollTop = li.offsetTop + li.offsetHeight - l.clientHeight + 6;
}
function progPick(v){ $("f-prog").value = v; updateMsg(); progOpen(false); $("prog-btn").focus(); }
$("prog-btn").addEventListener("click", () => progOpen(!$("prog").classList.contains("open")));
$("prog-btn").addEventListener("keydown", e => { if(e.key === "ArrowDown" || e.key === "ArrowUp"){ e.preventDefault(); progOpen(true); } });
$("prog-list").addEventListener("click", e => { const li = e.target.closest("[data-v]"); if(li) progPick(li.dataset.v); });
$("prog-list").addEventListener("pointermove", e => { const li = e.target.closest("[data-v]"); if(li && !li.classList.contains("hl")) progFocus(li); });
$("prog-list").addEventListener("keydown", e => {
  const opts = [...$("prog-list").querySelectorAll("[data-v]")], i = opts.findIndex(o => o.classList.contains("hl"));
  if(e.key === "ArrowDown"){ e.preventDefault(); progFocus(opts[Math.min(opts.length - 1, i + 1)]); }
  else if(e.key === "ArrowUp"){ e.preventDefault(); progFocus(opts[Math.max(0, i - 1)]); }
  else if(e.key === "Home"){ e.preventDefault(); progFocus(opts[0]); }
  else if(e.key === "End"){ e.preventDefault(); progFocus(opts[opts.length - 1]); }
  else if(e.key === "Enter" || e.key === " "){ e.preventDefault(); if(opts[i]) progPick(opts[i].dataset.v); }
  else if(e.key === "Escape" || e.key === "Tab"){ progOpen(false); if(e.key === "Escape"){ e.stopPropagation(); $("prog-btn").focus(); } }
});
document.addEventListener("click", e => { if(!e.target.closest("#prog")) progOpen(false); });
/* people stepper */
document.querySelectorAll("[data-step]").forEach(b => b.addEventListener("click", () => {
  const f = $("f-people"); f.value = Math.max(1, Math.min(20, (parseInt(f.value, 10) || 1) + +b.dataset.step)); updateMsg();
}));
document.querySelector(".st-v").addEventListener("click", () => $("f-people").focus());
$("f-people").addEventListener("blur", () => { const f = $("f-people"); f.value = Math.max(1, Math.min(20, parseInt(f.value, 10) || 1)); updateMsg(); });
function syncPeople(){
  const n = Math.max(1, Math.min(20, parseInt($("f-people").value, 10) || 1)), m10 = n % 10, m100 = n % 100;
  $("pp-unit").textContent = lang === "ru" ? (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? "человека" : "человек") : (n === 1 ? "person" : "people");
  $("pp-minus").disabled = n <= 1; $("pp-plus").disabled = n >= 20;
}
function renderNativeSelect(){
  const keep = $("f-prog").value || quiz.pick;
  $("f-prog").innerHTML = GROUPS.map(g => `<optgroup label="${esc(g[lang])}">${g.items.map(i=>`<option value="${i.id}">${esc(i[lang])} · ${money(i)}</option>`).join("")}</optgroup>`).join("");
  if(keep && ALL.some(i => i.id === keep)) $("f-prog").value = keep;
}
function fmtDate(v){
  if(!v) return "";
  const [y,m,d] = v.split("-").map(Number);
  return `${d} ${MONTHS[lang][m-1]}`;
}
function dates(){
  const a=$("f-from").value, b=$("f-to").value;
  if(a && b && b!==a) return `${fmtDate(a)} – ${fmtDate(b)}`;
  return fmtDate(a||b);
}
function message(){
  const p = ALL.find(x=>x.id===$("f-prog").value) || ALL[0];
  const L = lang==="ru"
    ? ["Привет, Настя! Хочу записаться.","Имя","Программа","Человек","Даты","Отель","Фото/видео","Вопросы"]
    : ["Hi Nastya! I'd like to book a dive.","Name","Program","People","Dates","Hotel","Photos/video","Notes"];
  const v = [$("f-name").value, `${p[lang]} (${money(p)})`, $("f-people").value, dates(), $("f-hotel").value,
             $("f-photo").checked ? T("да, хочу","yes please") : "", $("f-note").value];
  return [L[0], ...v.map((x,i)=> x && String(x).trim() ? `${L[i+1]}: ${String(x).trim()}` : null)].filter(Boolean).join("\n");
}
function waLink(text){ return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`; }
function updateMsg(){
  const m = message();
  $("msg").textContent = m;
  $("go-wa").href = waLink(m);
  const it = quiz.pick && ALL.find(i => i.id === quiz.pick);
  const hi = it ? T(`Привет, Настя! Хочу записаться: ${it.ru}.`, `Hi Nastya! I'd like to book: ${it.en}.`)
               : T("Привет, Настя! Хочу записаться на погружение в Нячанге.", "Hi Nastya! I'd like to book a dive in Nha Trang.");
  $("hero-wa").href = waLink(hi);
  syncProg(); syncPeople(); syncDates();
}
function applyLang(){
  document.body.dataset.lang = lang;
  document.documentElement.lang = lang;
  $("lang-ru").setAttribute("aria-pressed", lang==="ru");
  $("lang-en").setAttribute("aria-pressed", lang==="en");
  $("intro-skip") && ($("intro-skip").textContent = T("Пропустить ›","Skip ›"));
  renderTabs(); renderList(); renderQuiz(); renderSelect(); updateMsg(); hideTip();
  if(typeof renderMaps === "function") renderMaps();
}
function setTab(id, focus){
  tab=id; renderTabs(); renderList();
  if(focus) $("tab-"+id).focus();
}
const smooth = () => matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

/* glossary popover */
function showTip(k){
  const t = TERMS[k]; if(!t) return;
  $("tip-t").textContent = t.t; $("tip-p").textContent = t[lang];
  $("tip").hidden = false; $("tip-x").focus();
}
function hideTip(){ $("tip").hidden = true; }
document.addEventListener("click", e => {
  const b = e.target.closest("[data-term]");
  if(b){ showTip(b.dataset.term); return; }
  if(!$("tip").hidden && !e.target.closest("#tip")) hideTip();
});
$("tip-x").addEventListener("click", hideTip);
document.addEventListener("keydown", e => { if(e.key==="Escape") hideTip(); });

document.querySelectorAll("[data-set]").forEach(b => b.addEventListener("click", () => {
  lang = b.dataset.set; try{ localStorage.setItem("lang", lang); }catch(e){}
  applyLang();
}));
$("q-body").addEventListener("click", e => {
  const p = e.target.closest("[data-path]");
  if(p){ quiz.path = p.dataset.path; quiz.step = quiz.path; quiz.pick = null; setTab(quiz.path); renderQuiz(); $("q-body").querySelector(".q-opt")?.focus({preventScroll:true}); return; }
  const q = e.target.closest("[data-q]");
  if(q){ quiz.pick = q.dataset.q; quiz.step = "done"; saveQuiz(); renderQuiz(); $("f-prog").value = quiz.pick; updateMsg(); return; }
  if(e.target.closest("[data-qback]")){ quiz.step = "q1"; renderQuiz(); return; }
  if(e.target.closest("[data-qredo]")){ quiz = {step:"q1", path:null, pick:null}; try{ localStorage.removeItem("quiz"); }catch(err){} renderQuiz(); updateMsg(); $("quiz").scrollIntoView({behavior: smooth(), block:"nearest"}); return; }
});
$("tabs").addEventListener("click", e => { const b=e.target.closest("[data-tab]"); if(b) setTab(b.dataset.tab); });
$("tabs").addEventListener("keydown", e => {
  if(e.key!=="ArrowRight" && e.key!=="ArrowLeft") return;
  const i = GROUPS.findIndex(g=>g.id===tab);
  const n = (i + (e.key==="ArrowRight"?1:-1) + GROUPS.length) % GROUPS.length;
  e.preventDefault(); setTab(GROUPS[n].id, true);
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-pick]"); if(!b) return;
  $("f-prog").value = b.dataset.pick; updateMsg();
  $("book").scrollIntoView({behavior: smooth()});
  setTimeout(() => { try{ $("f-name").focus({preventScroll:true}); }catch(err){} }, 700);
});
$("f").addEventListener("input", updateMsg);
$("f").addEventListener("change", updateMsg);
$("f").addEventListener("submit", e => e.preventDefault());
$("copy").addEventListener("click", () => {
  const m = message();
  const done = () => $("toast").textContent = T("Скопировано. Вставь в чат Telegram.","Copied. Paste it into Telegram.");
  try{ navigator.clipboard.writeText(m).then(done).catch(selectMsg); }catch(e){ selectMsg(); }
});
function selectMsg(){
  const r=document.createRange(); r.selectNodeContents($("msg"));
  const s=getSelection(); s.removeAllRanges(); s.addRange(r);
  $("toast").textContent = T("Текст выделен: скопируй его вручную.","Text selected: copy it manually.");
}
const today = new Date(); const iso = new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);

/* trip dates: Air Datepicker (vendor/air-datepicker-*.js) in range mode; hidden f-from / f-to keep ISO dates for the message and the backend */
const ADP_LOCALE = {
  ru:{days:["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"],daysShort:["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],daysMin:["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],
      months:["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],monthsShort:["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"],
      today:"Сегодня",clear:"Очистить",dateFormat:"dd.MM.yyyy",timeFormat:"HH:mm",firstDay:1},
  en:{days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],daysMin:["Su","Mo","Tu","We","Th","Fr","Sa"],
      months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      today:"Today",clear:"Clear",dateFormat:"MM/dd/yyyy",timeFormat:"hh:mm aa",firstDay:1}
};
const isoOf = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
let dp = null;
function dpOpts(){
  return {
    locale: ADP_LOCALE[lang], range: true, multipleDatesSeparator: " – ", minDate: new Date(new Date().setHours(0,0,0,0)),
    dateFormat: d => fmtDate(isoOf(d)), autoClose: true, toggleSelected: false, keyboardNav: true,
    isMobile: matchMedia("(max-width:560px)").matches, position: "bottom left", buttons: ["clear"],
    prevHtml: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    nextHtml: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    navTitles: {days: "<b>MMMM</b>&nbsp;yyyy"},
    onSelect: ({date}) => {
      const [a, b] = Array.isArray(date) ? date : (date ? [date] : []);
      $("f-from").value = a ? isoOf(a) : ""; $("f-to").value = b ? isoOf(b) : "";
      updateMsg();
    }
  };
}
function syncDates(){
  const a = $("f-from").value, b = $("f-to").value;
  $("f-dates").placeholder = T("Когда ты в Нячанге?", "When are you in Nha Trang?");
  if(dp){
    if(dp.__lang !== lang){ dp.__lang = lang; dp.update({locale: ADP_LOCALE[lang]}, {silent: true}); }
    $("f-dates").value = a ? (b && b !== a ? `${fmtDate(a)} – ${fmtDate(b)}` : fmtDate(a) + (b ? "" : " – …")) : "";
  }
  const n = a && b ? Math.round((new Date(b) - new Date(a)) / 864e5) + 1 : 0, m10 = n % 10, m100 = n % 100;
  $("f-nights").textContent = n ? (lang === "ru" ? `${n} ${m10 === 1 && m100 !== 11 ? "день" : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? "дня" : "дней"}` : `${n} day${n > 1 ? "s" : ""}`) : "";
}
if(window.AirDatepicker){
  dp = new AirDatepicker("#f-dates", dpOpts()); dp.__lang = lang;
  addEventListener("resize", () => { const mob = matchMedia("(max-width:560px)").matches; if(dp && dp.opts.isMobile !== mob){ if(dp.visible) dp.hide(); dp.update({isMobile: mob}, {silent: true}); } });
} else {
  // library failed to load: fall back to two native date fields
  $("f-dates").closest(".fld").hidden = true;
  ["f-from","f-to"].forEach(id => { const f = $(id); f.type = "date"; f.min = iso; f.className = "dates-fallback"; f.addEventListener("change", updateMsg); $("f-dates").closest(".fld").after(f); });
}

$("go-tg").href = $("c-tg-a").href = $("hi-tg").href = `https://t.me/${CONTACT.telegram}`;
$("c-wa-a").href = `https://wa.me/${CONTACT.whatsapp}`;
$("c-ig-a").href = `https://instagram.com/${CONTACT.instagram}`;
$("c-tg").textContent = "@" + CONTACT.telegram;
$("c-wa").textContent = "+" + CONTACT.whatsapp.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/,"$1 $2 $3 $4");
$("c-ig").textContent = "@" + CONTACT.instagram;
if(quiz.pick) tab = quiz.path;

/* ===== scroll effects: depth gauge, reveals ===== */
(function(){
  const gauge = $("gauge"), gv = $("g-val");
  const secs = [...document.querySelectorAll("section[data-depth]")];
  let ticking = false;
  function onScroll(){
    ticking = false;
    const y = scrollY, vh = innerHeight;
    // depth = interpolated between the sections' data-depth values
    let d = 0;
    for(const s of secs){ const r = s.getBoundingClientRect(); if(r.top < vh * .5) d = +s.dataset.depth + Math.min(1, Math.max(0, (vh * .5 - r.top) / r.height)) * 3; }
    d = Math.min(30, d);
    gauge.classList.toggle("on", y > vh * .5);
    gauge.style.setProperty("--g", (d / 30 * 100).toFixed(1) + "%");
    gv.textContent = d.toFixed(0) + " m";
  }
  addEventListener("scroll", () => { if(!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  addEventListener("resize", onScroll);
  onScroll();
  const els = document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){ els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }), {rootMargin:"0px 0px -8% 0px", threshold:.08});
  els.forEach(e => io.observe(e));
})();

/* ===== videos: play on tap, pause when scrolled away ===== */
document.querySelectorAll(".mo video").forEach(v => {
  const fig = v.closest(".mo"), btn = fig.querySelector(".play");
  btn && btn.addEventListener("click", () => { v.controls = true; v.play().then(() => fig.classList.add("on")).catch(() => {}); });
  v.addEventListener("pause", () => { if(v.ended) fig.classList.remove("on"); });
  if("IntersectionObserver" in window) new IntersectionObserver(es => es.forEach(en => { if(!en.isIntersecting && !v.paused) v.pause(); }), {threshold:0}).observe(v);
});

/* ===== Interactive dive-site maps =====
   Drawn as SVG from the data below, so every label follows the page language.
   Coordinates are in a 1000 × 625 box; route points are [x, y, depth in metres]. */

const SITES = [
 {id:"cemetery", name:"Cemetery Bay", where:{ru:"Хон Мун, Нячанг", en:"Hon Mun, Nha Trang"},
  land:"forest", north:0,
  shore:[[-30,-30],[1030,-30],[1030,282],[960,292],[910,296],[850,276],[800,232],[772,172],[748,112],[704,62],[640,40],[560,30],[470,28],[380,34],[300,52],[236,84],[178,128],[112,160],[46,184],[-30,196]],
  islands:[],
  deep:"s",
  reefs:[[150,205,60,26],[300,120,70,30],[690,135,55,20],[820,300,70,30],[930,330,60,22],[640,430,50,24],[760,470,90,34],[870,470,60,26],[500,175,40,12],[245,250,60,18]],
  rocks:[[640,420],[662,445],[625,450],[905,318],[950,330],[820,505],[860,520],[690,470]],
  sand:[[340,78,70],[420,330,60]],
  depths:[[300,300,"5 m"],[230,470,"12 m"],[560,560,"18 m+"],[930,560,"15 m"]],
  pois:[
   {x:581,y:226,k:"moor",d:"4 m",ru:"Швартовка",en:"Mooring",n_ru:"Спуск и подъём по линии",n_en:"Descent and ascent on the line"},
   {x:340,y:82,k:"sand",d:"1–3 m",ru:"Мелкий песок",en:"Shallow sand",n_ru:"Светлое дно у пляжа",n_en:"Bright sand by the beach"},
   {x:432,y:278,k:"nav",d:"7 m",ru:"Навигационный квадрат",en:"NAV square",n_ru:"Тренировки навигации на курсах",n_en:"Used for navigation practice"},
   {x:512,y:312,k:"tire",d:"10 m",ru:"Покрышка",en:"Car tire",n_ru:"Ориентир на пути к склону",n_en:"Landmark on the way to the slope"},
   {x:712,y:150,k:"coral",d:"2–3 m",ru:"Кораллы",en:"Coral garden",n_ru:"Мелко и светло, следи за ластами",n_en:"Shallow and bright, mind your fins"},
   {x:640,y:432,k:"rock",d:"8 m",ru:"Камни",en:"Rock cluster",n_ru:"Мурены прячутся в щелях",n_en:"Moray eels hide in the cracks"},
   {x:842,y:470,k:"wall",d:"13 m",ru:"Стенка",en:"Wall",n_ru:"Вдоль стенки на восток",n_en:"Follow it east"},
   {x:372,y:590,k:"deep",d:"18 m",ru:"Глубокий склон",en:"Deep slope",n_ru:"Склон уходит глубже 18 м: смотри на компьютер",n_en:"Keeps going below 18 m: watch your computer"}
  ],
  routes:[
   {c:"#ff6b5b", ru:"Коралловая петля", en:"Coral loop", depth:"2–8 m", time:40, best:"DSD · OW",
    s_ru:["От швартовки на юг вдоль рифа к камням (8 м)","На север над кораллами (2–3 м)","Маленькая петля севернее лодки и назад"],
    s_en:["From the mooring south along the reef to the rocks (8 m)","North over the coral (2–3 m)","A small loop north of the boat, then back"],
    pts:[[581,226,4],[592,300,6],[604,378,8],[640,432,8],[690,400,7],[716,322,5],[692,242,3],[642,176,2],[576,118,2],[510,120,3],[490,176,3],[530,214,4],[581,226,4]]},
   {c:"#ffc94a", ru:"Стенка и камни", en:"Wall and rocks", depth:"4–13 m", time:45, best:"OW · AOW",
    s_ru:["От швартовки на юг мимо камней","Вдоль стенки (13 м) на восток, вокруг внешних камней","Назад на запад вдоль стенки к лодке"],
    s_en:["From the mooring south past the rocks","East along the wall (13 m), around the outer rocks","Back west along the wall to the boat"],
    pts:[[581,226,4],[602,292,6],[626,372,8],[684,436,10],[764,452,12],[842,452,13],[902,420,13],[936,372,12],[950,430,13],[912,508,13],[822,530,13],[730,494,12],[664,446,10],[622,334,7],[581,226,4]]},
   {c:"#a98bff", ru:"Глубокий склон", en:"Deep slope", depth:"4–18 m", time:40, best:"AOW · Deep",
    s_ru:["От швартовки на юго-запад мимо покрышки (10 м)","Вниз по песчаному склону до 18 м","Тем же путём назад к линии"],
    s_en:["From the mooring south-west past the car tire (10 m)","Down the sandy slope to 18 m","The same way back to the line"],
    pts:[[581,226,4],[522,262,7],[474,330,10],[434,420,13],[402,510,16],[372,590,18],[392,596,18],[420,512,16],[452,424,13],[492,336,10],[536,270,7],[581,226,4]]}
  ],
  facts:[["Тип","Type","Закрытая бухта, кораллы и камни","Sheltered bay, coral and rocks"],
         ["Глубина","Depth","2–18 м","2–18 m"],["Уровень","Level","DSD · OW · AOW","DSD · OW · AOW"],
         ["Видимость","Visibility","5–20 м, лучше всего март–июнь","5–20 m, best March–June"],
         ["Течение","Current","Нет или умеренное, сильнее в окт–янв","None to moderate, stronger Oct–Jan"],
         ["Вода","Water","24–29 °C","24–29 °C"],["GPS","GPS","12.18212 N, 109.29394 E","12.18212 N, 109.29394 E"]],
  life:{ru:["Рифовые рыбы: попугаи, хирурги, единороги","Крылатки","Мурены в щелях камней","Голожаберные моллюски","Твёрдые и мягкие кораллы, луцианы"],
        en:["Reef fish: parrotfish, surgeonfish, unicornfish","Lionfish","Moray eels in rock crevices","Nudibranchs","Hard and soft corals, snappers and grunts"]},
  safety:{ru:["Лодки у швартовки: всплываем по линии","Склон идёт глубже 18 м, следи за глубиной","Прибой у камней и берега","Крылатки и ежи: не трогать","Мелкие кораллы: аккуратно с ластами","Заповедник: ничего не трогаем и не берём"],
          en:["Boats at the mooring: ascend on the line","The slope continues below 18 m, watch your depth","Surge near rocks and the shore","Lionfish and sea urchins: don't touch","Shallow coral: mind your fins","Marine park: no touching, no collecting"]}
 },

 {id:"madonna", name:"Madonna Rock", where:{ru:"Хон Мун, 5–10 минут на лодке",en:"Hon Mun, 5–10 min by boat"},
  land:"rock", north:null, current:{x:860,y:70,ang:0},
  shore:[],
  islands:[
   [[300,170],[380,140],[470,150],[540,190],[556,270],[548,360],[520,430],[450,456],[370,446],[300,410],[272,330],[276,240]],
   [[560,200],[640,180],[720,200],[742,280],[728,360],[690,398],[620,400],[566,370],[556,290]],
   [[536,388],[600,376],[660,396],[672,440],[630,466],[560,462],[530,430]],
   [[132,392],[160,380],[176,398],[160,414],[136,410]],
   [[186,418],[210,410],[224,428],[204,442],[184,436]]
  ],
  deep:"nw",
  reefs:[[230,200,60,22],[230,380,50,18],[790,260,60,24],[780,420,60,22],[420,500,70,26],[120,300,50,16],[700,500,70,22],[600,120,60,14]],
  rocks:[[170,490],[200,500],[232,488],[248,508],[760,178],[786,190],[300,520]],
  sand:[[880,520,60],[120,560,50]],
  depths:[[880,236,"12 m"],[890,350,"10 m"],[890,470,"10 m"],[40,60,"30 m ↖"]],
  pois:[
   {x:546,y:100,k:"boat",d:"18 m",ru:"Quick Drop, верхняя лодка",en:"Quick Drop, upper boat",n_ru:"Быстрый спуск сразу на 18 м",n_en:"Straight down to 18 m"},
   {x:504,y:500,k:"moor",d:"7 m",ru:"Швартовка, нижняя лодка",en:"Mooring, lower boat",n_ru:"Линия спуска, сюда возвращаются все маршруты",n_en:"Descent line, every route ends here"},
   {x:214,y:350,k:"tunnel",d:"14 m",ru:"Трещина и проход-туннель",en:"Crack and swim-through",n_ru:"Проходим только с хорошей плавучестью",n_en:"Only with good buoyancy"},
   {x:770,y:184,k:"rock",d:"14 m",ru:"Два камня, проход",en:"Two stones, passage",n_ru:"Проплываем между камнями",n_en:"Swim between the stones"},
   {x:168,y:408,k:"rock",d:"0 m",ru:"Два камня над водой",en:"Two stones above water",n_ru:"Хорошо видно с лодки",n_en:"Visible from the boat"},
   {x:210,y:500,k:"rock",d:"17 m",ru:"L-образные камни",en:"L-shaped stones",n_ru:"Под водой, обходим снаружи",n_en:"Underwater, go round the outside"},
   {x:120,y:130,k:"wall",d:"18 m",ru:"Склон рифа",en:"Reef slope",n_ru:"Дальше обрыв до 30 м",n_en:"Then a drop-off to 30 m"}
  ],
  routes:[
   {c:"#ffc94a", ru:"Маршрут вдоль склона", en:"Slope route", depth:"7–18 m", time:45, best:"OW · AOW",
    s_ru:["От верхней лодки вдоль склона рифа","К трещине и проходу (14 м), к двум камням над водой","Дальше к L-образным камням и к нижней лодке"],
    s_en:["From the upper boat along the reef slope","To the crack and swim-through (14 m) and the two stones above water","On to the L-shaped stones and the lower boat"],
    pts:[[546,100,18],[440,104,18],[326,126,18],[236,200,16],[214,312,14],[214,350,14],[232,400,13],[300,456,11],[400,488,9],[504,500,7]]},
   {c:"#ff6b5b", ru:"Проход между камнями", en:"Stone passage", depth:"7–14 m", time:45, best:"OW · AOW",
    s_ru:["От нижней лодки вдоль правой стороны рифа","К двум камням и проходу между ними (14 м)","Назад вдоль рифа через 12–10 м к нижней лодке"],
    s_en:["From the lower boat along the right side of the reef","To the two stones and the passage between them (14 m)","Back along the reef through 12–10 m to the lower boat"],
    pts:[[504,500,7],[620,512,9],[740,486,10],[828,400,10],[850,300,12],[820,214,13],[770,184,14],[700,160,14],[650,170,14],[772,230,13],[782,330,11],[770,420,10],[700,470,9],[600,490,8],[504,500,7]]},
   {c:"#4fd8f0", ru:"Вокруг L-образных камней", en:"Around the L-stones", depth:"7–17 m", time:40, best:"AOW",
    s_ru:["От нижней лодки к L-образным камням (17 м)","Обходим их с внешней стороны","Возвращаемся к нижней лодке"],
    s_en:["From the lower boat to the L-shaped stones (17 m)","Go round them on the outside","Back to the lower boat"],
    pts:[[504,500,7],[400,540,12],[280,556,15],[160,540,17],[84,486,17],[72,410,16],[112,352,15],[200,360,14],[300,410,12],[404,470,9],[504,500,7]]}
  ],
  facts:[["Тип","Type","Скальный риф","Rocky reef"],["Глубина","Depth","обычно 10–18 м, макс. 30–35 м","usually 10–18 m, max 30–35 m"],
         ["Уровень","Level","OW · AOW","OW · AOW"],["Видимость","Visibility","8–20 м","8–20 m"],
         ["Течение","Current","Слабое или умеренное","Weak to moderate"],["Вода","Water","26–29 °C","26–29 °C"],
         ["Дно","Bottom","Камни, кораллы, песок","Rocks, coral, sand"]],
  life:{ru:["Рифовые рыбы","Скорпены (морской ёрш)","Крылатки","Мурены","Голожаберные моллюски","Креветки и крабы","Иногда каракатицы"],
        en:["Reef fish","Scorpionfish","Lionfish","Moray eels","Nudibranchs","Shrimps and crabs","Cuttlefish, sometimes"]},
  safety:{ru:["Течение может меняться","Прибой на мелководье","Острые кораллы и камни","Лодки при всплытии","Глубокая сторона: следи за глубиной","Нужна хорошая плавучесть","Не трогать кораллы и животных"],
          en:["The current can change","Surge in the shallows","Sharp coral and rocks","Boats when you surface","Deep side: watch your depth","Good buoyancy is a must","Don't touch coral or animals"]}
 },

 {id:"dambay", name:"Dam Bay", where:{ru:"Хон Тре, Нячанг",en:"Hon Tre, Nha Trang"},
  land:"forest", north:null,
  shore:[[-30,-30],[1030,-30],[1030,150],[960,140],[900,118],[830,92],[740,74],[640,76],[520,80],[400,84],[300,88],[218,96],[160,130],[120,190],[86,260],[46,320],[0,356],[-30,370]],
  islands:[],
  deep:"sw",
  reefs:[[520,215,120,70],[920,250,70,30],[160,310,60,22],[240,420,90,30],[420,470,90,26],[640,470,90,24],[860,420,70,22],[150,200,40,14],[760,160,40,14]],
  rocks:[[96,330],[60,380],[130,400],[180,440],[230,470],[110,450],[150,500],[820,108],[880,126]],
  sand:[[760,360,110],[540,560,90]],
  depths:[[176,128,"2–3 m"],[900,170,"2–3 m"],[950,240,"6 m"],[150,275,"2–3 m"],[200,420,"9–13 m"],[770,356,"10 m"]],
  pois:[
   {x:236,y:181,k:"moor",d:"3 m",ru:"Левая швартовка",en:"Left mooring",n_ru:"Старт всех трёх маршрутов",n_en:"All three routes start here"},
   {x:665,y:131,k:"moor",d:"3 m",ru:"Правая швартовка",en:"Right mooring",n_ru:"Вторая лодка",n_en:"The second boat"},
   {x:520,y:216,k:"coral",d:"4 m",ru:"Центральный риф",en:"Central reef",n_ru:"Главный коралловый участок",n_en:"The main coral patch"},
   {x:724,y:176,k:"bike",d:"4 m",ru:"Велосипед",en:"Bicycle",n_ru:"Затонувший велосипед, любимое фото",n_en:"A sunken bicycle, a favourite photo spot"},
   {x:120,y:380,k:"wall",d:"9–13 m",ru:"Скальная стенка",en:"Rock wall",n_ru:"Уходит до 9–13 м",n_en:"Drops to 9–13 m"}
  ],
  routes:[
   {c:"#ffc94a", ru:"Вокруг центрального рифа", en:"Round the central reef", depth:"2–4 m", time:40, best:"DSD · OW",
    s_ru:["От левой швартовки по мелководью 2–3 м","По часовой стрелке вокруг кораллов на 4 м","Назад к лодке"],
    s_en:["From the left mooring through the 2–3 m shallows","Clockwise round the coral patch at 4 m","Back to the boat"],
    pts:[[236,181,3],[262,122,2],[400,110,3],[570,116,3],[642,152,4],[646,216,4],[562,262,4],[440,252,4],[302,212,3],[236,181,3]]},
   {c:"#ff8a3d", ru:"К велосипеду", en:"To the bicycle", depth:"2–4 m", time:40, best:"OW",
    s_ru:["От левой швартовки по верхней части бухты к правой","Вокруг участка с велосипедом (4 м)","Назад вдоль центрального рифа"],
    s_en:["From the left mooring along the top of the bay to the right mooring","Round the bicycle area (4 m)","Back along the central reef"],
    pts:[[236,181,3],[204,150,3],[262,132,3],[420,124,3],[560,108,3],[665,131,3],[762,146,4],[796,192,4],[742,212,4],[622,192,4],[460,170,4],[330,190,3],[236,181,3]]},
   {c:"#c26bff", ru:"Скальная стенка", en:"Rock wall", depth:"3–13 m", time:45, best:"OW · AOW",
    s_ru:["От левой швартовки против часовой стрелки к скальной стенке 9–13 м","Вдоль нижней кромки рифа","Назад к лодке, обходя центральный риф"],
    s_en:["From the left mooring anticlockwise to the rock wall, 9–13 m","Along the lower edge of the reef","Back to the boat around the central reef"],
    pts:[[236,181,3],[172,240,4],[124,318,7],[146,376,10],[220,410,12],[340,380,11],[480,330,9],[640,310,8],[720,262,6],[690,196,5],[590,160,4],[430,166,4],[300,180,3],[236,181,3]]}
  ],
  facts:[["Тип","Type","Защищённая бухта и риф","Sheltered bay and reef"],["Глубина","Depth","2–13 м","2–13 m"],
         ["Уровень","Level","OW · AOW","OW · AOW"],["Дно","Bottom","Кораллы, песок, камни, стенка","Coral, sand, rocks, a wall"],
         ["GPS","GPS","12.17890 N, 109.29023 E","12.17890 N, 109.29023 E"]],
  life:{ru:["Рыбы-попугаи","Рыбы-бабочки и ангелы","Рыбы-клоуны в анемонах","Мурены","Голожаберные моллюски","Креветки и раки-богомолы","Морские звёзды и ежи","Иногда черепахи и скаты"],
        en:["Parrotfish","Butterflyfish and angelfish","Clownfish in anemones","Moray eels","Nudibranchs","Shrimps and mantis shrimps","Starfish and sea urchins","Turtles and rays, sometimes"]},
  safety:{ru:["Мелководье 2–3 м: камни и прибой у берега","Стенка уходит до 9–13 м","Течение может меняться","Следи за глубиной и плавучестью","Не трогай кораллы и не вставай на риф","Ежи и рыбы-камуфляжи","Лодки у швартовок"],
          en:["2–3 m shallows: rocks and surge by the shore","The wall drops to 9–13 m","The current can change","Watch your depth and buoyancy","Don't touch coral or stand on the reef","Sea urchins and camouflaged fish","Boats at the moorings"]}
 }
];

const MAP_T = {
 ru:{routes:"Маршруты", play:"Показать маршрут", replay:"Ещё раз", depth:"Глубина", time:"Время", best:"Подходит", min:"мин",
     info:"О сайте", life:"Кто живёт", safety:"Безопасность", points:"Точки на карте", want:"Хочу нырнуть здесь",
     current:"течение", hint:"Нажми на точку, чтобы узнать, что там", n:"С", note:"Хочу на сайт"},
 en:{routes:"Routes", play:"Show the route", replay:"Play again", depth:"Depth", time:"Time", best:"Good for", min:"min",
     info:"Site info", life:"Marine life", safety:"Safety", points:"Points on the map", want:"I want to dive here",
     current:"current", hint:"Tap a point to see what's there", n:"N", note:"I'd like to dive"}
};

let mapSite = 0, mapRoute = 0, mapAnim = null, mapAutoplayed = {};

/* Catmull-Rom → cubic Bézier, gives soft natural lines through the given points */
function curve(pts, closed){
  const P = pts.map(p => [p[0], p[1]]), n = P.length;
  if(n < 2) return "";
  const at = i => closed ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))];
  let d = `M${P[0][0]},${P[0][1]}`;
  const last = closed ? n : n - 1;
  for(let i = 0; i < last; i++){
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2), k = 6;
    d += `C${(p1[0] + (p2[0] - p0[0]) / k).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / k).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / k).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / k).toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d + (closed ? "Z" : "");
}
/* tiny seeded random so coral patches look the same on every render */
function rng(seed){ let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

const POI_ICON = {
  moor:'<circle r="11" fill="#071a22" stroke="#fff" stroke-width="2.4"/><path d="M-5-5L5 5M5-5L-5 5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>',
  boat:'<path d="M-13 2h26l-5 8h-16z" fill="#fff"/><rect x="-6" y="-8" width="11" height="9" rx="1.5" fill="#4fd8f0"/>',
  coral:'<path d="M0 10V-2M0 2l-7-8M0 0l7-9M-7-6l-3-5M7-9l4-3" stroke="#ff7b8a" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
  rock:'<ellipse rx="11" ry="7.5" fill="#8b6a52" stroke="#3b2a1e" stroke-width="1.5"/>',
  tire:'<circle r="9" fill="none" stroke="#1d1d1d" stroke-width="5"/><circle r="9" fill="none" stroke="#555" stroke-width="1"/>',
  nav:'<rect x="-10" y="-10" width="20" height="20" fill="none" stroke="#fff" stroke-dasharray="3 3" stroke-width="1.6"/><g fill="#ff6b5b"><circle cx="-10" cy="-10" r="3"/><circle cx="10" cy="-10" r="3"/><circle cx="-10" cy="10" r="3"/><circle cx="10" cy="10" r="3"/></g>',
  sand:'<g fill="#fff"><circle cx="-5" cy="-3" r="1.6"/><circle cx="2" cy="-5" r="1.6"/><circle cx="6" cy="1" r="1.6"/><circle cx="-2" cy="3" r="1.6"/><circle cx="-7" cy="4" r="1.6"/></g>',
  wall:'<path d="M-11 6l5-11 5 6 5-9 7 14z" fill="#5a6b73" stroke="#c9d6da" stroke-width="1.4" stroke-linejoin="round"/>',
  deep:'<path d="M0-10v18M-6 2l6 7 6-7" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  tunnel:'<path d="M-11 8a11 11 0 0 1 22 0" fill="#06131a" stroke="#c9d6da" stroke-width="2.4"/>',
  bike:'<g fill="none" stroke="#fff" stroke-width="2"><circle cx="-7" cy="3" r="5"/><circle cx="8" cy="3" r="5"/><path d="M-7 3l4-8h8l3 8M-3-5l4 8 4-8"/></g>'
};

function mapSVG(S){
  const L = MAP_T[lang], r = rng(S.id.length * 977 + 13);
  // water: deep side darker
  const g = {s:["0","0","0","1"], nw:["1","1","0","0"], sw:["1","0","0","1"]}[S.deep];
  let s = `<defs>
    <linearGradient id="mw" x1="${g[0]}" y1="${g[1]}" x2="${g[2]}" y2="${g[3]}"><stop offset="0" stop-color="#1fa6b4"/><stop offset=".45" stop-color="#0d5f78"/><stop offset="1" stop-color="#062338"/></linearGradient>
    <radialGradient id="mrock" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#d79a63"/><stop offset=".7" stop-color="#9c6440"/><stop offset="1" stop-color="#5b3826"/></radialGradient>
    <linearGradient id="mforest" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6b3b"/><stop offset="1" stop-color="#1f4d2d"/></linearGradient>
    <filter id="mblur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="mtex"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="${S.id.length}"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 .95"/><feComposite in2="SourceGraphic" operator="in"/></filter>
    <pattern id="mcaus" width="140" height="140" patternUnits="userSpaceOnUse"><path d="M0 40c30-20 50 20 80 0s50 10 60 0M0 100c20 10 40-20 70 0s50-10 70 5M30 0c-10 30 20 50 0 80s10 40 0 60M100 0c10 30-20 40 0 70s-10 50 5 70" stroke="#bff6ff" stroke-opacity=".07" stroke-width="2" fill="none"/></pattern>
  </defs>
  <rect width="1000" height="625" fill="url(#mw)"/>
  <rect width="1000" height="625" fill="url(#mcaus)" class="m-caus"/>`;
  // shallow halo along every coastline, then the land on top
  const lands = [];
  if(S.shore.length) lands.push(curve(S.shore, true));
  S.islands.forEach(i => lands.push(curve(i, true)));
  s += `<g filter="url(#mblur)" fill="none" stroke-linejoin="round">${lands.map(d => `<path d="${d}" stroke="#5fe0d0" stroke-opacity=".35" stroke-width="150"/><path d="${d}" stroke="#9ff3e3" stroke-opacity=".45" stroke-width="60"/>`).join("")}</g>`;
  S.sand.forEach(([x, y, rr]) => s += `<ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${rr * .55}" fill="#d8ecd0" opacity=".12" filter="url(#mblur)"/>`);
  // coral patches
  let reef = "";
  S.reefs.forEach(([cx, cy, rad, cnt]) => { for(let i = 0; i < cnt * 1.6; i++){
    const a = r() * 6.283, d = Math.sqrt(r()) * rad, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .7, z = 3 + r() * 6;
    const col = ["#2f8f7c","#3a9f8a","#24706a","#2b7b8c","#4a9a78","#b07a86","#a8865e"][Math.min(6, Math.floor(r() * r() * 9))];
    reef += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${z.toFixed(1)}" fill="${col}" stroke="#0a3a40" stroke-opacity=".5" opacity="${(.4 + r() * .35).toFixed(2)}"/>`;
  }});
  s += `<g class="m-reef">${reef}</g>`;
  S.rocks.forEach(([x, y]) => s += `<ellipse cx="${x}" cy="${y}" rx="${9 + r() * 7}" ry="${6 + r() * 4}" fill="#6d5644" stroke="#2f241b" stroke-width="1.2" opacity=".9"/>`);
  // land
  lands.forEach((d, i) => {
    const rock = S.land === "rock";
    s += `<path d="${d}" fill="${rock ? "url(#mrock)" : "url(#mforest)"}" stroke="${rock ? "#3b2416" : "#d9cfa4"}" stroke-width="${rock ? 2 : 5}" stroke-opacity="${rock ? 1 : .8}"/>`;
    s += `<path d="${d}" fill="${rock ? "#5c8f3a" : "#3f8a48"}" filter="url(#mtex)" opacity="${rock ? .55 : .9}"/>`;
  });
  // depth labels
  S.depths.forEach(([x, y, t]) => s += `<text x="${x}" y="${y}" class="m-depth">${esc(t)}</text>`);
  // routes (all dim), the active one drawn bright on top
  S.routes.forEach((R, i) => {
    const d = curve(R.pts, false);
    s += `<g class="m-route${i === mapRoute ? " on" : ""}" data-route="${i}" style="--rc:${R.c}">
      <path d="${d}" class="m-hit"/><path d="${d}" class="m-glow"/><path d="${d}" class="m-line" id="mr-${i}"/>
    </g>`;
  });
  // compass / current
  if(S.north !== null) s += `<g transform="translate(948 62) rotate(${S.north})" class="m-compass"><circle r="30" fill="#061a22" fill-opacity=".72" stroke="#ffffff55"/><path d="M0-22L7 4 0 0-7 4z" fill="#fff"/><path d="M0 22L7 4 0 0-7 4z" fill="#ffffff55"/><text y="-30" class="m-n">${L.n}</text></g>`;
  if(S.current) s += `<g transform="translate(${S.current.x} ${S.current.y})" class="m-current"><path d="M-60 0H40" stroke="#7fd8ff" stroke-width="5" stroke-linecap="round"/><path d="M28-12L50 0 28 12" fill="#7fd8ff"/><text x="-60" y="-14">${L.current}</text></g>`;
  // points of interest
  S.pois.forEach((p, i) => {
    const lx = p.x > 760 ? -18 : 18, anchor = p.x > 760 ? "end" : "start";
    s += `<g class="m-poi" data-poi="${i}" tabindex="0" role="button" aria-label="${esc(p[lang])}, ${esc(p.d)}" transform="translate(${p.x} ${p.y})">
      <circle r="24" class="m-poi-hit"/>${POI_ICON[p.k] || ""}
      <g class="m-tag"><text x="${lx}" y="-12" text-anchor="${anchor}">${esc(p[lang])}<tspan> · ${esc(p.d)}</tspan></text></g>
      <g class="m-num" transform="translate(13 -13)"><circle r="9"/><text y="3.5">${i + 1}</text></g>
    </g>`;
  });
  // the diver
  s += `<g id="m-diver" class="m-diver"><circle r="22" class="m-pulse"/><circle r="9" class="m-dot"/><circle r="3.5" fill="#06131a"/></g>`;
  return s;
}

function renderMaps(){
  const box = $("site-map"); if(!box) return;
  const L = MAP_T[lang], S = SITES[mapSite];
  $("site-tabs").innerHTML = SITES.map((x, i) => `<button type="button" role="tab" aria-selected="${i === mapSite}" tabindex="${i === mapSite ? 0 : -1}" data-site="${i}"><b>${esc(x.name)}</b><small>${esc(x.where[lang])}</small></button>`).join("");
  $("site-svg").innerHTML = mapSVG(S);
  $("site-svg").setAttribute("aria-label", `${S.name}: ${L.routes.toLowerCase()} ${S.routes.map(R => R[lang]).join(", ")}`);
  renderRoutes();
  $("site-pois").innerHTML = S.pois.map((p, i) => `<li><button type="button" data-poi="${i}"><span class="m-pn">${i + 1}</span>${esc(p[lang])} <em>${esc(p.d)}</em></button></li>`).join("");
  $("site-points-h").textContent = L.hint;
  const open = !matchMedia("(max-width:700px)").matches;
  $("site-info").innerHTML = `
    <details${open ? " open" : ""}><summary>${L.info}</summary><dl>${S.facts.map(f => `<div><dt>${esc(lang === "ru" ? f[0] : f[1])}</dt><dd>${esc(lang === "ru" ? f[2] : f[3])}</dd></div>`).join("")}</dl></details>
    <details${open ? " open" : ""}><summary>${L.life}</summary><ul>${S.life[lang].map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>
    <details${open ? " open" : ""}><summary>${L.safety}</summary><ul class="warn">${S.safety[lang].map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>`;
  $("m-play").lastChild.textContent = L.play;
  hidePoiTip();
  placeDiver(0);
}
function renderRoutes(){
  const S = SITES[mapSite], L = MAP_T[lang];
  $("site-routes").innerHTML = `<p class="m-h">${L.routes}</p>` + S.routes.map((R, i) => `
    <div class="m-rt-w${i === mapRoute ? " on" : ""}" style="--rc:${R.c}">
      <button type="button" class="m-rt" data-route="${i}" aria-pressed="${i === mapRoute}">
        <span class="m-sw"></span><span class="m-rt-t"><b>${esc(R[lang])}</b><small>${esc(R.depth)} · ~${R.time} ${L.min} · ${esc(R.best)}</small></span>
      </button>
      ${i === mapRoute ? `<ol class="m-steps">${R["s_" + lang].map(x => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}
    </div>`).join("");
  $("m-route-name").textContent = S.routes[mapRoute][lang];
  $("m-route-name").style.color = S.routes[mapRoute].c;
}
function setRoute(i, play){
  mapRoute = i;
  document.querySelectorAll("#site-svg .m-route").forEach(g => g.classList.toggle("on", +g.dataset.route === i));
  renderRoutes(); stopDiver(); placeDiver(0);
  if(play) playDiver();
}
/* depth along the route: interpolate the depths of the control points by distance */
function depthAt(R, t){
  const P = R.pts; let total = 0; const seg = [];
  for(let i = 1; i < P.length; i++){ const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(d); total += d; }
  let want = t * total;
  for(let i = 0; i < seg.length; i++){
    if(want <= seg[i] || i === seg.length - 1){ const k = seg[i] ? Math.min(1, want / seg[i]) : 0; return P[i][2] + (P[i + 1][2] - P[i][2]) * k; }
    want -= seg[i];
  }
  return P[0][2];
}
function placeDiver(t){
  const path = $("mr-" + mapRoute), dv = $("m-diver"); if(!path || !dv) return;
  const R = SITES[mapSite].routes[mapRoute], len = path.getTotalLength(), pt = path.getPointAtLength(len * t);
  dv.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
  dv.style.setProperty("--rc", R.c);
  path.style.strokeDasharray = `${len}`;
  path.style.strokeDashoffset = `${len * (1 - (t || 1))}`;
  $("m-depth").textContent = depthAt(R, t).toFixed(1);
  // on phones the map is wider than the screen: keep the diver in view
  const sc = $("m-scroll");
  if(sc && sc.scrollWidth > sc.clientWidth + 2){
    const k = sc.scrollWidth / 1000;
    sc.scrollLeft = Math.max(0, Math.min(sc.scrollWidth - sc.clientWidth, pt.x * k - sc.clientWidth / 2));
  }
  $("m-time").textContent = Math.round(R.time * t);
}
function stopDiver(){ if(mapAnim){ cancelAnimationFrame(mapAnim); mapAnim = null; } $("site-map").classList.remove("playing"); }
function playDiver(){
  stopDiver();
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){ placeDiver(1); return; }
  const R = SITES[mapSite].routes[mapRoute], dur = 7000 + R.pts.length * 250; let t0 = 0;
  const path = $("mr-" + mapRoute); if(path){ const len = path.getTotalLength(); path.style.strokeDashoffset = `${len}`; }
  $("site-map").classList.add("playing");
  const step = now => {
    if(!t0) t0 = now;
    const t = Math.min(1, (now - t0) / dur), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    placeDiver(Math.max(e, .0001));
    if(t < 1) mapAnim = requestAnimationFrame(step);
    else { mapAnim = null; $("site-map").classList.remove("playing"); $("m-play").lastChild.textContent = MAP_T[lang].replay; }
  };
  mapAnim = requestAnimationFrame(step);
}

/* point-of-interest tooltip, positioned in the map box.
   Hover shows it; a click or tap pins it, and a second one on the same point closes it. */
let tipOpen = -1, tipPinned = false;
function togglePoiTip(i){
  if(tipOpen === i && tipPinned){ hidePoiTip(); return; }
  showPoiTip(i); tipPinned = true;
}
function showPoiTip(i){
  tipOpen = i;
  const S = SITES[mapSite], p = S.pois[i], tip = $("m-tip"), box = $("site-map");
  tip.innerHTML = `<b>${esc(p[lang])}</b><span class="mono">${esc(p.d)}</span><p>${esc(p["n_" + lang])}</p>`;
  tip.hidden = false;
  const sc = $("m-scroll");
  if(sc && sc.scrollWidth > sc.clientWidth + 2) sc.scrollLeft = Math.max(0, p.x / 1000 * sc.scrollWidth - sc.clientWidth / 2);
  const svg = $("site-svg").getBoundingClientRect(), bb = box.getBoundingClientRect();
  const x = svg.left - bb.left + p.x / 1000 * svg.width, y = svg.top - bb.top + p.y / 625 * svg.height;
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let left = Math.max(8, Math.min(bb.width - w - 8, x - w / 2)), top = y - h - 22;
  if(top < 8) top = y + 26;
  tip.style.left = left + "px"; tip.style.top = top + "px";
  document.querySelectorAll("#site-svg .m-poi").forEach(g => g.classList.toggle("hot", +g.dataset.poi === i));
  document.querySelectorAll("#site-pois [data-poi]").forEach(b => b.classList.toggle("hot", +b.dataset.poi === i));
}
function hidePoiTip(){
  tipOpen = -1; tipPinned = false;
  const t = $("m-tip"); if(t) t.hidden = true;
  document.querySelectorAll(".m-poi.hot, #site-pois .hot").forEach(g => g.classList.remove("hot"));
}

(function wireMaps(){
  if(!$("site-map")) return;
  $("site-tabs").addEventListener("click", e => {
    const b = e.target.closest("[data-site]"); if(!b) return;
    mapSite = +b.dataset.site; mapRoute = 0; stopDiver(); renderMaps(); playDiver();
  });
  $("site-tabs").addEventListener("keydown", e => {
    if(e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault(); mapSite = (mapSite + (e.key === "ArrowRight" ? 1 : -1) + SITES.length) % SITES.length; mapRoute = 0;
    stopDiver(); renderMaps(); $("site-tabs").querySelector(`[data-site="${mapSite}"]`).focus();
  });
  $("site-routes").addEventListener("click", e => { const b = e.target.closest("[data-route]"); if(b) setRoute(+b.dataset.route, true); });
  $("m-play").addEventListener("click", playDiver);
  $("site-svg").addEventListener("click", e => {
    const p = e.target.closest(".m-poi"); if(p){ togglePoiTip(+p.dataset.poi); return; }
    const r = e.target.closest(".m-route"); if(r){ setRoute(+r.dataset.route, true); return; }
    hidePoiTip();
  });
  $("site-svg").addEventListener("keydown", e => {
    const p = e.target.closest(".m-poi"); if(p && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); togglePoiTip(+p.dataset.poi); }
  });
  $("site-svg").addEventListener("pointerover", e => { const p = e.target.closest(".m-poi"); if(p && e.pointerType === "mouse" && !tipPinned) showPoiTip(+p.dataset.poi); });
  $("site-svg").addEventListener("pointerout", e => { const p = e.target.closest(".m-poi"); if(p && e.pointerType === "mouse" && !tipPinned && !p.contains(e.relatedTarget)) hidePoiTip(); });
  $("site-pois").addEventListener("click", e => { const b = e.target.closest("[data-poi]"); if(b) togglePoiTip(+b.dataset.poi); });
  document.addEventListener("click", e => { if(!e.target.closest("#site-map") && !e.target.closest("#site-pois")) hidePoiTip(); });
  addEventListener("resize", hidePoiTip);
  // swim the first route once when the map scrolls into view
  if("IntersectionObserver" in window){
    const io = new IntersectionObserver(es => es.forEach(en => {
      if(en.isIntersecting && !mapAutoplayed[mapSite]){ mapAutoplayed[mapSite] = 1; playDiver(); }
    }), {threshold:.45});
    io.observe($("site-map"));
  }
})();

applyLang();

/* ===== Backend (optional): live prices, booking requests, anonymous analytics ===== */
(function(){
  const C = window.SITE_CONFIG || {};
  if(!C.SUPABASE_URL || !C.SUPABASE_ANON_KEY) return;
  const FN = C.SUPABASE_URL + "/functions/v1/";
  const H = { "content-type":"application/json", apikey:C.SUPABASE_ANON_KEY, authorization:"Bearer "+C.SUPABASE_ANON_KEY };
  let sid = "";
  try{ sid = sessionStorage.getItem("sid") || ""; }catch(e){}
  if(!/^[a-zA-Z0-9]{16}$/.test(sid)){
    sid = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
    try{ sessionStorage.setItem("sid", sid); }catch(e){}
  }
  const device = matchMedia("(max-width:860px)").matches ? "mobile" : "desktop";
  function track(event, value){
    try{ fetch(FN+"track", {method:"POST", headers:H, keepalive:true,
      body:JSON.stringify({session:sid, event, value:value ? String(value).slice(0,40) : null, lang, device})}).catch(()=>{}); }catch(e){}
  }
  track("view");
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-path],[data-tab],[data-term],[data-pick],#go-wa,#hero-wa,#c-wa-a,#go-tg,#c-tg-a,#copy,[data-set]");
    if(!t) return;
    if(t.dataset.path) track("path", t.dataset.path);
    else if(t.dataset.tab) track("tab", t.dataset.tab);
    else if(t.dataset.term) track("term", t.dataset.term);
    else if(t.dataset.pick) track("pick", t.dataset.pick);
    else if(t.dataset.set) track("lang", t.dataset.set);
    else if(/wa/.test(t.id)) track("wa", t.id);
    else if(/tg/.test(t.id)) track("tg", t.id);
    else if(t.id==="copy") track("copy");
  });

  // live prices: the admin edits them in /admin; the built-in list stays as a fallback
  fetch(C.SUPABASE_URL + "/rest/v1/programs?select=id,grp,sort,price_usd,price_from,recommended,name_ru,name_en,desc_ru,desc_en&order=sort", {headers:H})
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(rows => {
      if(!Array.isArray(rows) || !rows.length) return;
      const byId = Object.fromEntries(rows.map(r => [r.id, r]));
      GROUPS.forEach(g => {
        g.items = g.items.filter(i => byId[i.id]);           // hidden in admin → hidden on site
        g.items.forEach(i => { const r = byId[i.id];
          i.price = r.price_usd; i.from = r.price_from; i.rec = r.recommended;
          i.ru = r.name_ru; i.en = r.name_en; i.d_ru = r.desc_ru || i.d_ru; i.d_en = r.desc_en || i.d_en; });
        rows.filter(r => r.grp===g.id && !ALL.some(a => a.id===r.id)).forEach(r => g.items.push({
          id:r.id, price:r.price_usd, from:r.price_from, rec:r.recommended, ru:r.name_ru, en:r.name_en,
          meta_ru:[], meta_en:[], d_ru:r.desc_ru, d_en:r.desc_en }));
      });
      ALL.length = 0; GROUPS.forEach(g => g.items.forEach(i => ALL.push({...i, group:g})));
      applyLang();
    }).catch(()=>{});

  // booking request stored on the server (needs captcha)
  if(!C.TURNSTILE_SITEKEY) return;
  $("lead-box").hidden = false;
  let captcha = "", widget = null;
  const s = document.createElement("script");
  s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; s.async = true;
  s.onload = () => { widget = turnstile.render("#captcha", { sitekey:C.TURNSTILE_SITEKEY, callback:t => captcha = t, "expired-callback":() => captcha = "" }); };
  document.head.appendChild(s);
  const say = (ru, en) => $("lead-status").textContent = lang==="ru" ? ru : en;
  $("send-lead").addEventListener("click", async () => {
    const name = $("f-name").value.trim(), contact = $("f-contact").value.trim();
    if(!name || contact.length < 3) return say("Укажи имя и куда ответить.", "Add your name and where to reply.");
    if(!captcha) return say("Подтверди, что ты не робот.", "Please complete the check above.");
    $("send-lead").disabled = true; say("Отправляю…", "Sending…");
    try{
      const r = await fetch(FN+"submit-lead", {method:"POST", headers:H, body:JSON.stringify({
        captcha, name, contact, program_id:$("f-prog").value, people:Number($("f-people").value)||1,
        date_from:$("f-from").value||null, date_to:$("f-to").value||null, hotel:$("f-hotel").value,
        wants_media:$("f-photo").checked, note:$("f-note").value, lang })});
      if(r.ok) say("Заявка у меня, скоро отвечу по твоему контакту.", "Got it, I'll reply to the contact you left soon.");
      else if(r.status===429) say("Слишком много заявок с этого адреса. Напиши в WhatsApp.", "Too many requests. Please use WhatsApp.");
      else say("Не получилось отправить. Напиши в WhatsApp.", "Couldn't send. Please use WhatsApp.");
    }catch(e){ say("Нет связи. Напиши в WhatsApp.", "No connection. Please use WhatsApp."); }
    $("send-lead").disabled = false; captcha = "";
    try{ turnstile.reset(widget); }catch(e){}
  });
})();
