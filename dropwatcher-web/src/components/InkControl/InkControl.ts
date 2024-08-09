import template from "./InkControl.html";
import "./InkControl.scss";
import "../Chart/Chart";
import { abortableEventListener } from "../../utils/abortableEventListener";
import { PressureControlAlgorithm, ChangePressureControlParametersRequest, PressureControlDirection, PressureControlParameters, PrinterSystemState } from "../../proto/compiled";
import { PrinterUSB } from "../../printer-usb";
import { Store } from "../../state/Store";
import { State, StateChanges, ValvePosition } from "../../state/State";
import { PressureControlPumpParameters } from "../../proto/compiled";
import "../PumpStatus/PumpStatus";
import { PumpStatus } from "../PumpStatus/PumpStatus";
import { ChangePrinterSystemStateRequest } from "../../proto/compiled";
import svgIllustration from "../../assets/ink_supply.svg";
import {
    PressureControlAlgorithm as StatePressureControlAlgorithm,
    PressureControlDirection as StatePressureControlDirection,
    PressureControlPumpParameters as StatePressureControlPumpParameters
} from "../../state/State";
import { InkControlAction, inkControlActions } from "./ink-control-actions";
import { InkControlActionChanged } from "../../state/actions/InkControlActionChanged";
import { ValvePositionChanged } from "../../state/actions/ValvePositionChanged";

export class InkControl extends HTMLElement {

    private rendered = false;
    private action: HTMLSelectElement;
    private btnStart: HTMLButtonElement;
    private abortController: AbortController;
    private inkControlForm: HTMLFormElement;
    private nozzlePrimingGroup: HTMLFieldSetElement;
    private targetPressureGroup: HTMLFieldSetElement;
    private printerUSB: PrinterUSB;
    private btnStop: HTMLButtonElement;
    private store: Store;
    // private targetPressure: HTMLInputElement;
    // private initialValueSet = false;
    private inkPumpStatus: PumpStatus;
    private cappingPumpStatus: PumpStatus;
    private btnKeepAlive: HTMLButtonElement;
    private inkControlIllustration: SVGElement;
    private pumprotor1: SVGGElement;
    private pumprotor2: SVGGElement
    private valve1: SVGGElement;
    private valve2: SVGGElement;
    private valve3: SVGGElement;
    private cap1: SVGGElement;
    private cap2: SVGGElement;
    private currentAction: InkControlAction;
    private inkControlCurrentActionForm: HTMLFormElement;
    private currentActionName: HTMLHeadingElement;
    private message: HTMLHeadingElement;
    private capping: SVGGElement;
    private btnNextAction: HTMLButtonElement;
    private extraComponentSpace: HTMLDivElement;
    private loadedExtraComponent: () => Element;
    private bntAbortAction : HTMLButtonElement;

    constructor() {
        super();
        this.printerUSB = PrinterUSB.getInstance();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.action = this.querySelector("#action");
            this.btnStart = this.querySelector("#btn-start");
            this.inkControlForm = this.querySelector("#ink-control-form");
            this.nozzlePrimingGroup = this.querySelector("#nozzle-priming-group");
            this.targetPressureGroup = this.querySelector("#target-pressure-group");
            this.btnStop = this.querySelector("#btn-stop");
            this.inkPumpStatus = this.querySelector("#ink-pump-status");
            this.cappingPumpStatus = this.querySelector("#capping-pump-status");
            this.btnKeepAlive = this.querySelector("#btn-keepalive");
            this.inkControlIllustration = this.querySelector("#ink-control-illustration");
            this.inkControlIllustration.innerHTML = svgIllustration;

            this.pumprotor1 = this.querySelector(".pump-rotor1");
            this.pumprotor2 = this.querySelector(".pump-rotor2");
            this.valve1 = this.querySelector(".valve1");
            this.valve2 = this.querySelector(".valve2");
            this.valve3 = this.querySelector(".valve3");
            this.cap1 = this.querySelector(".cap1");
            this.cap2 = this.querySelector(".cap2");
            this.capping = this.querySelector(".capping");

            this.btnNextAction = this.querySelector("#btn-next-action");
            this.bntAbortAction = this.querySelector("#btn-abort-action");

            for (let possibleaction of inkControlActions) {
                this.action.add(new Option(possibleaction.name, possibleaction.name));
            }

            this.inkControlCurrentActionForm = this.querySelector("#ink-control-current-action-form");
            this.currentActionName = this.querySelector("#current-action-name");
            this.message = this.querySelector("#message");
            this.extraComponentSpace = this.querySelector("#extra-component");

        }
        // this.targetPressure = this.querySelector("#target-pressure");
        abortableEventListener(this.btnStart, "click", (ev) => {
            ev.preventDefault();
            this.start().catch(console.error);
        }, this.abortController.signal);
        abortableEventListener(this.btnStop, "click", (ev) => {
            ev.preventDefault();
            this.stop().catch(console.error);
        }, this.abortController.signal);
        abortableEventListener(this.btnKeepAlive, "click", async (ev) => {
            ev.preventDefault();
            let request = new ChangePrinterSystemStateRequest();
            request.state = PrinterSystemState.PrinterSystemState_KEEP_ALIVE;
            await this.printerUSB.sendChangeSystemStateRequest(request);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#ink-control-action-form"), "submit", (ev) => {
            ev.preventDefault();
            this.store.postAction(new InkControlActionChanged({
                currentAction: this.action.value,
                currentStep: 0,
                actionsRunning: false
            }));
            let firstStep = inkControlActions.find(a => a.name == this.action.value).steps[0];
            if (firstStep.valvePositionChanges) {
                this.store.postAction(new ValvePositionChanged(firstStep.valvePositionChanges));
            }
        }, this.abortController.signal);
        abortableEventListener(this.inkControlCurrentActionForm, "submit", (ev) => {
            ev.preventDefault();
            this.next();
        }, this.abortController.signal);
        abortableEventListener(this.bntAbortAction, "click", (ev) => {
            ev.preventDefault();
            this.store.postAction(new InkControlActionChanged({
                currentAction: null,
                currentStep: 0,
                actionsRunning: false
            }));
            this.stop().catch(console.error);
        }, this.abortController.signal);

