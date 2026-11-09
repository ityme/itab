# iWonder Tab

极简浏览器新标签页。打开新标签即可搜索；背景是动态粒子或彩带，也可改用本地壁纸。

支持 Chrome、Edge、Firefox。

[English](README.en.md)

## 使用

扩展根目录是 `src/extension/`，不要选外层 `src/`。

### Chrome

1. 打开 `chrome://extensions/`
2. 打开右上角 **开发者模式**
3. **加载已解压的扩展程序** → 选择 `src/extension/`
4. 打开新标签页

或下载 Release 里的 `itab-extension-chrome.zip`，解压后再按同样方式加载该文件夹。

上架：Chrome 网上应用店上传 `itab-extension-chrome.zip`。

### Edge

1. 打开 `edge://extensions/`
2. 打开左侧 **开发人员模式**
3. **加载解压缩的扩展** → 选择 `src/extension/`
4. 打开新标签页

或下载 Release 里的 `itab-extension-edge.zip`，解压后再加载。

上架：Microsoft Edge 加载项上传 `itab-extension-edge.zip`。

### Firefox

1. 打开 `about:debugging#/runtime/this-firefox`
2. **临时载入附加组件** → 选择 `src/extension/manifest.firefox.json`
3. 打开新标签页

或下载 `itab-extension-firefox.zip`：`about:addons` → 齿轮 → **从文件安装附加组件**。

临时载入在重启 Firefox 后会卸下。长期使用需要 [AMO](https://addons.mozilla.org/) 签名，上传 `itab-extension-firefox.zip`。

Firefox 不支持用文件夹选择器读本地壁纸，动态背景仍可用。

### 搜索

| 操作 | 做法 |
| --- | --- |
| 显示搜索栏 | 按任意键（`Esc` 除外）；或在空白处左键 / 右键单击 |
| 隐藏搜索栏 | 输入框为空时按 `Esc`、中键点搜索栏，或在搜索栏外右键 |
| 切换引擎 | 点搜索栏左侧图标 |
| 搜索 | 输入后按 `Enter`，或点右侧搜索图标 |

引擎：Bing、Google、百度、Google AI Mode。选择会记住。

### 本地壁纸

1. 鼠标悬停右侧搜索按钮，左侧出现设置
2. 点设置
3. 粘贴图片**文件夹**路径（不是单个文件），例如 `F:\pictures\wallpaper`
4. 回车或点 confirm
5. 在弹出的文件窗口里再选一次同一个文件夹
6. 授权浏览器查看文件

之后每次刷新会从本地图片和 2 套动态背景里等概率选一张。不设文件夹时，只在两套动态背景里二选一。

### 源码预览

可直接双击 `src/extension/tab.html`。完整新标签页行为仍建议用扩展加载。

## 背景

- 动态粒子：鼠标靠近会放大
- 彩带光带：缓慢横移，每次打开随机配色

未指定壁纸目录时，刷新后两套等概率出现。指定目录后，目录里 `m` 张图加上这 2 套，一共 `m + 2` 里随机一张。

## 打包与发版

```bash
python3 scripts/package-extensions.py
```

生成：

- `dist/itab-extension-chrome.zip`
- `dist/itab-extension-edge.zip`
- `dist/itab-extension-firefox.zip`

打 `v*` 标签后，GitHub Actions 会把这三个 zip 传到 Release。

三种浏览器各有一份清单，打包时拷成 zip 内的 `manifest.json`：

- `src/extension/manifest.chrome.json`
- `src/extension/manifest.edge.json`
- `src/extension/manifest.firefox.json`

本地加载 Chrome / Edge 还需要目录里的 `manifest.json`（与 Chrome 那份相同）。

## 预览

搜索框显示：

<img width="2553" height="1230" alt="搜索框显示" src="https://github.com/user-attachments/assets/937359e6-c18c-47d0-8a15-753c032c52a2" />

搜索框隐藏：

<img width="2559" height="1235" alt="搜索框隐藏" src="https://github.com/user-attachments/assets/260970ec-5f7e-4927-817b-c7a49c79493c" />

设置按钮：

<img width="1355" height="848" alt="设置按钮" src="https://github.com/user-attachments/assets/e34ec12c-0b57-47b2-9126-03a7a0febc12" />

设置界面：

<img width="1338" height="227" alt="设置界面" src="https://github.com/user-attachments/assets/a0fc9f71-436b-458e-ad40-338b921edc1b" />

输入图片文件夹路径：

<img width="1423" height="210" alt="输入图片文件夹路径" src="https://github.com/user-attachments/assets/da92ac23-cc66-4936-9043-4833d39a48b2" />

再次选择文件夹：

<img width="1482" height="892" alt="再次选择文件夹" src="https://github.com/user-attachments/assets/8d252bdf-8065-406b-83b3-39fbb45bb7d3" />

授权访问：

<img width="558" height="153" alt="授权访问" src="https://github.com/user-attachments/assets/5af31252-9993-44e1-b4b3-c02313e1ecf2" />
