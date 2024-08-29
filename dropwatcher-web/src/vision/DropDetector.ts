import *as cv from "@techstark/opencv-js";

export class DropDetector {

    detectDrops(imageData: ImageData) {
        let res = this._detectDrops(imageData);
        let res2 = this._detectDrops(imageData, res.threshold);
        return res2;
    }

    private _detectDrops(imageData: ImageData, threshold: number = 100) {
        let src = cv.matFromImageData(imageData);
        let grayscale = new cv.Mat(src.rows, src.cols, cv.CV_8UC3);
        let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
        cv.cvtColor(src, grayscale, cv.COLOR_RGBA2GRAY, 0);
        cv.GaussianBlur(grayscale, src, { width: 5, height: 5 }, 2, 2, cv.BORDER_DEFAULT);
        cv.threshold(src, src, threshold, 255, cv.THRESH_BINARY);
        // cv.imshow(this.canvas, src);
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        let drops: {
            x: number, y: number, diameter: number
            pixel_x: number, pixel_y: number, pixel_diameter: number
        }[] = [];
        let dropMask = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);

        let enclosingCircles: {
            x: number,
            y: number,
            radius: number
        }[] = [];
        let ellipses: {
            center: { x: number, y: number },
            size: { width: number, height: number },
            angle: number
        }[] = [];
        for (let i = 0; i < contours.size(); ++i) {
            let cnt = contours.get(i);

            let enclosingCircle = cv.minEnclosingCircle(cnt);
            let pxToMm = 2.975780963 / 1920;
            let radius = enclosingCircle.radius * pxToMm;

            if (radius > 0.05 && radius < 0.3) {
                enclosingCircles.push({
                    x: enclosingCircle.center.x,
                    y: enclosingCircle.center.y,
                    radius: enclosingCircle.radius
                });
                let ellipse: cv.RotatedRect;
                try {
                    ellipse = cv.fitEllipse(cnt);
                }
                catch (e) {
                    console.error(e);
                    cnt.delete();
                    continue;
                }


                let isCircleLike = Math.abs(ellipse.size.width / ellipse.size.height);
                if (isCircleLike < 0.6) {
                    cnt.delete();
                    continue;
                }

                ellipses.push({
                    center: ellipse.center,
                    size: ellipse.size,
                    angle: ellipse.angle
                });

                let ellipseRadius = (ellipse.size.width + ellipse.size.height) / 4;
                let drop = {
                    x: ellipse.center.x * pxToMm,
                    y: ellipse.center.y * pxToMm,
                    diameter: ellipseRadius * 2 * pxToMm,
                    pixel_x: ellipse.center.x,
                    pixel_y: ellipse.center.y,
                    pixel_diameter: ellipseRadius * 2
                };
                drops.push(drop);
                cv.circle(dropMask, ellipse.center, ellipseRadius, new cv.Scalar(255, 255, 255), -1, 8, 0);
            }
            cnt.delete();
        }
        let meanDrop = cv.mean(grayscale, dropMask);
        let invertedMask = new cv.Mat(src.rows, src.cols, cv.CV_8UC1);
        cv.bitwise_not(dropMask, invertedMask);
        let meanBackground = cv.mean(grayscale, invertedMask);

        console.log("meanDrop", meanDrop);
        console.log("meanBackground", meanBackground);

        let newthreshold = (meanDrop[0] + meanBackground[0]) / 2;

        console.log(drops);
        dropMask.delete();
        invertedMask.delete();
        src.delete(); dst.delete(); hierarchy.delete(); contours.delete(); grayscale.delete();

        return {
            drops,
            threshold: newthreshold,
            ellipses,
            enclosingCircles
        };
    }

    averageDropSize(drops: { diameter: number }[]) {
        let sum = drops.reduce((acc, drop) => acc + drop.diameter, 0);
        return sum / drops.length;
    }
}