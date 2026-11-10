/**
 * @file background/index.js
 * @description iWonder 背景管理调度器
 *
 * 现保留 2 套动态背景：
 * 1. particles: 动态粒子（全向膨胀动态粒子 + 径向深色层次底板 + 胶片微质感）
 * 2. aurora: 极光彩带（多层流体 SVG 缓慢飘移，每次打开随机配色）
 *
 * 调度规则：
 * - 未设置图片目录时：在 2 套动态背景中等概率二选一。
 * - 设置图片目录时：目录图片数 m，动态背景 2 套 (n=2)，全池 (m + 2) 等概率取一。
 */

const DYNAMIC_BACKGROUND_MODULES = [
  { id: "particles", name: "动态粒子", mount: mountRandomParticles },
  { id: "aurora", name: "极光彩带", mount: mountSvgAurora }
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

function clearDynamicBackground() {
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

function renderDynamicBackground(index) {
  clearDynamicBackground();
  document.body.style.removeProperty("background-image");
  document.body.style.backgroundColor = "transparent";
  const host = ensureBackgroundHost();

  const safeIndex = (index >= 0 && index < DYNAMIC_BACKGROUND_MODULES.length)
    ? index
    : Math.floor(Math.random() * DYNAMIC_BACKGROUND_MODULES.length);

  const target = DYNAMIC_BACKGROUND_MODULES[safeIndex];
  console.log(`[iWonder Tab] Activated dynamic background (${safeIndex + 1}/${DYNAMIC_BACKGROUND_MODULES.length}): ${target.name}`);
  activeUnmount = target.mount(host);
  return target;
}

/**
 * (m + n) 取 1 随机算法，当前 n = 2
 */
async function selectRandomBackground(imagePath = "", imageNameList = []) {
  const m = Array.isArray(imageNameList) ? imageNameList.length : 0;
  const n = DYNAMIC_BACKGROUND_MODULES.length;

  if (!imagePath || m === 0) {
    const dynIndex = Math.floor(Math.random() * n);
    renderDynamicBackground(dynIndex);
    return { type: "dynamic", index: dynIndex, meta: DYNAMIC_BACKGROUND_MODULES[dynIndex] };
  }

  const total = m + n;
  const pick = Math.floor(Math.random() * total);

  if (pick < m) {
    const chosenImage = imageNameList[pick];
    console.log(`[iWonder Tab] Selected local image (${pick + 1}/${m}): ${chosenImage}`);

    let loadedFromCache = false;
    try {
      const file = await getWallpaperFile(chosenImage);
      if (file instanceof Blob) {
        clearDynamicBackground();
        currentBlobUrl = URL.createObjectURL(file);
        document.body.style.backgroundColor = "rgba(107, 107, 107, 0.65)";
        document.body.style.backgroundImage = `url("${currentBlobUrl}")`;
        loadedFromCache = true;
      }
    } catch (err) {
      console.warn("[iWonder Tab] Cached wallpaper unavailable:", err.name, err.message);
    }

    if (!loadedFromCache) {
      console.info("[iWonder Tab] No cached wallpaper for this file, using a dynamic background.");
      const dynIndex = Math.floor(Math.random() * n);
      renderDynamicBackground(dynIndex);
      return { type: "dynamic", index: dynIndex, meta: DYNAMIC_BACKGROUND_MODULES[dynIndex], fallbackFrom: chosenImage };
    }

    return { type: "image", index: pick, name: chosenImage };
  }

  const dynIndex = pick - m;
  renderDynamicBackground(dynIndex);
  return { type: "dynamic", index: dynIndex, meta: DYNAMIC_BACKGROUND_MODULES[dynIndex] };
}
