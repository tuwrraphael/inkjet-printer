import { CameraType } from "./CameraType";
import { GCodeRunner } from "./gcode-runner";
import { MovementStage } from "./movement-stage";
import { Store } from "./state/Store";
import { CameraStateChanged } from "./state/actions/CameraStateChanged";
import { SaveImage } from "./state/actions/SaveImage";

import *as cv from "@techstark/opencv-js";

const autofocusParams = {
    [CameraType.Dropwatcher]: {
        direction: {
            x: 0,
            y: 1,
            z: 0,
        },
        iterations: [{
            step: 0.25,
            range: 2,
            feedRate: 100,
        }, {
            step: 0.02,
            range: 0.5,
            feedRate: 100
        }],
    },
    [CameraType.Microscope]: {
        direction: {
            x: 0,
            y: 0,
            z: 1,
        },
        iterations: [
            {
                step: 0.25,
                range: 2,
                feedRate: 500
            }, {
                step: 0.05,
                range: 0.25,
                feedRate: 500
            }],
    }
}

export class CameraAccess {
    private static instances = new Map<CameraType, CameraAccess>();
    private stream: MediaStream;
    private store: Store;

    constructor(private type: CameraType) {
        this.store = Store.getInstance();
    }

    static getInstance(type: CameraType) {
        if (!CameraAccess.instances.has(type)) {
            CameraAccess.instances.set(type, new CameraAccess(type));
        }
        return CameraAccess.instances.get(type);
    }

    async getStoredDeviceId() {
        return localStorage.getItem("inkjetprinter:camera:" + this.type + "-deviceId");
    }

    async setStoredDeviceId(deviceId: string) {
        localStorage.setItem("inkjetprinter:camera:" + this.type + "-deviceId", deviceId);
    }

