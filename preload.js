const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onToggleGlobe: (callback) =>
        ipcRenderer.on('toggle-globe-refresh', (_, value) => callback(value)),

    onToggleEastern: (callback) =>
        ipcRenderer.on('toggle-eastern-refresh', (_, value) => callback(value)),
});

contextBridge.exposeInMainWorld('updater', {
    onStatus: (callback) =>
        ipcRenderer.on('update-status', (_, data) => callback(data)),

    restart: () => ipcRenderer.invoke('restart-app'),
});
