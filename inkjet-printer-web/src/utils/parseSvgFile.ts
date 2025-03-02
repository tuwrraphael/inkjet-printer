
export function parseSvgFile(file: File) {
    return new Promise<Document>((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = (e) => {
            try {
                const doc = new DOMParser().parseFromString(reader.result as string, "text/xml");
                resolve(doc);
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = (e) => {
            reject(reader.error);
        };
        reader.readAsText(file);
    });
}

