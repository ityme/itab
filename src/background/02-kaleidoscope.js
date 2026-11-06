/**
 * @file background/02-kaleidoscope.js
 * @description 10 原版复刻万花筒折射结构（内置纯本地华丽花卉与折射棱镜纹理，脱离失效远程资源）
 */

export function mount(container) {
  let disposed = false;

  // 生成本地离线花卉图案 DataURL 作为中心万花筒图像源
  function generateKaleidoTexture() {
    const size = 320;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");

    // 底色
    const g = ctx.createRadialGradient(size/2, size/2, 10, size/2, size/2, size/2);
    g.addColorStop(0, "#295b54");
    g.addColorStop(0.5, "#14332e");
    g.addColorStop(1, "#0a1f1b");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    // 绘制几何花瓣与棱镜放射环
    ctx.translate(size/2, size/2);
    const petals = 16;
    for (let i = 0; i < petals; i++) {
      ctx.rotate((Math.PI * 2) / petals);
      
      // 主花瓣
      ctx.beginPath();
      ctx.ellipse(60, 0, 50, 18, 0, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "rgba(50, 230, 197, 0.65)" : "rgba(255, 180, 210, 0.55)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 内层细蕊
      ctx.beginPath();
      ctx.arc(35, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 230, 120, 0.85)";
      ctx.fill();

      // 外缘折射晶格
      ctx.beginPath();
      ctx.rect(100, -8, 16, 16);
      ctx.fillStyle = "rgba(100, 200, 255, 0.6)";
      ctx.fill();
    }
    // 中心光核
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#32e6c5";
    ctx.shadowBlur = 15;
    ctx.fill();

    return c.toDataURL();
  }

  const textureUrl = generateKaleidoTexture();

  container.innerHTML = `
    <style>
      .k-wrap {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: radial-gradient(circle at center, #1b2f2d 0%, #0c1a18 65%, #050d0c 100%);
        user-select: none;
      }
      .k-svg {
        position: absolute;
        z-index: 1;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        pointer-events: none;
        opacity: 0.35;
      }
      .k-disk {
        width: 58vh;
        height: 58vh;
        background: hsla(180, 100%, 10%, 0.2);
        box-shadow: 0 0 14vh 16vh rgba(8, 30, 26, 0.7);
        border-radius: 50%;
        position: absolute;
        z-index: 2;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        border: 1px solid rgba(50, 230, 197, 0.25);
      }
      .k-disk .tile {
        display: none;
        position: absolute;
        top: 50%;
        left: 0;
        overflow: hidden;
        height: 100%;
        width: 50%;
        transform-origin: right top;
      }
      .k-disk .tile .image {
        position: relative;
        top: 0;
        left: 100%;
        height: 100%;
        width: 100%;
        background-image: url('${textureUrl}');
        background-size: 260px 260px;
        transform-origin: left top;
      }
      .k-disk.n12 .tile.t0 { display: block; transform: rotate(0deg); }
      .k-disk.n12 .tile.t1 { display: block; transform: scale(-1, 1) rotate(0deg); }
      .k-disk.n12 .tile.t2 { display: block; transform: rotate(30deg); }
      .k-disk.n12 .tile.t3 { display: block; transform: scale(-1, 1) rotate(30deg); }
      .k-disk.n12 .tile.t4 { display: block; transform: rotate(60deg); }
      .k-disk.n12 .tile.t5 { display: block; transform: scale(-1, 1) rotate(60deg); }
      .k-disk.n12 .tile.t6 { display: block; transform: rotate(90deg); }
      .k-disk.n12 .tile.t7 { display: block; transform: scale(-1, 1) rotate(90deg); }
      .k-disk.n12 .tile.t8 { display: block; transform: rotate(120deg); }
      .k-disk.n12 .tile.t9 { display: block; transform: scale(-1, 1) rotate(120deg); }
      .k-disk.n12 .tile.t10 { display: block; transform: rotate(150deg); }
      .k-disk.n12 .tile.t11 { display: block; transform: scale(-1, 1) rotate(150deg); }
      .k-disk.n12 .tile.t12 { display: block; transform: rotate(180deg); }
      .k-disk.n12 .tile.t13 { display: block; transform: scale(-1, 1) rotate(180deg); }
      .k-disk.n12 .tile.t14 { display: block; transform: rotate(210deg); }
      .k-disk.n12 .tile.t15 { display: block; transform: scale(-1, 1) rotate(210deg); }
      .k-disk.n12 .tile.t16 { display: block; transform: rotate(240deg); }
      .k-disk.n12 .tile.t17 { display: block; transform: scale(-1, 1) rotate(240deg); }
      .k-disk.n12 .tile.t18 { display: block; transform: rotate(270deg); }
      .k-disk.n12 .tile.t19 { display: block; transform: scale(-1, 1) rotate(270deg); }
      .k-disk.n12 .tile.t20 { display: block; transform: rotate(300deg); }
      .k-disk.n12 .tile.t21 { display: block; transform: scale(-1, 1) rotate(300deg); }
      .k-disk.n12 .tile.t22 { display: block; transform: rotate(330deg); }
      .k-disk.n12 .tile.t23 { display: block; transform: scale(-1, 1) rotate(330deg); }
    </style>
    <div class="k-wrap">
      <svg class="k-svg">
        <defs>
          <pattern id="k-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="28" height="28" fill="none" stroke="#25554d" stroke-width="0.75" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#k-grid)" />
      </svg>
      <div class="k-disk n12"></div>
    </div>
  `;

  const disk = container.querySelector(".k-disk");
  let tiles = "";
  for (let i = 0; i <= 24; i++) {
    tiles += `<div class="tile t${i}"><div class="image"></div></div>`;
  }
  disk.innerHTML = tiles;

  const images = disk.querySelectorAll(".image");
  let x = 0, y = 0;

  function onMouseMove(e) {
    if (disposed) return;
    x += 1.8;
    y += 1.8;
    const nx = e.pageX + x;
    const ny = e.pageY - y;
    const pos = `${nx}px ${ny}px`;
    for (let i = 0; i < images.length; i++) {
      images[i].style.backgroundPosition = pos;
    }
  }

  window.addEventListener("mousemove", onMouseMove);

  return function unmount() {
    disposed = true;
    window.removeEventListener("mousemove", onMouseMove);
    container.innerHTML = "";
  };
}
