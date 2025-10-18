const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const ytdlp = require('yt-dlp-exec');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const preloadPath = isDev
    ? path.join(__dirname, 'preload.js')
    : path.join(__dirname, 'dist/preload.js');

  console.log('Using preload script:', preloadPath);
  console.log('Preload file exists:', require('fs').existsSync(preloadPath));

  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      webSecurity: true // 啟用web安全，但允許file://協議
    },
  });

  win.once('ready-to-show', () => {
    console.log('Window ready to show');
    win.show();
  });

  win.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
  });

  // Forward renderer console messages to the main process terminal for debugging
  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[renderer console] level=${level} source=${sourceId} line=${line} msg=${message}`);
  });

  // Log renderer process crashes or unexpected exits
  win.webContents.on('render-process-gone', (event, details) => {
    console.error('Renderer process gone:', details);
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
  });

  if (isDev) {
    // 開發模式：載入Vite開發服務器
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // 生產模式：載入構建後的文件
    const indexPath = path.join(__dirname, 'dist/index.html');
    console.log('Loading production app from:', indexPath);
    win.loadFile(indexPath);
    // do not open DevTools in production by default
  }
}

Menu.setApplicationMenu(null);

ipcMain.handle('download', async (event, url, downloadPath) => {
  try {
    const outputPath = downloadPath ? `${downloadPath}/%(title)s.mp3` : '%(title)s.mp3';
    await ytdlp(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: outputPath
    });
    return '已下載';
  } catch (error) {
    return error.message;
  }
});

ipcMain.handle('chooseDownloadPath', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('search', async (event, query) => {
  // Use yt-dlp's built-in search as the primary search mechanism to avoid
  // ytsr parsing issues caused by frequent YouTube layout changes.
  try {
    const ytsearch = `ytsearch1:${query}`;
    console.log('Performing yt-dlp search for:', ytsearch);
    const stdout = await ytdlp(ytsearch, { dumpSingleJson: true, noWarnings: true });
    let data = stdout;
    if (typeof stdout === 'string') {
      try {
        data = JSON.parse(stdout);
      } catch (parseErr) {
        console.error('Failed to parse yt-dlp JSON output:', parseErr);
        return null;
      }
    }
    const entry = data && data.entries ? data.entries[0] : data;
    if (entry && entry.id) {
      return `https://www.youtube.com/watch?v=${entry.id}`;
    }
    console.error('yt-dlp search returned no usable entry:', data);
    return null;
  } catch (err) {
    console.error('yt-dlp search failed:', err);
    return null;
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});