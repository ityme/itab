/**
 * @file background/01-symbols-network.js
 * @description 04 符文矩阵 + 01 粒子引力网络
 * 
 * 视觉增强：微弱星座背景 (Faint Constellation Background)
 * 在最底层 Canvas 增加 35~50 颗细小的微弱星辰，随机连接成稀疏的微弱星座线条，伴随极慢的低频闪烁呼吸，
 * 彻底消除深色底色单调感，与前排几何符文形成优雅深邃的纵深空间。
 */

export function mount(container) {
  let disposed = false;
  const themeList = [
    { name: "极光暗青", bg: "radial-gradient(ellipse at bottom, #092c28 0%, #061917 60%, #030d0c 100%)", stroke: "#4ade80", netColor: "rgba(74,222,128,", starColor: "rgba(180,255,230," },
    { name: "深海星渊", bg: "radial-gradient(ellipse at bottom, #0f2b38 0%, #091a24 60%, #040c12 100%)", stroke: "#38bdf8", netColor: "rgba(56,189,248,", starColor: "rgba(180,235,255," },
    { name: "暗夜幽紫", bg: "radial-gradient(ellipse at bottom, #241432 0%, #150a1e 60%, #09030e 100%)", stroke: "#c084fc", netColor: "rgba(192,132,252,", starColor: "rgba(235,200,255," },
    { name: "曜石暖金", bg: "radial-gradient(ellipse at bottom, #2b2214 0%, #181209 60%, #0d0803 100%)", stroke: "#fbbf24", netColor: "rgba(251,191,36,", starColor: "rgba(255,240,200," },
    { name: "鼠尾草绿", bg: "radial-gradient(ellipse at bottom, #162a26 0%, #0d1a17 60%, #060e0c 100%)", stroke: "#6ee7b7", netColor: "rgba(110,231,183,", starColor: "rgba(200,255,235," },
    { name: "暮色灰蓝", bg: "radial-gradient(ellipse at bottom, #1e2633 0%, #111620 60%, #080b11 100%)", stroke: "#94a3b8", netColor: "rgba(148,163,184,", starColor: "rgba(220,230,245," }
  ];

  const currentTheme = themeList[Math.floor(Math.random() * themeList.length)];

  // 1. 最底层：微弱星座背景 Canvas
  const constellationCanvas = document.createElement("canvas");
  constationCanvasStyle:
  constellationCanvas.style.cssText = `position:absolute;inset:0;width:100%;height:100%;z-index:0;display:block;background:${currentTheme.bg};pointer-events:none;`;

  // 2. 中层与顶层：符号层与网络连线层
  const symbolCanvas = document.createElement("canvas");
  const netCanvas = document.createElement("canvas");

  symbolCanvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:1;display:block;pointer-events:none;";
  netCanvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:2;display:block;pointer-events:none;";

  container.appendChild(constellationCanvas);
  container.appendChild(symbolCanvas);
  container.appendChild(netCanvas);

  const constCtx = constellationCanvas.getContext("2d");
  const symbolCtx = symbolCanvas.getContext("2d");
  const netCtx = netCanvas.getContext("2d");

  function resize() {
    constellationCanvas.width = symbolCanvas.width = netCanvas.width = window.innerWidth;
    constellationCanvas.height = symbolCanvas.height = netCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  let target = { x: -9999, y: -9999 };
  let lastPos = { x: -9999, y: -9999 };
  let lastMoveTime = performance.now();
  let mouseSpeed = 0;

  // --- 微弱星座背景系统 (Constellation Dust) ---
  const stars = [];
  const STAR_COUNT = 45;

  function initConstellation() {
    stars.length = 0;
    const w = constellationCanvas.width;
    const h = constellationCanvas.height;

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 0.9 + 0.6, // 微小星辰半径 0.6~1.5px
        baseAlpha: Math.random() * 0.25 + 0.15, // 微弱亮度
        pulseSpeed: Math.random() * 0.0015 + 0.0008,
        pulseOffset: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.08, // 极慢背景漂移
        vy: (Math.random() - 0.5) * 0.08
      });
    }
  }

  // 04 符文矩阵
  let elements = [];
  const presets = {};

  presets.o = function (x, y, s, dx, dy) {
    return {
      x, y, r: 12 * s, w: 2.8 * s, dx, dy,
      draw: function(ctx, t) {
        this.x += this.dx;
        this.y += this.dy;
        ctx.beginPath();
        ctx.arc(this.x + Math.sin((50 + x + (t / 10)) / 100) * 3, this.y + Math.sin((45 + x + (t / 10)) / 100) * 4, this.r, 0, 2 * Math.PI, false);
        ctx.lineWidth = this.w;
        ctx.strokeStyle = currentTheme.stroke;
        ctx.globalAlpha = 0.55;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    };
  };

  presets.x = function (x, y, s, dx, dy, dr, r) {
    r = r || 0;
    return {
      x, y, s: 18 * s, w: 2.8 * s, r, dx, dy, dr,
      draw: function(ctx, t) {
        this.x += this.dx;
        this.y += this.dy;
        this.r += this.dr;
        const _this = this;
        const line = function(lx, ly, tx, ty, c) {
          ctx.beginPath();
          ctx.moveTo((_this.s / 2) * lx, (_this.s / 2) * ly);
          ctx.lineTo((_this.s / 2) * tx, (_this.s / 2) * ty);
          ctx.lineWidth = _this.w;
          ctx.strokeStyle = c;
          ctx.globalAlpha = 0.55;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        };
        ctx.save();
        ctx.translate(this.x + Math.sin((x + (t / 10)) / 100) * 5, this.y + Math.sin((10 + x + (t / 10)) / 100) * 2);
        ctx.rotate(this.r * Math.PI / 180);
        line(-1, -1, 1, 1, currentTheme.stroke);
        line(1, -1, -1, 1, currentTheme.stroke);
        ctx.restore();
      }
    };
  };

  function populateElements() {
    elements = [];
    for(let x = 0; x < symbolCanvas.width; x += 34) {
      for(let y = 0; y < symbolCanvas.height; y += 34) {
        if(Math.round(Math.random() * 8) === 1) {
          const s = ((Math.random() * 5) + 1) / 10;
          if(Math.round(Math.random()) === 1)
            elements.push(presets.o(x, y, s, 0, 0));
          else
            elements.push(presets.x(x, y, s, 0, 0, ((Math.random() * 3) - 1) / 10, (Math.random() * 360)));
        }
      }
    }
  }

  // 01 粒子网络
  let points = [];

  function initNetwork() {
    const w = netCanvas.width;
    const h = netCanvas.height;
    target = { x: w / 2, y: h / 2 };
    points = [];
    const stepX = w / 18;
    const stepY = h / 18;
    for(let x = 0; x < w; x += stepX) {
      for(let y = 0; y < h; y += stepY) {
        const px = x + Math.random() * stepX;
        const py = y + Math.random() * stepY;
        points.push({
          x: px, originX: px, y: py, originY: py,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          attrX: 0, attrY: 0
        });
      }
    }

    for(let i = 0; i < points.length; i++) {
      const closest = [];
      const p1 = points[i];
      for(let j = 0; j < points.length; j++) {
        const p2 = points[j];
        if(p1 !== p2) {
          let placed = false;
          for(let k = 0; k < 5; k++) {
            if(!placed && closest[k] === undefined) {
              closest[k] = p2; placed = true;
            }
          }
          for(let k = 0; k < 5; k++) {
            if(!placed && getDistance(p1, p2) < getDistance(p1, closest[k])) {
              closest[k] = p2; placed = true;
            }
          }
        }
      }
      p1.closest = closest;
      p1.circle = new Circle(p1, 2 + Math.random() * 2);
    }
  }

  function Circle(pos, rad) {
    this.pos = pos;
    this.radius = rad;
    this.draw = function() {
      if(!this.active) return;
      netCtx.beginPath();
      netCtx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
      netCtx.fillStyle = currentTheme.netColor + this.active + ')';
      netCtx.fill();
    };
  }

  function getDistance(p1, p2) {
    return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
  }

  let isWindowFocused = document.hasFocus();

  function resetFocus() {
    target.x = -9999;
    target.y = -9999;
    lastPos.x = -9999;
    lastPos.y = -9999;
    mouseSpeed = 0;
    isWindowFocused = false;
  }

  function onFocus() {
    isWindowFocused = true;
  }

  function onMouseMove(e) {
    if (!isWindowFocused) isWindowFocused = true;
    const now = performance.now();
    const dt = Math.max(now - lastMoveTime, 1);
    const distMoved = Math.hypot(e.clientX - lastPos.x, e.clientY - lastPos.y);

    if (lastPos.x !== -9999) {
      const instSpeed = distMoved / dt;
      mouseSpeed = mouseSpeed * 0.4 + instSpeed * 0.6;
    }

    lastPos.x = e.clientX;
    lastPos.y = e.clientY;
    lastMoveTime = now;

    target.x = e.clientX;
    target.y = e.clientY;
  }

  function onMouseLeave() {
    resetFocus();
  }

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseleave", onMouseLeave);
  window.addEventListener("blur", resetFocus);
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) resetFocus();
    else isWindowFocused = document.hasFocus();
  });

  initConstellation();
  populateElements();
  initNetwork();

  let animId;
  function loop() {
    if (disposed) return;
    if (document.hidden) {
      animId = requestAnimationFrame(loop);
      return;
    }
    const time = Date.now();

    // 0. 渲染微弱星座背景 (Constellation Background)
    const cw = constellationCanvas.width;
    const ch = constellationCanvas.height;
    constCtx.clearRect(0, 0, cw, ch);

    // 更新并绘制星辰位置
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0) s.x = cw;
      if (s.x > cw) s.x = 0;
      if (s.y < 0) s.y = ch;
      if (s.y > ch) s.y = 0;

      // 柔和呼吸明暗
      const pulse = Math.sin(time * s.pulseSpeed + s.pulseOffset);
      const alpha = s.baseAlpha + pulse * 0.12;

      constCtx.beginPath();
      constCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      constCtx.fillStyle = currentTheme.starColor + Math.max(0.04, alpha) + ")";
      constCtx.fill();
    }

    // 星座连线：两颗星辰距离适中时产生极细微的若隐若现星座连线
    const MAX_STAR_DIST = 110;
    for (let i = 0; i < stars.length; i++) {
      const s1 = stars[i];
      for (let j = i + 1; j < stars.length; j++) {
        const s2 = stars[j];
        const dx = s1.x - s2.x;
        const dy = s1.y - s2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_STAR_DIST) {
          const lineAlpha = (1 - dist / MAX_STAR_DIST) * 0.12; // 极低透明度，若隐若现
          constCtx.beginPath();
          constCtx.moveTo(s1.x, s1.y);
          constCtx.lineTo(s2.x, s2.y);
          constCtx.strokeStyle = currentTheme.starColor + lineAlpha + ")";
          constCtx.lineWidth = 0.65;
          constCtx.stroke();
        }
      }
    }

    // 鼠标静止时速度随时间衰减
    const idleTime = performance.now() - lastMoveTime;
    if (idleTime > 60) {
      mouseSpeed *= 0.85;
    }

    // 1. 符文层
    symbolCtx.clearRect(0, 0, symbolCanvas.width, symbolCanvas.height);
    for (let e in elements) elements[e].draw(symbolCtx, time);

    // 2. 粒子自漂移 + 速度敏感断开的极微弱向心吸附
    const SPEED_THRESHOLD = 0.75;
    const isAttracting = mouseSpeed < SPEED_THRESHOLD && target.x !== -9999;
    const ATTR_RADIUS = 150;
    const MAX_PULL = 6.0;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p.x += p.vx; p.y += p.vy;
      if (Math.abs(p.x - p.originX) > 36) p.vx *= -1;
      if (Math.abs(p.y - p.originY) > 36) p.vy *= -1;

      if (isAttracting) {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < ATTR_RADIUS && d > 1) {
          const speedFactor = Math.max(0, 1 - mouseSpeed / SPEED_THRESHOLD);
          const ratio = (1 - d / ATTR_RADIUS) * speedFactor;
          const pull = ratio * ratio * MAX_PULL;

          const targetAttrX = (dx / d) * pull;
          const targetAttrY = (dy / d) * pull;
          p.attrX += (targetAttrX - p.attrX) * 0.08;
          p.attrY += (targetAttrY - p.attrY) * 0.08;
        } else {
          p.attrX *= 0.88;
          p.attrY *= 0.88;
        }
      } else {
        p.attrX *= 0.82;
        p.attrY *= 0.82;
      }

      p.x += p.attrX;
      p.y += p.attrY;
    }

    // 3. 连线与渲染
    netCtx.clearRect(0, 0, netCanvas.width, netCanvas.height);
    for(let i = 0; i < points.length; i++) {
      const p = points[i];
      const dist = Math.abs(getDistance(target, p));
      if(dist < 4000) {
        p.active = 0.55; p.circle.active = 0.85;
      } else if(dist < 20000) {
        p.active = 0.25; p.circle.active = 0.45;
      } else if(dist < 40000) {
        p.active = 0.08; p.circle.active = 0.18;
      } else {
        p.active = 0; p.circle.active = 0;
      }

      if(p.active) {
        for(let k in p.closest) {
          netCtx.beginPath();
          netCtx.moveTo(p.x, p.y);
          netCtx.lineTo(p.closest[k].x, p.closest[k].y);
          netCtx.strokeStyle = currentTheme.netColor + (p.active * 0.75) + ')';
          netCtx.stroke();
        }
      }
      p.circle.draw();
    }

    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  return function unmount() {
    disposed = true;
    cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseleave", onMouseLeave);
    window.removeEventListener("blur", resetFocus);
    window.removeEventListener("focus", onFocus);
    container.innerHTML = "";
  };
}
