const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  quitApp: () => ipcRenderer.send('quit-app'),
  checkUnsavedChanges: () => ipcRenderer.invoke('check-unsaved-changes'),
  getEditorState: (callback) => ipcRenderer.on('get-editor-state', callback),
  sendEditorState: (hasChanges, filePath, content) =>
    ipcRenderer.send('editor-state-response', hasChanges, filePath, content),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, data) => callback(data)),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
