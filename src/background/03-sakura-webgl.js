/**
 * @file background/03-sakura-webgl.js
 * @description 09 原生 WebGL 景深漂浮樱花
 */

export function mount(container) {
  let disposed = false;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:1;display:block;background:#090b1c;";
  container.appendChild(canvas);

  let gl;
  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  } catch (e) {
    console.error("WebGL unsupported", e);
    return () => {};
  }
  if (!gl) return () => {};

  const vshSrc = `
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
  `;

  const fshSrc = `
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec3 uDOF;
    uniform vec3 uFade;

    const vec3 fadeCol = vec3(0.05, 0.08, 0.12);

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

    float getPointAlpha(vec2 p, float s) {
        vec2 pvec = p * 2.0 - 1.0;
        float pdist = length(pvec);
        if(pdist > 1.0) return 0.0;
        return (1.0 - smoothstep(1.0 - s, 1.0, pdist));
    }

    void main(void) {
        float palpha2 = getPointAlpha(gl_PointCoord, 0.15);
        if(palpha2 <= 0.0) discard;

        vec3 baseCol = vec3(1.0, 0.65, 0.78);
        vec3 col = baseCol * diffuse + vec3(specular);
        col = mix(fadeCol, col, distancefade);

        gl_FragColor = vec4(col, palpha * palpha2);
    }
  `;

  function compileShader(src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vsh = compileShader(vshSrc, gl.VERTEX_SHADER);
  const fsh = compileShader(fshSrc, gl.FRAGMENT_SHADER);
  if (!vsh || !fsh) return () => {};

  const prog = gl.createProgram();
  gl.attachShader(prog, vsh);
  gl.attachShader(prog, fsh);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // 几何数据
  const count = 350;
  const posArr = new Float32Array(count * 3);
  const eulerArr = new Float32Array(count * 3);
  const miscArr = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    posArr[i * 3 + 0] = (Math.random() - 0.5) * 16;
    posArr[i * 3 + 1] = (Math.random() - 0.5) * 16;
    posArr[i * 3 + 2] = -Math.random() * 14 - 1;

    eulerArr[i * 3 + 0] = Math.random() * Math.PI * 2;
    eulerArr[i * 3 + 1] = Math.random() * Math.PI * 2;
    eulerArr[i * 3 + 2] = Math.random() * Math.PI * 2;

    miscArr[i * 2 + 0] = Math.random() * 0.4 + 0.2; // 尺寸
    miscArr[i * 2 + 1] = Math.random();
  }

  function bindBuffer(data, attr, size) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, attr);
    if (loc >= 0) {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    }
  }

  bindBuffer(posArr, "aPosition", 3);
  bindBuffer(eulerArr, "aEuler", 3);
  bindBuffer(miscArr, "aMisc", 2);

  const uProjLoc = gl.getUniformLocation(prog, "uProjection");
  const uModelLoc = gl.getUniformLocation(prog, "uModelview");
  const uResLoc = gl.getUniformLocation(prog, "uResolution");
  const uOffsetLoc = gl.getUniformLocation(prog, "uOffset");
  const uDOFLoc = gl.getUniformLocation(prog, "uDOF");
  const uFadeLoc = gl.getUniformLocation(prog, "uFade");

  function makePerspective(fovy, aspect, znear, zfar) {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fovy);
    const rangeInv = 1.0 / (znear - zfar);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (znear + zfar) * rangeInv, -1,
      0, 0, znear * zfar * rangeInv * 2, 0
    ]);
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener("resize", resize);
  resize();

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let animId;
  const start = Date.now();

  function render() {
    if (disposed) return;
    const t = (Date.now() - start) * 0.001;

    gl.clearColor(0.04, 0.06, 0.09, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = canvas.width / canvas.height;
    const proj = makePerspective(Math.PI / 4, aspect, 0.5, 30.0);
    const model = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);

    gl.uniformMatrix4fv(uProjLoc, false, proj);
    gl.uniformMatrix4fv(uModelLoc, false, model);
    gl.uniform3f(uResLoc, canvas.width, canvas.height, 0);
    gl.uniform3f(uOffsetLoc, Math.sin(t * 0.5) * 0.8, -t * 0.6 % 16, 0);
    gl.uniform3f(uDOFLoc, 6.0, 3.0, 8.0);
    gl.uniform3f(uFadeLoc, 15.0, 12.0, 1.0);

    gl.drawArrays(gl.POINTS, 0, count);

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
