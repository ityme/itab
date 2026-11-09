/**
 * @file background/05-random-particles.js
 * @description 05 全向膨胀动态粒子系统 + 双色温呼吸弥散环境光 + 胶片微质感底板
 */

export function mount(container) {
  let disposed = false;

  // 5 组双色温呼吸弥散主题配置（左上冷调 × 右下暖调，搭配细腻胶片微颗粒）
  const themePresets = [
    {
      name: "翡翠暗金",
      baseColor: "#030907",
      glowCool: "rgba(16, 95, 75, 0.36)",
      glowWarm: "rgba(115, 68, 22, 0.22)",
      colors: ["#34d399", "#2dd4bf", "#6ee7b7", "#38bdf8", "#059669"]
    },
    {
      name: "深海星渊",
      baseColor: "#030811",
      glowCool: "rgba(14, 90, 140, 0.38)",
      glowWarm: "rgba(105, 45, 120, 0.25)",
      colors: ["#38bdf8", "#60a5fa", "#818cf8", "#0284c7", "#93c5fd"]
    },
    {
      name: "暗夜幽兰",
      baseColor: "#08040f",
      glowCool: "rgba(90, 45, 130, 0.38)",
      glowWarm: "rgba(130, 40, 85, 0.26)",
      colors: ["#c084fc", "#e879f9", "#f472b6", "#9333ea", "#a855f7"]
    },
    {
      name: "落霞暮光",
      baseColor: "#0b0504",
      glowCool: "rgba(135, 55, 30, 0.35)",
      glowWarm: "rgba(75, 25, 60, 0.28)",
      colors: ["#fb923c", "#f87171", "#fbbf24", "#ea580c", "#fca5a5"]
    },
    {
      name: "月影青黛",
      baseColor: "#040909",
      glowCool: "rgba(20, 105, 95, 0.36)",
      glowWarm: "rgba(25, 65, 95, 0.28)",
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
        background-color: ${currentTheme.baseColor};
        pointer-events: none;
      }
      .ambient-glow-1 {
        position: absolute;
        width: 130%;
        height: 130%;
        top: -25%;
        left: -20%;
        background: radial-gradient(circle 540px at 20% 25%, ${currentTheme.glowCool} 0%, transparent 68%);
        animation: amb-drift-cool 22s ease-in-out infinite alternate;
        pointer-events: none;
      }
      .ambient-glow-2 {
        position: absolute;
        width: 130%;
        height: 130%;
        bottom: -25%;
        right: -20%;
        background: radial-gradient(circle 560px at 80% 75%, ${currentTheme.glowWarm} 0%, transparent 65%);
        animation: amb-drift-warm 26s ease-in-out infinite alternate;
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
      @keyframes amb-drift-cool {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(3%, 2%) scale(1.05); }
        100% { transform: translate(-2%, 4%) scale(0.97); }
      }
      @keyframes amb-drift-warm {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(-3%, -2%) scale(1.06); }
        100% { transform: translate(2%, -3%) scale(0.96); }
      }
    </style>
    <div class="ambient-wrap">
      <div class="ambient-glow-1"></div>
      <div class="ambient-glow-2"></div>
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
