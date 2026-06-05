"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { LaserFlowProps } from "./laser-flow.types";

// 吸取自 React Bits LaserFlow：自顶向下倾泻的体积光束 —— 一束高亮激光带 +
// 沿束流动的明暗脉冲 + 两侧游走的微流光（wisp）+ 受指针牵引倾斜的体积雾，
// 全程由单个全屏片元 shader（光束几何用极坐标 acos 反推 + fbm 噪声雾）实时渲染。
//
// 瑚琏化要点：
// 1. 去 three.js 依赖：原版用 THREE.WebGLRenderer + RawShaderMaterial，
//    这里改走 ogl（与 Aurora/Silk/Orb 同源），shader 主体逐字移植，仅去掉
//    three 内建 precision/attribute 声明，改用 ogl Triangle 全屏三角。
// 2. 颜色吃 token：默认 uColor 读 `--color-chart-1`（明暗自适应），替原版写死 #FF79C6。
// 3. RSC / StrictMode 安全：复用 useGlCanvas —— 懒 import("ogl")、每次挂载新建 canvas
//    （规避 loseContext 毒化）、RAF 单帧抛错不杀循环、离屏暂停、卸载兜底释放 context。
// 4. reduced-motion / 无 WebGL：自动降级为纵向 linear-gradient 光束静态兜底（DOM 同构）。
// 5. 原版的 DPR 自适应降级 / FPS 采样省去（交由 useGlCanvas 的 dpr≤2 上限 + 离屏暂停）。

// ---------------------------------------------------------------------------
// 全屏三角顶点 shader —— OGL Triangle 已在 clip-space 全覆盖视口。
// 片元里直接用 gl_FragCoord.xy，不依赖 vUv。
// ---------------------------------------------------------------------------
const VERT = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

// ---------------------------------------------------------------------------
// 激光片元 shader（移植自 react-bits LaserFlow 的 FRAG，three → ogl）：
//   ① 去掉 three 注入的 `precision highp float; attribute vec3 position;`
//      （ogl 顶点已声明 vec2 position；片元自带 precision）
//   ② 保留 derivatives 扩展的 #ifdef 守卫 —— WebGL1 无该扩展时回退 pixW
//   ③ 所有 uniform 名（uTime/iResolution/iMouse/uColor/…）与原版保持一致
//   ④ 输出 gl_FragColor（ogl 默认 WebGL1 路径）
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
#ifdef GL_ES
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
precision mediump int;

uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform float uWispDensity;
uniform float uTiltScale;
uniform float uFlowTime;
uniform float uFogTime;
uniform float uBeamXFrac;
uniform float uBeamYFrac;
uniform float uFlowSpeed;
uniform float uVLenFactor;
uniform float uHLenFactor;
uniform float uFogIntensity;
uniform float uFogScale;
uniform float uWSpeed;
uniform float uWIntensity;
uniform float uFlowStrength;
uniform float uDecay;
uniform float uFalloffStart;
uniform float uFogFallSpeed;
uniform vec3 uColor;
uniform float uFade;

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define EPS 1e-6
#define EDGE_SOFT (DT_LOCAL*4.0)
#define DT_LOCAL 0.0038
#define TAP_RADIUS 6
#define R_H 150.0
#define R_V 150.0
#define FLARE_HEIGHT 16.0
#define FLARE_AMOUNT 8.0
#define FLARE_EXP 2.0
#define TOP_FADE_START 0.1
#define TOP_FADE_EXP 1.0
#define FLOW_PERIOD 0.5
#define FLOW_SHARPNESS 1.5

#define W_BASE_X 1.5
#define W_LAYER_GAP 0.25
#define W_LANES 10
#define W_SIDE_DECAY 0.5
#define W_HALF 0.01
#define W_AA 0.15
#define W_CELL 20.0
#define W_SEG_MIN 0.01
#define W_SEG_MAX 0.55
#define W_CURVE_AMOUNT 15.0
#define W_CURVE_RANGE (FLARE_HEIGHT - 3.0)
#define W_BOTTOM_EXP 10.0

#define FOG_ON 1
#define FOG_CONTRAST 1.2
#define FOG_SPEED_U 0.1
#define FOG_SPEED_V -0.1
#define FOG_OCTAVES 5
#define FOG_BOTTOM_BIAS 0.8
#define FOG_TILT_TO_MOUSE 0.05
#define FOG_TILT_DEADZONE 0.01
#define FOG_TILT_MAX_X 0.35
#define FOG_TILT_SHAPE 1.5
#define FOG_BEAM_MIN 0.0
#define FOG_BEAM_MAX 0.75
#define FOG_MASK_GAMMA 0.5
#define FOG_EXPAND_SHAPE 12.2
#define FOG_EDGE_MIX 0.5

