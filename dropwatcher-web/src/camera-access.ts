import { Store } from "./state/Store";
import { CameraStateChanged } from "./state/actions/CameraStateChanged";

export class CameraAccess {
    private static instance: CameraAccess;
    private stream: MediaStream;
    private store: Store;

    constructor() {
        this.store = Store.getInstance();
    }

    static getInstance() {
        if (null == this.instance) {
            this.instance = new CameraAccess();
        }
        return this.instance;
    }

    async start() {
        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: false, video: {
                width: { min: 0, ideal: 1920, max: 1920 },
                height: { min: 0, ideal: 1080, max: 1080 },
            }
        });
        let track = this.stream.getVideoTracks()[0];
        // console.log(track.getConstraints());


        let capabilities = track.getCapabilities();
        console.log(capabilities)
        let canChangeExposure = capabilities.exposureMode && capabilities.exposureMode.includes("manual")
            && (<any>capabilities).exposureTime && (<any>capabilities).exposureTime.min && (<any>capabilities).exposureTime.max;

        try {
            if (canChangeExposure) {
                let exposureTime = Math.min((<any>capabilities).exposureTime.max, Math.max((<any>capabilities).exposureTime.min,
                    this.store.state.dropwatcherState.exposureTime || 1000));
                if ((<any>capabilities).exposureTime.step) {
                    exposureTime = Math.round(exposureTime / (<any>capabilities).exposureTime.step) * (<any>capabilities).exposureTime.step;
                }
                await track.applyConstraints({
                    advanced: [{
                        ...<any>{
                            exposureTime: exposureTime,
                        },
                        ...{
                            exposureMode: "manual",
                            // width: 1920,
                            // height: 1080,
                        }
                    }]
                });
            }
        } catch (e) {
            console.error(e);
            canChangeExposure = false;
        }
        let settings = track.getSettings();
        this.store.postAction(new CameraStateChanged({
            cameraOn: true,
            exposureTime: (<any>settings).exposureTime,
            canChangeExposure: canChangeExposure ? {
                min: (<any>capabilities).exposureTime.min,
                max: (<any>capabilities).exposureTime.max,
                step: (<any>capabilities).exposureTime.step
            } : null
        }));

    }

    async stop() {
        console.log("Stopping camera");
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
        this.store.postAction(new CameraStateChanged({
            cameraOn: false
        }));
    }

    async setExposureTime(time: number) {
        if (this.stream) {
            let track = this.stream.getVideoTracks()[0];
            await track.applyConstraints({
                advanced: [{
                    ...<any>{
                        exposureTime: time,
                    },
                    ...{
                        exposureMode: "manual",
                        // width: 1920,
                        // height: 1080,
                    }
                }]
            });
            let settings = track.getSettings();
            this.store.postAction(new CameraStateChanged({
                exposureTime: (<any>settings).exposureTime
            }));
        }
    }

    getStream() {
        return this.stream;
    }
}