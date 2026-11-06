/**
 * @file background/01-symbols-network.js
 * @description 融合方案：04 几何符文矩阵 + 01 粒子引力网络，每次随机色彩
 */

export function mount(container) {
  let disposed = false;
  const themeList = [
    { name: "极光青蓝", bg: "#04BBD3", stroke: "#ffffff", netColor: "rgba(255,255,255," },
    { name: "暗夜翡翠", bg: "#0c3b36", stroke: "#5efce8", netColor: "rgba(94,252,232," },
    { name: "深紫幻境", bg: "#2d1442", stroke: "#ff71ce", netColor: "rgba(255,113,206," },
    { name: "黄昏晚霞", bg: "#b84d34", stroke: "#ffe600", netColor: "rgba(255,230,0," },
    { name: "曜石酷黑", bg: "#14171a", stroke: "#32e6c5", netColor: "rgba(50,230,197," },
    { name: "暖阳珊瑚", bg: "#e0534c", stroke: "#ffffff", netColor: "rgba(255,255,255," },
    { name: "普鲁士蓝", bg: "#0a2540", stroke: "#635bff", netColor: "rgba(99,91,255," }
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

  let elements = [];
  const presets = {};

  presets.o = function (x, y, s, dx, dy) {
    return {
      x, y, r: 12 * s, w: 3.5 * s, dx, dy,
      draw: function(ctx, t) {
        this.x += this.dx;
        this.y += this.dy;
        ctx.beginPath();
        ctx.arc(this.x + Math.sin((50 + x + (t / 10)) / 100) * 3, this.y + Math.sin((45 + x + (t / 10)) / 100) * 4, this.r, 0, 2 * Math.PI, false);
        ctx.lineWidth = this.w;
        ctx.strokeStyle = currentTheme.stroke;
        ctx.stroke();
      }
    };
  };

  presets.x = function (x, y, s, dx, dy, dr, r) {
    r = r || 0;
    return {
      x, y, s: 20 * s, w: 3.5 * s, r, dx, dy, dr,
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
          ctx.stroke();
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
    for(let x = 0; x < symbolCanvas.width; x += 32) {
      for(let y = 0; y < symbolCanvas.height; y += 32) {
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

  // 粒子网络
  let points = [], target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

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
          x: px,
          originX: px,
          y: py,
          originY: py,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8
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
              closest[k] = p2;
              placed = true;
            }
          }
          for(let k = 0; k < 5; k++) {
            if(!placed && getDistance(p1, p2) < getDistance(p1, closest[k])) {
              closest[k] = p2;
              placed = true;
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
  window.addEventListener("mousemove", onMouseMove);

  populateElements();
  initNetwork();

  let animId;
  function loop() {
    if (disposed) return;
    const time = Date.now();

    // 1. 符文
    symbolCtx.clearRect(0, 0, symbolCanvas.width, symbolCanvas.height);
    for (let e in elements) elements[e].draw(symbolCtx, time);

    // 2. 粒子自漂移
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p.x += p.vx;
      p.y += p.vy;
      if (Math.abs(p.x - p.originX) > 40) p.vx *= -1;
      if (Math.abs(p.y - p.originY) > 40) p.vy *= -1;
    }

    // 3. 连线
    netCtx.clearRect(0, 0, netCanvas.width, netCanvas.height);
    for(let i = 0; i < points.length; i++) {
      const p = points[i];
      const dist = Math.abs(getDistance(target, p));
      if(dist < 4000) {
        p.active = 0.55;
        p.circle.active = 0.85;
      } else if(dist < 20000) {
        p.active = 0.25;
        p.circle.active = 0.45;
      } else if(dist < 40000) {
        p.active = 0.08;
        p.circle.active = 0.18;
      } else {
        p.active = 0;
        p.circle.active = 0;
      }

      if(p.active) {
        for(let k in p.closest) {
          netCtx.beginPath();
          netCtx.moveTo(p.x, p.y);
          netCtx.lineTo(p.closest[k].x, p.closest[k].y);
          netCtx.strokeStyle = currentTheme.netColor + p.active + ')';
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
    container.innerHTML = "";
  };
}
