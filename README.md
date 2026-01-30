# 📊 Bandwidth Monitoring Dashboard

![Electron](https://img.shields.io/badge/Electron-28.x-47848F?logo=electron&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?logo=windows&logoColor=white)
![Version](https://img.shields.io/badge/Version-1.2.8-blue)
![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-Proprietary-red)

A **Windows Application** that consolidates multiple ISP bandwidth monitoring portals into **one unified, always-on dashboard**, designed for IT, NOC, and internal monitoring environments.

---

## ✨ Features

### 📶 Multi-ISP Monitoring
- **PLDT**
- **Globe**
- **Eastern Telecom**

### 🖥 Dashboard Views
- Individual ISP tabs
- **All Bandwidth** combined view

### 🔄 Smart Auto Refresh
- Per-ISP auto refresh toggles
- Refresh-safe tab switching
- No unnecessary reloads

### ⏱ PLDT Session Protection
- Neutralizes PLDT inactivity timeout
- Prevents 15-minute forced logout
- Safe iframe reload loop

### 📅 PLDT Time Range Selector
- 6H / 1D / 7D / 14D / 30D
- Selected range persists after reload
- Auto-refresh respects selected range

### 🔍 Zoom Controls
- Zoom In
- Zoom Out
- Reset Zoom

### 🕒 Status Overlays
- “Last Updated” timestamp
- Refresh status (Active / Paused)

### 📥 Auto Update System
- Manual **Check for Updates**
- Background update checks
- In-app progress modal
- Tray notification when update is ready
- Supports **offline / LAN updates**

---

## 🛠 Tech Stack
- Electron
- Node.js
- HTML / CSS / JavaScript
- electron-builder
- electron-updater

---

## 🖼 Screenshots

Place screenshots inside a `screenshots/` folder:

```
screenshots/
├── dashboard.png
├── all-bandwidth.png
└── update-progress.png
```

---

## 🏗 Build

```bash
npm install
npm run build
```

---

## 🧠 Versioning

Semantic Versioning:

```
MAJOR.MINOR.PATCH
```

Example:
- 1.2.8 → current release
- 1.2.9 → bugfix
- 1.3.0 → feature update

---

## 📝 Release Notes Template

```md
## 🚀 Bandwidth Monitoring vX.Y.Z

### ✨ New Features
-

### 🛠 Improvements
-

### 🐞 Bug Fixes
-

### ⚠️ Notes
-
```

---

## 👨‍💻 Author

**Joshua Grijaldo**

---

## 📄 License

Proprietary / Internal Use Only  
All rights reserved.
