/**
 * @file background/index.js
 * @description iWonder 背景管理调度器
 * 
 * 现固化采用：
 * 05-random-particles: 05 全向膨胀动态粒子系统 + 静态深色底板 + 胶片微质感
 * 
 * 调度规则：
 * - 未设置图片目录时：直接渲染高质感 05 全向膨胀动态粒子背景。
 * - 设置图片目录时：目录图片数 m，动态背景 1 套 (n=1)，全池 (m + 1) 等概率取一。
 */

import { mount as mountRandomParticles } from "./05-random-particles.js";
import { getDirectoryHandle, verifyPermission } from "./storage.js";

export const DYNAMIC_BACKGROUND_MODULES = [
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

export function renderDynamicBackground(index = 0) {
  clearDynamicBackground();
  document.body.style.removeProperty("background-image");
  document.body.style.backgroundColor = "transparent";
  const host = ensureBackgroundHost();

  const safeIndex = (index >= 0 && index < DYNAMIC_BACKGROUND_MODULES.length)
    ? index
    : 0;

  const target = DYNAMIC_BACKGROUND_MODULES[safeIndex];
  console.log(`[iWonder] Activated dynamic background: ${target.name}`);
  activeUnmount = target.mount(host);
  return target;
}

/**
 * (m + n) 取 1 随机算法，当前 n = 1
 */
export async function selectRandomBackground(imagePath = "", imageNameList = []) {
  const m = Array.isArray(imageNameList) ? imageNameList.length : 0;
  const n = DYNAMIC_BACKGROUND_MODULES.length; // 1

  if (!imagePath || m === 0) {
    // 纯动态背景
    renderDynamicBackground(0);
    return { type: "dynamic", index: 0, meta: DYNAMIC_BACKGROUND_MODULES[0] };
  }

  // (m + 1) 取一
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
    renderDynamicBackground(0);
    return { type: "dynamic", index: 0, meta: DYNAMIC_BACKGROUND_MODULES[0] };
  }
}
