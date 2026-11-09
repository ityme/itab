# iWonder Tab

这是一个简洁、美观且功能强大的浏览器起始页项目，旨在提供一个干净、可定制的界面来开始您的网页浏览。

## ✨ 功能特性

- **🧩 Edge 新标签页扩展**: 支持作为 Edge 浏览器扩展直接载入，接管新标签页。
- **🖼️ 混合双模背景 (m + n 随机)**:
  - **默认状态（未指定图片目录）**：每次刷新在 2 套动态背景中**等概率二选一**。
  - **自定义状态（指定图片目录）**：本地图片池（数量 $m$）与 2 套动态背景（数量 $n=2$）合并，每次刷新在 $(m + 2)$ 中**等概率选一**。
- **🌌 2 套动态背景套件**:
  1. `05-random-particles`: 05 全向膨胀动态粒子（鼠标感应膨胀，径向深色层次底板，细腻胶片微颗粒）
  2. `04-svg-aurora`: 04 彩带光带（多层 SVG 缓慢横移；每次打开随机一套彩带与背景配色）
- **🔍 多引擎搜索**: 在必应、谷歌、百度和 Google AI Mode 之间无缝切换，持久化保存偏好。
- **🔮 毛玻璃界面**: 现代轻量玻璃拟态搜索框，不干扰底层动态背景渲染。

## 🚀 安装说明

### 作为 Edge / Chrome 浏览器扩展载入
1. 在 Edge 浏览器地址栏输入 `edge://extensions/` 并回车。
2. 开启左侧的 **「开发人员模式」** 开关。
3. 点击 **「加载解压缩的扩展」**，选择本项目的 `src/` 文件夹。
4. 打开新标签页，即可享受极速动态背景。

### 搜索栏可见性

#### 显示搜索栏

- **键盘**: 按下任意键 (`Esc` 除外)。
- **鼠标 (左键)**: 在页面的任何空白处单击。
- **鼠标 (右键)**: 在搜索栏隐藏时，在页面任意位置右键单击。

#### 隐藏搜索栏

- **键盘**: 按下 `Esc` 键 (仅当搜索输入框为空时有效)。
- **鼠标 (中键)**: 在搜索栏上单击鼠标滚轮 (仅当搜索输入框为空时有效)。
- **鼠标 (右键)**: 在搜索栏可见且输入框为空时，在页面**外部**任意位置右键单击。

### 搜索操作

- **切换搜索引擎**: 单击搜索栏左侧的搜索引擎图标打开下拉菜单，然后选择您想要的引擎。
- **执行搜索**: 输入您的查询并按 `Enter` 或单击右侧的搜索图标。

### 设置✨✨
1. 鼠标悬停右侧搜索按钮, 会在其左侧弹出设置按钮.
2. 点击设置按钮会弹出如预览图4的界面. 
3. 在windows文件管理器中复制你自己的图片文件目录地址(是目录而非文件的绝对地址), 以我的图片文件目录路径`F:\000-share\picture\wallpaper`为例
4. 粘贴在`设置图3`的输入框中, 之后点击回车键或点击`confirm`按钮.
5. 之后会弹出一个文件窗口如`设置图4`, 在弹窗中再次选择上文提到的`F:\000-share\picture\wallpaper`. , 之后点击`选择文件夹`.
6. 之后会弹窗如`设置图5`, 点击`查看文件`.
7. 此时背景图片设置完成.

## 🛠️ 安装说明
1. [点击下载 `itab.html`](https://github.com/ThymeiWonder/browser.tab.iWonder/releases/latest)。
2. 将下载的 `itab.html` 文件设置为浏览器主页。

源码预览可直接打开 `src/tab.html`。发布版将 `src/` 打成 Edge / Chrome 扩展 zip（见 `.github/workflows/CICD.yaml`）。
---

## 👁️ 预览
1. **搜索框显示时效果:**
<img width="2553" height="1230" alt="image" src="https://github.com/user-attachments/assets/937359e6-c18c-47d0-8a15-753c032c52a2" />


2. **搜索框隐藏时效果:**
<img width="2559" height="1235" alt="image" src="https://github.com/user-attachments/assets/260970ec-5f7e-4927-817b-c7a49c79493c" />

3. **设置图1-设置按钮:**
<img width="1355" height="848" alt="image" src="https://github.com/user-attachments/assets/e34ec12c-0b57-47b2-9126-03a7a0febc12" />

4. **设置图2-设置界面:**
<img width="1338" height="227" alt="image" src="https://github.com/user-attachments/assets/a0fc9f71-436b-458e-ad40-338b921edc1b" />

5. **设置图3-输入图片文件夹路径后点击确认:**
<img width="1423" height="210" alt="image" src="https://github.com/user-attachments/assets/da92ac23-cc66-4936-9043-4833d39a48b2" />

6. **设置图4-弹窗后再次选择图片文件夹路径:**
<img width="1482" height="892" alt="image" src="https://github.com/user-attachments/assets/8d252bdf-8065-406b-83b3-39fbb45bb7d3" />

7. **设置图5-授权浏览器访问图片文件夹路径:**
<img width="558" height="153" alt="image" src="https://github.com/user-attachments/assets/5af31252-9993-44e1-b4b3-c02313e1ecf2" />
