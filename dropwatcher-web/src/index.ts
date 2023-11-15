import "./styles.scss";
import { process } from "./process";
import { WebUSBWrapper } from "./webusb";

async function startVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false, video: {
            width: { min: 0, ideal: 1920, max: 1920 },
            height: { min: 0, ideal: 1080, max: 1080 },
        }
    });
    (<HTMLInputElement>document.querySelector("#start-button")).disabled = true;
    const video = document.querySelector("#video-element") as HTMLVideoElement;
    video.srcObject = stream;
    const track = stream.getVideoTracks()[0];
    await track.applyConstraints({
        advanced: [{
            ...<any>{
                exposureTime: (<any>track.getCapabilities()).exposureTime.max,
            },
            ...{
                exposureMode: "manual",
                // width: 1920,
                // height: 1080,
            }
        }]
    });
    console.log(track.getCapabilities());
    console.log(track.getConstraints());
    console.log(track.getSettings());
    // const imageCapture = new ImageCapture(track);
    // for (let i = 0; i < 10; i++) {
    //     performance.mark("start");
    //     let frame = await imageCapture.grabFrame();
    //     performance.mark("end");
    //     console.log(frame);
    //     performance.measure("frame", "start", "end");
    // }
    // console.log(performance.getEntriesByType("measure").map(m => m.duration));

    let nr = 0;
    let cv = async () => {
        performance.mark("end");
        nr++;

        let frame = await createImageBitmap(video);

        // console.log(frame);
        var duration = performance.measure("frame", "start", "end").duration;
        // console.log(duration);
        // if (nr < 10) {
        performance.mark("start");
        video.requestVideoFrameCallback(cv);
        // } else {
        //     console.log(performance.getEntriesByType("measure").map(m => m.duration));
        // }
    };
    performance.mark("start");
    video.requestVideoFrameCallback(cv);
}
let webusb = new WebUSBWrapper();
async function startUsb() {

    await webusb.connect();
    webusb.addEventListener("data", (e: CustomEvent) => {
        console.log(e.detail);
    });
}

async function start() {
    startUsb();
}

async function sendWebcamReady() {
    await webusb.send(new Uint8Array(["R".charCodeAt(0)]));
}

const JETTING_SIGNAL_MODE_FALLING = 2;
const JETTING_SIGNAL_MODE_RISING = 3;

async function writeConfig() {
    let cameraReadyDelayTicks = ((parseFloat((<HTMLInputElement>document.querySelector("#config-camera-ready-delay")).value) *1000)/62.5);
    let strobeOnTicks: number = ((parseFloat((<HTMLInputElement>document.querySelector("#config-strobe-on")).value) *1000)/62.5)-2;
    let delayAfterJettingSignalTicks = ((parseFloat((<HTMLInputElement>document.querySelector("#config-delay-after-jetting-signal")).value)*1000/62.5));
    console.log(delayAfterJettingSignalTicks);
    let jettingSignalMode = JETTING_SIGNAL_MODE_RISING;
    let arr = new Uint8Array(8);
    let view = new DataView(arr.buffer);
    view.setUint8(0, "C".charCodeAt(0));
    view.setUint16(1, delayAfterJettingSignalTicks, true);
    view.setUint16(3, strobeOnTicks, true);
    view.setUint8(5, jettingSignalMode);
    view.setUint16(6, cameraReadyDelayTicks, true);
    await webusb.send(arr);
}

document.querySelector("#start-button").addEventListener("click", start);
document.querySelector("#test-button").addEventListener("click", sendWebcamReady);
document.querySelector("#write-config").addEventListener("click", writeConfig);



if (module.hot) {
    module.hot.accept("./process", () => {
        console.log("Accepting the updated process module!");
        // process();
    });
}