import * as $protobuf from "protobufjs";
import Long = require("long");
/** PressureControlAlgorithm enum. */
export enum PressureControlAlgorithm {
    PressureControlAlgorithm_UNSPECIFIED = 0,
    PressureControlAlgorithm_TARGET_PRESSURE = 1,
    PressureControlAlgorithm_FEED_WITH_LIMIT = 2
}

/** PressureControlDirection enum. */
export enum PressureControlDirection {
    PressureControlDirection_UNSPECIFIED = 0,
    PressureControlDirection_VACUUM = 1,
    PressureControlDirection_PRESSURE = 2
}

/** Represents a PressureControlParameters. */
export class PressureControlParameters implements IPressureControlParameters {

    /**
     * Constructs a new PressureControlParameters.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPressureControlParameters);

    /** PressureControlParameters enable. */
    public enable: boolean;

    /** PressureControlParameters algorithm. */
    public algorithm: PressureControlAlgorithm;

    /** PressureControlParameters targetPressure. */
    public targetPressure: number;

    /** PressureControlParameters direction. */
    public direction: PressureControlDirection;

    /** PressureControlParameters limitPressure. */
    public limitPressure: number;

    /** PressureControlParameters feedPwm. */
    public feedPwm: number;

    /** PressureControlParameters feedTime. */
    public feedTime: number;

    /**
     * Creates a new PressureControlParameters instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PressureControlParameters instance
     */
    public static create(properties?: IPressureControlParameters): PressureControlParameters;

    /**
     * Encodes the specified PressureControlParameters message. Does not implicitly {@link PressureControlParameters.verify|verify} messages.
     * @param message PressureControlParameters message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPressureControlParameters, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PressureControlParameters message, length delimited. Does not implicitly {@link PressureControlParameters.verify|verify} messages.
     * @param message PressureControlParameters message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPressureControlParameters, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PressureControlParameters message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PressureControlParameters
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PressureControlParameters;

    /**
     * Decodes a PressureControlParameters message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PressureControlParameters
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PressureControlParameters;

    /**
     * Verifies a PressureControlParameters message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PressureControlParameters message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PressureControlParameters
     */
    public static fromObject(object: { [k: string]: any }): PressureControlParameters;

    /**
     * Creates a plain object from a PressureControlParameters message. Also converts values to other types if specified.
     * @param message PressureControlParameters
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PressureControlParameters, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PressureControlParameters to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PressureControlParameters
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a PressureControlSystemState. */
export class PressureControlSystemState implements IPressureControlSystemState {

    /**
     * Constructs a new PressureControlSystemState.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPressureControlSystemState);

    /** PressureControlSystemState pressure. */
    public pressure: number;

    /** PressureControlSystemState enabled. */
    public enabled: boolean;

    /** PressureControlSystemState parameters. */
    public parameters?: (IPressureControlParameters|null);

    /** PressureControlSystemState done. */
    public done: boolean;

    /**
     * Creates a new PressureControlSystemState instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PressureControlSystemState instance
     */
    public static create(properties?: IPressureControlSystemState): PressureControlSystemState;

    /**
     * Encodes the specified PressureControlSystemState message. Does not implicitly {@link PressureControlSystemState.verify|verify} messages.
     * @param message PressureControlSystemState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPressureControlSystemState, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PressureControlSystemState message, length delimited. Does not implicitly {@link PressureControlSystemState.verify|verify} messages.
     * @param message PressureControlSystemState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPressureControlSystemState, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PressureControlSystemState message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PressureControlSystemState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PressureControlSystemState;

    /**
     * Decodes a PressureControlSystemState message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PressureControlSystemState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PressureControlSystemState;

    /**
     * Verifies a PressureControlSystemState message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PressureControlSystemState message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PressureControlSystemState
     */
    public static fromObject(object: { [k: string]: any }): PressureControlSystemState;

    /**
     * Creates a plain object from a PressureControlSystemState message. Also converts values to other types if specified.
     * @param message PressureControlSystemState
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PressureControlSystemState, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PressureControlSystemState to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PressureControlSystemState
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a PrintControlEncoderModeSettings. */
export class PrintControlEncoderModeSettings implements IPrintControlEncoderModeSettings {

