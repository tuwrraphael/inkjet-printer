import { State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { PrintingParamsChanged as PrintingParamsChanged } from "../../state/actions/PrintOptionsChanged";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./PrintOptions.html";
import "./PrintOptions.scss";

export class PrintOptions extends HTMLElement {

    private rendered = false;
    private fireEvery: HTMLInputElement;
    store: any;
    private abortController: AbortController;
    private firstLayerHeight : HTMLInputElement;
    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.fireEvery = this.querySelector("#fire-every");
            this.firstLayerHeight = this.querySelector("#first-layer-height");
        }
        this.abortController = new AbortController();
        this.store = Store.getInstance();

        this.store.subscribe((s: State, c: StateChanges) => this.update(s, c));

        abortableEventListener(this.querySelector("#print-options-form"), "submit", (e) => {
            e.preventDefault();
            let formData = new FormData(e.target as HTMLFormElement);
            let fireEvery = parseInt(formData.get("fire-every") as string);
            let firstLayerHeight = parseFloat(formData.get("first-layer-height") as string);
            this.store.postAction(new PrintingParamsChanged({
                fireEveryTicks: fireEvery,
                firstLayerHeight: firstLayerHeight
            }));
        }, this.abortController.signal);

        this.update(this.store.state, ["printState"]);
    }
    update(s: State, c: StateChanges) {
        if (null == s) {
            return;
        }
        if (!c || c.includes("printState")) {
            this.fireEvery.value = s.printState.printingParams.fireEveryTicks.toString();
            this.firstLayerHeight.value = s.printState.printingParams.firstLayerHeight.toString();
        }
    }


    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const PrintOptionsTagName = "print-options";
customElements.define(PrintOptionsTagName, PrintOptions);
