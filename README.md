# iWonder Tab

极简新标签页：搜索、动态背景，可选本地壁纸。

支持 Chrome、Edge、Firefox。

[English](README.en.md)

---

## 两种用法

### 1. 把主页或新标签页设为远程地址

适合不想装扩展、只想立刻用的情况。

将浏览器的**主页**或**新标签页**设为：

https://iwu.world/

| 浏览器 | 入口 |
| --- | --- |
| Chrome | 设置 → 启动时 / 外观 → 主页 |
| Edge | 设置 → 启动 / 新标签页 / 主页 |
| Firefox | 设置 → 主页 |

部分浏览器不允许把新标签页直接改成任意网址。若新标签页改不了，把**主页**设为上述地址，启动时打开主页即可。

远程页无法读取你电脑上的壁纸文件夹，只能使用站点上的动态背景。

### 2. 安装扩展（推荐）

扩展会接管新标签页：打开新标签即进入本页，不必再改主页。

先到 [Releases](https://github.com/ThymeiWonder/browser.tab.iWonder/releases/latest) 下载对应浏览器的 zip：

| 浏览器 | 文件 |
| --- | --- |
| Chrome | `itab-extension-chrome.zip` |
| Edge | `itab-extension-edge.zip` |
| Firefox | `itab-extension-firefox.zip` |

解压到任意目录，记住解压后的文件夹（其中应有 `manifest.json`）。

**Chrome**

1. 打开 `chrome://extensions/`
2. 打开 **开发者模式**
3. **加载已解压的扩展程序**，选择刚才解压出的文件夹
4. 打开新标签页

**Edge**

1. 打开 `edge://extensions/`
2. 打开 **开发人员模式**
3. **加载解压缩的扩展**，选择刚才解压出的文件夹
4. 打开新标签页

**Firefox**

1. 打开 `about:addons`
2. 点击齿轮 → **从文件安装附加组件**
3. 选择下载的 `itab-extension-firefox.zip`（也可选解压后的 `manifest.json`）
4. 打开新标签页

若商店尚未上架，Firefox 也可打开 `about:debugging#/runtime/this-firefox`，用 **临时载入附加组件** 选择 zip 内的 `manifest.json`。临时载入在重启后会卸下。

Firefox 不能用文件夹选择器读取本地壁纸，动态背景仍可用。

---

## 日常操作

| 操作 | 方法 |
| --- | --- |
| 显示搜索栏 | 按任意键（`Esc` 除外），或在空白处单击左键 / 右键 |
| 隐藏搜索栏 | 输入框为空时按 `Esc`、中键点击搜索栏，或在搜索栏外右键 |
| 切换搜索引擎 | 点击搜索栏左侧图标 |
| 执行搜索 | 输入后按 `Enter`，或点击右侧搜索图标 |

可选引擎：Google、Bing、百度、Google AI Mode。默认 Google，选择会保存在本地。

### 本地壁纸（扩展环境）

1. 将鼠标移到右侧搜索按钮上，左侧出现设置按钮
2. 打开设置
3. 粘贴图片**文件夹**的路径（不是单个文件）
4. 按回车或点击 confirm
5. 在弹出的文件窗口中再次选择同一文件夹
6. 允许浏览器查看该文件夹

之后每次刷新会从本地图片与两套动态背景中等概率选一。未设置文件夹时，只在两套动态背景中选择。

---

## 背景

- **动态粒子**：指针靠近时放大
- **彩带光带**：缓慢横移，每次打开随机配色

未指定壁纸目录时，刷新后二者等概率出现。指定目录后，目录内 `m` 张图片加上这 2 套，共 `m + 2` 中随机一张。

---

## 打包

```bash
python3 scripts/package-extensions.py
```

生成：

- `dist/itab-extension-chrome.zip`
- `dist/itab-extension-edge.zip`
- `dist/itab-extension-firefox.zip`

推送 `v*` 标签后，GitHub Actions 会将上述 zip 上传到 Release。

各浏览器清单：

- `src/extension/manifest.chrome.json`
- `src/extension/manifest.edge.json`
- `src/extension/manifest.firefox.json`

打包时会将对应文件复制为 zip 内的 `manifest.json`。本地加载 Chrome / Edge 时，目录中还需名为 `manifest.json` 的文件（与 Chrome 清单相同）。

---

## 预览

搜索框显示

<img width="2553" height="1230" alt="搜索框显示" src="https://github.com/user-attachments/assets/937359e6-c18c-47d0-8a15-753c032c52a2" />

搜索框隐藏

<img width="2559" height="1235" alt="搜索框隐藏" src="https://github.com/user-attachments/assets/260970ec-5f7e-4927-817b-c7a49c79493c" />

设置按钮

<img width="1355" height="848" alt="设置按钮" src="https://github.com/user-attachments/assets/e34ec12c-0b57-47b2-9126-03a7a0febc12" />

设置界面

<img width="1338" height="227" alt="设置界面" src="https://github.com/user-attachments/assets/a0fc9f71-436b-458e-ad40-338b921edc1b" />

输入图片文件夹路径

<img width="1423" height="210" alt="输入图片文件夹路径" src="https://github.com/user-attachments/assets/da92ac23-cc66-4936-9043-4833d39a48b2" />

再次选择文件夹

<img width="1482" height="892" alt="再次选择文件夹" src="https://github.com/user-attachments/assets/8d252bdf-8065-406b-83b3-39fbb45bb7d3" />

授权访问

<img width="558" height="153" alt="授权访问" src="https://github.com/user-attachments/assets/5af31252-9993-44e1-b4b3-c02313e1ecf2" />