    /**
     * Constructs a new PrintControlEncoderModeSettings.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPrintControlEncoderModeSettings);

    /** PrintControlEncoderModeSettings sequentialFires. */
    public sequentialFires: number;

    /** PrintControlEncoderModeSettings fireEveryTicks. */
    public fireEveryTicks: number;

    /** PrintControlEncoderModeSettings printFirstLineAfterEncoderTick. */
    public printFirstLineAfterEncoderTick: number;

    /**
     * Creates a new PrintControlEncoderModeSettings instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PrintControlEncoderModeSettings instance
     */
    public static create(properties?: IPrintControlEncoderModeSettings): PrintControlEncoderModeSettings;

    /**
     * Encodes the specified PrintControlEncoderModeSettings message. Does not implicitly {@link PrintControlEncoderModeSettings.verify|verify} messages.
     * @param message PrintControlEncoderModeSettings message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPrintControlEncoderModeSettings, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PrintControlEncoderModeSettings message, length delimited. Does not implicitly {@link PrintControlEncoderModeSettings.verify|verify} messages.
     * @param message PrintControlEncoderModeSettings message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPrintControlEncoderModeSettings, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PrintControlEncoderModeSettings message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PrintControlEncoderModeSettings
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PrintControlEncoderModeSettings;

    /**
     * Decodes a PrintControlEncoderModeSettings message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PrintControlEncoderModeSettings
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PrintControlEncoderModeSettings;

    /**
     * Verifies a PrintControlEncoderModeSettings message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PrintControlEncoderModeSettings message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PrintControlEncoderModeSettings
     */
    public static fromObject(object: { [k: string]: any }): PrintControlEncoderModeSettings;

    /**
     * Creates a plain object from a PrintControlEncoderModeSettings message. Also converts values to other types if specified.
     * @param message PrintControlEncoderModeSettings
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PrintControlEncoderModeSettings, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PrintControlEncoderModeSettings to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PrintControlEncoderModeSettings
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a PrintControlState. */
export class PrintControlState implements IPrintControlState {

    /**
     * Constructs a new PrintControlState.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPrintControlState);

    /** PrintControlState encoderModeSettings. */
    public encoderModeSettings?: (IPrintControlEncoderModeSettings|null);

    /** PrintControlState encoderValue. */
    public encoderValue: number;

    /** PrintControlState expectedEncoderValue. */
    public expectedEncoderValue: number;

    /** PrintControlState lastPrintedLine. */
    public lastPrintedLine: number;

    /** PrintControlState lostLinesCount. */
    public lostLinesCount: number;

    /** PrintControlState printedLines. */
    public printedLines: number;

    /**
     * Creates a new PrintControlState instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PrintControlState instance
     */
    public static create(properties?: IPrintControlState): PrintControlState;

    /**
     * Encodes the specified PrintControlState message. Does not implicitly {@link PrintControlState.verify|verify} messages.
     * @param message PrintControlState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPrintControlState, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PrintControlState message, length delimited. Does not implicitly {@link PrintControlState.verify|verify} messages.
     * @param message PrintControlState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPrintControlState, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PrintControlState message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PrintControlState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PrintControlState;

    /**
     * Decodes a PrintControlState message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PrintControlState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PrintControlState;

    /**
     * Verifies a PrintControlState message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PrintControlState message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PrintControlState
     */
    public static fromObject(object: { [k: string]: any }): PrintControlState;

    /**
     * Creates a plain object from a PrintControlState message. Also converts values to other types if specified.
     * @param message PrintControlState
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PrintControlState, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PrintControlState to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PrintControlState
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a GetPrinterSystemStateRequest. */
export class GetPrinterSystemStateRequest implements IGetPrinterSystemStateRequest {

    /**
     * Constructs a new GetPrinterSystemStateRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetPrinterSystemStateRequest);

    /**
     * Creates a new GetPrinterSystemStateRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetPrinterSystemStateRequest instance
     */
    public static create(properties?: IGetPrinterSystemStateRequest): GetPrinterSystemStateRequest;

