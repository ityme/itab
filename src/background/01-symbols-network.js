/**
 * @file background/01-symbols-network.js
 * @description 04 符文矩阵 + 01 粒子连线引力网络
 * 采用轻柔细腻的呼吸引力：微弱向心倾向（类似微风拂面），保留整体几何点阵结构，绝不坍缩汇聚成蜘蛛网
 */

export function mount(container) {
  let disposed = false;
  const themeList = [
    { name: "极光暗青", bg: "radial-gradient(ellipse at bottom, #092c28 0%, #061917 60%, #030d0c 100%)", stroke: "#4ade80", netColor: "rgba(74,222,128," },
    { name: "深海星渊", bg: "radial-gradient(ellipse at bottom, #0f2b38 0%, #091a24 60%, #040c12 100%)", stroke: "#38bdf8", netColor: "rgba(56,189,248," },
    { name: "暗夜幽紫", bg: "radial-gradient(ellipse at bottom, #241432 0%, #150a1e 60%, #09030e 100%)", stroke: "#c084fc", netColor: "rgba(192,132,252," },
    { name: "曜石暖金", bg: "radial-gradient(ellipse at bottom, #2b2214 0%, #181209 60%, #0d0803 100%)", stroke: "#fbbf24", netColor: "rgba(251,191,36," },
    { name: "鼠尾草绿", bg: "radial-gradient(ellipse at bottom, #162a26 0%, #0d1a17 60%, #060e0c 100%)", stroke: "#6ee7b7", netColor: "rgba(110,231,183," },
    { name: "暮色灰蓝", bg: "radial-gradient(ellipse at bottom, #1e2633 0%, #111620 60%, #080b11 100%)", stroke: "#94a3b8", netColor: "rgba(148,163,184," }
  ];

  const currentTheme = themeList[Math.floor(Math.random() * themeList.length)];

  const symbolCanvas = document.createElement("canvas");
  const netCanvas = document.createElement("canvas");

  symbolCanvas.style.cssText = `position:absolute;inset:0;width:100%;height:100%;z-index:1;display:block;background:${currentTheme.bg};`;
  netCanvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:2;display:block;pointer-events:none;";

  container.appendChild(symbolCanvas);
  container.appendChild(netCanvas);

  const symbolCtx = symbolCanvas.getContext("2d");
  const netCtx = netCanvas.getContext("2d");

  function resize() {
    symbolCanvas.width = netCanvas.width = window.innerWidth;
    symbolCanvas.height = netCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  let target = { x: -9999, y: -9999 };

  // --- 04 符文矩阵部分（极其克制的轻微倾斜引力，最大 8px 缓动）---
  let elements = [];
  const presets = {};

  presets.o = function (x, y, s, dx, dy) {
    return {
      x, y, originX: x, originY: y,
      offsetX: 0, offsetY: 0,
      r: 12 * s, w: 2.8 * s, dx, dy,
      draw: function(ctx, t) {
        this.x += this.dx;
        this.y += this.dy;

        const dxM = target.x - (this.originX + this.offsetX);
        const dyM = target.y - (this.originY + this.offsetY);
        const dist = Math.sqrt(dxM * dxM + dyM * dyM);
        const maxDist = 180;

        if (dist < maxDist && dist > 1) {
          const force = (1 - dist / maxDist) * 8; // 轻微吸附 8px
          const targetOffX = (dxM / dist) * force;
          const targetOffY = (dyM / dist) * force;
          this.offsetX += (targetOffX - this.offsetX) * 0.08;
          this.offsetY += (targetOffY - this.offsetY) * 0.08;
        } else {
          this.offsetX *= 0.92;
          this.offsetY *= 0.92;
        }

        const renderX = this.x + this.offsetX + Math.sin((50 + x + (t / 10)) / 100) * 3;
        const renderY = this.y + this.offsetY + Math.sin((45 + x + (t / 10)) / 100) * 4;

        ctx.beginPath();
        ctx.arc(renderX, renderY, this.r, 0, 2 * Math.PI, false);
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
      x, y, originX: x, originY: y,
      offsetX: 0, offsetY: 0,
      s: 18 * s, w: 2.8 * s, r, dx, dy, dr,
      draw: function(ctx, t) {
        this.x += this.dx;
        this.y += this.dy;
        this.r += this.dr;

        const dxM = target.x - (this.originX + this.offsetX);
        const dyM = target.y - (this.originY + this.offsetY);
        const dist = Math.sqrt(dxM * dxM + dyM * dyM);
        const maxDist = 180;

        if (dist < maxDist && dist > 1) {
          const force = (1 - dist / maxDist) * 8;
          const targetOffX = (dxM / dist) * force;
          const targetOffY = (dyM / dist) * force;
          this.offsetX += (targetOffX - this.offsetX) * 0.08;
          this.offsetY += (targetOffY - this.offsetY) * 0.08;
        } else {
          this.offsetX *= 0.92;
          this.offsetY *= 0.92;
        }

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

        const renderX = this.x + this.offsetX + Math.sin((x + (t / 10)) / 100) * 5;
        const renderY = this.y + this.offsetY + Math.sin((10 + x + (t / 10)) / 100) * 2;

        ctx.save();
        ctx.translate(renderX, renderY);
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

  // --- 01 粒子连线网络部分（轻微向心弹性偏移，保留网格骨架）---
  let points = [];

  function initNetwork() {
    const w = netCanvas.width;
    const h = netCanvas.height;
    points = [];
    const stepX = w / 18;
    const stepY = h / 18;
    for(let x = 0; x < w; x += stepX) {
      for(let y = 0; y < h; y += stepY) {
        const px = x + Math.random() * stepX;
        const py = y + Math.random() * stepY;
        points.push({
          x: px, originX: px, y: py, originY: py,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
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

  function onMouseMove(e) {
    target.x = e.clientX;
    target.y = e.clientY;
  }
  function onMouseLeave() {
    target.x = -9999;
    target.y = -9999;
  }

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseleave", onMouseLeave);

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

    // 1. 符文层
    symbolCtx.clearRect(0, 0, symbolCanvas.width, symbolCanvas.height);
    for (let e in elements) elements[e].draw(symbolCtx, time);

    // 2. 粒子自漂移 + 极轻微向心引力（最大只牵拉 12px，丝滑微动）
    const GRAVITY_RADIUS = 200;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p.x += p.vx; p.y += p.vy;
      if (Math.abs(p.x - p.originX) > 28) p.vx *= -1;
      if (Math.abs(p.y - p.originY) > 28) p.vy *= -1;

      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d < GRAVITY_RADIUS && d > 1) {
        // 轻盈柔和的引力倾斜，绝不过度聚团
        const targetAttrX = (dx / d) * (1 - d / GRAVITY_RADIUS) * 12;
        const targetAttrY = (dy / d) * (1 - d / GRAVITY_RADIUS) * 12;
        p.attrX += (targetAttrX - p.attrX) * 0.08;
        p.attrY += (targetAttrY - p.attrY) * 0.08;
      } else {
        p.attrX *= 0.90;
        p.attrY *= 0.90;
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
      } else if(dist < 18000) {
        p.active = 0.22; p.circle.active = 0.42;
      } else if(dist < 36000) {
        p.active = 0.06; p.circle.active = 0.15;
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
    container.innerHTML = "";
  };
}
