import template from "./Info.html";

export class Info extends HTMLElement {
    private buildDateLabel: HTMLSpanElement;

    constructor() {
        super();

    }
    addServices() {
    }

    async connectedCallback() {
        this.innerHTML = template;
        this.buildDateLabel = this.querySelector("#build-date");
        this.buildDateLabel.innerText = new Intl.DateTimeFormat([], {
            hour: "numeric", minute: "numeric", second: "numeric",
            day: "numeric", "month": "numeric", year: "numeric",
            timeZoneName: "short"
        }).format(new Date(__BUILD_DATE));;
        let res = await fetch("oss-licenses.json");
        let json = await res.json();
        let text = json.map((item:any) => 
            `--------------------------------------------------------------------------------
${item.name} ${item.version} (${item.author})
${item.repository}
${item.license}
--------------------------------------------------------------------------------
${item.licenseText}`).join("\n");
console.log(text);
        (<HTMLDivElement>this.querySelector("#third-party")).innerText = text;
    }
}

export const InfoTagName = "app-info";
customElements.define(InfoTagName, Info);