    /**
     * Encodes the specified GetPrinterSystemStateRequest message. Does not implicitly {@link GetPrinterSystemStateRequest.verify|verify} messages.
     * @param message GetPrinterSystemStateRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetPrinterSystemStateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetPrinterSystemStateRequest message, length delimited. Does not implicitly {@link GetPrinterSystemStateRequest.verify|verify} messages.
     * @param message GetPrinterSystemStateRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetPrinterSystemStateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetPrinterSystemStateRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetPrinterSystemStateRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetPrinterSystemStateRequest;

    /**
     * Decodes a GetPrinterSystemStateRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetPrinterSystemStateRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetPrinterSystemStateRequest;

    /**
     * Verifies a GetPrinterSystemStateRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetPrinterSystemStateRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetPrinterSystemStateRequest
     */
    public static fromObject(object: { [k: string]: any }): GetPrinterSystemStateRequest;

    /**
     * Creates a plain object from a GetPrinterSystemStateRequest message. Also converts values to other types if specified.
     * @param message GetPrinterSystemStateRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetPrinterSystemStateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetPrinterSystemStateRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for GetPrinterSystemStateRequest
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a ChangePrinterSystemStateRequest. */
export class ChangePrinterSystemStateRequest implements IChangePrinterSystemStateRequest {

    /**
     * Constructs a new ChangePrinterSystemStateRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: IChangePrinterSystemStateRequest);

    /** ChangePrinterSystemStateRequest state. */
    public state: PrinterSystemState;

    /**
     * Creates a new ChangePrinterSystemStateRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ChangePrinterSystemStateRequest instance
     */
    public static create(properties?: IChangePrinterSystemStateRequest): ChangePrinterSystemStateRequest;

    /**
     * Encodes the specified ChangePrinterSystemStateRequest message. Does not implicitly {@link ChangePrinterSystemStateRequest.verify|verify} messages.
     * @param message ChangePrinterSystemStateRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IChangePrinterSystemStateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ChangePrinterSystemStateRequest message, length delimited. Does not implicitly {@link ChangePrinterSystemStateRequest.verify|verify} messages.
     * @param message ChangePrinterSystemStateRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IChangePrinterSystemStateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ChangePrinterSystemStateRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ChangePrinterSystemStateRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ChangePrinterSystemStateRequest;

    /**
     * Decodes a ChangePrinterSystemStateRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ChangePrinterSystemStateRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ChangePrinterSystemStateRequest;

    /**
     * Verifies a ChangePrinterSystemStateRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ChangePrinterSystemStateRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ChangePrinterSystemStateRequest
     */
    public static fromObject(object: { [k: string]: any }): ChangePrinterSystemStateRequest;

    /**
     * Creates a plain object from a ChangePrinterSystemStateRequest message. Also converts values to other types if specified.
     * @param message ChangePrinterSystemStateRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ChangePrinterSystemStateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ChangePrinterSystemStateRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ChangePrinterSystemStateRequest
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a ChangeDropwatcherParametersRequest. */
export class ChangeDropwatcherParametersRequest implements IChangeDropwatcherParametersRequest {

    /**
     * Constructs a new ChangeDropwatcherParametersRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: IChangeDropwatcherParametersRequest);

    /** ChangeDropwatcherParametersRequest delayNanos. */
    public delayNanos: number;

    /** ChangeDropwatcherParametersRequest flashOnTimeNanos. */
    public flashOnTimeNanos: number;

    /**
     * Creates a new ChangeDropwatcherParametersRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ChangeDropwatcherParametersRequest instance
     */
    public static create(properties?: IChangeDropwatcherParametersRequest): ChangeDropwatcherParametersRequest;

    /**
     * Encodes the specified ChangeDropwatcherParametersRequest message. Does not implicitly {@link ChangeDropwatcherParametersRequest.verify|verify} messages.
     * @param message ChangeDropwatcherParametersRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IChangeDropwatcherParametersRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ChangeDropwatcherParametersRequest message, length delimited. Does not implicitly {@link ChangeDropwatcherParametersRequest.verify|verify} messages.
     * @param message ChangeDropwatcherParametersRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IChangeDropwatcherParametersRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ChangeDropwatcherParametersRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ChangeDropwatcherParametersRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ChangeDropwatcherParametersRequest;

    /**
     * Decodes a ChangeDropwatcherParametersRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ChangeDropwatcherParametersRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ChangeDropwatcherParametersRequest;

    /**
     * Verifies a ChangeDropwatcherParametersRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ChangeDropwatcherParametersRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ChangeDropwatcherParametersRequest
     */
    public static fromObject(object: { [k: string]: any }): ChangeDropwatcherParametersRequest;

