/**
 * @file background/05-random-particles.js
 * @description 06 动态粒子系统 · 鼠标距离放大 · 每次随机色系
 * @optimization 背景采用深邃的星空极光渐变，告别纯黑死板背景；调和粒子透明度与光晕
 */

export function mount(container) {
  let disposed = false;
  const themePresets = [
    {
      name: "翡翠极光",
      bg: "radial-gradient(ellipse at bottom, #0a2521 0%, #061714 55%, #020908 100%)",
      colors: ["#34d399", "#2dd4bf", "#6ee7b7", "#38bdf8", "#059669"]
    },
    {
      name: "深海星芒",
      bg: "radial-gradient(ellipse at bottom, #0c2336 0%, #081622 55%, #03080e 100%)",
      colors: ["#38bdf8", "#60a5fa", "#818cf8", "#0284c7", "#93c5fd"]
    },
    {
      name: "暗夜幽兰",
      bg: "radial-gradient(ellipse at bottom, #21132f 0%, #130a1c 55%, #07030a 100%)",
      colors: ["#c084fc", "#e879f9", "#f472b6", "#9333ea", "#a855f7"]
    },
    {
      name: "落日余晖",
      bg: "radial-gradient(ellipse at bottom, #2d1814 0%, #1a0d0a 55%, #0b0504 100%)",
      colors: ["#fb923c", "#f87171", "#fbbf24", "#ea580c", "#fca5a5"]
    },
    {
      name: "月影青黛",
      bg: "radial-gradient(ellipse at bottom, #162624 0%, #0d1716 55%, #050908 100%)",
      colors: ["#5eead4", "#99f6e4", "#2dd4bf", "#67e8f9", "#0f766e"]
    }
  ];

  const currentTheme = themePresets[Math.floor(Math.random() * themePresets.length)];

  const canvas = document.createElement("canvas");
  canvas.style.cssText = `position:absolute;inset:0;width:100%;height:100%;z-index:1;display:block;background:${currentTheme.bg};`;
  container.appendChild(canvas);

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

  function create() {
    time = 0;
    parts.length = 0;
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

  create();

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
