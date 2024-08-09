import { ChangePressureControlParametersRequest, PressureControlAlgorithm, PressureControlParameters, PrinterSystemState, PressureControlPumpParameters, PressureControlDirection } from "../../proto/compiled";
import { ValvePosition, ValveState } from "../../state/State";
import { InkControlLoadInk, InkControlLoadInkTagName } from "../InkControlLoadInk/InkControlLoadInk";

interface InkControlActionStep {
    message: string;
    pumpactions?: () => {
        inkPump?: PressureControlPumpParameters, cappingPump?: PressureControlPumpParameters, turnOffPumps?: boolean,
        repetitions?: {
            count: number,
            pause: number
        }
    };
    highlight?: {
        valve1?: boolean,
        valve2?: boolean,
        valve3?: boolean
        cap1?: boolean,
        cap2?: boolean,
        capprinthead?: boolean
    },
    valvePositionChanges?: Partial<ValveState>;
    goToState?: PrinterSystemState;
    extraComponent?: () => Element;
}

export interface InkControlAction {
    name: string;
    steps: InkControlActionStep[];
}

const FillPressureReservoir: InkControlAction = {
    name: "Fill pressure reservoir",
    steps: [
        {
            message: `First it must be confirmed that the cap
at the ink supply port (Cap 1) and the cap at the degassing port (Cap 2) are closed.`,
            highlight: {
                cap1: true,
                cap2: true
            }
        },
        {
            message: "Next valve 1 must be switched to connect only port 1 and 3, blocking port 2.",
            highlight: {
                valve1: true
            },
            valvePositionChanges: {
                valve1: ValvePosition.Port1Port3
            }
        },
        {
            message: `Now the pressure reservoir can be vacuumed to -250mbar by pump 1.
If there was excess air in the reservoir, it will be removed.`,
            pumpactions: () => {
                let inkPump = new PressureControlPumpParameters();
                inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
                inkPump.targetPressure = -250;
                return {
                    inkPump
                }
            }
        },
        {
            message: "Next the pressure reservoir can be filled again by using pump 1 to restore 0mbar.",
            pumpactions: () => {
                let inkPump = new PressureControlPumpParameters();
                inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
                inkPump.targetPressure = 0;
                return {
                    inkPump,
                    turnOffPumps: true
                }
            }
        },
        {
            message: "Now valve 1 is switched back to connect port 1 and 2.",
            highlight: {
                valve1: true
            },
            valvePositionChanges: {
                valve1: ValvePosition.Port1Port2
            }
        }
    ],
}

const EnterKeepalive: InkControlAction = {
    name: "Enter keepalive state",
    steps: [
        {
            "message": "The printhead capping station must be installed.",
            highlight: {
                capprinthead: true
            }
        },
        {
            message: `The valves positions have to be switched to recirculate the ink in the system.
This means that valve 1 has to be switched to connect port 1 and 2,
valve 2 has to be switched to connect port 1 and 3, and
valve 3 has to be switched to connect port 2 and 3.`,
            highlight: {
                valve1: true,
                valve2: true,
                valve3: true
            },
            valvePositionChanges: {
                valve1: ValvePosition.Port1Port2,
                valve2: ValvePosition.Port1Port3,
                valve3: ValvePosition.Port2Port3
            }
        },
        {
            message: `The system state is now set to keepalive.`,
            goToState: PrinterSystemState.PrinterSystemState_KEEP_ALIVE,
        }

    ]
};

