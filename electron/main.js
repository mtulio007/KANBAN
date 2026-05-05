import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { join } from 'node:path';
let mainWindow = null;
const sqlitePath = join(process.cwd(), 'kanban-orders.sqlite');
const jsonDbPath = join(process.cwd(), 'kanban-db.json');
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        show: false,
        autoHideMenuBar: true,
        titleBarStyle: 'hiddenInset',
        ...(process.platform === 'linux' ? { icon: join(__dirname, '../../public/icon.jpg') } : {}),
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        }
    });
    mainWindow.on('ready-to-show', () => {
        mainWindow?.show();
    });
    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: 'deny' };
    });
    // Dev mode
    if (process.env.NODE_ENV === 'development' && !process.env.AUTOMATED) {
        mainWindow.webContents.openDevTools();
    }
    if (process.env.NODE_ENV === 'development' && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    }
    else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }
}
app.whenReady()
    .then(() => {
    if (process.platform === 'win32') {
        app.setAppUserModelId('com.kanbanclient.desktop');
    }
    // Atalho de teclado padrão do Electron para DevTools já funciona, não precisa de optimizer
    createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
})
    .catch((err) => console.error('Failed to launch app', err));
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
// Expose DB paths to preload
ipcMain.handle('get-db-paths', () => ({ sqlitePath, jsonDbPath }));
