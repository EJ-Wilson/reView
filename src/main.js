import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

/* Disabled while capture is fixed
const fs = require('fs');
import { paths, bins } from "ffmpeg-static-electron-forge";
import ffmpeg from "fluent-ffmpeg";

let ffmpegPath = "", ffprobePath = "";

if (process.env.NODE_ENV !== "development") {
  ffmpegPath = paths.ffmpegPath.replace("app.asar", "app.asar.unpacked");
  ffprobePath = paths.ffprobePath.replace("app.asar", "app.asar.unpacked");
} else {
  let ffmpegBinPaths = path.dirname(
    require.resolve("ffmpeg-static-electron-forge")
  );
  ffmpegBinPaths = path.resolve(process.cwd(), ffmpegBinPaths, "bin");
  ffmpegPath = path.join(ffmpegBinPaths, bins.ffmpegPath);
  ffprobePath = path.join(ffmpegBinPaths, bins.ffprobePath);
}

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

export default ffmpeg;*/

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.removeMenu();

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  //ipcMain.on('capture-video', captureVideo);
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

/*
* Capture video from frames
*
*/
/* Disabled while to be fixed later
async function captureVideo (event, frames, frameRate, filepath) {
  const videoFile = path.join(filepath, 'output.mp4');
    const tempFramesFolder = path.join(__dirname, 'frames');
    
    // Create temporary folder for frame images
    if (!fs.existsSync(tempFramesFolder)) {
        fs.mkdirSync(tempFramesFolder);
    }

    // Write frames to disk as PNG files
    frames.forEach((frame, index) => {
        const framePath = path.join(tempFramesFolder, `frame${index.toString().padStart(3, '0')}.png`);
        const base64Data = frame.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(framePath, Buffer.from(base64Data, 'base64'));
    });

    // Use FFmpeg to convert PNG frames to MP4 video
    ffmpeg()
        .input(path.join(tempFramesFolder, 'frame%03d.png'))  // Pattern to match frames
        .inputOptions('-framerate ' + frameRate)  // Set frame rate
        .output(videoFile)
        .outputOptions('-pix_fmt yuv420p')  // Ensure compatibility for MP4
        .on('end', () => {
            cleanup(tempFramesFolder);  // Clean up temporary frames
        })
        .on('error', (err) => {
            console.error('Error during video generation:', err);
        })
        .run();
}

function cleanup(folder) {
  fs.rmSync(folder, { recursive: true, force: true });
}
*/

/*
* ***********************************************************************
*/