    async start() {
        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: false, video: {
                width: { min: 0, ideal: 1920, max: 1920 },
                height: { min: 0, ideal: 1080, max: 1080 },
                deviceId: await this.getStoredDeviceId()
            }
        });
        await this.setStoredDeviceId(this.stream.getVideoTracks()[0].getSettings().deviceId);
        let track = this.stream.getVideoTracks()[0];
        // console.log(track.getConstraints());


        let capabilities = track.getCapabilities();
        console.log(capabilities)
        let canChangeExposure = capabilities.exposureMode && capabilities.exposureMode.includes("manual")
            && (<any>capabilities).exposureTime && (<any>capabilities).exposureTime.min && (<any>capabilities).exposureTime.max;

        try {
            if (canChangeExposure) {
                let exposureTime = Math.min((<any>capabilities).exposureTime.max, Math.max((<any>capabilities).exposureTime.min,
                    this.store.state.cameras[this.type]?.exposureTime || 1000));
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
        }, this.type));

    }

    async stop() {
        console.log("Stopping camera");
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
        this.store.postAction(new CameraStateChanged({
            cameraOn: false
        }, this.type));
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
                exposureTime: (<any>settings).exposureTime,
            }, this.type));
        }
    }

    getStream() {
        return this.stream;
    }

    async saveImage(filename: string) {
        if (!this.stream) {
            await this.start();
        }
        let track = this.stream.getVideoTracks()[0];
        let imageCapture = new ImageCapture(track);
        let image = await imageCapture.takePhoto();
        this.store.postAction(new SaveImage(image, this.type, filename));
    }

    private async autofocusAlg(movementExecutor: GCodeRunner, step: number, range: number, x: number, y: number, feedRate: number) {

        let direction = new cv.Mat(3, 1, cv.CV_64F);
        let dir = autofocusParams[this.type].direction;
        direction.data64F[0] = dir.x;
        direction.data64F[1] = dir.y;
        direction.data64F[2] = dir.z;
        let relativeMovement = direction.mul(cv.Mat.ones(3, 1, cv.CV_64F), -range / 2);
        await movementExecutor.moveRelativeAndWait(relativeMovement.data64F[0], relativeMovement.data64F[1], relativeMovement.data64F[2], feedRate);
        let bestDistance = 0;
        let bestScore = 0;
        let best: ImageBitmap = null;
        // let bestArea: ImageData = null;

        let imageCapture = new ImageCapture(this.stream.getVideoTracks()[0]);

        // await this.waitForNextVideoFrame();
        let frame = await imageCapture.grabFrame();
        x = Math.floor(x * frame.width);
        y = Math.floor(y * frame.height);

        let areaSize = frame.height / 2.5;

        let minX = Math.max(0, x - areaSize / 2);
        let minY = Math.max(y - areaSize / 2, 0);
        let maxX = Math.min(frame.width, x + areaSize / 2);
        let maxY = Math.min(frame.height, y + areaSize / 2);
        // console.log(y, x, minX, minY, maxX - minX, maxY - minY);

        let offscreen = new OffscreenCanvas(frame.width, frame.height);
        let ctx2 = offscreen.getContext("2d");
        for (let i = 0; i < range; i += step) {
            relativeMovement = direction.mul(cv.Mat.ones(3, 1, cv.CV_64F), step);
            await movementExecutor.moveRelativeAndWait(relativeMovement.data64F[0], relativeMovement.data64F[1], relativeMovement.data64F[2], feedRate);
            // await this.waitForNextVideoFrame();
            frame = await imageCapture.grabFrame();
            // this.canvas.width = frame.width;
            // this.canvas.height = frame.height;

            // ctx.drawImage(frame, 0, 0);

            ctx2.drawImage(frame, 0, 0);
            let imageData: ImageData = ctx2.getImageData(minX, minY, maxX - minX, maxY - minY);
            // let imageData: ImageData = ctx.getImageData(0, 0, frame.width, frame.height);
            // console.log(imageData);
            // ctx.putImageData(imageData,0,0);
            // return;
            let srcMat = cv.matFromImageData(imageData);




            let blurred = new cv.Mat();
            let dstMat = new cv.Mat();
            cv.cvtColor(srcMat, dstMat, cv.COLOR_RGBA2GRAY);


            let resized = new cv.Mat();
            let targetSize = Math.floor(0.15 * areaSize);
            let dsize = new cv.Size(targetSize, targetSize);
            cv.resize(dstMat, resized, dsize, 0, 0, cv.INTER_AREA);

            // cv.GaussianBlur(resized, blurred, { width: 5, height: 5 }, 0.9, 0.9, cv.BORDER_DEFAULT);
            cv.medianBlur(resized, blurred, 5);

            let laplacian = new cv.Mat();
            cv.Laplacian(blurred, laplacian, cv.CV_64F);
            let mean = new cv.Mat();
            let stddev = new cv.Mat();
            cv.meanStdDev(laplacian, mean, stddev);
            let focusScore = stddev.data64F[0] * stddev.data64F[0];
            // console.log("focus score", focusScore, i);

            if (focusScore > bestScore) {

                bestScore = focusScore;
                bestDistance = i;
                best = frame;
                // bestArea = imageData;
            }

            // let imshowMat = new cv.Mat();
            // cv.convertScaleAbs(laplacian, imshowMat, 5);

            // cv.imshow(this.canvas, imshowMat);




            dstMat.delete();
            srcMat.delete();
            blurred.delete();
            laplacian.delete();
            mean.delete();
            stddev.delete();
            resized.delete();
        }
        // ctx.putImageData(best, 0, 0);
        // ctx.strokeStyle = "green";
        // ctx.lineWidth = 4;
        // ctx.rect(minX, minY, maxX - minX, maxY - minY);
        // ctx.stroke();
        // ctx.putImageData(bestArea, 0, 0);
        console.log("best distance", bestDistance);
        console.log("best score", bestScore);
        console.log("best", best);
        let relativeMovementToBestDistance = direction.mul(cv.Mat.ones(3, 1, cv.CV_64F), -range + bestDistance);
        await movementExecutor.moveRelativeAndWait(relativeMovementToBestDistance.data64F[0], relativeMovementToBestDistance.data64F[1], relativeMovementToBestDistance.data64F[2], feedRate);
        direction.delete();
        return {
            area: {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            },
            bestDistance: bestDistance,
            bestScore: bestScore,
            best: best,
        }
    }

    async performAutoFocus(x: number, y: number, movementExecutor: GCodeRunner) {
        if (!this.stream) {
            await this.start();
        }
        let iterations = autofocusParams[this.type].iterations;
        for (let i = 0; i < iterations.length; i++) {
            let iter = iterations[i];
            let res = await this.autofocusAlg(movementExecutor, iter.step, iter.range, x, y, iter.feedRate);
            if (i == iterations.length - 1) {
                return res;
            }
        }
    }
}