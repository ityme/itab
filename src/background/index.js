/**
 * @file background/index.js
 * @description iWonder 背景管理调度器
 * 
 * 核心设计：
 * 1. 彻底弃用外部 iframe，所有 5 套背景全部作为直挂 DOM 的 ES Module 运行在 tab.html 中。
 * 2. 保证 tab.html 的鼠标事件（右键显示/隐藏搜索框、滚轮中键隐藏、键盘输入）100% 畅通稳定。
 * 3. 采用 (m + n) 取 1 随机算法，若未设图片目录则在 5 套动态背景中五选一。
 */

import { mount as mountSymbolsNetwork } from "./01-symbols-network.js";
import { mount as mountKaleidoscope } from "./02-kaleidoscope.js";
import { mount as mountSakuraWebGL } from "./03-sakura-webgl.js";
import { mount as mountNoiseNeuralGrid } from "./04-noise-neural-grid.js";
import { mount as mountRandomParticles } from "./05-random-particles.js";
import { getDirectoryHandle, verifyPermission } from "./storage.js";

export const DYNAMIC_BACKGROUND_MODULES = [
  { id: "symbols-network", name: "01 几何符文与引力网络", mount: mountSymbolsNetwork },
  { id: "kaleidoscope", name: "02 原版折射万花筒", mount: mountKaleidoscope },
  { id: "sakura-webgl", name: "03 原版 WebGL 景深飘落樱花", mount: mountSakuraWebGL },
  { id: "noise-neural-grid", name: "04 胶片噪点与神经光栅", mount: mountNoiseNeuralGrid },
  { id: "random-particles", name: "05 全向膨胀动态粒子", mount: mountRandomParticles }
];

let activeUnmount = null;
let currentBlobUrl = null;

function cleanupBlobUrl() {
  if (currentBlobUrl) {
    try {
      URL.revokeObjectURL(currentBlobUrl);
    } catch (e) {}
    currentBlobUrl = null;
  }
}

function ensureBackgroundHost() {
  let host = document.getElementById("iwonder-background-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "iwonder-background-host";
    host.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:-1;overflow:hidden;pointer-events:none;";
    document.body.prepend(host);
  }
  return host;
}

export function clearDynamicBackground() {
  cleanupBlobUrl();
  if (typeof activeUnmount === "function") {
    try {
      activeUnmount();
    } catch (e) {
      console.error("Error unmounting background:", e);
    }
    activeUnmount = null;
  }
  const host = document.getElementById("iwonder-background-host");
  if (host) host.innerHTML = "";
}

export function renderDynamicBackground(index) {
  clearDynamicBackground();
  // 关键：清空 body 自带的遮挡背景色，保证 WebGL / Canvas / 万花筒通透裸露渲染
  document.body.style.removeProperty("background-image");
  document.body.style.backgroundColor = "transparent";
  const host = ensureBackgroundHost();

  const safeIndex = (index >= 0 && index < DYNAMIC_BACKGROUND_MODULES.length)
    ? index
    : Math.floor(Math.random() * DYNAMIC_BACKGROUND_MODULES.length);

  const target = DYNAMIC_BACKGROUND_MODULES[safeIndex];
  console.log(`[iWonder] Activated dynamic background: ${target.name}`);
  activeUnmount = target.mount(host);
  return target;
}

/**
 * (m + n) 取 1 随机算法
 */
export async function selectRandomBackground(imagePath = "", imageNameList = []) {
  const m = Array.isArray(imageNameList) ? imageNameList.length : 0;
  const n = DYNAMIC_BACKGROUND_MODULES.length; // 5

  if (!imagePath || m === 0) {
    // 纯动态五选一
    const dynIndex = Math.floor(Math.random() * n);
    renderDynamicBackground(dynIndex);
    return { type: "dynamic", index: dynIndex, meta: DYNAMIC_BACKGROUND_MODULES[dynIndex] };
  }

  // (m + n) 取一
  const total = m + n;
  const pick = Math.floor(Math.random() * total);

  if (pick < m) {
    // 选中小图库图片
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
        document.body.style.backgroundColor = "rgba(107, 107, 107, 0.65)";
        document.body.style.backgroundImage = `url("${currentBlobUrl}")`;
        loadedViaHandle = true;
      }
    } catch (err) {
      console.warn("Could not read image via DirectoryHandle, fallback to direct path:", err);
    }

    if (!loadedViaHandle) {
      clearDynamicBackground();
      const fullPath = imagePath + chosenImage;
      document.body.style.backgroundColor = "rgba(107, 107, 107, 0.65)";
      document.body.style.backgroundImage = `url("file:///${fullPath}")`;
    }

    return { type: "image", index: pick, name: chosenImage };
  } else {
    // 选中动态背景套件
    const dynIndex = pick - m;
    renderDynamicBackground(dynIndex);
    return { type: "dynamic", index: dynIndex, meta: DYNAMIC_BACKGROUND_MODULES[dynIndex] };
  }
}
