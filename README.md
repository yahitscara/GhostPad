# Transparent Notebook

A lightweight, transparent overlay notebook for macOS. Perfect for taking notes while watching videos, reading documentation, or working with multiple windows.

## Features

- **Transparent Window**: Adjustable opacity (10-100%) so you can see what's behind it
- **Always On Top**: Stays visible over other applications
- **Dark Mode**: Toggle between light and dark themes with persistent preference
- **Minimal Interface**: Clean design with controls that appear only on hover
- **Auto-Save**: Automatically saves your work every 2 seconds once a file is opened
- **Obsidian Compatible**: Open and edit files from your Obsidian vault or any text files

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

### Setup

1. Clone this repository:
```bash
git clone https://github.com/yourusername/transparent-notebook.git
cd transparent-notebook
```

2. Install dependencies:
```bash
npm install
```

## Usage

Start the application:

```bash
npm start
```

## Keyboard Shortcuts

- **Cmd+O**: Open a file
- **Cmd+S**: Save the current file
- **Cmd+Q**: Quit the application

## How It Works

1. Launch the app - it opens with a blank note
2. Hover over the window to reveal the opacity slider, theme toggle, and control buttons
3. Click the sun/moon icon to switch between light and dark mode
4. Adjust transparency using the slider to see content behind the window
5. Start typing or open an existing file with Cmd+O
6. Files are auto-saved every 2 seconds after the first save

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
