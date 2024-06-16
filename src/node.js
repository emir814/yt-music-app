const { app, BrowserWindow, session } = require('electron');
const path = require('path');

let mainWindow;
let store;

async function createWindow() {
    // electron-store'u dinamik olarak içe aktar
    const Store = (await import('electron-store')).default;
    store = new Store();

    // pencere boyutunu ve tam ekran durumunu hatirlamak icin
    const windowState = store.get('windowState', { width: 800, height: 600, isMaximized: false });

    mainWindow = new BrowserWindow({
        width: windowState.width,
        height: windowState.height,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true, // Daha güvenli bir seçenek
            enableRemoteModule: true // Eğer uzaktan modülü kullanıyorsan
        },
        icon: path.join(__dirname, 'assets', 'icon.png'), // ikon dosyasi
        autoHideMenuBar: true // üstte file edit falan fistan yaziyor onu sil
    });

    // Pencereyi tam ekran yap
    if (windowState.isMaximized) {
        mainWindow.maximize();
    }

    // YouTube Music'i yükle
    mainWindow.loadURL('https://music.youtube.com/');

    // kapandigi zaman pencere boyutunu ve tam ekran durumunu kaydet
    mainWindow.on('close', () => {
        const { width, height } = mainWindow.getBounds();
        const isMaximized = mainWindow.isMaximized();
        store.set('windowState', { width, height, isMaximized });
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Reklam engelleyici
    const adBlockerList = [
        '*://*.doubleclick.net/*',
        '*://partner.googleadservices.com/*',
        '*://*.googlesyndication.com/*',
        '*://*.google-analytics.com/*',
        '*://*.adservice.google.com/*',
        '*://*.ads.youtube.com/*'
    ];

    session.defaultSession.webRequest.onBeforeRequest({ urls: adBlockerList }, (details, callback) => {
        callback({ cancel: true });
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
