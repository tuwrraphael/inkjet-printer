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
    PrintBedViewStateChanged,
    ModelPositionChanged,
    SlicePositionChanged,
    SlicePositionIncrement,
    PrintingParamsChanged,
    SaveToFile,
    OpenFile,
    SaveToCurrentFile,
    ModelSelected,
    ModelParamsChanged,
    SetSlicerWorker,
    PrintingTrack,
    SetCustomTracks,
    ModelGroupParamsChanged
}