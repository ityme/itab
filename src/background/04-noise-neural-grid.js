/**
 * @file background/04-noise-neural-grid.js
 * @description 02 电影胶片噪点 + 08 神经光栅交互
 * @optimization 使用 128x128 预渲染离线噪点纹理全屏平铺，大幅节省 4K/2K 高分屏 CPU 算力
 */

export function mount(container) {
  let disposed = false;
  container.innerHTML = `
    <style>
      .nn-wrap {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: radial-gradient(circle at center, #1b2826 0%, #0d1615 60%, #060b0a 100%);
      }
      .nn-grid-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        display: block;
      }
      .nn-noise-layer {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        pointer-events: none;
        opacity: 0.18;
      }
      .nn-vignette {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 3;
        box-shadow: inset 0 0 160px 30px rgba(0, 0, 0, 0.9);
        pointer-events: none;
        animation: nn-vignette-pulse 4s infinite ease-in-out;
      }
      @keyframes nn-vignette-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.65; }
      }
    </style>
    <div class="nn-wrap">
      <canvas class="nn-grid-canvas"></canvas>
      <div class="nn-noise-layer"></div>
      <div class="nn-vignette"></div>
    </div>
  `;

  const gridCanvas = container.querySelector(".nn-grid-canvas");
  const noiseLayer = container.querySelector(".nn-noise-layer");
  const gridCtx = gridCanvas.getContext("2d");

  // --- 噪点性能优化：预生成 4 帧 128x128 噪点 Pattern 平铺 ---
  const NOISE_SIZE = 128;
  const noisePatterns = [];
  for (let frame = 0; frame < 4; frame++) {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = NOISE_SIZE;
    offCanvas.height = NOISE_SIZE;
    const offCtx = offCanvas.getContext("2d");
    const imgData = offCtx.createImageData(NOISE_SIZE, NOISE_SIZE);
    const buffer = new Uint32Array(imgData.data.buffer);
    for (let i = 0; i < buffer.length; i++) {
      if (Math.random() < 0.18) {
        const gray = (Math.random() * 255) | 0;
        buffer[i] = (45 << 24) | (gray << 16) | (gray << 8) | gray;
      }
    }
    offCtx.putImageData(imgData, 0, 0);
    noisePatterns.push(offCanvas.toDataURL());
  }

  let noiseFrame = 0;
  let lastNoiseTime = 0;

  let width, height;
  const squareSize = 70;
  const grid = [];

  function setupGrid() {
    grid.length = 0;
    for (let x = 0; x < width; x += squareSize) {
      for (let y = 0; y < height; y += squareSize) {
        grid.push({
          x,
          y,
          alpha: 0,
          fading: false,
          lastTouched: 0
        });
      }
    }
  }

  function resize() {
    width = gridCanvas.width = window.innerWidth;
    height = gridCanvas.height = window.innerHeight;
    setupGrid();
  }
  window.addEventListener("resize", resize);
  resize();

  function getCellAt(x, y) {
    return grid.find(c => x >= c.x && x < c.x + squareSize && y >= c.y && y < c.y + squareSize);
  }

  function onMouseMove(e) {
    const cell = getCellAt(e.clientX, e.clientY);
    if (cell && cell.alpha === 0) {
      cell.alpha = 1;
      cell.lastTouched = Date.now();
      cell.fading = false;
    }
  }
  window.addEventListener("mousemove", onMouseMove);

  let animId;
  function render(time) {
    if (disposed) return;

    // 当页面切换到后台隐藏时跳过运算，实现 0 功耗
    if (document.hidden) {
      animId = requestAnimationFrame(render);
      return;
    }

    const now = Date.now();

    // 1. 切换噪点帧（控制在 ~12fps 模拟电影胶片频率，极度省电）
    if (time - lastNoiseTime > 80) {
      lastNoiseTime = time;
      noiseFrame = (noiseFrame + 1) % noisePatterns.length;
      noiseLayer.style.backgroundImage = `url("${noisePatterns[noiseFrame]}")`;
    }

    // 2. 神经网格渲染
    gridCtx.clearRect(0, 0, width, height);
    for (let i = 0; i < grid.length; i++) {
      const cell = grid[i];
      if (cell.alpha > 0 && !cell.fading && now - cell.lastTouched > 400) {
        cell.fading = true;
      }
      if (cell.fading) {
        cell.alpha -= 0.025;
        if (cell.alpha <= 0) {
          cell.alpha = 0;
          cell.fading = false;
        }
      }
      if (cell.alpha > 0) {
        const cx = cell.x + squareSize / 2;
        const cy = cell.y + squareSize / 2;
        const gradient = gridCtx.createRadialGradient(cx, cy, 4, cx, cy, squareSize);
        gradient.addColorStop(0, `rgba(50, 230, 197, ${cell.alpha * 0.85})`);
        gradient.addColorStop(1, `rgba(18, 90, 80, 0)`);

        gridCtx.strokeStyle = gradient;
        gridCtx.lineWidth = 1.4;
        gridCtx.strokeRect(cell.x + 0.5, cell.y + 0.5, squareSize - 1, squareSize - 1);
      }
    }

    animId = requestAnimationFrame(render);
  }
  animId = requestAnimationFrame(render);

  return function unmount() {
    disposed = true;
    cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("mousemove", onMouseMove);
    container.innerHTML = "";
  };
}
