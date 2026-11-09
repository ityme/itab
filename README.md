# iWonder Tab

这是一个简洁、美观且功能强大的浏览器起始页项目，旨在提供一个干净、可定制的界面来开始您的网页浏览。

## ✨ 功能特性

- **🧩 浏览器新标签页扩展**: 支持 Chrome / Edge / Firefox，接管新标签页。
- **🖼️ 混合双模背景 (m + n 随机)**:
  - **默认状态（未指定图片目录）**：每次刷新在 2 套动态背景中**等概率二选一**。
  - **自定义状态（指定图片目录）**：本地图片池（数量 $m$）与 2 套动态背景（数量 $n=2$）合并，每次刷新在 $(m + 2)$ 中**等概率选一**。
- **🌌 2 套动态背景套件**:
  1. `05-random-particles`: 05 全向膨胀动态粒子（鼠标感应膨胀，径向深色层次底板，细腻胶片微颗粒）
  2. `04-svg-aurora`: 04 彩带光带（多层 SVG 缓慢横移；每次打开随机一套彩带与背景配色）
- **🔍 多引擎搜索**: 在必应、谷歌、百度和 Google AI Mode 之间无缝切换，持久化保存偏好。
- **🔮 毛玻璃界面**: 现代轻量玻璃拟态搜索框，不干扰底层动态背景渲染。

## 🚀 安装说明

扩展根目录是 `src/extension/`，不要选择外层 `src/`。三种浏览器各有一份清单，打包时原样放进 zip 并命名为 `manifest.json`：

- `src/extension/manifest.chrome.json`
- `src/extension/manifest.edge.json`
- `src/extension/manifest.firefox.json`

本地加载 Chrome / Edge 时，目录里还需要一份名为 `manifest.json` 的文件（内容与 `manifest.chrome.json` 相同）。

开发时也可在仓库根目录运行 `python3 scripts/package-extensions.py`，生成：

- `dist/itab-extension-chrome.zip`
- `dist/itab-extension-edge.zip`
- `dist/itab-extension-firefox.zip`

### Chrome
1. 打开 `chrome://extensions/`。
2. 打开右上角 **「开发者模式」**。
3. 点击 **「加载已解压的扩展程序」**，选择本仓库的 `src/extension/`。
4. 或下载 Release 里的 `itab-extension-chrome.zip`，解压后再按同样方式加载该文件夹。
5. 打开新标签页即可。

上架：Chrome 网上应用店需要开发者账号，上传 `itab-extension-chrome.zip`。

### Edge
1. 打开 `edge://extensions/`。
2. 打开左侧 **「开发人员模式」**。
3. 点击 **「加载解压缩的扩展」**，选择本仓库的 `src/extension/`。
4. 或下载 Release 里的 `itab-extension-edge.zip`，解压后再加载该文件夹。
5. 打开新标签页即可。

上架：Microsoft Edge 加载项需要合作中心账号，上传 `itab-extension-edge.zip`。

### Firefox
1. 打开 `about:debugging#/runtime/this-firefox`。
2. 点击 **「临时载入附加组件」**，选择 `src/extension/manifest.firefox.json`（Firefox 允许指定清单文件）。
3. 或下载 Release 里的 `itab-extension-firefox.zip`：打开 `about:addons` → 齿轮 → **「从文件安装附加组件」**。
4. 打开新标签页即可。

说明：临时载入在重启 Firefox 后会卸下。长期使用需要 [addons.mozilla.org](https://addons.mozilla.org/) 签名；上传的是 `itab-extension-firefox.zip`（包内 `manifest.json` 已含 gecko id）。

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

## 🛠️ 源码预览与发版

源码预览可直接打开 `src/extension/tab.html`。

打 `v*` 标签后，GitHub Actions 会打包三个 zip 并上传到 Release：`itab-extension-chrome.zip`、`itab-extension-edge.zip`、`itab-extension-firefox.zip`。
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