    /**
     * Creates a plain object from a ChangeDropwatcherParametersRequest message. Also converts values to other types if specified.
     * @param message ChangeDropwatcherParametersRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ChangeDropwatcherParametersRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ChangeDropwatcherParametersRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ChangeDropwatcherParametersRequest
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a CameraFrameRequest. */
export class CameraFrameRequest implements ICameraFrameRequest {

    /**
     * Constructs a new CameraFrameRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICameraFrameRequest);

    /**
     * Creates a new CameraFrameRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CameraFrameRequest instance
     */
    public static create(properties?: ICameraFrameRequest): CameraFrameRequest;

    /**
     * Encodes the specified CameraFrameRequest message. Does not implicitly {@link CameraFrameRequest.verify|verify} messages.
     * @param message CameraFrameRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICameraFrameRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CameraFrameRequest message, length delimited. Does not implicitly {@link CameraFrameRequest.verify|verify} messages.
     * @param message CameraFrameRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICameraFrameRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CameraFrameRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CameraFrameRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CameraFrameRequest;

    /**
     * Decodes a CameraFrameRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CameraFrameRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): CameraFrameRequest;

    /**
     * Verifies a CameraFrameRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a CameraFrameRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CameraFrameRequest
     */
    public static fromObject(object: { [k: string]: any }): CameraFrameRequest;

    /**
     * Creates a plain object from a CameraFrameRequest message. Also converts values to other types if specified.
     * @param message CameraFrameRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: CameraFrameRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this CameraFrameRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for CameraFrameRequest
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a ChangePressureControlParametersRequest. */
export class ChangePressureControlParametersRequest implements IChangePressureControlParametersRequest {

    /**
     * Constructs a new ChangePressureControlParametersRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: IChangePressureControlParametersRequest);

    /** ChangePressureControlParametersRequest parameters. */
    public parameters?: (IPressureControlParameters|null);

    /**
     * Creates a new ChangePressureControlParametersRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ChangePressureControlParametersRequest instance
     */
    public static create(properties?: IChangePressureControlParametersRequest): ChangePressureControlParametersRequest;

    /**
     * Encodes the specified ChangePressureControlParametersRequest message. Does not implicitly {@link ChangePressureControlParametersRequest.verify|verify} messages.
     * @param message ChangePressureControlParametersRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IChangePressureControlParametersRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ChangePressureControlParametersRequest message, length delimited. Does not implicitly {@link ChangePressureControlParametersRequest.verify|verify} messages.
     * @param message ChangePressureControlParametersRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IChangePressureControlParametersRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ChangePressureControlParametersRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ChangePressureControlParametersRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ChangePressureControlParametersRequest;

    /**
     * Decodes a ChangePressureControlParametersRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ChangePressureControlParametersRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ChangePressureControlParametersRequest;

    /**
     * Verifies a ChangePressureControlParametersRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ChangePressureControlParametersRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ChangePressureControlParametersRequest
     */
    public static fromObject(object: { [k: string]: any }): ChangePressureControlParametersRequest;

    /**
     * Creates a plain object from a ChangePressureControlParametersRequest message. Also converts values to other types if specified.
     * @param message ChangePressureControlParametersRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ChangePressureControlParametersRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ChangePressureControlParametersRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ChangePressureControlParametersRequest
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a ChangeNozzleDataRequest. */
export class ChangeNozzleDataRequest implements IChangeNozzleDataRequest {

    /**
     * Constructs a new ChangeNozzleDataRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: IChangeNozzleDataRequest);

    /** ChangeNozzleDataRequest data. */
    public data: number[];

    /**
     * Creates a new ChangeNozzleDataRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ChangeNozzleDataRequest instance
     */
    public static create(properties?: IChangeNozzleDataRequest): ChangeNozzleDataRequest;

