/**
 * @file background/02-kaleidoscope.js
 * @description 10 原版完整万花筒折射结构
 * 纯 JS 模块化挂载到 tab.html，无需 iframe。
 * 纹理内置于本地 assets/kaleido-texture.svg，绝无 404 失效问题，完整保留原版 12 段折射与全向鼠标控制。
 */

export function mount(container) {
  let disposed = false;

  const wrap = document.createElement("div");
  wrap.style.cssText = "position:absolute;inset:0;width:100%;height:100%;overflow:hidden;background:radial-gradient(circle at center, #182c2a 0%, #0c1816 65%, #050b0a 100%);user-select:none;pointer-events:none;";

  // SVG 坐标网格背景
  wrap.innerHTML = `
    <svg style="position:absolute;z-index:1;width:100%;height:100%;top:0;left:0;opacity:0.32;pointer-events:none;">
      <defs>
        <pattern id="k-grid-pattern" width="28" height="28" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="28" height="28" fill="none" stroke="#25554d" stroke-width="0.75" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#k-grid-pattern)" />
    </svg>
    <div class="k-disk-host" style="width:58vh;height:58vh;background:hsla(180,100%,10%,0.2);box-shadow:0 0 14vh 16vh rgba(8,30,26,0.7);border-radius:50%;position:absolute;z-index:2;top:50%;left:50%;transform:translate(-50%,-50%);border:1px solid rgba(50,230,197,0.25);"></div>
  `;

  container.appendChild(wrap);

  const disk = wrap.querySelector(".k-disk-host");
  const textureUrl = chrome.runtime?.getURL ? chrome.runtime.getURL("background/assets/kaleido-texture.svg") : "background/assets/kaleido-texture.svg";

  // 构建 12 段（24 个切片）对称折射矩阵
  let tilesHtml = "";
  const rotations = [
    "0deg", "30deg", "60deg", "90deg", "120deg", "150deg",
    "180deg", "210deg", "240deg", "270deg", "300deg", "330deg"
  ];

  for (let i = 0; i < 12; i++) {
    const rot = rotations[i];
    tilesHtml += `
      <div style="position:absolute;top:50%;left:0;height:100%;width:50%;overflow:hidden;transform-origin:right top;transform:rotate(${rot});">
        <div class="k-slice" style="position:relative;top:0;left:100%;height:100%;width:100%;background-image:url('${textureUrl}');background-size:280px 280px;transform-origin:left top;"></div>
      </div>
      <div style="position:absolute;top:50%;left:0;height:100%;width:50%;overflow:hidden;transform-origin:right top;transform:scale(-1,1) rotate(${rot});">
        <div class="k-slice" style="position:relative;top:0;left:100%;height:100%;width:100%;background-image:url('${textureUrl}');background-size:280px 280px;transform-origin:left top;"></div>
      </div>
    `;
  }
  disk.innerHTML = tilesHtml;

  const slices = disk.querySelectorAll(".k-slice");
  let x = 0, y = 0;

  function onMouseMove(e) {
    if (disposed) return;
    x += 1.8;
    y += 1.8;
    const nx = e.pageX + x;
    const ny = e.pageY - y;
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
