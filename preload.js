const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('updater', {
    onStatus: callback => ipcRenderer.on('update-status', (_, data) => callback(data)),
    restart: () => ipcRenderer.invoke('restart-app')
});
