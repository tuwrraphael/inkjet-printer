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

/** Represents a PressureControlChangeParametersRequest. */
export class PressureControlChangeParametersRequest implements IPressureControlChangeParametersRequest {

    /**
     * Constructs a new PressureControlChangeParametersRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPressureControlChangeParametersRequest);

    /** PressureControlChangeParametersRequest parameters. */
    public parameters?: (IPressureControlParameters|null);

    /**
     * Creates a new PressureControlChangeParametersRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PressureControlChangeParametersRequest instance
     */
    public static create(properties?: IPressureControlChangeParametersRequest): PressureControlChangeParametersRequest;

    /**
     * Encodes the specified PressureControlChangeParametersRequest message. Does not implicitly {@link PressureControlChangeParametersRequest.verify|verify} messages.
     * @param message PressureControlChangeParametersRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPressureControlChangeParametersRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PressureControlChangeParametersRequest message, length delimited. Does not implicitly {@link PressureControlChangeParametersRequest.verify|verify} messages.
     * @param message PressureControlChangeParametersRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPressureControlChangeParametersRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PressureControlChangeParametersRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PressureControlChangeParametersRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PressureControlChangeParametersRequest;

    /**
     * Decodes a PressureControlChangeParametersRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PressureControlChangeParametersRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PressureControlChangeParametersRequest;

    /**
     * Verifies a PressureControlChangeParametersRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PressureControlChangeParametersRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PressureControlChangeParametersRequest
     */
    public static fromObject(object: { [k: string]: any }): PressureControlChangeParametersRequest;

    /**
     * Creates a plain object from a PressureControlChangeParametersRequest message. Also converts values to other types if specified.
     * @param message PressureControlChangeParametersRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PressureControlChangeParametersRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PressureControlChangeParametersRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PressureControlChangeParametersRequest
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

    /** PrinterRequest pressureControlChangeParametersRequest. */
    public pressureControlChangeParametersRequest?: (IPressureControlChangeParametersRequest|null);

    /** PrinterRequest _getPrinterSystemStateRequest. */
    public _getPrinterSystemStateRequest?: "getPrinterSystemStateRequest";

    /** PrinterRequest _changePrinterSystemStateRequest. */
    public _changePrinterSystemStateRequest?: "changePrinterSystemStateRequest";

    /** PrinterRequest _changeDropwatcherParametersRequest. */
    public _changeDropwatcherParametersRequest?: "changeDropwatcherParametersRequest";

    /** PrinterRequest _cameraFrameRequest. */
    public _cameraFrameRequest?: "cameraFrameRequest";

    /** PrinterRequest _pressureControlChangeParametersRequest. */
    public _pressureControlChangeParametersRequest?: "pressureControlChangeParametersRequest";

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
    PrinterSystemState_DROPWATCHER = 4
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
