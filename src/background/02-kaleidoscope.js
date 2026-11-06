/**
 * @file background/02-kaleidoscope.js
 * @description 10 原版完整万花筒折射结构
 * 
 * 还原原作者全部视觉层级：
 * 1. 经典细线 SVG 浅蓝网格底纹
 * 2. 居中的优雅花束图层（使用内置高清 bouquet.svg 代替 404 死链）
 * 3. 经典的 7~12 段折射万花筒圆盘（使用内置高密折射纹理 caroussel.svg）
 * 4. 完整的全向鼠标位移流转公式
 */

export function mount(container) {
  let disposed = false;

  const bouquetUrl = chrome.runtime?.getURL ? chrome.runtime.getURL("background/assets/bouquet.svg") : "background/assets/bouquet.svg";
  const carousselUrl = chrome.runtime?.getURL ? chrome.runtime.getURL("background/assets/caroussel.svg") : "background/assets/caroussel.svg";

  const wrap = document.createElement("div");
  wrap.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #0b1216;
    user-select: none;
    pointer-events: none;
  `;

  // 1. 原版 SVG 坐标浅蓝网格 + 2. 原版中心花束背景 + 3. 万花筒圆盘
  wrap.innerHTML = `
    <svg style="position:absolute;z-index:1;width:100%;height:100%;top:0;left:0;pointer-events:none;">
      <defs>
        <pattern id="k-orig-grid" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="14" height="14" fill="none" stroke="rgba(173, 216, 230, 0.45)" stroke-width="0.8" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#k-orig-grid)" />
    </svg>

    <!-- 原版花束层 -->
    <div style="position:absolute;inset:0;width:100%;height:100%;z-index:2;background:url('${bouquetUrl}') no-repeat center 15vh;background-size:min(90vh, 700px);opacity:0.95;pointer-events:none;"></div>

    <!-- 原版万花筒折射盘 -->
    <div class="k-disk-host" style="width:32vh;height:32vh;background:hsla(180,100%,10%,.12);box-shadow:0 0 8vh 12vh hsla(180,100%,10%,.2);border-radius:100%;position:absolute;z-index:3;top:50%;left:50%;transform:translate(-50%,-10%);"></div>
  `;

  container.appendChild(wrap);

  const disk = wrap.querySelector(".k-disk-host");

  // 原版采用 7 段对称（生成 14 个 tile）
  const n = 7;
  let tilesHtml = "";
  const step = 360 / n;

  for (let i = 0; i <= n * 2; i++) {
    const angle = (i * step * 0.5);
    const transform = (i % 2 === 1) ? `scale(-1, 1) rotate(${angle}deg)` : `rotate(${angle}deg)`;
    tilesHtml += `
      <div style="position:absolute;top:50%;left:0;height:100%;width:50%;overflow:hidden;transform-origin:right top;transform:${transform};">
        <div class="k-slice" style="position:relative;top:0;left:100%;height:100%;width:100%;background-image:url('${carousselUrl}');background-size:320px 320px;transform-origin:left top;transform:rotate(${angle}deg);"></div>
      </div>
    `;
  }
  disk.innerHTML = tilesHtml;

  const slices = disk.querySelectorAll(".k-slice");
  let x = 0, y = 0;

  // 原版的流转逻辑 mode 2: nx = e.pageX, ny = -y
  function onMouseMove(e) {
    if (disposed) return;
    x++;
    y++;
    const nx = e.pageX;
    const ny = -y;
    const pos = `${nx}px ${ny}px`;
    for (let i = 0; i < slices.length; i++) {
      slices[i].style.backgroundPosition = pos;
    }
  }

  window.addEventListener("mousemove", onMouseMove);

  return function unmount() {
    disposed = true;
    window.removeEventListener("mousemove", onMouseMove);
    container.innerHTML = "";
  };
}
