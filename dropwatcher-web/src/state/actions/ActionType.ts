export const enum ActionType {
    PrinterSystemStateResponseReceived,
    PrinterUSBConnectionStateChanged,
    InitializeWorker,
    MovementStageConnectionChanged,
    MovementStagePositionChanged,
    ProgramRunnerStateChanged,
    NozzleDataChanged,
    DropwatcherParametersChanged,
    CameraStateChanged,
    DropwatcherNozzlePosChanged,
    ModelAdded,
    ViewLayerChanged,
    ModelPositionChanged,
    SlicePositionChanged,
    SlicePositionIncrement,
    PrintingParamsChanged
}