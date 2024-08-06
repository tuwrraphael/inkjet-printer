import "./styles.scss";
import { AppComponent, AppComponentTagName } from "./components/AppComponent/AppComponent";
import { PrinterUSB } from "./printer-usb";
import { Store } from "./state/Store";
import { MovementStage } from "./movement-stage";
import { TaskRunnerSynchronization } from "./print-tasks/TaskRunnerSynchronization";
import { CameraAccess } from "./camera-access";
import { CameraType } from "./CameraType";
import { SlicerClient } from "./slicer/SlicerClient";

// if ("serviceWorker" in navigator) {
//     window.addEventListener("load", async () => {
//         navigator.serviceWorker.register("./sw.js").then(registration => {
//         }).catch(registrationError => {
//             console.log('SW registration failed: ', registrationError);
//         });
//     });
// }

// import {
//     ChangeDropwatcherParametersRequest,
//     GetPrinterSystemStateRequest,
//     PressureControlDirection,
//     PrinterSystemStateResponse,
//     PrinterRequest,
//     CameraFrameRequest,
//     PressureControlChangeParametersRequest,
//     PressureControlParameters,
//     PressureControlAlgorithm
// } from "./proto/compiled";
// const appState = {
//     connected: false,
//     printerSystemState: <PrinterSystemStateResponse>null
// };

// function changeAppState(newState: Partial<typeof appState>) {
//     Object.assign(appState, newState);
//     refresh();
// }

// const timer_clock = 96000000;
// const timer_tick_us = (1 / timer_clock) * 1000000;

// const strobeOnInput = document.querySelector("#config-strobe-on") as HTMLInputElement;
// const delayAfterJettingSignalInput = document.querySelector("#config-delay-after-jetting-signal") as HTMLInputElement;
// const connectUsbButton = document.querySelector("#connect-usb-button") as HTMLButtonElement;
// const stateDebug = document.querySelector("#state-debug") as HTMLPreElement;
// const targetPressureInput = document.querySelector("#target-pressure") as HTMLInputElement;
// const pressureControlButton = document.querySelector("#pressure-control") as HTMLButtonElement;


// strobeOnInput.min = (1 * timer_tick_us).toString();
// strobeOnInput.max = (0xFFDF * timer_tick_us).toString();
// strobeOnInput.step = timer_tick_us.toString();
// strobeOnInput.value = (Math.ceil(2 / timer_tick_us) * timer_tick_us).toString();

// strobeOnInput.addEventListener("input", (e) => {
//     let us = parseFloat(strobeOnInput.value);
//     console.log("ticks: " + us / timer_tick_us);
// });

// delayAfterJettingSignalInput.min = (1 * timer_tick_us).toString();
// delayAfterJettingSignalInput.max = (0xFFDF * timer_tick_us).toString();
// delayAfterJettingSignalInput.step = timer_tick_us.toString();
// delayAfterJettingSignalInput.value = (Math.ceil(10 / timer_tick_us) * timer_tick_us).toString();


let printerUSB = PrinterUSB.getInstance();
printerUSB.start().catch(console.error);

let movementStage = MovementStage.getInstance();
movementStage.start().catch(console.error);

let store = Store.getInstance();

let slicerClient = SlicerClient.getInstance();
slicerClient.sendToStore().catch(console.error);

TaskRunnerSynchronization.getInstance();
CameraAccess.getInstance(CameraType.Dropwatcher);

setInterval(async () => {
    if (store.state?.printerSystemState.usbConnected) {
        await printerUSB.sendPrinterSystemStateRequest();
    }
}, 1000);

// async function sendWebcamReady() {
//     let printerRequest = new PrinterRequest();
//     printerRequest.cameraFrameRequest = new CameraFrameRequest();
//     await webusb.send(PrinterRequest.encode(printerRequest).finish());
// }


// async function startVideo() {
//     const stream = await navigator.mediaDevices.getUserMedia({
//         audio: false, video: {
//             width: { min: 0, ideal: 1920, max: 1920 },
//             height: { min: 0, ideal: 1080, max: 1080 },
//         }
//     });
//     (<HTMLInputElement>document.querySelector("#start-button")).disabled = true;
//     const video = document.querySelector("#video-element") as HTMLVideoElement;
//     video.srcObject = stream;
//     const track = stream.getVideoTracks()[0];
//     await track.applyConstraints({
//         advanced: [{
//             ...<any>{
//                 exposureTime: 1000,
//             },
//             ...{
//                 exposureMode: "manual",
//                 // width: 1920,
//                 // height: 1080,
//             }
//         }]
//     });
//     console.log(track.getCapabilities());
//     console.log(track.getConstraints());
//     console.log(track.getSettings());
//     // const imageCapture = new ImageCapture(track);
//     // for (let i = 0; i < 10; i++) {
//     //     performance.mark("start");
//     //     let frame = await imageCapture.grabFrame();
//     //     performance.mark("end");
//     //     console.log(frame);
//     //     performance.measure("frame", "start", "end");
//     // }
//     // console.log(performance.getEntriesByType("measure").map(m => m.duration));

