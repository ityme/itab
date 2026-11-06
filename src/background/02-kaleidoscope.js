/**
 * @file background/02-kaleidoscope.js
 * @description 10 原版复刻万花筒折射结构
 */

export function mount(container) {
  let disposed = false;
  container.innerHTML = `
    <style>
      .k-wrap {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #0e161b;
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
        width: 48vh;
        height: 48vh;
        background: hsla(180, 100%, 10%, 0.15);
        box-shadow: 0 0 12vh 14vh hsla(180, 100%, 10%, 0.35);
        border-radius: 50%;
        position: absolute;
        z-index: 2;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
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
        background-image: url('https://assets.codepen.io/194946/caroussel90.png');
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
          <pattern id="k-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="22" height="22" fill="none" stroke="#2a5c54" stroke-width="0.8" />
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
    x += 1.5;
    y += 1.5;
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
