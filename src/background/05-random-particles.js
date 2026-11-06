/**
 * @file background/05-random-particles.js
 * @description 06 动态粒子系统 · 鼠标距离放大 · 每次随机色系
 * @optimization 使用 requestAnimationFrame，增加页面切后台自动休眠（0 CPU 消耗）
 */

export function mount(container) {
  let disposed = false;
  const themePresets = [
    { name: "极光青绿", colors: ["#32e6c5", "#00ff87", "#60efff", "#0061ff", "#13547a"] },
    { name: "赛博霓虹", colors: ["#ff007f", "#7928ca", "#00f0ff", "#ff0080", "#4338ca"] },
    { name: "日落火烧云", colors: ["#ff4e50", "#f9d423", "#f857a6", "#ff5858", "#ff9900"] },
    { name: "暗夜幽兰", colors: ["#8a2387", "#e94057", "#f27121", "#3a1c71", "#d76d77"] },
    { name: "深海星芒", colors: ["#2193b0", "#6dd5ed", "#00c6ff", "#0072ff", "#1e3c72"] }
  ];

  const currentTheme = themePresets[Math.floor(Math.random() * themePresets.length)];

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:1;display:block;background:#080c10;";
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

    // 当标签页切换到后台隐藏时跳过运算，实现 0 CPU 功耗
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
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.globalAlpha = 0.85;
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