const SupplyDegassing: InkControlAction = {
    name: "Supply tubing / filter power degassing",
    steps: [
        {
            message: `Ensure that a cap is placed on the degassing port (Cap 2) and on the ink supply port (Cap 1).`,
            highlight: {
                cap2: true,
                cap1: true
            }
        },
        {
            message: `Valve 1 must be switched to connect port 1 and 3, blocking port 2.`,
            highlight: {
                valve1: true
            },
            valvePositionChanges: {
                valve1: ValvePosition.Port1Port3
            }
        },
        {
            message: `Next the printhead supply is shut off by turning Valve 2 to connect port 1 and 2 only.`,
            highlight: {
                valve2: true
            },
            valvePositionChanges: {
                valve2: ValvePosition.Port1Port2
            },
        },
        {
            message: `Now the degassing port cap can be removed and connected to the waste container by a tube.`,
            highlight: {
                cap2: true
            },
        },
        {
            message: `Pump 1 is used to create a positive pressure of 250mbar.`,
            pumpactions: () => {
                let inkPump = new PressureControlPumpParameters();
                inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
                inkPump.targetPressure = 250;
                return {
                    inkPump
                }
            }
        },
        {
            message: `The valve 1 is now opened shortly to allow the pressure to remove any air bubbles in the system.`,
            highlight: {
                valve1: true
            },
            valvePositionChanges: {
                valve1: ValvePosition.Port1Port2
            },
        },
        {
            message: `Be sure to close valve 1 again after a short time.`,
            highlight: {
                valve1: true
            },
            valvePositionChanges: {
                valve1: ValvePosition.Port1Port3
            },
        },
        {
            message: `Any remaining pressure is removed by setting pump 1 to control the pressure to 0mbar.`,
            pumpactions: () => {
                let inkPump = new PressureControlPumpParameters();
                inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
                inkPump.targetPressure = 0;
                return {
                    inkPump,
                    turnOffPumps: true
                }
            }
        },
        {
            message: "Finally, the degassing port cap must be fitted securely.",
            highlight: {
                cap2: true
            }
        },
        {
            message: `Valve 1 is switched back to connect port 1 and 2.`,
            highlight: {
                valve1: true
            },
            valvePositionChanges: {
                valve1: ValvePosition.Port1Port2
            }
        },
        {
            message: `Valve 2 is switched back to connect port 1 and 3.`,
            highlight: {
                valve2: true
            },
            valvePositionChanges: {
                valve2: ValvePosition.Port1Port3
            }
        }
    ]
};

export const MildPressurePurge: InkControlAction = {
    name: "Mild pressure purge nozzles",
    steps: [
        {
            message: `For pressure purging the nozzles, the printhead capping station must be removed.
Any purged ink is collected by a towel placed under the printhead.`,
            highlight: {
                capprinthead: true
            }
        },
        {
            message: `Valve 1 and 2 are in their home positions, connecting the pressure reservoir to the printhead.`,
            highlight: {
                valve1: true,
                valve2: true
            },
            valvePositionChanges: {
                valve1: ValvePosition.Port1Port2,
                valve2: ValvePosition.Port1Port3
            }
        },
        {
            message: `The ink pump is used to pump ink through the nozzles for 5 seconds, respecting a maximum pressure of 30mbar.
Any loaded ink fluids will be purged and lost.`,
            pumpactions: () => {
                let inkPump = new PressureControlPumpParameters();
                inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT;
                inkPump.direction = PressureControlDirection.PressureControlDirection_PRESSURE;
                inkPump.maxPressureLimit = 40;
                inkPump.minPressureLimit = -30;
                inkPump.feedTime = 5;
                inkPump.feedPwm = 100;
                return {
                    inkPump
                }
            }
        },
        {
            message: `The pressure is regulated back to 0mbar by the ink pump.`,
            pumpactions: () => {
                let inkPump = new PressureControlPumpParameters();
                inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
                inkPump.targetPressure = 0;
                return {
                    inkPump,
                    turnOffPumps: true
                }
            }
        }
    ]
};