#define HFOG_EDGE_START 0.20
#define HFOG_EDGE_END 0.98
#define HFOG_EDGE_GAMMA 1.4
#define HFOG_Y_RADIUS 25.0
#define HFOG_Y_SOFT 60.0

#define EDGE_X0 0.22
#define EDGE_X1 0.995
#define EDGE_X_GAMMA 1.25
#define EDGE_LUMA_T0 0.0
#define EDGE_LUMA_T1 2.0
#define DITHER_STRENGTH 1.0

float g(float x){return x<=0.00031308?12.92*x:1.055*pow(x,1.0/2.4)-0.055;}
float bs(vec2 p,vec2 q,float powr){
    float d=distance(p,q),f=powr*uFalloffStart,r=(f*f)/(d*d+EPS);
    return powr*min(1.0,r);
}
float bsa(vec2 p,vec2 q,float powr,vec2 s){
    vec2 d=p-q; float dd=(d.x*d.x)/(s.x*s.x)+(d.y*d.y)/(s.y*s.y),f=powr*uFalloffStart,r=(f*f)/(dd+EPS);
    return powr*min(1.0,r);
}
float tri01(float x){float f=fract(x);return 1.0-abs(f*2.0-1.0);}
float tauWf(float t,float tmin,float tmax){float a=smoothstep(tmin,tmin+EDGE_SOFT,t),b=1.0-smoothstep(tmax-EDGE_SOFT,tmax,t);return max(0.0,a*b);}
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+34.123);return fract(p.x*p.y);}
float vnoise(vec2 p){
    vec2 i=floor(p),f=fract(p);
    float a=h21(i),b=h21(i+vec2(1,0)),c=h21(i+vec2(0,1)),d=h21(i+vec2(1,1));
    vec2 u=f*f*(3.0-2.0*f);
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm2(vec2 p){
    float v=0.0,amp=0.6; mat2 m=mat2(0.86,0.5,-0.5,0.86);
    for(int i=0;i<FOG_OCTAVES;++i){v+=amp*vnoise(p); p=m*p*2.03+17.1; amp*=0.52;}
    return v;
}
float rGate(float x,float l){float a=smoothstep(0.0,W_AA,x),b=1.0-smoothstep(l,l+W_AA,x);return max(0.0,a*b);}
float flareY(float y){float t=clamp(1.0-(clamp(y,0.0,FLARE_HEIGHT)/max(FLARE_HEIGHT,EPS)),0.0,1.0);return pow(t,FLARE_EXP);}

float vWisps(vec2 uv,float topF){
    float y=uv.y,yf=(y+uFlowTime*uWSpeed)/W_CELL;
    float dRaw=clamp(uWispDensity,0.0,2.0),d=dRaw<=0.0?1.0:dRaw;
    float lanesF=floor(float(W_LANES)*min(d,1.0)+0.5);
    int lanes=int(max(1.0,lanesF));
    float sp=min(d,1.0),ep=max(d-1.0,0.0);
    float fm=flareY(max(y,0.0)),rm=clamp(1.0-(y/max(W_CURVE_RANGE,EPS)),0.0,1.0),cm=fm*rm;
    const float G=0.05; float xS=1.0+(FLARE_AMOUNT*W_CURVE_AMOUNT*G)*cm;
    float sPix=clamp(y/R_V,0.0,1.0),bGain=pow(1.0-sPix,W_BOTTOM_EXP),sum=0.0;
    for(int s=0;s<2;++s){
        float sgn=s==0?-1.0:1.0;
        for(int i=0;i<W_LANES;++i){
            if(i>=lanes) break;
            float off=W_BASE_X+float(i)*W_LAYER_GAP,xc=sgn*(off*xS);
            float dx=abs(uv.x-xc),lat=1.0-smoothstep(W_HALF,W_HALF+W_AA,dx),amp=exp(-off*W_SIDE_DECAY);
            float seed=h21(vec2(off,sgn*17.0)),yf2=yf+seed*7.0,ci=floor(yf2),fy=fract(yf2);
            float seg=mix(W_SEG_MIN,W_SEG_MAX,h21(vec2(ci,off*2.3)));
            float spR=h21(vec2(ci,off+sgn*31.0)),seg1=rGate(fy,seg)*step(spR,sp);
            if(ep>0.0){float spR2=h21(vec2(ci*3.1+7.0,off*5.3+sgn*13.0)); float f2=fract(fy+0.5); seg1+=rGate(f2,seg*0.9)*step(spR2,ep);}
            sum+=amp*lat*seg1;
        }
    }
    float span=smoothstep(-3.0,0.0,y)*(1.0-smoothstep(R_V-6.0,R_V,y));
    return uWIntensity*sum*topF*bGain*span;
}

void mainImage(out vec4 fc,in vec2 frag){
    vec2 C=iResolution.xy*.5; float invW=1.0/max(C.x,1.0);
    vec2 sc=(512.0/iResolution.xy)*.4;
    vec2 uv=(frag-C)*sc,off=vec2(uBeamXFrac*iResolution.x*sc.x,uBeamYFrac*iResolution.y*sc.y);
    vec2 uvc = uv - off;
    float a=0.0,b=0.0;
    float basePhase=1.5*PI+uDecay*.5; float tauMin=basePhase-uDecay; float tauMax=basePhase;
    float cx=clamp(uvc.x/(R_H*uHLenFactor),-1.0,1.0),tH=clamp(TWO_PI-acos(cx),tauMin,tauMax);
    for(int k=-TAP_RADIUS;k<=TAP_RADIUS;++k){
        float tu=tH+float(k)*DT_LOCAL,wt=tauWf(tu,tauMin,tauMax); if(wt<=0.0) continue;
        float spd=max(abs(sin(tu)),0.02),u=clamp((basePhase-tu)/max(uDecay,EPS),0.0,1.0),env=pow(1.0-abs(u*2.0-1.0),0.8);
        vec2 p=vec2((R_H*uHLenFactor)*cos(tu),0.0);
        a+=wt*bs(uvc,p,env*spd);
    }
    float yPix=uvc.y,cy=clamp(-yPix/(R_V*uVLenFactor),-1.0,1.0),tV=clamp(TWO_PI-acos(cy),tauMin,tauMax);
    for(int k=-TAP_RADIUS;k<=TAP_RADIUS;++k){
        float tu=tV+float(k)*DT_LOCAL,wt=tauWf(tu,tauMin,tauMax); if(wt<=0.0) continue;
        float yb=(-R_V)*cos(tu),s=clamp(yb/R_V,0.0,1.0),spd=max(abs(sin(tu)),0.02);
        float env=pow(1.0-s,0.6)*spd;
        float cap=1.0-smoothstep(TOP_FADE_START,1.0,s); cap=pow(cap,TOP_FADE_EXP); env*=cap;
        float ph=s/max(FLOW_PERIOD,EPS)+uFlowTime*uFlowSpeed;
        float fl=pow(tri01(ph),FLOW_SHARPNESS);
        env*=mix(1.0-uFlowStrength,1.0,fl);
        float yp=(-R_V*uVLenFactor)*cos(tu),m=pow(smoothstep(FLARE_HEIGHT,0.0,yp),FLARE_EXP),wx=1.0+FLARE_AMOUNT*m;
        vec2 sig=vec2(wx,1.0),p=vec2(0.0,yp);
        float mask=step(0.0,yp);
        b+=wt*bsa(uvc,p,mask*env,sig);
    }
    float sPix=clamp(yPix/R_V,0.0,1.0),topA=pow(1.0-smoothstep(TOP_FADE_START,1.0,sPix),TOP_FADE_EXP);
    float L=a+b*topA;
    float w=vWisps(vec2(uvc.x,yPix),topA);
    float fog=0.0;
#if FOG_ON
    vec2 fuv=uvc*uFogScale;
    float mAct=step(1.0,length(iMouse.xy)),nx=((iMouse.x-C.x)*invW)*mAct;
    float ax = abs(nx);
    float stMag = mix(ax, pow(ax, FOG_TILT_SHAPE), 0.35);
    float st = sign(nx) * stMag * uTiltScale;
    st = clamp(st, -FOG_TILT_MAX_X, FOG_TILT_MAX_X);
    vec2 dir=normalize(vec2(st,1.0));
    fuv+=uFogTime*uFogFallSpeed*dir;
    vec2 prp=vec2(-dir.y,dir.x);
    fuv+=prp*(0.08*sin(dot(uvc,prp)*0.08+uFogTime*0.9));
    float n=fbm2(fuv+vec2(fbm2(fuv+vec2(7.3,2.1)),fbm2(fuv+vec2(-3.7,5.9)))*0.6);
    n=pow(clamp(n,0.0,1.0),FOG_CONTRAST);
    float pixW = 1.0 / max(iResolution.y, 1.0);
#ifdef GL_OES_standard_derivatives
    float wL = max(fwidth(L), pixW);
#else
    float wL = pixW;
#endif
    float m0=pow(smoothstep(FOG_BEAM_MIN - wL, FOG_BEAM_MAX + wL, L),FOG_MASK_GAMMA);
    float bm=1.0-pow(1.0-m0,FOG_EXPAND_SHAPE); bm=mix(bm*m0,bm,FOG_EDGE_MIX);
    float yP=1.0-smoothstep(HFOG_Y_RADIUS,HFOG_Y_RADIUS+HFOG_Y_SOFT,abs(yPix));
    float nxF=abs((frag.x-C.x)*invW),hE=1.0-smoothstep(HFOG_EDGE_START,HFOG_EDGE_END,nxF); hE=pow(clamp(hE,0.0,1.0),HFOG_EDGE_GAMMA);
    float hW=mix(1.0,hE,clamp(yP,0.0,1.0));
    float bBias=mix(1.0,1.0-sPix,FOG_BOTTOM_BIAS);
    float browserFogIntensity = uFogIntensity;
    browserFogIntensity *= 1.8;
    float radialFade = 1.0 - smoothstep(0.0, 0.7, length(uvc) / 120.0);
    float safariFog = n * browserFogIntensity * bBias * bm * hW * radialFade;
    fog = safariFog;
#endif
    float LF=L+fog;
    float dith=(h21(frag)-0.5)*(DITHER_STRENGTH/255.0);
    float tone=g(LF+w);
    vec3 col=tone*uColor+dith;
    float alpha=clamp(g(L+w*0.6)+dith*0.6,0.0,1.0);
    float nxE=abs((frag.x-C.x)*invW),xF=pow(clamp(1.0-smoothstep(EDGE_X0,EDGE_X1,nxE),0.0,1.0),EDGE_X_GAMMA);
    float scene=LF+max(0.0,w)*0.5,hi=smoothstep(EDGE_LUMA_T0,EDGE_LUMA_T1,scene);
    float eM=mix(xF,1.0,hi);
    col*=eM; alpha*=eM;
    col*=uFade; alpha*=uFade;
    fc=vec4(col,alpha);
}

void main(){
  vec4 fc;
  mainImage(fc, gl_FragCoord.xy);
  gl_FragColor = fc;
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（0–1），离屏 2D canvas 解析任意 CSS 颜色（hex/oklch/rgb/…）。
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [1, 0.47, 0.78]; // 兜底：接近原版 #FF79C6
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [1, 0.47, 0.78];
  }
}

