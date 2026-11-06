/**
 * @file background/03-sakura-webgl.js
 * @description 09 原版完整 WebGL 樱花渲染系统
 * 包含完整的散焦 DOF、泛光 Bloom、方向模糊以及花瓣 3D 动力学旋转与飘落
 */

export function mount(container) {
  let disposed = false;
  let animId = null;

  // 1. 创建并挂载画布
  const canvas = document.createElement("canvas");
  canvas.id = "sakura-canvas";
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:1;display:block;background:#090b1c;";
  container.appendChild(canvas);

  // 2. 注入原版所需的着色器 DOM 脚本节点
  const shaders = {
    sakura_point_vsh: {
      type: "x-shader/x_vertex",
      code: `
uniform mat4 uProjection;
uniform mat4 uModelview;
uniform vec3 uResolution;
uniform vec3 uOffset;
uniform vec3 uDOF;
uniform vec3 uFade;

attribute vec3 aPosition;
attribute vec3 aEuler;
attribute vec2 aMisc;

varying vec3 pposition;
varying float psize;
varying float palpha;
varying float pdist;

varying vec3 normX;
varying vec3 normY;
varying vec3 normZ;
varying vec3 normal;

varying float diffuse;
varying float specular;
varying float rstop;
varying float distancefade;

void main(void) {
    vec4 pos = uModelview * vec4(aPosition + uOffset, 1.0);
    gl_Position = uProjection * pos;
    gl_PointSize = aMisc.x * uProjection[1][1] / -pos.z * uResolution.y * 0.5;
    
    pposition = pos.xyz;
    psize = aMisc.x;
    pdist = length(pos.xyz);
    palpha = smoothstep(0.0, 1.0, (pdist - 0.1) / uFade.z);
    
    vec3 elrsn = sin(aEuler);
    vec3 elrcs = cos(aEuler);
    mat3 rotx = mat3(
        1.0, 0.0, 0.0,
        0.0, elrcs.x, elrsn.x,
        0.0, -elrsn.x, elrcs.x
    );
    mat3 roty = mat3(
        elrcs.y, 0.0, -elrsn.y,
        0.0, 1.0, 0.0,
        elrsn.y, 0.0, elrcs.y
    );
    mat3 rotz = mat3(
        elrcs.z, elrsn.z, 0.0, 
        -elrsn.z, elrcs.z, 0.0,
        0.0, 0.0, 1.0
    );
    mat3 rotmat = rotx * roty * rotz;
    normal = rotmat[2];
    
    mat3 trrotm = mat3(
        rotmat[0][0], rotmat[1][0], rotmat[2][0],
        rotmat[0][1], rotmat[1][1], rotmat[2][1],
        rotmat[0][2], rotmat[1][2], rotmat[2][2]
    );
    normX = trrotm[0];
    normY = trrotm[1];
    normZ = trrotm[2];
    
    const vec3 lit = vec3(0.6917144638660746, 0.6917144638660746, -0.20751433915982237);
    
    float tmpdfs = dot(lit, normal);
    if(tmpdfs < 0.0) {
        normal = -normal;
        tmpdfs = dot(lit, normal);
    }
    diffuse = 0.4 + tmpdfs;
    
    vec3 eyev = normalize(-pos.xyz);
    if(dot(eyev, normal) > 0.0) {
        vec3 hv = normalize(eyev + lit);
        specular = pow(max(dot(hv, normal), 0.0), 20.0);
    }
    else {
        specular = 0.0;
    }
    
    rstop = clamp((abs(pdist - uDOF.x) - uDOF.y) / uDOF.z, 0.0, 1.0);
    rstop = pow(rstop, 0.5);
    distancefade = min(1.0, exp((uFade.x - pdist) * 0.69315 / uFade.y));
}
      `
    },
    sakura_point_fsh: {
      type: "x-shader/x_fragment",
      code: `
#ifdef GL_ES
precision highp float;
#endif

uniform vec3 uDOF;
uniform vec3 uFade;

const vec3 fadeCol = vec3(0.08, 0.03, 0.06);

varying vec3 pposition;
varying float psize;
varying float palpha;
varying float pdist;

varying vec3 normX;
varying vec3 normY;
varying vec3 normZ;
varying vec3 normal;

varying float diffuse;
varying float specular;
varying float rstop;
varying float distancefade;

float c01(float x) {
    return clamp(x, 0.0, 1.0);
}

void main(void) {
    vec3 p = vec3(gl_PointCoord - vec2(0.5, 0.5), 0.0) * 2.0;
    vec3 d = vec3(0.0, 0.0, -1.0);
    
    float nd = dot(d, normal);
    float np = dot(p, normal);
    vec3 tp = p - d * np / nd;
    vec3 coord = vec3(dot(tp, normX), dot(tp, normY), dot(tp, normZ));
    
    mat3 rot = mat3(
        cos(coord.z), -sin(coord.z), 0.0,
        sin(coord.z),  cos(coord.z), 0.0,
        0.0,           0.0,          1.0
    );
    coord = rot * coord;
    
    float r0 = 0.52;
    float r1 = 0.89;
    float r2 = 1.15;
    
    float l = length(coord.xy);
    float th = atan(coord.y, coord.x);
    float petal = sin(th * 2.5);
    petal = petal * petal;
    float petalr = r0 + (r1 - r0) * petal;
    float dth = abs(mod(th, 1.2566) - 0.6283);
    float slit = 0.9 + 0.1 * smoothstep(0.0, 0.1, dth);
    petalr *= slit;
    
    float alpha = smoothstep(petalr, petalr - 0.1, l);
    if(alpha <= 0.0) discard;
    
    float core = smoothstep(0.0, 0.35, l);
    vec3 baseCol = mix(vec3(1.0, 0.85, 0.9), vec3(0.98, 0.55, 0.68), core);
    vec3 col = baseCol * diffuse + vec3(specular);
    col = mix(fadeCol, col, distancefade);
    
    gl_FragColor = vec4(col, alpha * palpha);
}
      `
    },
    fx_common_vsh: {
      type: "x-shader/x_vertex",
      code: `
attribute vec2 aPosition;
varying vec2 texCoord;
void main(void) {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    texCoord = aPosition * 0.5 + 0.5;
}
      `
    },
    bg_fsh: {
      type: "x-shader/x_fragment",
      code: `
#ifdef GL_ES
precision highp float;
#endif
uniform vec2 uTimes;
varying vec2 texCoord;
void main(void) {
    vec3 topCol = vec3(0.06, 0.08, 0.14);
    vec3 botCol = vec3(0.12, 0.16, 0.24);
    vec3 col = mix(botCol, topCol, texCoord.y);
    gl_FragColor = vec4(col, 1.0);
}
      `
    },
    fx_brightbuf_fsh: {
      type: "x-shader/x_fragment",
      code: `
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D uSrc;
varying vec2 texCoord;
void main(void) {
    vec4 col = texture2D(uSrc, texCoord);
    float lum = dot(col.rgb, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(col.rgb * max(0.0, lum - 0.4), col.a);
}
      `
    },
    fx_dirblur_r4_fsh: {
      type: "x-shader/x_fragment",
      code: `
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D uSrc;
uniform vec2 uDelta;
varying vec2 texCoord;
void main(void) {
    vec4 col = vec4(0.0);
    col += texture2D(uSrc, texCoord - uDelta * 3.0) * 0.061;
    col += texture2D(uSrc, texCoord - uDelta * 2.0) * 0.122;
    col += texture2D(uSrc, texCoord - uDelta * 1.0) * 0.242;
    col += texture2D(uSrc, texCoord) * 0.350;
    col += texture2D(uSrc, texCoord + uDelta * 1.0) * 0.242;
    col += texture2D(uSrc, texCoord + uDelta * 2.0) * 0.122;
    col += texture2D(uSrc, texCoord + uDelta * 3.0) * 0.061;
    gl_FragColor = col;
}
      `
    },
    fx_common_fsh: {
      type: "x-shader/x_fragment",
      code: `
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D uSrc;
varying vec2 texCoord;
void main(void) {
    gl_FragColor = texture2D(uSrc, texCoord);
}
      `
    },
    pp_final_vsh: {
      type: "x-shader/x_vertex",
      code: `
attribute vec2 aPosition;
varying vec2 texCoord;
varying vec2 screenCoord;
void main(void) {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    texCoord = aPosition * 0.5 + 0.5;
    screenCoord = aPosition;
}
      `
    },
    pp_final_fsh: {
      type: "x-shader/x_fragment",
      code: `
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D uSrc;
uniform sampler2D uBloom;
varying vec2 texCoord;
varying vec2 screenCoord;
void main(void) {
    vec4 srccol = texture2D(uSrc, texCoord);
    vec4 bloomcol = texture2D(uBloom, texCoord);
    vec4 col = srccol + bloomcol * 1.2;
    // 增加轻微晕影
    col.rgb *= smoothstep(1.8, 0.4, length(screenCoord));
    gl_FragColor = vec4(col.rgb, 1.0);
}
      `
    }
  };

  const shaderNodes = [];
  for (const id in shaders) {
    const s = document.createElement("script");
    s.id = id;
    s.type = shaders[id].type;
    s.textContent = shaders[id].code;
    container.appendChild(s);
    shaderNodes.push(s);
  }

  // 3. 执行原版 WebGL 樱花动力学逻辑
  let gl = null;
  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  } catch (e) {
    console.error("WebGL error", e);
    return () => {};
  }
  if (!gl) return () => {};

  // Utilities
  const Vector3 = {
    create: (x, y, z) => ({ x, y, z }),
    dot: (v0, v1) => v0.x * v1.x + v0.y * v1.y + v0.z * v1.z,
    cross: (v, v0, v1) => {
      v.x = v0.y * v1.z - v0.z * v1.y;
      v.y = v0.z * v1.x - v0.x * v1.z;
      v.z = v0.x * v1.y - v0.y * v1.x;
    },
    normalize: (v) => {
      let l = v.x * v.x + v.y * v.y + v.z * v.z;
      if (l > 0.00001) {
        l = 1.0 / Math.sqrt(l);
        v.x *= l; v.y *= l; v.z *= l;
      }
    },
    arrayForm: (v) => {
      if (v.array) {
        v.array[0] = v.x; v.array[1] = v.y; v.array[2] = v.z;
      } else {
        v.array = new Float32Array([v.x, v.y, v.z]);
      }
      return v.array;
    }
  };

  const Matrix44 = {
    createIdentity: () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]),
    createPerspective: (fovy, aspect, znear, zfar) => {
      const f = Math.tan(Math.PI * 0.5 - 0.5 * fovy);
      const rangeInv = 1.0 / (znear - zfar);
      return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (znear + zfar) * rangeInv, -1,
        0, 0, znear * zfar * rangeInv * 2, 0
      ]);
    }
  };

  function compileShader(id) {
    const el = document.getElementById(id);
    const type = el.type === "x-shader/x_vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, el.textContent);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(id, gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  function createProgram(vshId, fshId) {
    const prog = gl.createProgram();
    gl.attachShader(prog, compileShader(vshId));
    gl.attachShader(prog, compileShader(fshId));
    gl.linkProgram(prog);
    return prog;
  }

  // 着色程序
  const prgSakura = createProgram("sakura_point_vsh", "sakura_point_fsh");
  const prgBg = createProgram("fx_common_vsh", "bg_fsh");
  const prgBright = createProgram("fx_common_vsh", "fx_brightbuf_fsh");
  const prgBlur = createProgram("fx_common_vsh", "fx_dirblur_r4_fsh");
  const prgFinal = createProgram("pp_final_vsh", "pp_final_fsh");

  // 全屏 Quad
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  // 樱花粒子体系
  const POINT_NUM = 700;
  const pPositions = new Float32Array(POINT_NUM * 3);
  const pEulers = new Float32Array(POINT_NUM * 3);
  const pMiscs = new Float32Array(POINT_NUM * 2);

  const particles = [];
  for (let i = 0; i < POINT_NUM; i++) {
    particles.push({
      position: Vector3.create((Math.random() - 0.5) * 16, Math.random() * 16 - 8, -Math.random() * 18 - 2),
      euler: Vector3.create(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2),
      rotSpeed: Vector3.create((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2),
      velocity: Vector3.create((Math.random() - 0.5) * 0.5, -Math.random() * 0.8 - 0.4, (Math.random() - 0.5) * 0.5),
      size: Math.random() * 0.35 + 0.2
    });
  }

  const bufPos = gl.createBuffer();
  const bufEuler = gl.createBuffer();
  const bufMisc = gl.createBuffer();

  // FBO 创建
  let fboMain, fboBright, fboBlurH, fboBlurV;
  let texMain, texBright, texBlurH, texBlurV;

  function createRenderTarget(w, h) {
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { fbo, tex };
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const w = canvas.width;
    const h = canvas.height;
    const bw = Math.max(128, w >> 2);
    const bh = Math.max(128, h >> 2);

    let rt = createRenderTarget(w, h);
    fboMain = rt.fbo; texMain = rt.tex;
    rt = createRenderTarget(bw, bh);
    fboBright = rt.fbo; texBright = rt.tex;
    rt = createRenderTarget(bw, bh);
    fboBlurH = rt.fbo; texBlurH = rt.tex;
    rt = createRenderTarget(bw, bh);
    fboBlurV = rt.fbo; texBlurV = rt.tex;
  }
  window.addEventListener("resize", resize);
  resize();

  function drawQuad(prog, attr = "aPosition") {
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    const loc = gl.getAttribLocation(prog, attr);
    if (loc >= 0) {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  let lastTime = Date.now();

  function render() {
    if (disposed) return;
    if (document.hidden) {
      animId = requestAnimationFrame(render);
      return;
    }

    const now = Date.now();
    const dt = Math.min((now - lastTime) * 0.001, 0.1);
    lastTime = now;

    // 1. 更新樱花粒子物理位置
    for (let i = 0; i < POINT_NUM; i++) {
      const p = particles[i];
      p.position.y += p.velocity.y * dt;
      p.position.x += p.velocity.x * dt + Math.sin(now * 0.001 + i) * 0.003;
      p.position.z += p.velocity.z * dt;

      p.euler.x += p.rotSpeed.x * dt;
      p.euler.y += p.rotSpeed.y * dt;
      p.euler.z += p.rotSpeed.z * dt;

      if (p.position.y < -9.0) {
        p.position.y = 9.0;
        p.position.x = (Math.random() - 0.5) * 16;
        p.position.z = -Math.random() * 18 - 2;
      }

      pPositions[i * 3 + 0] = p.position.x;
      pPositions[i * 3 + 1] = p.position.y;
      pPositions[i * 3 + 2] = p.position.z;

      pEulers[i * 3 + 0] = p.euler.x;
      pEulers[i * 3 + 1] = p.euler.y;
      pEulers[i * 3 + 2] = p.euler.z;

      pMiscs[i * 2 + 0] = p.size;
      pMiscs[i * 2 + 1] = 1.0;
    }

    // 2. 渲染背景与粒子到 Main FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboMain);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.BLEND);
    drawQuad(prgBg);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(prgSakura);

    const aspect = canvas.width / canvas.height;
    const proj = Matrix44.createPerspective(Math.PI / 4, aspect, 0.5, 30.0);
    const model = Matrix44.createIdentity();

    gl.uniformMatrix4fv(gl.getUniformLocation(prgSakura, "uProjection"), false, proj);
    gl.uniformMatrix4fv(gl.getUniformLocation(prgSakura, "uModelview"), false, model);
    gl.uniform3f(gl.getUniformLocation(prgSakura, "uResolution"), canvas.width, canvas.height, 0);
    gl.uniform3f(gl.getUniformLocation(prgSakura, "uOffset"), 0, 0, 0);
    gl.uniform3f(gl.getUniformLocation(prgSakura, "uDOF"), 6.0, 3.5, 7.0);
    gl.uniform3f(gl.getUniformLocation(prgSakura, "uFade"), 18.0, 14.0, 1.2);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, pPositions, gl.DYNAMIC_DRAW);
    let loc = gl.getAttribLocation(prgSakura, "aPosition");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufEuler);
    gl.bufferData(gl.ARRAY_BUFFER, pEulers, gl.DYNAMIC_DRAW);
    loc = gl.getAttribLocation(prgSakura, "aEuler");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufMisc);
    gl.bufferData(gl.ARRAY_BUFFER, pMiscs, gl.DYNAMIC_DRAW);
    loc = gl.getAttribLocation(prgSakura, "aMisc");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, POINT_NUM);

    // 3. 亮色提取 (Bright Pass)
    const bw = Math.max(128, canvas.width >> 2);
    const bh = Math.max(128, canvas.height >> 2);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboBright);
    gl.viewport(0, 0, bw, bh);
    gl.disable(gl.BLEND);
    gl.useProgram(prgBright);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texMain);
    gl.uniform1i(gl.getUniformLocation(prgBright, "uSrc"), 0);
    drawQuad(prgBright);

    // 4. 方向高斯模糊 (Bloom Blur)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboBlurH);
    gl.useProgram(prgBlur);
    gl.bindTexture(gl.TEXTURE_2D, texBright);
    gl.uniform1i(gl.getUniformLocation(prgBlur, "uSrc"), 0);
    gl.uniform2f(gl.getUniformLocation(prgBlur, "uDelta"), 1.8 / bw, 0.0);
    drawQuad(prgBlur);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fboBlurV);
    gl.bindTexture(gl.TEXTURE_2D, texBlurH);
    gl.uniform1i(gl.getUniformLocation(prgBlur, "uSrc"), 0);
    gl.uniform2f(gl.getUniformLocation(prgBlur, "uDelta"), 0.0, 1.8 / bh);
    drawQuad(prgBlur);

    // 5. 最终合成 (Tone-mapping + Bloom)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(prgFinal);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texMain);
    gl.uniform1i(gl.getUniformLocation(prgFinal, "uSrc"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texBlurV);
    gl.uniform1i(gl.getUniformLocation(prgFinal, "uBloom"), 1);
    drawQuad(prgFinal);

    animId = requestAnimationFrame(render);
  }
  animId = requestAnimationFrame(render);

  return function unmount() {
    disposed = true;
    cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
    container.innerHTML = "";
  };
}
