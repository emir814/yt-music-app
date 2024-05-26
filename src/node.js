const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    // pencere boyutunu hatirlamak icin
    let windowState = {};
    const windowStatePath = path.join(app.getPath('userData'), 'window-state.json');
    try {
        windowState = JSON.parse(fs.readFileSync(windowStatePath, 'utf8'));
    } catch (err) {
        // varsayilan pencere boyutu
        windowState = { width: 800, height: 600 };
    }

    mainWindow = new BrowserWindow({
        width: windowState.width || 800,
        height: windowState.height || 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // This is required to load extensions
        },
        icon: path.join(__dirname, 'assets', 'icon.png'), // ikon dosyasi
        autoHideMenuBar: true // üstte file edit falan fistan yaziyor onu sil
    });

    // ublock dahil et kardesim
    const extensionPath = path.join(__dirname, 'ublock');
    session.defaultSession.loadExtension(extensionPath)
        .then(() => {
            mainWindow.loadURL('https://music.youtube.com/');
        })
        .catch(err => console.log('Failed to load extension:', err));

    // kapandigi zaman pencere boyutunu kaydet
    mainWindow.on('close', () => {
        const { width, height } = mainWindow.getBounds();
        fs.writeFileSync(windowStatePath, JSON.stringify({ width, height }));
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