const LoadInk: InkControlAction = {
    name: "Load ink",
    steps: [
        {
            message: `To load ink the capping station is used.`,
            highlight: {
                capprinthead: true
            }
        },
        {
            message: `Valve 3 directs the purged cleaning fluid/ink to the waste container.`,
            highlight: {
                valve3: true
            },
            valvePositionChanges: {
                valve3: ValvePosition.Port1Port3,
            }
        },
        {
            message: `Valve 1 shuts off the ink supply port, therefore the ink supply
port cap can be removed and a syringe can be connected.
The syringes plunger is removed and it acts as an ink tank.`,
            highlight: {
                valve1: true,
                cap1: true
            },
            valvePositionChanges: {
                valve1: ValvePosition.Port1Port2
            }
        },
        {
            message: `The installed syringe is filled with 2.5 ml of ink.`,
        },
        {
            message: `Valve 1 can now be switched to connect the ink supply port to the printhead.`,
            highlight: {
                valve1: true
            },
            valvePositionChanges: {
                valve1: ValvePosition.Port1Port3
            }
        },
        {
            message: `Ink is loaded by vacuum purging the nozzles using pump 2. On this way,
The ink enters the printhead in a slow and controlled manner without causing turbulence to air bubbles that
may have setteled at a top surface inside the printhead.
The user need to monitor the process carefully to not let air enter the system.`,
            extraComponent: () => document.createElement(InkControlLoadInkTagName)
        },
        {
            message: `Valve 1 is switched back to connect the pressure reservoir to the printhead.`,
            highlight: {
                valve1: true
            },
            valvePositionChanges: {
                valve1: ValvePosition.Port1Port2
            }
        },
    ]
};

const PowerPressurePurge: InkControlAction = {
    name: "Power pressure purge nozzles",
    steps: [
        {
            message: `For pressure purging the nozzles, the printhead capping station must be removed.
Any purged ink is collected by a towel placed under the printhead.`,
            highlight: {
                capprinthead: true
            }
        },
        {
            message: `It must be ensured that the ink supply port cap is closed.`,
            highlight: {
                cap1: true
            }
        },
        {
            message: `To build up pressure, valve 1 is used to shut off the pressure reservoir from the printhead.`,
            highlight: {
                valve1: true
            },
            valvePositionChanges: {
                valve1: ValvePosition.Port1Port3
            },
        },
        {
            message: `The ink pump builds up pressure of 350mbar in the system.`,
            pumpactions: () => {
                let inkPump = new PressureControlPumpParameters();
                inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
                inkPump.targetPressure = 350;
                return {
                    inkPump
                }
            }
        },
        {
            message: `Valve 1 is opened to allow the pressure to purge the nozzles and can be closed again after a short time.
This can be repeated a few times to ensure that all nozzles are purged.`,
            highlight: {
                valve1: true
            },
            valvePositionChanges: {
                valve1: ValvePosition.Port1Port2
            }
        },
        {
            message: `The pressure is regulated back to 0mbar by the ink pump.`,
            pumpactions: () => {
                let inkPump = new PressureControlPumpParameters();
                inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
                inkPump.targetPressure = 0;
                return {
                    inkPump,
                    turnOffPumps: true
                }
            }
        },
        {
            message: `Valve 1 is switched back to connect the pressure reservoir to the printhead.`,
            highlight: {
                valve1: true
            },
            valvePositionChanges: {
                valve1: ValvePosition.Port1Port2
            }
        }
    ]
};

const SuctionPurge: InkControlAction = {
    name: "Suction purge nozzles",
    steps: [
        {
            message: `For suction purging the nozzles, the printhead capping station must be used.`,
            highlight: {
                capprinthead: true
            }
        },
        {
            message: `Valve 3 directs the purged ink to the waste container.`,
            highlight: {
                valve3: true
            },
            valvePositionChanges: {
                valve3: ValvePosition.Port1Port3,
                valve1: ValvePosition.Port1Port2,
                valve2: ValvePosition.Port1Port3
            },
        },
        {
            message: `The capping pump purges the nozzles by vacuuming for 15 seconds, while the ink pump is keeping the pressure at 0mbar.`,
            pumpactions: () => {
                let cappingPump = new PressureControlPumpParameters();
                cappingPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT;
                cappingPump.direction = PressureControlDirection.PressureControlDirection_VACUUM;
                cappingPump.feedTime = 15;
                cappingPump.feedPwm = 0.8;
                cappingPump.maxPressureLimit = 100;
                cappingPump.minPressureLimit = -100;
                let inkPump = new PressureControlPumpParameters();
                inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
                inkPump.targetPressure = 0;
                return {
                    cappingPump,
                    inkPump,
                    turnOffPumps: true
                }
            }
        },
        {
            message: `Valve 3 is switched back to connect port 2 and 3.`,
            highlight: {
                valve3: true
            },
            valvePositionChanges: {
                valve3: ValvePosition.Port2Port3
            }
        }
    ]
};

