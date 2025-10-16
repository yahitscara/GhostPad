# Transparent Notebook

[![GitHub Release](https://img.shields.io/github/v/release/yahitscara/transparent-notebook)](https://github.com/yahitscara/transparent-notebook/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/yahitscara/transparent-notebook/total)](https://github.com/yahitscara/transparent-notebook/releases)

A lightweight, transparent overlay notebook for macOS, Windows, and Linux. Perfect for taking notes while watching videos, reading documentation, or working with multiple windows.

## Features

- **Transparent Window**: Adjustable opacity (10-100%) so you can see what's behind it
- **Always On Top**: Stays visible over other applications
- **Dark Mode**: Toggle between light and dark themes with persistent preference
- **Minimal Interface**: Clean design with controls that appear only on hover
- **Auto-Save**: Automatically saves your work every 2 seconds once a file is opened
- **Obsidian Compatible**: Open and edit files from your Obsidian vault or any text files

## Installation

### For End Users (Pre-built Apps)

Want to just use the app? Download the latest release for your platform:

#### macOS
1. **[Download for macOS (.dmg)](https://github.com/yahitscara/transparent-notebook/releases/latest/download/Transparent-Notebook-1.0.0-arm64.dmg)** (Apple Silicon) or **[Intel version](https://github.com/yahitscara/transparent-notebook/releases/latest)** (see releases page)
2. Alternatively, go to the [Releases page](https://github.com/yahitscara/transparent-notebook/releases/latest)
3. Open the downloaded file
4. Drag "Transparent Notebook" to your Applications folder
5. **Right-click** the app and select "Open" (only needed first time to bypass security)
6. Click "Open" in the security dialog

**Troubleshooting**: If the app won't open, go to System Preferences > Security & Privacy > General, and click "Open Anyway"

#### Windows
1. **[Download Installer (.exe)](https://github.com/yahitscara/transparent-notebook/releases/latest)** - Choose from the releases page:
   - `Transparent-Notebook-Setup-1.0.0.exe` (installer version)
   - `Transparent-Notebook-1.0.0.exe` (portable version - no install needed)
2. Or visit the [Releases page](https://github.com/yahitscara/transparent-notebook/releases/latest) for all options
3. Run the downloaded file
4. If Windows Defender SmartScreen appears, click "More info" → "Run anyway"
5. Follow the installation wizard (installer version) or just run it (portable version)

**Troubleshooting**: The security warning is normal for apps not from the Microsoft Store. The app is open source and doesn't require code signing.

#### Linux (Ubuntu/Debian)
1. **[Download AppImage](https://github.com/yahitscara/transparent-notebook/releases/latest)** (universal) or **[Download .deb](https://github.com/yahitscara/transparent-notebook/releases/latest)** (Ubuntu/Debian)
2. Or visit the [Releases page](https://github.com/yahitscara/transparent-notebook/releases/latest) for all options:
   - `Transparent-Notebook-1.0.0.AppImage` (works on all distros)
   - `transparent-notebook_1.0.0_amd64.deb` (Debian/Ubuntu)

**For AppImage**:
```bash
chmod +x Transparent-Notebook-1.0.0.AppImage
./Transparent-Notebook-1.0.0.AppImage
```

**For .deb package**:
```bash
sudo dpkg -i transparent-notebook_1.0.0_amd64.deb
```

**Troubleshooting**: If transparency doesn't work, enable compositor in your window manager settings.

---

### For Developers (Build from Source)

#### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

#### Setup

1. Clone this repository:
```bash
git clone https://github.com/yahitscara/transparent-notebook.git
cd transparent-notebook
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Running in Development

Start the application:

```bash
npm start
```

### Building for Distribution

Build for your platform or all platforms at once:

```bash
# Build for your current platform
npm run build

# Build for specific platforms
npm run build:mac      # macOS only
npm run build:win      # Windows only
npm run build:linux    # Linux only
npm run build:all      # All platforms
```

#### macOS

**Builds created:**
- `Transparent Notebook.app` - Application bundle (in `dist/mac/`)
- `Transparent Notebook-1.0.0.dmg` - Disk image installer
- `Transparent Notebook-1.0.0-mac.zip` - Compressed archive

**Installation:**
1. Find `Transparent Notebook.app` in the `dist/mac/` folder
2. Drag it to your Applications folder
3. Double-click to run

**First launch:** macOS may ask you to allow the app in System Preferences > Security & Privacy (right-click > Open to bypass Gatekeeper).

#### Windows

**Builds created:**
- `Transparent Notebook Setup 1.0.0.exe` - Installer (in `dist/`)
- `Transparent Notebook 1.0.0.exe` - Portable executable

**Installation:**
- **Installer**: Run the setup and follow prompts. Creates Start Menu shortcuts.
- **Portable**: Run directly, no installation needed. Great for USB drives.

**First launch:** Windows Defender SmartScreen may warn about an unrecognized app. Click "More info" > "Run anyway" (the app is not code-signed).

**Keyboard shortcuts:** Use `Ctrl` instead of `Cmd` (Ctrl+O, Ctrl+S, Ctrl+Q).

#### Linux

**Builds created:**
- `Transparent-Notebook-1.0.0.AppImage` - Universal Linux app (in `dist/`)
- `transparent-notebook_1.0.0_amd64.deb` - Debian/Ubuntu package

**Installation:**
- **AppImage**:
  ```bash
  chmod +x Transparent-Notebook-1.0.0.AppImage
  ./Transparent-Notebook-1.0.0.AppImage
  ```
- **Debian/Ubuntu**:
  ```bash
  sudo dpkg -i transparent-notebook_1.0.0_amd64.deb
  ```

**Window manager notes:**
- Transparency works best with compositing window managers (GNOME, KDE, Xfce with compositor enabled)
- "Always on top" behavior may vary depending on your desktop environment
- Some tiling window managers may need additional configuration

**Keyboard shortcuts:** Use `Ctrl` instead of `Cmd` (Ctrl+O, Ctrl+S, Ctrl+Q).

## Keyboard Shortcuts

- **Cmd+O** (macOS) / **Ctrl+O** (Windows/Linux): Open a file
- **Cmd+S** (macOS) / **Ctrl+S** (Windows/Linux): Save the current file
- **Cmd+Q** (macOS) / **Ctrl+Q** (Windows/Linux): Quit the application

## How It Works

1. Launch the app - it opens with a blank note
2. Hover over the window to reveal the title bar with hamburger menu and window controls
3. Click the hamburger menu (☰) to access:
   - Opacity slider to adjust transparency
   - Theme toggle to switch between light and dark mode
   - Open and Save file options
4. Use the window controls (minimize, maximize, close) in the top-right
5. The entire title bar is draggable - click and hold to move the window
6. Start typing or open an existing file with Cmd+O (or Ctrl+O on Windows/Linux)
7. Files are auto-saved every 2 seconds after the first save

## Platform-Specific Behavior

### macOS
- Transparent windows work seamlessly
- Window stays on top of all apps except fullscreen applications
- Native look and feel with system fonts

### Windows
- Transparency works with Windows 10/11 Aero effects
- Always-on-top works across all applications
- Uses Ctrl key for shortcuts instead of Cmd

### Linux
- Best experience with compositing window managers (GNOME, KDE Plasma, Cinnamon, etc.)
- On Xfce, enable compositor in Window Manager Tweaks
- Tiling WMs (i3, Sway) may need manual "float" and "sticky" configuration
- Uses Ctrl key for shortcuts instead of Cmd

## File Handling

- Opens with a blank, unsaved note on launch
- Use "Open" or Cmd+O to browse for files (supports .txt, .md, and all file types)
- First save prompts for a location
- Subsequent changes auto-save to the opened file
- One file at a time (multi-tab support planned for v2)

## Future Enhancements (v2)

- Markdown rendering
- File browser for quick navigation
- Configurable fonts
- Multi-tab support
- Custom window size/position memory

## License

MIT