//     let nr = 0;
//     let cv = async () => {
//         performance.mark("end");
//         nr++;

//         let frame = await createImageBitmap(video);

//         // console.log(frame); warning causes hang
//         var duration = performance.measure("frame", "start", "end").duration;
//         // console.log(duration);
//         // if (nr < 10) {
//         performance.mark("start");
//         video.requestVideoFrameCallback(cv);
//         if ((<HTMLInputElement>document.querySelector("#strobe-on")).checked) {
//             sendWebcamReady();
//         }
//         // } else {
//         //     console.log(performance.getEntriesByType("measure").map(m => m.duration));
//         // }
//     };
//     performance.mark("start");
//     video.requestVideoFrameCallback(cv);
// }

// webusb.addEventListener("connected", () => {
//     changeAppState({ connected: true });
// });
// webusb.addEventListener("disconnected", () => {
//     changeAppState({ connected: false });
// });
// function refresh() {
//     connectUsbButton.disabled = appState.connected;
//     stateDebug.textContent = JSON.stringify(appState, null, 2);
// }
// async function startUsb() {

//     await webusb.connect();
//     webusb.addEventListener("data", (e: CustomEvent) => {
//         let received: DataView = e.detail;
//         let response = PrinterSystemStateResponse.decode(new Uint8Array(received.buffer));
//         changeAppState({ printerSystemState: response });
//     });
// }

// async function start() {
//     await startVideo();

// }




// const JETTING_SIGNAL_MODE_FALLING = 2;
// const JETTING_SIGNAL_MODE_RISING = 3;

// async function writeConfig() {
//     // let cameraReadyDelayTicks = ((parseFloat((<HTMLInputElement>document.querySelector("#config-camera-ready-delay")).value) * 1000) / 62.5);
//     // let strobeOnTicks: number = ((parseFloat((<HTMLInputElement>document.querySelector("#config-strobe-on")).value) * 1000) / 62.5) - 2;
//     // let delayAfterJettingSignalTicks = ((parseFloat((<HTMLInputElement>document.querySelector("#config-delay-after-jetting-signal")).value) * 1000 / 62.5));
//     // console.log(delayAfterJettingSignalTicks);
//     // let jettingSignalMode = JETTING_SIGNAL_MODE_RISING;
//     // let arr = new Uint8Array(8);
//     // let view = new DataView(arr.buffer);
//     // view.setUint8(0, "C".charCodeAt(0));
//     // view.setUint16(1, delayAfterJettingSignalTicks, true);
//     // view.setUint16(3, strobeOnTicks, true);
//     // view.setUint8(5, jettingSignalMode);
//     // view.setUint16(6, cameraReadyDelayTicks, true);

//     let request = new PrinterRequest();
//     request.changeDropwatcherParametersRequest = new ChangeDropwatcherParametersRequest();
//     request.changeDropwatcherParametersRequest.delayNanos = (parseFloat(delayAfterJettingSignalInput.value) * 1000);
//     request.changeDropwatcherParametersRequest.flashOnTimeNanos = (parseFloat(strobeOnInput.value) * 1000);



//     let bytes = PrinterRequest.encode(request).finish();

//     console.log(bytes);


//     await webusb.send(bytes);
// }



// document.querySelector("#start-button").addEventListener("click", start);
// document.querySelector("#test-button").addEventListener("click", sendWebcamReady);
// document.querySelector("#write-config").addEventListener("click", writeConfig);

// connectUsbButton.addEventListener("click", async () => {
//     await webusb.connect();
// });



// async function autoStart() {
//     if (await webusb.hasDevices()) {
//         await startUsb();
//     }
// }

// autoStart().catch(console.error);

let appComponent: AppComponent = <AppComponent>document.createElement(AppComponentTagName);
document.body.appendChild(appComponent);
if (module.hot) {
    module.hot.accept("./components/AppComponent/AppComponent", async () => {
        document.body.removeChild(appComponent);
        appComponent = <AppComponent>document.createElement(AppComponentTagName);
        document.body.appendChild(appComponent);
    });
}

// pressureControlButton.addEventListener("click", async () => {

//     let request = new PrinterRequest();
//     let changeParametersRequest = new PressureControlChangeParametersRequest();
//     let parameters = new PressureControlParameters();
//     parameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT;
//     parameters.direction = PressureControlDirection.PressureControlDirection_VACUUM;
//     parameters.feedPwm = 0.5;
//     parameters.limitPressure = -10.0;
//     parameters.feedTime = 5;
//     parameters.targetPressure = parseFloat(targetPressureInput.value);
//     parameters.enabled = true;
//     changeParametersRequest.parameters = parameters;
//     request.pressureControlChangeParametersRequest = changeParametersRequest;
//     await webusb.send(PrinterRequest.encode(request).finish());
// });