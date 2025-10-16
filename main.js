const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const https = require('https');

let mainWindow;
let isQuitting = false;

function createWindow() {
  // Set app name for macOS menu bar
  app.setName('GhostPad');

  mainWindow = new BrowserWindow({
    width: 400,
    height: 700,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  // Check for updates after window loads
  mainWindow.webContents.on('did-finish-load', () => {
    checkForUpdates();
  });
}

// Check for updates
async function checkForUpdates() {
  try {
    const latestRelease = await fetchLatestRelease();
    const currentVersion = app.getVersion();
    const latestVersion = latestRelease.tag_name.replace('v', '');

    if (latestVersion !== currentVersion) {
      // Send update notification to renderer
      mainWindow.webContents.send('update-available', {
        version: latestRelease.tag_name,
        url: latestRelease.html_url
      });
    }
  } catch (error) {
    // Silently fail - don't bother user if update check fails
    console.log('Update check failed:', error.message);
  }
}

// Fetch latest release from GitHub
function fetchLatestRelease() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/yahitscara/transparent-notebook/releases/latest',
      headers: {
        'User-Agent': 'GhostPad'
      }
    };

    https.get(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`GitHub API returned ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle file opening
ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt', 'md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled) {
    return null;
  }

  const filePath = result.filePaths[0];
  const content = await fs.readFile(filePath, 'utf-8');
  return { filePath, content };
});

// Handle file saving
ipcMain.handle('save-file', async (event, filePath, content) => {
  if (!filePath) {
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [
        { name: 'Markdown Files', extensions: ['md'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled) {
      return null;
    }

    filePath = result.filePath;
  }

  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
});

// Handle window controls
ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

// Handle quit
ipcMain.on('quit-app', async () => {
  await handleQuitAttempt();
});

// Handle quit attempt with unsaved changes check
async function handleQuitAttempt() {
  if (isQuitting) {
    return; // Already quitting, don't loop
  }

  // Request editor state from renderer
  return new Promise((resolve) => {
    mainWindow.webContents.send('get-editor-state');

    // Listen for response
    ipcMain.once('editor-state-response', async (event, hasChanges, filePath, content) => {
      if (!hasChanges) {
        isQuitting = true;
        app.quit();
        resolve();
        return;
      }

      // Show confirmation dialog
      const choice = await dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['Save and Quit', 'Quit Without Saving', 'Cancel'],
        defaultId: 0,
        cancelId: 2,
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. What would you like to do?',
        detail: filePath || 'New unsaved file'
      });

      if (choice.response === 0) {
        // Save and Quit
        try {
          if (filePath) {
            await fs.writeFile(filePath, content, 'utf-8');
          } else {
            // Need to show save dialog
            const result = await dialog.showSaveDialog(mainWindow, {
              filters: [
                { name: 'Markdown Files', extensions: ['md'] },
                { name: 'Text Files', extensions: ['txt'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });

            if (!result.canceled) {
              await fs.writeFile(result.filePath, content, 'utf-8');
            } else {
              resolve();
              return; // User canceled save dialog, don't quit
            }
          }
          isQuitting = true;
          app.quit();
        } catch (error) {
          console.error('Error saving file:', error);
        }
      } else if (choice.response === 1) {
        // Quit Without Saving
        isQuitting = true;
        app.quit();
      }
      // If response === 2 (Cancel), do nothing
      resolve();
    });
  });
}

// Handle window close button and menu quit
app.on('before-quit', async (event) => {
  if (!mainWindow || isQuitting) return;

  event.preventDefault();
  await handleQuitAttempt();
});

// Handle manual update check
ipcMain.handle('check-for-updates', async () => {
  try {
    const latestRelease = await fetchLatestRelease();
    const currentVersion = app.getVersion();
    const latestVersion = latestRelease.tag_name.replace('v', '');

    return {
      currentVersion,
      latestVersion,
      updateAvailable: latestVersion !== currentVersion,
      url: latestRelease.html_url
    };
  } catch (error) {
    return { error: error.message };
  }
});

// Open external URL
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});