    /**
     * Encodes the specified ChangeNozzleDataRequest message. Does not implicitly {@link ChangeNozzleDataRequest.verify|verify} messages.
     * @param message ChangeNozzleDataRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IChangeNozzleDataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ChangeNozzleDataRequest message, length delimited. Does not implicitly {@link ChangeNozzleDataRequest.verify|verify} messages.
     * @param message ChangeNozzleDataRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IChangeNozzleDataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ChangeNozzleDataRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ChangeNozzleDataRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ChangeNozzleDataRequest;

    /**
     * Decodes a ChangeNozzleDataRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ChangeNozzleDataRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ChangeNozzleDataRequest;

    /**
     * Verifies a ChangeNozzleDataRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ChangeNozzleDataRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ChangeNozzleDataRequest
     */
    public static fromObject(object: { [k: string]: any }): ChangeNozzleDataRequest;

    /**
     * Creates a plain object from a ChangeNozzleDataRequest message. Also converts values to other types if specified.
     * @param message ChangeNozzleDataRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ChangeNozzleDataRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ChangeNozzleDataRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ChangeNozzleDataRequest
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a ChangeEncoderPositionRequest. */
export class ChangeEncoderPositionRequest implements IChangeEncoderPositionRequest {

    /**
     * Constructs a new ChangeEncoderPositionRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: IChangeEncoderPositionRequest);

    /** ChangeEncoderPositionRequest position. */
    public position: number;

    /**
     * Creates a new ChangeEncoderPositionRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ChangeEncoderPositionRequest instance
     */
    public static create(properties?: IChangeEncoderPositionRequest): ChangeEncoderPositionRequest;

    /**
     * Encodes the specified ChangeEncoderPositionRequest message. Does not implicitly {@link ChangeEncoderPositionRequest.verify|verify} messages.
     * @param message ChangeEncoderPositionRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IChangeEncoderPositionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ChangeEncoderPositionRequest message, length delimited. Does not implicitly {@link ChangeEncoderPositionRequest.verify|verify} messages.
     * @param message ChangeEncoderPositionRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IChangeEncoderPositionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ChangeEncoderPositionRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ChangeEncoderPositionRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ChangeEncoderPositionRequest;

    /**
     * Decodes a ChangeEncoderPositionRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ChangeEncoderPositionRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ChangeEncoderPositionRequest;

    /**
     * Verifies a ChangeEncoderPositionRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ChangeEncoderPositionRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ChangeEncoderPositionRequest
     */
    public static fromObject(object: { [k: string]: any }): ChangeEncoderPositionRequest;

    /**
     * Creates a plain object from a ChangeEncoderPositionRequest message. Also converts values to other types if specified.
     * @param message ChangeEncoderPositionRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ChangeEncoderPositionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ChangeEncoderPositionRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ChangeEncoderPositionRequest
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a ChangeEncoderModeSettingsRequest. */
export class ChangeEncoderModeSettingsRequest implements IChangeEncoderModeSettingsRequest {

    /**
     * Constructs a new ChangeEncoderModeSettingsRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: IChangeEncoderModeSettingsRequest);

    /** ChangeEncoderModeSettingsRequest encoderModeSettings. */
    public encoderModeSettings?: (IPrintControlEncoderModeSettings|null);

    /**
     * Creates a new ChangeEncoderModeSettingsRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ChangeEncoderModeSettingsRequest instance
     */
    public static create(properties?: IChangeEncoderModeSettingsRequest): ChangeEncoderModeSettingsRequest;

    /**
     * Encodes the specified ChangeEncoderModeSettingsRequest message. Does not implicitly {@link ChangeEncoderModeSettingsRequest.verify|verify} messages.
     * @param message ChangeEncoderModeSettingsRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IChangeEncoderModeSettingsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ChangeEncoderModeSettingsRequest message, length delimited. Does not implicitly {@link ChangeEncoderModeSettingsRequest.verify|verify} messages.
     * @param message ChangeEncoderModeSettingsRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IChangeEncoderModeSettingsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ChangeEncoderModeSettingsRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ChangeEncoderModeSettingsRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ChangeEncoderModeSettingsRequest;

    /**
     * Decodes a ChangeEncoderModeSettingsRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ChangeEncoderModeSettingsRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ChangeEncoderModeSettingsRequest;

    /**
     * Verifies a ChangeEncoderModeSettingsRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ChangeEncoderModeSettingsRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ChangeEncoderModeSettingsRequest
     */
    public static fromObject(object: { [k: string]: any }): ChangeEncoderModeSettingsRequest;

