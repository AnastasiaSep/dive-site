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
