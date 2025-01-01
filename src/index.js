let video = document.getElementById("video");
let canvas_live = document.getElementById("canvas_live");
let canvas_delay = document.getElementById("canvas_delay");
let capture_canvas = document.getElementById("capture_canvas");
let delay = document.getElementById("delay");
let mirror = document.getElementById("mirror");
let videoSelect = document.querySelector('select#videoSource');

// Window state
let state = "main";

// Array of [time, image data]
let buffer = [ ];
let extendedBuffer = [ ];

let frameRate = 60; //frames per second
let captureLength = document.getElementById("cpLen").value;

let isLiveView = false;
let isFullscreen = false;
let targetWidthRatio = 0.45;

let shouldRestart = false;

//Start video stream
getDevices().then(gotDevices).then(getStream);
//baseWidth = canvas_live.clientWidth;

//Detect mouse move
addEventListener("mousemove", (event) => {
    if (isFullscreen){
        displayFullscreenOverlay();
    }
});

let fullOverTimeoutID = -1;
async function displayFullscreenOverlay(){
    let fullOver = document.getElementById("fullscreen-overlay");
    fullOver.className = "fullscreen_overlay_mm";
    if (fullOverTimeoutID >= 0) {
        clearTimeout(fullOverTimeoutID);
        fullOverTimeoutID = -1;
    }
    fullOverTimeoutID = setTimeout(hideFullscreenOverlay, 1000);
}

function hideFullscreenOverlay(){
    let fullOver = document.getElementById("fullscreen-overlay");
    fullOver.className = "fullscreen_overlay";
}

//Log message to screen
function log(msg, length) {
    document.querySelector("#log").innerHTML = msg;
    if(length){
        setTimeout(function(){
            document.querySelector("#log").innerHTML = "";
        }, length);
    } else {
        setTimeout(function(){
            document.querySelector("#log").innerHTML = "";
        }, 1500);
    }
}


// On webcam change restart stream
document.querySelector("#videoSource").addEventListener('change', function() {
    shouldRestart = true;
});

addEventListener('resize', function(event) {
    shouldRestart = true;
});

//Switch between live video display and overlay modes
document.querySelector("#live-video").addEventListener('change', function() {
    if (this.checked) {
      //Set class to grid
      isLiveView = true;
      startLiveView();
    } else {
      //Set class to overlay
      isLiveView = false;
      endLiveView();
    }
});

function startLiveView(){
    document.querySelector("#canvas-container").className = "grid_2col";
    document.querySelector("#canvas_live").className = "";
    document.querySelector("#canvas_delay").className = "live_out";
    document.querySelector("#fullscreenContainer").className = "video_canvas";
}

function endLiveView(){
    document.querySelector("#canvas-container").className = "overlay";
    document.querySelector("#canvas_live").className = "overlay_bottom";
    document.querySelector("#canvas_delay").className = "";
    document.querySelector("#fullscreenContainer").className = "fullscreenContainer overlay_top video_canvas";
}

//Fullscreen app
document.querySelector('#fullscreenBtn').addEventListener('click', function (event) {
    endLiveView();
    isFullscreen = true;
    var fullscreenCntr = document.querySelector('#fullscreenContainer');
    if (fullscreenCntr.requestFullscreen) 
        fullscreenCntr.requestFullscreen();
    else if (fullscreenCntr.webkitRequestFullscreen) 
        fullscreenCntr.webkitRequestFullscreen();
    else if (fullscreenCntr.msRequestFullScreen) 
        fullscreenCntr.msRequestFullScreen();
});

document.querySelector('#close-fullscreen').addEventListener('click', function (event) {
    if (document.fullscreenElement) {
        document.exitFullscreen();
        isFullscreen = false;
        hideFullscreenOverlay();
        if (isLiveView) {
            startLiveView();
        } else {
            document.querySelector("#canvas_delay").className = "";
        }
    }
});

addEventListener("fullscreenchange", (event) => {

    if (!document.fullscreenElement) {
        isFullscreen = false;
        hideFullscreenOverlay();
        if (isLiveView) {
            startLiveView();
        } else {
            document.querySelector("#canvas_delay").className = "";
        }
    }

});

document.querySelector('#canvas_delay').addEventListener('click', function (event) {
    capture();    
});

document.querySelector('#capture').addEventListener('click', function (event) {
    capture();    
});