const Reciculate: InkControlAction = {
    name: "Recirculate",
    steps: [
        {
            message: `Valve 3 directs the purged cleaning fluid back to the pressure reservoir.
There must be no ink remaining in the tubing from capping station to the waste container,
otherwise the supply side will be contaminated. The capping station must be installed.`,
            highlight: {
                valve3: true,
                capprinthead: true
            },
            valvePositionChanges: {
                valve3: ValvePosition.Port2Port3,
                valve1: ValvePosition.Port1Port2,
                valve2: ValvePosition.Port1Port3
            }
        },
        {
            message: `The capping pump is used to recirculate the cleaning fluid for 15 seconds.`,
            pumpactions: () => {
                let cappingPump = new PressureControlPumpParameters();
                cappingPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT;
                cappingPump.direction = PressureControlDirection.PressureControlDirection_VACUUM;
                cappingPump.feedTime = 15;
                cappingPump.feedPwm = 0.8;
                cappingPump.maxPressureLimit = 100;
                cappingPump.minPressureLimit = -100;
                return {
                    cappingPump
                }
            }
        },
        {
            message: `The pressure is regulated back to 0mbar by the ink pump.`,
            pumpactions: () => {
                let inkPump = new PressureControlPumpParameters();
                inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
                inkPump.targetPressure = 0;
                return {
                    inkPump,
                    turnOffPumps: true
                }
            }
        }
    ]
};

const ReciculateSuctionPurge: InkControlAction = {
    name: "Recirculate Vacuum Purge",
    steps: [
        {
            message: "Only use this method if you are sure there is a good seal between the printhead and the capping station.",
        },
        {
            message: `Valve 3 directs the purged cleaning fluid back to the pressure reservoir.
There must be no ink remaining in the tubing from capping station to the waste container,
otherwise the supply side will be contaminated. The capping station must be installed.`,
            highlight: {
                valve3: true,
                capprinthead: true
            },
            valvePositionChanges: {
                valve3: ValvePosition.Port2Port3,
                valve1: ValvePosition.Port1Port2,
                valve2: ValvePosition.Port1Port3
            }
        },
        {
            message: `The capping pump is used to recirculate the cleaning fluid for 5 seconds, followed by a pause of 5 seconds.
This is repeated 10 times.`,
            pumpactions: () => {
                let cappingPump = new PressureControlPumpParameters();
                cappingPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT;
                cappingPump.direction = PressureControlDirection.PressureControlDirection_VACUUM;
                cappingPump.feedTime = 5;
                cappingPump.feedPwm = 1;
                cappingPump.maxPressureLimit = 30;
                cappingPump.minPressureLimit = -30;
                return {
                    cappingPump,
                    repetitions: {
                        count: 10,
                        pause: 5000
                    }
                }
            }
        },
        {
            message: `The pressure is regulated back to 0mbar by the ink pump.`,
            pumpactions: () => {
                let inkPump = new PressureControlPumpParameters();
                inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
                inkPump.targetPressure = 0;
                return {
                    inkPump,
                    turnOffPumps: true
                }
            }
        }
    ]
};


export const ZeroInkPressure: InkControlAction = {
    name: "Zero ink pressure",
    steps: [
        {
            message: `The ink pump is used to set the pressure to 0mbar.`,
            pumpactions: () => {
                let inkPump = new PressureControlPumpParameters();
                inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
                inkPump.targetPressure = 0;
                return {
                    inkPump,
                    turnOffPumps: true
                }
            },
        }
    ]
};


export const inkControlActions: InkControlAction[] = [
    FillPressureReservoir,
    EnterKeepalive,
    SupplyDegassing,
    MildPressurePurge,
    LoadInk,
    PowerPressurePurge,
    SuctionPurge,
    Reciculate,
    ReciculateSuctionPurge,
    ZeroInkPressure
];
