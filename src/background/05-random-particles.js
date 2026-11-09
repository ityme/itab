/**
 * @file background/05-random-particles.js
 * @description 05 全向膨胀动态粒子系统 + 静态深色底板 + 胶片微质感
 */

export function mount(container) {
  let disposed = false;

  // 5 组静态深色主题，保留粒子配色与胶片微颗粒。
  const themePresets = [
    {
      name: "翡翠暗金",
      bg: "radial-gradient(circle at 50% 38%, #0d3a32 0%, #07241f 46%, #030907 100%)",
      colors: ["#34d399", "#2dd4bf", "#6ee7b7", "#38bdf8", "#059669"]
    },
    {
      name: "深海星渊",
      bg: "radial-gradient(circle at 50% 38%, #123b5c 0%, #0a243a 46%, #030811 100%)",
      colors: ["#38bdf8", "#60a5fa", "#818cf8", "#0284c7", "#93c5fd"]
    },
    {
      name: "暗夜幽兰",
      bg: "radial-gradient(circle at 50% 38%, #3a1d55 0%, #1d0e30 46%, #08040f 100%)",
      colors: ["#c084fc", "#e879f9", "#f472b6", "#9333ea", "#a855f7"]
    },
    {
      name: "落霞暮光",
      bg: "radial-gradient(circle at 50% 38%, #4a2418 0%, #24120c 46%, #0b0504 100%)",
      colors: ["#fb923c", "#f87171", "#fbbf24", "#ea580c", "#fca5a5"]
    },
    {
      name: "月影青黛",
      bg: "radial-gradient(circle at 50% 38%, #164744 0%, #0b2a28 46%, #040909 100%)",
      colors: ["#5eead4", "#99f6e4", "#2dd4bf", "#67e8f9", "#0f766e"]
    }
  ];

  const currentTheme = themePresets[Math.floor(Math.random() * themePresets.length)];

  container.innerHTML = `
    <style>
      .ambient-wrap {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: ${currentTheme.bg};
        pointer-events: none;
      }
      .ambient-grain {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0.045;
        mix-blend-mode: overlay;
        pointer-events: none;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      }
      .particle-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        background: transparent;
        pointer-events: none;
      }
    </style>
    <div class="ambient-wrap">
      <div class="ambient-grain"></div>
      <canvas class="particle-canvas"></canvas>
    </div>
  `;

  const canvas = container.querySelector(".particle-canvas");
  const ctx = canvas.getContext("2d");
  let w, h;
  const arc = 110;
  let time = 0;
  const size = 7;
  const speed = 25;
  const parts = [];
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  for (let i = 0; i < arc; i++) {
    parts.push({
      x: Math.ceil(Math.random() * w),
      y: Math.ceil(Math.random() * h),
      toX: Math.random() * 4 - 2,
      toY: Math.random() * 4 - 2,
      c: currentTheme.colors[Math.floor(Math.random() * currentTheme.colors.length)],
      size: Math.random() * size + 2
    });
  }

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }
  window.addEventListener("mousemove", onMouseMove);

  function distanceBetween(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  let animId;
  function loop() {
    if (disposed) return;
    if (document.hidden) {
      animId = requestAnimationFrame(loop);
      return;
    }

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < arc; i++) {
      const li = parts[i];
      let distanceFactor = distanceBetween(mouse, li);
      distanceFactor = Math.max(Math.min(18 - (distanceFactor / 18), 12), 1);

      ctx.beginPath();
      ctx.arc(li.x, li.y, li.size * distanceFactor * 0.45, 0, Math.PI * 2, false);
      ctx.fillStyle = li.c;
      ctx.strokeStyle = li.c;

      if (i % 2 === 0) {
        ctx.lineWidth = 1.4;
        ctx.stroke();
      } else {
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      li.x += li.toX * (time * 0.04);
      li.y += li.toY * (time * 0.04);

      if (li.x > w) li.x = 0;
      if (li.y > h) li.y = 0;
      if (li.x < 0) li.x = w;
      if (li.y < 0) li.y = h;
    }

    if (time < speed) time++;
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
