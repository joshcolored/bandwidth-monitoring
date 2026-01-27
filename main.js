const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');


let mainWindow;

// refresh flags
let autoRefreshGlobe = true;
let autoRefreshEastern = true;


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    title: 'Bandwidth Monitoring',
    webPreferences: {
      icon: path.join(__dirname, 'assets/app.ico'),
      preload: __dirname + '/preload.js',
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.once('ready-to-show', () => {
    mainWindow.setTitle('Bandwidth Monitoring');
  });
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [{ role: 'quit' }]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Auto Refresh Globe',
          type: 'checkbox',
          checked: true,
          click(menuItem) {
            autoRefreshGlobe = menuItem.checked;
            mainWindow.webContents.send('toggle-globe-refresh', autoRefreshGlobe);
          }
        },
        {
          label: 'Auto Refresh Eastern',
          type: 'checkbox',
          checked: true,
          click(menuItem) {
            autoRefreshEastern = menuItem.checked;
            mainWindow.webContents.send('toggle-eastern-refresh', autoRefreshEastern);
          }
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'close' }]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click() {
            require('electron').dialog.showMessageBox({
              title: 'Bandwidth Monitoring Dashboard',
              message: 'Bandwidth Monitoring Dashboard\nVersion 1.2\n\nDeveloped by Joshua Grijaldo\n\nAll rights reserved.'
            });
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = true;

app.whenReady().then(() => {
  createWindow();

  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: 'A new version is downloading in the background.'
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'question',
    buttons: ['Restart Now', 'Later'],
    defaultId: 0,
    message: 'Update ready. Restart to apply?'
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