    /**
     * Creates a plain object from a ChangeEncoderModeSettingsRequest message. Also converts values to other types if specified.
     * @param message ChangeEncoderModeSettingsRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ChangeEncoderModeSettingsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ChangeEncoderModeSettingsRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ChangeEncoderModeSettingsRequest
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a ChangePrintMemoryRequest. */
export class ChangePrintMemoryRequest implements IChangePrintMemoryRequest {

    /**
     * Constructs a new ChangePrintMemoryRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: IChangePrintMemoryRequest);

    /** ChangePrintMemoryRequest offset. */
    public offset: number;

    /** ChangePrintMemoryRequest data. */
    public data: number[];

    /**
     * Creates a new ChangePrintMemoryRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ChangePrintMemoryRequest instance
     */
    public static create(properties?: IChangePrintMemoryRequest): ChangePrintMemoryRequest;

    /**
     * Encodes the specified ChangePrintMemoryRequest message. Does not implicitly {@link ChangePrintMemoryRequest.verify|verify} messages.
     * @param message ChangePrintMemoryRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IChangePrintMemoryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ChangePrintMemoryRequest message, length delimited. Does not implicitly {@link ChangePrintMemoryRequest.verify|verify} messages.
     * @param message ChangePrintMemoryRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IChangePrintMemoryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ChangePrintMemoryRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ChangePrintMemoryRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ChangePrintMemoryRequest;

    /**
     * Decodes a ChangePrintMemoryRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ChangePrintMemoryRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ChangePrintMemoryRequest;

    /**
     * Verifies a ChangePrintMemoryRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ChangePrintMemoryRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ChangePrintMemoryRequest
     */
    public static fromObject(object: { [k: string]: any }): ChangePrintMemoryRequest;

    /**
     * Creates a plain object from a ChangePrintMemoryRequest message. Also converts values to other types if specified.
     * @param message ChangePrintMemoryRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ChangePrintMemoryRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ChangePrintMemoryRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ChangePrintMemoryRequest
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a PrinterRequest. */
export class PrinterRequest implements IPrinterRequest {

    /**
     * Constructs a new PrinterRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPrinterRequest);

    /** PrinterRequest getPrinterSystemStateRequest. */
    public getPrinterSystemStateRequest?: (IGetPrinterSystemStateRequest|null);

    /** PrinterRequest changePrinterSystemStateRequest. */
    public changePrinterSystemStateRequest?: (IChangePrinterSystemStateRequest|null);

    /** PrinterRequest changeDropwatcherParametersRequest. */
    public changeDropwatcherParametersRequest?: (IChangeDropwatcherParametersRequest|null);

    /** PrinterRequest cameraFrameRequest. */
    public cameraFrameRequest?: (ICameraFrameRequest|null);

    /** PrinterRequest changePressureControlParameterRequest. */
    public changePressureControlParameterRequest?: (IChangePressureControlParametersRequest|null);

    /** PrinterRequest changeNozzleDataRequest. */
    public changeNozzleDataRequest?: (IChangeNozzleDataRequest|null);

    /** PrinterRequest changeEncoderPositionRequest. */
    public changeEncoderPositionRequest?: (IChangeEncoderPositionRequest|null);

    /** PrinterRequest changeEncoderModeSettingsRequest. */
    public changeEncoderModeSettingsRequest?: (IChangeEncoderModeSettingsRequest|null);

    /** PrinterRequest changePrintMemoryRequest. */
    public changePrintMemoryRequest?: (IChangePrintMemoryRequest|null);

    /** PrinterRequest _getPrinterSystemStateRequest. */
    public _getPrinterSystemStateRequest?: "getPrinterSystemStateRequest";

    /** PrinterRequest _changePrinterSystemStateRequest. */
    public _changePrinterSystemStateRequest?: "changePrinterSystemStateRequest";

    /** PrinterRequest _changeDropwatcherParametersRequest. */
    public _changeDropwatcherParametersRequest?: "changeDropwatcherParametersRequest";

