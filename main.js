const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  Tray,
  Notification
} = require('electron');

const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

let mainWindow;
let tray = null;

// refresh flags
let autoRefreshGlobe = true;
let autoRefreshEastern = true;

// update interval (hours)
const UPDATE_INTERVAL_HOURS = 4;

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url.startsWith('https://bandwidth10.eastern-tele.com')) {
    event.preventDefault();
    callback(true); // trust this cert ONLY
  } else {
    callback(false);
  }
});
/* ======================
   WINDOW
====================== */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    title: 'Bandwidth Monitoring',
    icon: path.join(__dirname, 'assets/app.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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

/* ======================
   MENU
====================== */
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Check for Updates',
          click() {
            autoUpdater.checkForUpdates();
          }
        },
        { type: 'separator' },
        { role: 'quit' }
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
            mainWindow.webContents.send(
              'toggle-globe-refresh',
              autoRefreshGlobe
            );
          }
        },
        {
          label: 'Auto Refresh Eastern',
          type: 'checkbox',
          checked: true,
          click(menuItem) {
            autoRefreshEastern = menuItem.checked;
            mainWindow.webContents.send(
              'toggle-eastern-refresh',
              autoRefreshEastern
            );
          }
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click() {
            dialog.showMessageBox({
              title: 'Bandwidth Monitoring ' + app.getVersion(),
              message:
                `Bandwidth Monitoring Dashboard\n\n` +
                `Version ${app.getVersion()}\n\n` +
                `Developed by Joshua Grijaldo`
            });
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ======================
   TRAY
====================== */
function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/app.ico'));

  tray.setToolTip('Bandwidth Monitoring');

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Open',
        click() {
          mainWindow.show();
        }
      },
      {
        label: 'Check for Updates',
        click() {
          autoUpdater.checkForUpdates();
        }
      },
      { type: 'separator' },
      { role: 'quit' }
    ])
  );

  tray.on('double-click', () => mainWindow.show());
}

/* ======================
   AUTO UPDATER
====================== */
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = true;

// checking
autoUpdater.on('checking-for-update', () => {
  mainWindow.webContents.send('update-status', {
    status: 'checking'
  });
});

// available
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update-status', {
    status: 'downloading',
    percent: 0
  });
});

// progress
autoUpdater.on('download-progress', progress => {
  const percent = Math.round(progress.percent);

  mainWindow.setProgressBar(percent / 100);

  mainWindow.webContents.send('update-status', {
    status: 'downloading',
    percent
  });
});

// downloaded
autoUpdater.on('update-downloaded', () => {
  mainWindow.setProgressBar(-1);

  new Notification({
    title: 'Bandwidth Monitoring',
    body: 'Update downloaded. Restart to apply.'
  }).show();

  mainWindow.webContents.send('update-status', {
    status: 'ready'
  });
});

/* ======================
   IPC
====================== */
ipcMain.handle('restart-app', () => {
  autoUpdater.quitAndInstall();
});

/* ======================
   BACKGROUND UPDATE
====================== */
function startBackgroundUpdateCheck() {
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, UPDATE_INTERVAL_HOURS * 60 * 60 * 1000);
}

/* ======================
   APP
====================== */
app.whenReady().then(() => {
  createWindow();

  // 🔌 OFFLINE / LAN UPDATE SERVER
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: 'http://172.30.2.13:5500'
  });

  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
