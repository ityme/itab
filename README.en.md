# iWonder Tab

A minimal new-tab page: search, an animated background, and optional local wallpapers.

Works in Chrome, Edge, and Firefox.

[中文](README.md)

---

## Two ways to use it

### 1. Point the home page or new tab at the hosted site

Use this if you do not want to install an extension.

Set the browser **home page** or **new tab** to:

https://iwu.world/

| Browser | Where |
| --- | --- |
| Chrome | Settings → On startup / Appearance → Home |
| Edge | Settings → Start, home, and new tabs |
| Firefox | Settings → Home |

Some browsers will not let a new tab be an arbitrary URL. If that setting is locked, set **Home** to the address above and open the home page on startup.

The hosted page cannot read folders on your computer. Only the built-in animated backgrounds are available.

### 2. Install the extension (recommended)

The extension replaces the new-tab page. Opening a new tab loads this UI; you do not need to change the home page.

Download the zip for your browser from [Releases](https://github.com/ThymeiWonder/browser.tab.iWonder/releases/latest):

| Browser | File |
| --- | --- |
| Chrome | `itab-extension-chrome.zip` |
| Edge | `itab-extension-edge.zip` |
| Firefox | `itab-extension-firefox.zip` |

Unzip it anywhere and keep the folder that contains `manifest.json`.

**Chrome**

1. Open `chrome://extensions/`
2. Turn on **Developer mode**
3. **Load unpacked** and choose the unzipped folder
4. Open a new tab

**Edge**

1. Open `edge://extensions/`
2. Turn on **Developer mode**
3. **Load unpacked** and choose the unzipped folder
4. Open a new tab

**Firefox**

1. Open `about:addons`
2. Open the gear menu → **Install Add-on From File**
3. Choose `itab-extension-firefox.zip` (or `manifest.json` inside the unzipped folder)
4. Open a new tab

If it is not on AMO yet, you can also open `about:debugging#/runtime/this-firefox` and **Load Temporary Add-on** with `manifest.json` from the zip. A temporary add-on is removed when Firefox restarts.

Firefox cannot use the folder picker for local wallpapers. The animated backgrounds still work.

---

## Daily use

| Action | How |
| --- | --- |
| Show the search bar | Press any key except `Esc`, or click empty space with the left or right button |
| Hide the search bar | With an empty input, press `Esc`, middle-click the bar, or right-click outside it |
| Switch engine | Click the icon on the left |
| Search | Press `Enter`, or click the search icon on the right |

Engines: Google, Bing, Baidu, Google AI Mode. Google is the default. The choice is stored locally.

### Local wallpapers (extension)

1. Hover the search button on the right; settings appears to its left
2. Open settings
3. Paste a **folder** path (not a single file)
4. Press Enter or click confirm
5. In the file dialog, choose the same folder again
6. Allow the browser to view the folder

Each reload then picks equally from your images plus the two animated backgrounds. With no folder set, it picks one of the two animations.

---

## Backgrounds

- **Particles**: grow when the pointer is near
- **Ribbon bands**: slow drift, random palette on each load

With no wallpaper folder, a reload picks one of the two. With `m` local images, it picks from `m + 2`.

---

## Packaging

```bash
python3 scripts/package-extensions.py
```

This writes:

- `dist/itab-extension-chrome.zip`
- `dist/itab-extension-edge.zip`
- `dist/itab-extension-firefox.zip`

Pushing a `v*` tag uploads those zips to the GitHub Release.

Manifests:

- `src/extension/manifest.chrome.json`
- `src/extension/manifest.edge.json`
- `src/extension/manifest.firefox.json`

Packaging copies the matching file to `manifest.json` inside each zip. Unpacked Chrome / Edge loading still needs `src/extension/manifest.json` (same as the Chrome file).

---

## Screenshots

Search bar visible

<img width="2553" height="1230" alt="Search bar visible" src="https://github.com/user-attachments/assets/937359e6-c18c-47d0-8a15-753c032c52a2" />

Search bar hidden

<img width="2559" height="1235" alt="Search bar hidden" src="https://github.com/user-attachments/assets/260970ec-5f7e-4927-817b-c7a49c79493c" />

Settings button

<img width="1355" height="848" alt="Settings button" src="https://github.com/user-attachments/assets/e34ec12c-0b57-47b2-9126-03a7a0febc12" />

Settings panel

<img width="1338" height="227" alt="Settings panel" src="https://github.com/user-attachments/assets/a0fc9f71-436b-458e-ad40-338b921edc1b" />

Paste a wallpaper folder path

<img width="1423" height="210" alt="Paste wallpaper folder path" src="https://github.com/user-attachments/assets/da92ac23-cc66-4936-9043-4833d39a48b2" />

Pick the folder again

<img width="1482" height="892" alt="Pick the folder again" src="https://github.com/user-attachments/assets/8d252bdf-8065-406b-83b3-39fbb45bb7d3" />

Allow access

<img width="558" height="153" alt="Allow access" src="https://github.com/user-attachments/assets/5af31252-9993-44e1-b4b3-c02313e1ecf2" />
