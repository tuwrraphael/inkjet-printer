import "./styles.scss";
import { process } from "./process";
import { WebUSBWrapper } from "./webusb";


async function start() {
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
    let webusb = new WebUSBWrapper();
    await webusb.connect();
    webusb.addEventListener("data", (e: CustomEvent) => {
        console.log(e.detail);
    });
    await webusb.send(new Uint8Array([0x01, 0x02, 0x03]));
}

document.querySelector("#start-button").addEventListener("click", start);



if (module.hot) {
    module.hot.accept("./process", () => {
        console.log("Accepting the updated process module!");
        // process();
    });
}