    /** PrinterRequest _cameraFrameRequest. */
    public _cameraFrameRequest?: "cameraFrameRequest";

    /** PrinterRequest _changePressureControlParameterRequest. */
    public _changePressureControlParameterRequest?: "changePressureControlParameterRequest";

    /** PrinterRequest _changeNozzleDataRequest. */
    public _changeNozzleDataRequest?: "changeNozzleDataRequest";

    /** PrinterRequest _changeEncoderPositionRequest. */
    public _changeEncoderPositionRequest?: "changeEncoderPositionRequest";

    /** PrinterRequest _changeEncoderModeSettingsRequest. */
    public _changeEncoderModeSettingsRequest?: "changeEncoderModeSettingsRequest";

    /** PrinterRequest _changePrintMemoryRequest. */
    public _changePrintMemoryRequest?: "changePrintMemoryRequest";

    /**
     * Creates a new PrinterRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PrinterRequest instance
     */
    public static create(properties?: IPrinterRequest): PrinterRequest;

    /**
     * Encodes the specified PrinterRequest message. Does not implicitly {@link PrinterRequest.verify|verify} messages.
     * @param message PrinterRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPrinterRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PrinterRequest message, length delimited. Does not implicitly {@link PrinterRequest.verify|verify} messages.
     * @param message PrinterRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPrinterRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PrinterRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PrinterRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PrinterRequest;

    /**
     * Decodes a PrinterRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PrinterRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PrinterRequest;

    /**
     * Verifies a PrinterRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PrinterRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PrinterRequest
     */
    public static fromObject(object: { [k: string]: any }): PrinterRequest;

    /**
     * Creates a plain object from a PrinterRequest message. Also converts values to other types if specified.
     * @param message PrinterRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PrinterRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PrinterRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PrinterRequest
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** PrinterSystemState enum. */
export enum PrinterSystemState {
    PrinterSystemState_UNSPECIFIED = 0,
    PrinterSystemState_STARTUP = 1,
    PrinterSystemState_IDLE = 2,
    PrinterSystemState_ERROR = 3,
    PrinterSystemState_DROPWATCHER = 4,
    PrinterSystemState_PRINT = 5
}

/** Represents a PrinterSystemStateResponse. */
export class PrinterSystemStateResponse implements IPrinterSystemStateResponse {

    /**
     * Constructs a new PrinterSystemStateResponse.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPrinterSystemStateResponse);

    /** PrinterSystemStateResponse state. */
    public state: PrinterSystemState;

    /** PrinterSystemStateResponse errorFlags. */
    public errorFlags: number;

    /** PrinterSystemStateResponse pressureControl. */
    public pressureControl?: (IPressureControlSystemState|null);

    /** PrinterSystemStateResponse printControl. */
    public printControl?: (IPrintControlState|null);

    /**
     * Creates a new PrinterSystemStateResponse instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PrinterSystemStateResponse instance
     */
    public static create(properties?: IPrinterSystemStateResponse): PrinterSystemStateResponse;

    /**
     * Encodes the specified PrinterSystemStateResponse message. Does not implicitly {@link PrinterSystemStateResponse.verify|verify} messages.
     * @param message PrinterSystemStateResponse message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPrinterSystemStateResponse, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PrinterSystemStateResponse message, length delimited. Does not implicitly {@link PrinterSystemStateResponse.verify|verify} messages.
     * @param message PrinterSystemStateResponse message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPrinterSystemStateResponse, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PrinterSystemStateResponse message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PrinterSystemStateResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PrinterSystemStateResponse;

    /**
     * Decodes a PrinterSystemStateResponse message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PrinterSystemStateResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PrinterSystemStateResponse;

    /**
     * Verifies a PrinterSystemStateResponse message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PrinterSystemStateResponse message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PrinterSystemStateResponse
     */
    public static fromObject(object: { [k: string]: any }): PrinterSystemStateResponse;

    /**
     * Creates a plain object from a PrinterSystemStateResponse message. Also converts values to other types if specified.
     * @param message PrinterSystemStateResponse
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PrinterSystemStateResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PrinterSystemStateResponse to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PrinterSystemStateResponse
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}
