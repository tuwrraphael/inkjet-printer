import { CategoryScale, Chart, Legend, LineController, LineElement, LinearScale, PointElement, TimeScale } from "chart.js";
import template from "./Chart.html";
import "./Chart.scss";
import { Store } from "../../state/Store";
import { State, StateChanges } from "../../state/State";
import "chartjs-adapter-date-fns";
import { de } from 'date-fns/locale';

Chart.register([LineController,
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Legend]);

const timeFormat = new Intl.DateTimeFormat("de-AT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export class ChartComponent extends HTMLElement {

    private rendered = false;
    private chart: Chart<"line", any[], any>;
    private store: Store;
    abortController: AbortController;
    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            let ctx = (document.getElementById("myChart") as HTMLCanvasElement).getContext("2d");
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: "Pressure (mbar)",
                        borderColor: "#00b5aa",
                        backgroundColor: "#00b5aa",
                        data: [],
                        pointRadius: 0
                    }],
                    labels: []
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 0,
                    },
                    scales: {
                        x: {
                            type: 'time',
                            position: 'bottom',
                            time: {
                                unit: "second",
                                displayFormats: {
                                    second: 'HH:mm:ss'
                                }
                            },
                            adapters: {
                                date: {
                                    locale: de
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: "bottom",
                        }
                    }
                }
            });
        }
        this.update(this.store.state, <StateChanges>Object.keys(this.store.state || {}));
    }

    update(s: State, c: StateChanges): void {
        if (c.includes("printerSystemState")) {
            let pressure = s.printerSystemState.pressureControl?.pressure || [];
            let firstTimestamp = pressure.length > 0 ? pressure[0].timestamp : new Date();
            // let labels = pressure.map(p => timeFormat.format(p.timestamp));
            let data = pressure.map(p => ({ x: p.timestamp, y: p.mbar }));
            // this.chart.data.labels = labels;
            // console.log(labels);
            this.chart.data.datasets[0].data = data;
            this.chart.update();            
        }
        
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const ChartTagName = "app-chart";
customElements.define(ChartTagName, ChartComponent);
