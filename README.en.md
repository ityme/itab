# iWonder Tab

A small browser new-tab page. Open a tab, search, and keep a quiet animated background — or your own wallpapers.

Works in Chrome, Edge, and Firefox.

[中文](README.md)

## Use

The extension root is `src/extension/`. Do not select the outer `src/` folder.

### Chrome

1. Open `chrome://extensions/`
2. Turn on **Developer mode**
3. **Load unpacked** → choose `src/extension/`
4. Open a new tab

Or download `itab-extension-chrome.zip` from Releases, unzip it, and load that folder.

Store upload: Chrome Web Store, `itab-extension-chrome.zip`.

### Edge

1. Open `edge://extensions/`
2. Turn on **Developer mode**
3. **Load unpacked** → choose `src/extension/`
4. Open a new tab

Or download `itab-extension-edge.zip`, unzip it, and load that folder.

Store upload: Microsoft Edge Add-ons, `itab-extension-edge.zip`.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on** → choose `src/extension/manifest.firefox.json`
3. Open a new tab

Or install `itab-extension-firefox.zip` from `about:addons` → gear → **Install Add-on From File**.

A temporary add-on is removed when Firefox restarts. For lasting installs, sign it on [AMO](https://addons.mozilla.org/) with `itab-extension-firefox.zip`.

Firefox cannot use the folder picker for local wallpapers. The animated backgrounds still work.

### Search

| Action | How |
| --- | --- |
| Show the bar | Press any key except `Esc`, or click empty space with left / right mouse |
| Hide the bar | With an empty input, press `Esc`, middle-click the bar, or right-click outside it |
| Switch engine | Click the icon on the left |
| Search | Press `Enter`, or click the search icon |

Engines: Bing, Google, Baidu, Google AI Mode. The choice is saved.

### Local wallpapers

1. Hover the search button on the right; settings appears to its left
2. Open settings
3. Paste a **folder** path (not a file), for example `F:\pictures\wallpaper`
4. Press Enter or click confirm
5. In the file dialog, pick the same folder again
6. Allow the browser to view the files

Each reload then picks equally from your images plus the 2 animated backgrounds. With no folder set, it picks one of the two animations.

### Source preview

You can open `src/extension/tab.html` directly. For full new-tab behavior, load it as an extension.

## Backgrounds

- Particles: grow when the pointer is near
- Ribbon bands: slow drift, random palette on each load

With no wallpaper folder, refresh picks one of the two. With `m` local images, it picks from `m + 2`.

## Pack and release

```bash
python3 scripts/package-extensions.py
```

This writes:

- `dist/itab-extension-chrome.zip`
- `dist/itab-extension-edge.zip`
- `dist/itab-extension-firefox.zip`

Pushing a `v*` tag uploads those zips to the GitHub Release.

Each browser has its own manifest. Packaging copies it to `manifest.json` inside the zip:

- `src/extension/manifest.chrome.json`
- `src/extension/manifest.edge.json`
- `src/extension/manifest.firefox.json`

Chrome / Edge unpacked loading still needs `src/extension/manifest.json` (same as the Chrome file).

## Screenshots

Search bar visible:

<img width="2553" height="1230" alt="Search bar visible" src="https://github.com/user-attachments/assets/937359e6-c18c-47d0-8a15-753c032c52a2" />

Search bar hidden:

<img width="2559" height="1235" alt="Search bar hidden" src="https://github.com/user-attachments/assets/260970ec-5f7e-4927-817b-c7a49c79493c" />

Settings button:

<img width="1355" height="848" alt="Settings button" src="https://github.com/user-attachments/assets/e34ec12c-0b57-47b2-9126-03a7a0febc12" />

Settings panel:

<img width="1338" height="227" alt="Settings panel" src="https://github.com/user-attachments/assets/a0fc9f71-436b-458e-ad40-338b921edc1b" />

Paste a wallpaper folder path:

<img width="1423" height="210" alt="Paste wallpaper folder path" src="https://github.com/user-attachments/assets/da92ac23-cc66-4936-9043-4833d39a48b2" />

Pick the folder again:

<img width="1482" height="892" alt="Pick the folder again" src="https://github.com/user-attachments/assets/8d252bdf-8065-406b-83b3-39fbb45bb7d3" />

Allow access:

<img width="558" height="153" alt="Allow access" src="https://github.com/user-attachments/assets/5af31252-9993-44e1-b4b3-c02313e1ecf2" />
