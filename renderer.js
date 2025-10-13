// State management
let currentFilePath = null;
let autoSaveInterval = null;
let hasUnsavedChanges = false;
let isDarkMode = false;

// DOM elements
const editor = document.getElementById('editor');
const opacitySlider = document.getElementById('opacity-slider');
const opacityValue = document.getElementById('opacity-value');
const openBtn = document.getElementById('open-btn');
const saveBtn = document.getElementById('save-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');
const menuBtn = document.getElementById('menu-btn');
const dropdownMenu = document.getElementById('dropdown-menu');
const minimizeBtn = document.getElementById('minimize-btn');
const maximizeBtn = document.getElementById('maximize-btn');
const closeBtn = document.getElementById('close-btn');
const app = document.getElementById('app');

// Initialize theme from localStorage
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDarkMode = true;
    document.body.classList.add('dark-mode');
    themeIcon.textContent = '🌙';
    themeLabel.textContent = 'Light Mode';
    updateBackgroundColor();
  }
}

// Theme toggle
themeToggleBtn.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode');
  themeIcon.textContent = isDarkMode ? '🌙' : '☀️';
  themeLabel.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  updateBackgroundColor();
  dropdownMenu.classList.remove('show');
});

// Update background color based on theme and opacity
function updateBackgroundColor() {
  const opacity = opacitySlider.value / 100;
  if (isDarkMode) {
    app.style.background = `rgba(30, 30, 30, ${opacity})`;
  } else {
    app.style.background = `rgba(255, 255, 255, ${opacity})`;
  }
}

// Opacity control
opacitySlider.addEventListener('input', (e) => {
  opacityValue.textContent = `${e.target.value}%`;
  updateBackgroundColor();
});

// Menu toggle
menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('show');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!dropdownMenu.contains(e.target) && e.target !== menuBtn) {
    dropdownMenu.classList.remove('show');
  }
});

// Track changes
editor.addEventListener('input', () => {
  hasUnsavedChanges = true;
});

// Open file
openBtn.addEventListener('click', async () => {
  const result = await window.electronAPI.openFile();
  if (result) {
    editor.value = result.content;
    currentFilePath = result.filePath;
    hasUnsavedChanges = false;
    startAutoSave();
  }
  dropdownMenu.classList.remove('show');
});

// Save file
saveBtn.addEventListener('click', async () => {
  await saveFile();
  dropdownMenu.classList.remove('show');
});

async function saveFile() {
  const content = editor.value;
  const filePath = await window.electronAPI.saveFile(currentFilePath, content);

  if (filePath) {
    currentFilePath = filePath;
    hasUnsavedChanges = false;
    startAutoSave();
  }
}

// Auto-save functionality
function startAutoSave() {
  // Clear existing interval
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }

  // Only set up auto-save if we have a file path
  if (currentFilePath) {
    autoSaveInterval = setInterval(async () => {
      if (hasUnsavedChanges) {
        const content = editor.value;
        await window.electronAPI.saveFile(currentFilePath, content);
        hasUnsavedChanges = false;
      }
    }, 2000); // Auto-save every 2 seconds
  }
}

// Window controls
minimizeBtn.addEventListener('click', () => {
  window.electronAPI.minimizeWindow();
});

maximizeBtn.addEventListener('click', () => {
  window.electronAPI.maximizeWindow();
});

closeBtn.addEventListener('click', () => {
  window.electronAPI.quitApp();
});

// Keyboard shortcuts
document.addEventListener('keydown', async (e) => {
  // Cmd+O - Open file
  if (e.metaKey && e.key === 'o') {
    e.preventDefault();
    openBtn.click();
  }

  // Cmd+S - Save file
  if (e.metaKey && e.key === 's') {
    e.preventDefault();
    await saveFile();
  }

  // Cmd+Q - Quit app
  if (e.metaKey && e.key === 'q') {
    e.preventDefault();
    window.electronAPI.quitApp();
  }
});

// Initialize theme and focus editor on load
initTheme();
editor.focus();