        // this.actionChanged();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        this.update(this.store.state, null);
    }
    private async next() {
        this.store.postAction(new InkControlActionChanged({
            actionsRunning: true
        }));
        let currentStep = this.currentAction.steps[this.store.state.inkControlAction.currentStep];
        if (currentStep.pumpactions) {
            let actions = currentStep.pumpactions();
            for (let i = 0; i < (actions.repetitions?.count || 1); i++) {

                let changeParametersRequest = new ChangePressureControlParametersRequest();
                let parameters = new PressureControlParameters();
                changeParametersRequest.parameters = parameters;
                if (actions.inkPump) {
                    parameters.inkPump = actions.inkPump;
                } else {
                    parameters.inkPump = new PressureControlPumpParameters();
                    parameters.inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_NONE;
                }
                parameters.enable = false;
                await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
                parameters = new PressureControlParameters();
                changeParametersRequest.parameters = parameters;
                if (actions.cappingPump) {
                    parameters.cappingPump = actions.cappingPump;
                } else {
                    parameters.cappingPump = new PressureControlPumpParameters();
                    parameters.cappingPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_NONE;
                }
                parameters.enable = true;
                await this.printerUSB.sendChangePressureControlParametersRequestAndWait(changeParametersRequest);
                if (actions.turnOffPumps) {
                    parameters = new PressureControlParameters();
                    changeParametersRequest.parameters = parameters;
                    parameters.enable = false;
                    await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
                }
                if (actions.repetitions?.pause) {
                    await new Promise((resolve) => setTimeout(resolve, actions.repetitions.pause));
                }
            }
        }
        if (currentStep.goToState) {
            let request = new ChangePrinterSystemStateRequest();
            request.state = currentStep.goToState;
            await this.printerUSB.sendChangeSystemStateRequest(request);
        }
        if (this.store.state.inkControlAction.currentStep + 1 >= this.currentAction.steps.length) {
            this.store.postAction(new InkControlActionChanged({
                currentAction: null,
                currentStep: 0
            }));
        } else {
            let nextStep = this.currentAction.steps[this.store.state.inkControlAction.currentStep + 1];
            if (nextStep.valvePositionChanges) {
                this.store.postAction(new ValvePositionChanged(nextStep.valvePositionChanges));
            }
            this.store.postAction(new InkControlActionChanged({
                currentAction: this.store.state.inkControlAction.currentAction,
                currentStep: this.store.state.inkControlAction.currentStep + 1
            }));

        }
        this.store.postAction(new InkControlActionChanged({
            actionsRunning: false
        }));
    }
    private update(s: State, c: StateChanges): void {
        if (!s) {
            return;
        }
        if (!c || c.includes("printerSystemState")) {
            // if (!this.initialValueSet) {
            //     this.targetPressure.value = s.printerSystemState.pressureControl?.parameters.targetPressure.toString();
            //     this.initialValueSet = true;
            // }
            if (s.printerSystemState.pressureControl?.inkPump) {
                this.inkPumpStatus.setPumpParameters(s.printerSystemState.pressureControl.inkPump);
                this.setPumpAnimation(s, s.printerSystemState.pressureControl.inkPump, this.pumprotor1);
            }
            if (s.printerSystemState.pressureControl?.cappingPump) {
                this.cappingPumpStatus.setPumpParameters(s.printerSystemState.pressureControl.cappingPump);
                this.setPumpAnimation(s, s.printerSystemState.pressureControl.cappingPump, this.pumprotor2);
            }
            if (s.printerSystemState.valves) {
                this.setValvePosition(this.valve1, s.printerSystemState.valves.valve1);
                this.setValvePosition(this.valve2, s.printerSystemState.valves.valve2);
                this.setValvePosition(this.valve3, s.printerSystemState.valves.valve3);
            }
        }

        if (!c || c.includes("inkControlAction")) {

            this.currentAction = inkControlActions.find(a => a.name == s.inkControlAction.currentAction);
            console.log("InkControlAction", s.inkControlAction, this.currentAction);
            this.inkControlCurrentActionForm.style.display = this.currentAction ? "" : "none";
            if (this.currentAction) {
                this.currentActionName.innerText = this.currentAction.name;
                this.message.innerText = this.currentAction.steps[s.inkControlAction.currentStep].message;
                if (this.currentAction.steps[s.inkControlAction.currentStep].extraComponent) {
                    if (this.loadedExtraComponent != this.currentAction.steps[s.inkControlAction.currentStep].extraComponent) {
                        this.extraComponentSpace.innerHTML = "";
                        this.extraComponentSpace.appendChild(this.currentAction.steps[s.inkControlAction.currentStep].extraComponent());
                    }
                } else {
                    this.extraComponentSpace.innerHTML = "";
                }
            }
            this.valve1.classList.toggle("valve-highlight", true == this.currentAction?.steps[s.inkControlAction.currentStep].highlight?.valve1);
            this.valve2.classList.toggle("valve-highlight", true == this.currentAction?.steps[s.inkControlAction.currentStep].highlight?.valve2);
            this.valve3.classList.toggle("valve-highlight", true == this.currentAction?.steps[s.inkControlAction.currentStep].highlight?.valve3);
            this.cap1.classList.toggle("cap-highlight", true == this.currentAction?.steps[s.inkControlAction.currentStep].highlight?.cap1);
            this.cap2.classList.toggle("cap-highlight", true == this.currentAction?.steps[s.inkControlAction.currentStep].highlight?.cap2);
            this.capping.classList.toggle("capping-highlight", true == this.currentAction?.steps[s.inkControlAction.currentStep].highlight?.capprinthead);

            this.btnNextAction.disabled = s.inkControlAction.actionsRunning;
        }
    }

    private setPumpAnimation(s: State, p: StatePressureControlPumpParameters, rotor: SVGGElement) {
        let movingControl = s.printerSystemState.pressureControl.enabled &&
            p.algorithm == StatePressureControlAlgorithm.TargetPressure;
        let pressure = s.printerSystemState.pressureControl.enabled &&
            !s.printerSystemState.pressureControl.done &&
            p.algorithm == StatePressureControlAlgorithm.FeedwithLimit
            && p.direction == StatePressureControlDirection.Pressure;
        let vacuum = s.printerSystemState.pressureControl.enabled &&
            !s.printerSystemState.pressureControl.done &&
            p.algorithm == StatePressureControlAlgorithm.FeedwithLimit
            && p.direction == StatePressureControlDirection.Vacuum;
        rotor.classList.toggle("pump-moving-control", movingControl);
        rotor.classList.toggle("pump-moving-pressure", pressure);
        rotor.classList.toggle("pump-moving-vacuum", vacuum);
    }

    private setValvePosition(valve: SVGGElement, position: ValvePosition) {
        valve.classList.toggle("valve-port1-port2", position == ValvePosition.Port1Port2);
        valve.classList.toggle("valve-port1-port3", position == ValvePosition.Port1Port3);
        valve.classList.toggle("valve-port2-port3", position == ValvePosition.Port2Port3);
        valve.classList.toggle("valve-all-connected", position == ValvePosition.AllConnected);
    }

    private parseAlgorithm(str: string): {
        alg: PressureControlAlgorithm,
        dir: PressureControlDirection
    } {
        switch (str) {
            case "targetpressure":
                return { alg: PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE, dir: PressureControlDirection.PressureControlDirection_PRESSURE };
            case "feed":
                return { alg: PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT, dir: PressureControlDirection.PressureControlDirection_PRESSURE };
            case "vacuum":
                return { alg: PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT, dir: PressureControlDirection.PressureControlDirection_VACUUM };
            default:
                return { alg: PressureControlAlgorithm.PressureControlAlgorithm_NONE, dir: PressureControlDirection.PressureControlDirection_PRESSURE };
        }
    }

    private async start() {
        if (this.inkControlForm.checkValidity()) {
            let values = new FormData(this.inkControlForm);
            console.log("Start", ...values);

            let changeParametersRequest = new ChangePressureControlParametersRequest();
            let parameters = new PressureControlParameters();
            changeParametersRequest.parameters = parameters;
            parameters.enable = false;
            let inkPumpParameters = new PressureControlPumpParameters();
            let inkPumpAlg = this.parseAlgorithm(values.get("ink-pump-pump-action") as string);
            inkPumpParameters.algorithm = inkPumpAlg.alg;
            inkPumpParameters.direction = inkPumpAlg.dir;
            inkPumpParameters.feedPwm = parseFloat(values.get("ink-pump-feed-limit-pwm") as string);
            inkPumpParameters.maxPressureLimit = parseFloat(values.get("ink-pump-feed-max-pressure") as string);
            inkPumpParameters.minPressureLimit = parseFloat(values.get("ink-pump-feed-min-pressure") as string);
            inkPumpParameters.feedTime = parseFloat(values.get("ink-pump-feed-time") as string);
            inkPumpParameters.targetPressure = parseFloat(values.get("ink-pump-target-pressure") as string);
            parameters.inkPump = inkPumpParameters;

            await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);


            changeParametersRequest = new ChangePressureControlParametersRequest();
            parameters = new PressureControlParameters();
            changeParametersRequest.parameters = parameters;
            parameters.enable = true;
            let cappingPumpParameters = new PressureControlPumpParameters();
            let cappingPumpAlg = this.parseAlgorithm(values.get("capping-pump-pump-action") as string);
            cappingPumpParameters.algorithm = cappingPumpAlg.alg;
            cappingPumpParameters.direction = cappingPumpAlg.dir;
            cappingPumpParameters.feedPwm = parseFloat(values.get("capping-pump-feed-limit-pwm") as string);
            cappingPumpParameters.maxPressureLimit = parseFloat(values.get("capping-pump-feed-max-pressure") as string);
            cappingPumpParameters.minPressureLimit = parseFloat(values.get("capping-pump-feed-min-pressure") as string);
            cappingPumpParameters.feedTime = parseFloat(values.get("capping-pump-feed-time") as string);
            cappingPumpParameters.targetPressure = parseFloat(values.get("capping-pump-target-pressure") as string);
            parameters.cappingPump = cappingPumpParameters;

            await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);



            // switch (action) {
            //     case "priming":
            //         parameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT;
            //         parameters.direction = PressureControlDirection.PressureControlDirection_PRESSURE;
            //         parameters.feedPwm = parseFloat(values.get("feed-limit-pwm") as string);
            //         parameters.limitPressure = parseFloat(values.get("feed-limit-pressure") as string);
            //         parameters.feedTime = parseFloat(values.get("feed-time") as string);
            //         parameters.enable = true;
            //         await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
            //         break;
            //     case "fillflushtank":
            //         parameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT;
            //         parameters.direction = PressureControlDirection.PressureControlDirection_VACUUM;
            //         parameters.feedPwm = parseFloat(values.get("feed-limit-pwm") as string);
            //         parameters.limitPressure = parseFloat(values.get("feed-limit-pressure") as string);
            //         parameters.feedTime = parseFloat(values.get("feed-time") as string);
            //         parameters.enable = true;
            //         await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
            //         break;
            //     case "targetpressure":
            //         parameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
            //         parameters.targetPressure = parseFloat(values.get("target-pressure") as string);
            //         parameters.enable = true;
            //         await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
            //         break;
            //     default:
            //         console.error("Unknown action", action);
            //         break;
            // }
        }
        else {
            this.inkControlForm.reportValidity();
        }
    }

    private async stop() {
        let changeParametersRequest = new ChangePressureControlParametersRequest();
        let parameters = new PressureControlParameters();
        changeParametersRequest.parameters = parameters;
        parameters.enable = false;
        await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const InkControlTagName = "ink-control";
customElements.define(InkControlTagName, InkControl);