async function capture(){
    log("Capture unavailable", 1500);
    /* ------------- Disabled until fixed -----------------
    var filePath = "C:/Users/Edwar/Videos";

    var capture_context = capture_canvas.getContext('2d');
    capture_canvas.width = video.videoWidth;
    capture_canvas.height = video.videoHeight;

    var processedBuffer = [ ];
    buffer.forEach(element => {
        var frame = element[1];

        createImageBitmap(frame)
        .then(function(imgBitmap) {
            capture_context.drawImage(imgBitmap, 0, 0, video.videoHeight, video.videoHeight);
        });

        processedBuffer.push(capture_canvas.toDataURL('image/png'));
    });

    await window.electronAPI.captureVideo(processedBuffer, frameRate, filePath);
    */
}

// Open Settings
document.querySelector('#settings').addEventListener('click', function (event) {
    openSettings();
});

async function openSettings() {
    console.log(state);
    if (state == "main"){
        state = "settings";
        document.querySelector('#settings-screen').style.display = "flex";
        document.querySelector('#main-screen').style.display = "none";
        document.querySelector('#settings').innerHTML = "home";
    } else if (state == "settings") {
        state = "main";
        document.querySelector('#settings-screen').style.display = "none";
        document.querySelector('#main-screen').style.display = "flex";
        document.querySelector('#settings').innerHTML = "settings";
    }
    
    
}

function onUpdateCanvas() {
    var now = Date.now();
    var live_context = canvas_live.getContext('2d');


    var render_canvas = document.querySelector("#render_canvas");
    var render_context = render_canvas.getContext('2d');

    render_canvas.width = video.videoWidth;
    render_canvas.height = video.videoHeight;

    // Copy video to render canvas
    if (mirror.checked) {
        render_context.scale(-1,1);
        render_context.drawImage(video, 0, 0, -video.videoWidth, video.videoHeight);
    } else {
        render_context.scale(1,1);
        render_context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    }

    // Copy render canvas to buffers
    var data = render_context.getImageData(0, 0, video.videoWidth, video.videoHeight);
    buffer.push([now, data]);
    //extendedBuffer.push([now, render_canvas.toDataURL('image/png')]);

    // Discard out of date images and copy head of queue to output canvases
    while(buffer.length >= 2 && buffer[0][0] < now-delay.value*1000) {
        buffer.shift();
    }
    /*while(extendedBuffer.length >= 2 && extendedBuffer[0][0] < now-captureLength*1000){
        extendedBuffer.shift();
    }*/

    if (state=="main"){
        // Calculate the target size for the output canvases
        var container = document.querySelector("#container");
        var targetWidth = container.clientWidth * targetWidthRatio;

        var width = video.videoWidth;
        var height = video.videoHeight;

        if(!isFullscreen){
            height *= targetWidth/width;
            width = targetWidth;
        }

        canvas_live.width = width;
        canvas_live.height = height;
        canvas_delay.width = width;
        canvas_delay.height = height;

        // Copy render canvas to live appropriately scaling it
        createImageBitmap(data, {resizeWidth: width, resizeHeight: height}).then(function(imgBitmap) {
            live_context.drawImage(imgBitmap, 0, 0, width, height);
        });

        // Copy image data from buffer to the delayed canvas (including scaling it)
        var delay_context = canvas_delay.getContext('2d');
        createImageBitmap(buffer[0][1], {resizeWidth: width, resizeHeight: height}).then(function(imgBitmap) {
            delay_context.drawImage(imgBitmap, 0, 0, width, height);
        });
    }

    //Restart on request
    if (shouldRestart) {
        shouldRestart = false;
        getStream();
    } else {
        // Do it again
        window.setTimeout(onUpdateCanvas, 1/frameRate);
    }

}

// Start main loop once video is ready
video.oncanplay = function(event) {
    onUpdateCanvas();
};

function getStream() {
    // Attach webcam to video element
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }

    const videoSource = videoSelect.value;
    const constraints = {
        audio: false,
        video: {deviceId: videoSource ? {exact: videoSource} : undefined,
            width: { ideal: 1920 }, 
            height: { ideal: 1080 }, 
            frameRate: { ideal: 60 },
            facingMode: "user" 
        }
    };

    return navigator
    .mediaDevices
    .getUserMedia(constraints)
    .then(function(stream) {
        video.srcObject = stream;
        video.play();
        videoSelect.selectedIndex = [...videoSelect.options].
            findIndex(option => option.text === stream.getVideoTracks()[0].label);
    })
    .catch(function(err) {
        console.log("An error occurred: " + err);
    });
}

function getDevices() {
    // AFAICT in Safari this only gets default devices until gUM is called :/
    return navigator.mediaDevices.enumerateDevices();
}
  
function gotDevices(deviceInfos) {
    window.deviceInfos = deviceInfos; // make available to console
    for (const deviceInfo of deviceInfos) {
      const option = document.createElement('option');
      option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
        videoSelect.appendChild(option);
      }
    }
}