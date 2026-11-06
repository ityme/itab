/**
 * @file background/index.js
 * @description iWonder 背景管理模块
 * - 支持 5 套动态背景 (n=5)
 * - 当指定图片目录时，图片列表 (m) 与 5 套背景合并进行等概率随机：(m + n) 取 1
 * - 未指定图片目录时，直接在 5 套背景中五选一
 */

import { mount as mountSymbolsNetwork } from "./01-symbols-network.js";
import { mount as mountKaleidoscope } from "./02-kaleidoscope.js";
import { mount as mountSakuraWebGL } from "./03-sakura-webgl.js";
import { mount as mountNoiseNeuralGrid } from "./04-noise-neural-grid.js";
import { mount as mountRandomParticles } from "./05-random-particles.js";

export const DYNAMIC_BACKGROUND_MODULES = [
  { id: "symbols-network", name: "几何符文与引力网络", mount: mountSymbolsNetwork },
  { id: "kaleidoscope", name: "对称折射万花筒", mount: mountKaleidoscope },
  { id: "sakura-webgl", name: "3D景深漂浮樱花", mount: mountSakuraWebGL },
  { id: "noise-neural-grid", name: "胶片噪点与神经光栅", mount: mountNoiseNeuralGrid },
  { id: "random-particles", name: "全向膨胀随机粒子", mount: mountRandomParticles }
];

let activeUnmount = null;

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
  if (typeof activeUnmount === "function") {
    try {
      activeUnmount();
    } catch (e) {
      console.error("Error unmounting dynamic background:", e);
    }
    activeUnmount = null;
  }
  const host = document.getElementById("iwonder-background-host");
  if (host) host.innerHTML = "";
}

export function renderDynamicBackground(index) {
  clearDynamicBackground();
  const host = ensureBackgroundHost();
  document.body.style.removeProperty("background-image");

  const safeIndex = (index >= 0 && index < DYNAMIC_BACKGROUND_MODULES.length)
    ? index
    : Math.floor(Math.random() * DYNAMIC_BACKGROUND_MODULES.length);

  const target = DYNAMIC_BACKGROUND_MODULES[safeIndex];
  console.log(`[iWonder] Activated dynamic background (${safeIndex + 1}/${DYNAMIC_BACKGROUND_MODULES.length}): ${target.name}`);
  activeUnmount = target.mount(host);
  return target;
}

/**
 * 核心调度：
 * 1. 未指定图片目录时：直接从 5 套动态背景中等概率五选一。
 * 2. 指定图片目录时：图片数量 m，动态背景 5 套 (n=5)。
 *    总候选池为 m + 5，整体等概率 (m + n) 取 1。
 *    - 抽中 0 ~ m-1：展示对应本地图片；
 *    - 抽中 m ~ m+4：清除图片背景，装载对应的动态 Canvas 背景。
 */
export function selectRandomBackground(imagePath = "", imageNameList = []) {
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
    clearDynamicBackground();
    const chosenImage = imageNameList[pick];
    const fullPath = imagePath + chosenImage;
    console.log(`[iWonder] Selected local image (${pick + 1}/${m}): ${fullPath}`);
    document.body.style.backgroundImage = `url("file:///${fullPath}")`;
    return { type: "image", index: pick, path: fullPath };
  } else {
    // 选中动态背景套件
    const dynIndex = pick - m;
    renderDynamicBackground(dynIndex);
    return { type: "dynamic", index: dynIndex, meta: DYNAMIC_BACKGROUND_MODULES[dynIndex] };
  }
}
