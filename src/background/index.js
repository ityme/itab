/**
 * @file background/index.js
 * @description iWonder 扩展背景调度管理器
 * 
 * 架构升级：
 * 采用原生隔离的 Web Component / 全屏 iframe 承载 5 套独立的动态背景网页，
 * 不再对源码进行任何压缩阉割，100% 保持原作者 Shader、着色器 DOM、SVG、CSS 滤镜和原生动画。
 */

import { getDirectoryHandle, verifyPermission } from "./storage.js";

export const DYNAMIC_BACKGROUNDS = [
  { id: "symbols-network", name: "几何符文与引力网络", url: "background/01-symbols-network.html" },
  { id: "kaleidoscope", name: "10 原版折射万花筒", url: "background/02-kaleidoscope.html" },
  { id: "sakura-webgl", name: "09 原版 WebGL 景深樱花", url: "background/03-sakura-webgl.html" },
  { id: "noise-neural-grid", name: "胶片噪点与神经光栅", url: "background/04-noise-neural-grid.html" },
  { id: "random-particles", name: "动态粒子聚散系统", url: "background/05-random-particles.html" }
];

let currentBlobUrl = null;

function cleanupBlobUrl() {
  if (currentBlobUrl) {
    try {
      URL.revokeObjectURL(currentBlobUrl);
    } catch (e) {}
    currentBlobUrl = null;
  }
}

function ensureFrameHost() {
  let host = document.getElementById("iwonder-bg-frame");
  if (!host) {
    host = document.createElement("iframe");
    host.id = "iwonder-bg-frame";
    host.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      border: none;
      margin: 0;
      padding: 0;
      overflow: hidden;
      z-index: -1;
      pointer-events: auto;
    `;
    document.body.prepend(host);
  }
  return host;
}

export function clearDynamicBackground() {
  cleanupBlobUrl();
  const host = document.getElementById("iwonder-bg-frame");
  if (host) {
    host.remove();
  }
}

export function renderDynamicBackground(index) {
  cleanupBlobUrl();
  document.body.style.removeProperty("background-image");

  const safeIndex = (index >= 0 && index < DYNAMIC_BACKGROUNDS.length)
    ? index
    : Math.floor(Math.random() * DYNAMIC_BACKGROUNDS.length);

  const target = DYNAMIC_BACKGROUNDS[safeIndex];
  console.log(`[iWonder] Activated dynamic background (${safeIndex + 1}/${DYNAMIC_BACKGROUNDS.length}): ${target.name}`);

  const frame = ensureFrameHost();
  frame.src = target.url;
  return target;
}

/**
 * (m + n) 取 1 随机算法
 */
export async function selectRandomBackground(imagePath = "", imageNameList = []) {
  const m = Array.isArray(imageNameList) ? imageNameList.length : 0;
  const n = DYNAMIC_BACKGROUNDS.length; // 5

  if (!imagePath || m === 0) {
    const dynIndex = Math.floor(Math.random() * n);
    renderDynamicBackground(dynIndex);
    return { type: "dynamic", index: dynIndex, meta: DYNAMIC_BACKGROUNDS[dynIndex] };
  }

  const total = m + n;
  const pick = Math.floor(Math.random() * total);

  if (pick < m) {
    // 选中本地图片
    const chosenImage = imageNameList[pick];
    console.log(`[iWonder] Selected local image (${pick + 1}/${m}): ${chosenImage}`);

    let loadedViaHandle = false;
    try {
      const dirHandle = await getDirectoryHandle();
      if (dirHandle && (await verifyPermission(dirHandle, false))) {
        const fileHandle = await dirHandle.getFileHandle(chosenImage);
        const file = await fileHandle.getFile();
        clearDynamicBackground();
        currentBlobUrl = URL.createObjectURL(file);
        document.body.style.backgroundImage = `url("${currentBlobUrl}")`;
        loadedViaHandle = true;
      }
    } catch (err) {
      console.warn("Could not read image via DirectoryHandle, fallback to direct path:", err);
    }

    if (!loadedViaHandle) {
      clearDynamicBackground();
      const fullPath = imagePath + chosenImage;
      document.body.style.backgroundImage = `url("file:///${fullPath}")`;
    }

    return { type: "image", index: pick, name: chosenImage };
  } else {
    // 选中动态背景套件
    const dynIndex = pick - m;
    renderDynamicBackground(dynIndex);
    return { type: "dynamic", index: dynIndex, meta: DYNAMIC_BACKGROUNDS[dynIndex] };
  }
}
