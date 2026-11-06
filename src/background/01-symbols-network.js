/**
 * @file background/01-symbols-network.js
 * @description 04 几何符文矩阵 + 01 粒子引力网络深度融合
 * 
 * 核心设计（严格按需求调研重构）：
 * 1. 【彻底取消多余圆点】：网络连线直接以画布上现存的 `x` 和 `o` 符号作为节点，节点就是符号本身！
 * 2. 【引力吸附算法调研（基于 03-xposedbones 经典磁吸动力学）】：
 *    - 影响半径 R = 160px（经典人机工学舒适半径，覆盖周围 2~3 个符号格子）。
 *    - 阻尼衰减系数：二次平滑缓动衰减 `(1 - d / R)^2`，远离鼠标处衰减为 0，避免生硬截断。
 *    - 最大吸引位移限制在 18px 以内，既有肉眼可见的向心流动感，又彻底杜绝“坍缩成蜘蛛侠”的失控团聚。
 * 3. 【连线动态拉伸】：当 `x` 和 `o` 受到鼠标吸引轻微位移时，临近符号之间的引力连线随之动态拉伸、高亮，呈现出富有弹性张力的几何晶格网。
 */

export function mount(container) {
  let disposed = false;
  const themeList = [
    { name: "极光暗青", bg: "radial-gradient(ellipse at bottom, #092c28 0%, #061917 60%, #030d0c 100%)", stroke: "#4ade80", netColor: "rgba(74,222,128," },
    { name: "深海星渊", bg: "radial-gradient(ellipse at bottom, #0f2b38 0%, #091a24 60%, #040c12 100%)", stroke: "#38bdf8", netColor: "rgba(56,189,248," },
    { name: "暗夜幽紫", bg: "radial-gradient(ellipse at bottom, #241432 0%, #150a1e 60%, #09030e 100%)", stroke: "#c084fc", netColor: "rgba(192,132,252," },
    { name: "曜石暖金", bg: "radial-gradient(ellipse at bottom, #2b2214 0%, #181209 60%, #0d0803 100%)", stroke: "#fbbf24", netColor: "rgba(251,191,36," },
    { name: "鼠尾草绿", bg: "radial-gradient(ellipse at bottom, #162a26 0%, #0d1a17 60%, #060e0c 100%)", stroke: "#6ee7b7", netColor: "rgba(110,231,183," },
    { name: "暮色灰蓝", bg: "radial-gradient(ellipse at bottom, #1e2633 0%, #111620 60%, #080b11 100%)", stroke: "#94a3b8", netColor: "rgba(148,163,184," }
  ];

  const currentTheme = themeList[Math.floor(Math.random() * themeList.length)];

  // 单一画布，将符号与符号间的连线渲染在同一坐标空间中
  const canvas = document.createElement("canvas");
  canvas.style.cssText = `position:absolute;inset:0;width:100%;height:100%;z-index:1;display:block;background:${currentTheme.bg};pointer-events:none;`;
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  let target = { x: -9999, y: -9999 };

  // --- 符号元素数据定义（每个节点即为一个 x 或 o）---
  const symbols = [];
  const GRID_STEP = 42; // 点阵间距
  const ATTR_RADIUS = 160; // 调研得出的自然吸附半径
  const MAX_PULL = 18; // 最大吸附形变距离

  function initSymbols() {
    symbols.length = 0;
    const cols = Math.ceil(canvas.width / GRID_STEP);
    const rows = Math.ceil(canvas.height / GRID_STEP);

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        // 随机稀疏生成符号（概率约 1/4，留出空间呈现引力呼吸感）
        if (Math.random() < 0.28) {
          const type = Math.random() > 0.5 ? "o" : "x";
          const baseX = c * GRID_STEP + (Math.random() - 0.5) * 10;
          const baseY = r * GRID_STEP + (Math.random() - 0.5) * 10;
          const scale = (Math.random() * 0.4 + 0.8); // 尺寸微缩放

          symbols.push({
            type,
            originX: baseX,
            originY: baseY,
            x: baseX,
            y: baseY,
            scale,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.015,
            offsetX: 0,
            offsetY: 0,
            closest: [],
            active: 0
          });
        }
      }
    }

    // 为每个符号寻找最近的 4 个邻近符号，形成天然网络
    for (let i = 0; i < symbols.length; i++) {
      const s1 = symbols[i];
      const list = [];
      for (let j = 0; j < symbols.length; j++) {
        if (i !== j) {
          const s2 = symbols[j];
          const distSq = Math.pow(s1.originX - s2.originX, 2) + Math.pow(s1.originY - s2.originY, 2);
          list.push({ node: s2, distSq });
        }
      }
      list.sort((a, b) => a.distSq - b.distSq);
      s1.closest = list.slice(0, 4).map(item => item.node);
    }
  }

  function onMouseMove(e) {
    target.x = e.clientX;
    target.y = e.clientY;
  }
  function onMouseLeave() {
    target.x = -9999;
    target.y = -9999;
  }

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseleave", onMouseLeave);

  initSymbols();

  // 绘制 x 符号
  function drawCross(ctx, x, y, size, angle, stroke, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2.2;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(-size, -size);
    ctx.lineTo(size, size);
    ctx.moveTo(size, -size);
    ctx.lineTo(-size, size);
    ctx.stroke();
    ctx.restore();
  }

  // 绘制 o 符号
  function drawCircle(ctx, x, y, radius, stroke, alpha) {
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2.2;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  let animId;
  function loop() {
    if (disposed) return;
    if (document.hidden) {
      animId = requestAnimationFrame(loop);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();

    // 1. 物理运算：计算鼠标向心引力吸附（应用 03-xposedbones 的阻尼弹簧算法）
    for (let i = 0; i < symbols.length; i++) {
      const s = symbols[i];

      // 原版正弦轻微呼吸
      const idleWaveX = Math.sin((s.originX + now * 0.1) * 0.01) * 3;
      const idleWaveY = Math.sin((s.originY + now * 0.1) * 0.01) * 3;

      // 鼠标向心吸引
      const dx = target.x - (s.originX + s.offsetX);
      const dy = target.y - (s.originY + s.offsetY);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < ATTR_RADIUS && dist > 1) {
        // 二次缓动引力曲线：越靠近鼠标吸引越强，但平滑收敛在 MAX_PULL 内
        const ratio = 1 - dist / ATTR_RADIUS;
        const force = ratio * ratio * MAX_PULL;
        const targetOffX = (dx / dist) * force;
        const targetOffY = (dy / dist) * force;

        // 弹性缓动追踪
        s.offsetX += (targetOffX - s.offsetX) * 0.14;
        s.offsetY += (targetOffY - s.offsetY) * 0.14;
        s.active = ratio; // 激活高亮状态
      } else {
        // 移开鼠标后弹性回弹归位
        s.offsetX *= 0.88;
        s.offsetY *= 0.88;
        s.active *= 0.85;
      }

      s.x = s.originX + s.offsetX + idleWaveX;
      s.y = s.originY + s.offsetY + idleWaveY;
      s.rot += s.rotSpeed;
    }

    // 2. 渲染【符号间】的引力动态网络（直接连接 x 和 o，不再有任何圆点）
    for (let i = 0; i < symbols.length; i++) {
      const s = symbols[i];
      if (s.active > 0.04) {
        for (let k = 0; k < s.closest.length; k++) {
          const neighbor = s.closest[k];
          // 计算两邻接符号当前距离
          const cdx = s.x - neighbor.x;
          const cdy = s.y - neighbor.y;
          const connDist = Math.sqrt(cdx * cdx + cdy * cdy);

          // 仅在合理邻近跨度内连线，形成张力几何晶格
          if (connDist < GRID_STEP * 2.8) {
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(neighbor.x, neighbor.y);
            const lineAlpha = Math.min(s.active * 0.65, 0.45);
            ctx.strokeStyle = currentTheme.netColor + lineAlpha + ')';
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }
      }
    }

    // 3. 渲染符号本身（x 与 o）
    for (let i = 0; i < symbols.length; i++) {
      const s = symbols[i];
      const alpha = 0.45 + s.active * 0.45; // 被吸引时自然增亮
      if (s.type === "x") {
        drawCross(ctx, s.x, s.y, 6.5 * s.scale, s.rot, currentTheme.stroke, alpha);
      } else {
        drawCircle(ctx, s.x, s.y, 6.0 * s.scale, currentTheme.stroke, alpha);
      }
    }

    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  return function unmount() {
    disposed = true;
    cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseleave", onMouseLeave);
    container.innerHTML = "";
  };
}