// 从已挂载的容器元素计算样式中读取 chart token（当前主题下解析）。
function resolveChartToken(el: HTMLElement): [number, number, number] {
  const raw = getComputedStyle(el).getPropertyValue("--color-chart-1").trim();
  if (!raw) return [1, 0.47, 0.78];
  return cssColorToRgb01(raw);
}

/**
 * LaserFlow — 自顶向下的体积激光束 WebGL 背景。
 *
 * 移植自 react-bits LaserFlow 原版 GLSL shader（极坐标光束几何 + fbm 噪声雾 +
 * 行进微流光），three.js → ogl 去依赖。瑚琏化：默认主色吃 `--color-chart-1` token；
 * 鼠标牵引雾团倾斜；reduced-motion / 无 WebGL 自动降级为纵向 linear-gradient 兜底。
 *
 * 用法：放在 `relative overflow-hidden` 容器里（建议深色底），组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-96 overflow-hidden bg-neutral-950">
 *   <LaserFlow />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function LaserFlow({
  color,
  horizontalBeamOffset = 0.0,
  verticalBeamOffset = 0.0,
  flowSpeed = 0.35,
  verticalSizing = 2.0,
  horizontalSizing = 0.5,
  fogIntensity = 0.45,
  fogScale = 0.3,
  fogFallSpeed = 0.6,
  wispDensity = 1,
  wispSpeed = 15.0,
  wispIntensity = 5.0,
  flowStrength = 0.25,
  decay = 1.1,
  falloffStart = 1.2,
  mouseTiltStrength = 0.01,
  className,
  fallback,
}: LaserFlowProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color, Vec3, Vec4 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({
        canvas,
        alpha: true,
        antialias: false,
        depth: false,
        dpr,
      });
      const gl = renderer.gl;

      // 解析主色：显式 color prop 优先；否则读容器计算样式里的 chart-1 token
      const host = (canvas.parentElement as HTMLElement | null) ?? canvas;
      const [r, gg, bb] = color
        ? cssColorToRgb01(color)
        : resolveChartToken(host);

      // 鼠标牵引：指针在容器内的位置（设备像素，y 翻转，与原版 iMouse 约定一致）。
      const mouseTarget = { x: 0, y: 0 };
      const mouseSmooth = { x: 0, y: 0 };
      const onMove = (ev: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = (ev.clientX - rect.left) * dpr;
        const y = (ev.clientY - rect.top) * dpr;
        mouseTarget.x = x;
        mouseTarget.y = rect.height * dpr - y;
      };
      const onLeave = () => {
        mouseTarget.x = 0;
        mouseTarget.y = 0;
      };
      canvas.addEventListener("pointermove", onMove, { passive: true });
      canvas.addEventListener("pointerenter", onMove, { passive: true });
      canvas.addEventListener("pointerleave", onLeave, { passive: true });

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Vec3(1, 1, 1) },
          iMouse: { value: new Vec4(0, 0, 0, 0) },
          uWispDensity: { value: wispDensity },
          uTiltScale: { value: mouseTiltStrength },
          uFlowTime: { value: 0 },
          uFogTime: { value: 0 },
          uBeamXFrac: { value: horizontalBeamOffset },
          uBeamYFrac: { value: verticalBeamOffset },
          uFlowSpeed: { value: flowSpeed },
          uVLenFactor: { value: verticalSizing },
          uHLenFactor: { value: horizontalSizing },
          uFogIntensity: { value: fogIntensity },
          uFogScale: { value: fogScale },
          uWSpeed: { value: wispSpeed },
          uWIntensity: { value: wispIntensity },
          uFlowStrength: { value: flowStrength },
          uDecay: { value: decay },
          uFalloffStart: { value: falloffStart },
          uFogFallSpeed: { value: fogFallSpeed },
          uColor: { value: new Color(r, gg, bb) },
          uFade: { value: 0 },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        const cw = w || 1;
        const ch = h || 1;
        renderer.setSize(cw, ch);
        program.uniforms.iResolution!.value.set(cw * dpr, ch * dpr, dpr);
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      let prevMs = 0;
      let fade = 0;
      return {
        render(t: number) {
          const sec = t * 0.001;
          const dt = prevMs ? Math.min(0.033, Math.max(0.001, (t - prevMs) * 0.001)) : 0.016;
          prevMs = t;

          program.uniforms.iTime!.value = sec;
          program.uniforms.uFlowTime!.value += dt;
          program.uniforms.uFogTime!.value += dt;

          // 入场淡入（约 1s）
          if (fade < 1) {
            fade = Math.min(1, fade + dt);
            program.uniforms.uFade!.value = fade;
          }

          // 指数平滑鼠标牵引
          const alpha = 1 - Math.exp(-dt / 0.05);
          mouseSmooth.x += (mouseTarget.x - mouseSmooth.x) * alpha;
          mouseSmooth.y += (mouseTarget.y - mouseSmooth.y) * alpha;
          program.uniforms.iMouse!.value.set(mouseSmooth.x, mouseSmooth.y, 0, 0);

          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          canvas.removeEventListener("pointermove", onMove);
          canvas.removeEventListener("pointerenter", onMove);
          canvas.removeEventListener("pointerleave", onLeave);
          program.remove?.();
        },
      };
    },
    [
      color,
      horizontalBeamOffset,
      verticalBeamOffset,
      flowSpeed,
      verticalSizing,
      horizontalSizing,
      fogIntensity,
      fogScale,
      fogFallSpeed,
      wispDensity,
      wispSpeed,
      wispIntensity,
      flowStrength,
      decay,
      falloffStart,
      mouseTiltStrength,
    ],
  );

  // -------------------------------------------------------------------------
  // reduced-motion / 无 WebGL：纵向 linear-gradient 光束静态兜底（吃 chart token）。
  // -------------------------------------------------------------------------
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:linear-gradient(to_bottom,var(--color-chart-1)_0%,transparent_70%)]",
          "[mask-image:radial-gradient(40%_100%_at_50%_0%,black,transparent)]",
          "opacity-70",
          className,
        )}
        aria-hidden
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none absolute inset-0 z-0 block h-full w-full",
        className,
      )}
      aria-hidden
    />
  );
}
