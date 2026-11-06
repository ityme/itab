/**
 * @file background/04-noise-neural-grid.js
 * @description 02 电影胶片噪点 + 08 神经光栅交互
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
      .nn-noise-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        pointer-events: none;
        opacity: 0.22;
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
      <canvas class="nn-noise-canvas"></canvas>
      <div class="nn-vignette"></div>
    </div>
  `;

  const gridCanvas = container.querySelector(".nn-grid-canvas");
  const noiseCanvas = container.querySelector(".nn-noise-canvas");
  const gridCtx = gridCanvas.getContext("2d");
  const noiseCtx = noiseCanvas.getContext("2d");

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
    width = gridCanvas.width = noiseCanvas.width = window.innerWidth;
    height = gridCanvas.height = noiseCanvas.height = window.innerHeight;
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
  function render() {
    if (disposed) return;
    const now = Date.now();

    // 1. 噪点
    const imgData = noiseCtx.createImageData(width, height);
    const buffer = new Uint32Array(imgData.data.buffer);
    const len = buffer.length;
    for (let i = 0; i < len; i += 2) {
      if (Math.random() < 0.12) {
        const gray = (Math.random() * 255) | 0;
        buffer[i] = (40 << 24) | (gray << 16) | (gray << 8) | gray;
      }
    }
    noiseCtx.putImageData(imgData, 0, 0);

    // 2. 神经网格
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
