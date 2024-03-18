/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

/**
 * PressureControlAlgorithm enum.
 * @exports PressureControlAlgorithm
 * @enum {number}
 * @property {number} PressureControlAlgorithm_UNSPECIFIED=0 PressureControlAlgorithm_UNSPECIFIED value
 * @property {number} PressureControlAlgorithm_TARGET_PRESSURE=1 PressureControlAlgorithm_TARGET_PRESSURE value
 * @property {number} PressureControlAlgorithm_FEED_WITH_LIMIT=2 PressureControlAlgorithm_FEED_WITH_LIMIT value
 */
export const PressureControlAlgorithm = $root.PressureControlAlgorithm = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "PressureControlAlgorithm_UNSPECIFIED"] = 0;
    values[valuesById[1] = "PressureControlAlgorithm_TARGET_PRESSURE"] = 1;
    values[valuesById[2] = "PressureControlAlgorithm_FEED_WITH_LIMIT"] = 2;
    return values;
})();

/**
 * PressureControlDirection enum.
 * @exports PressureControlDirection
 * @enum {number}
 * @property {number} PressureControlDirection_UNSPECIFIED=0 PressureControlDirection_UNSPECIFIED value
 * @property {number} PressureControlDirection_VACUUM=1 PressureControlDirection_VACUUM value
 * @property {number} PressureControlDirection_PRESSURE=2 PressureControlDirection_PRESSURE value
 */
export const PressureControlDirection = $root.PressureControlDirection = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "PressureControlDirection_UNSPECIFIED"] = 0;
    values[valuesById[1] = "PressureControlDirection_VACUUM"] = 1;
    values[valuesById[2] = "PressureControlDirection_PRESSURE"] = 2;
    return values;
})();

export const PressureControlParameters = $root.PressureControlParameters = (() => {

    /**
     * Properties of a PressureControlParameters.
     * @exports IPressureControlParameters
     * @interface IPressureControlParameters
     * @property {boolean|null} [enabled] PressureControlParameters enabled
     * @property {PressureControlAlgorithm|null} [algorithm] PressureControlParameters algorithm
     * @property {number|null} [targetPressure] PressureControlParameters targetPressure
     * @property {PressureControlDirection|null} [direction] PressureControlParameters direction
     * @property {number|null} [limitPressure] PressureControlParameters limitPressure
     * @property {number|null} [feedPwm] PressureControlParameters feedPwm
     * @property {number|null} [feedTime] PressureControlParameters feedTime
     */

    /**
     * Constructs a new PressureControlParameters.
     * @exports PressureControlParameters
     * @classdesc Represents a PressureControlParameters.
     * @implements IPressureControlParameters
     * @constructor
     * @param {IPressureControlParameters=} [properties] Properties to set
     */
    function PressureControlParameters(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PressureControlParameters enabled.
     * @member {boolean} enabled
     * @memberof PressureControlParameters
     * @instance
     */
    PressureControlParameters.prototype.enabled = false;

    /**
     * PressureControlParameters algorithm.
     * @member {PressureControlAlgorithm} algorithm
     * @memberof PressureControlParameters
     * @instance
     */
    PressureControlParameters.prototype.algorithm = 0;

    /**
     * PressureControlParameters targetPressure.
     * @member {number} targetPressure
     * @memberof PressureControlParameters
     * @instance
     */
    PressureControlParameters.prototype.targetPressure = 0;

    /**
     * PressureControlParameters direction.
     * @member {PressureControlDirection} direction
     * @memberof PressureControlParameters
     * @instance
     */
    PressureControlParameters.prototype.direction = 0;

    /**
     * PressureControlParameters limitPressure.
     * @member {number} limitPressure
     * @memberof PressureControlParameters
     * @instance
     */
    PressureControlParameters.prototype.limitPressure = 0;

    /**
     * PressureControlParameters feedPwm.
     * @member {number} feedPwm
     * @memberof PressureControlParameters
     * @instance
     */
    PressureControlParameters.prototype.feedPwm = 0;

    /**
     * PressureControlParameters feedTime.
     * @member {number} feedTime
     * @memberof PressureControlParameters
     * @instance
     */
    PressureControlParameters.prototype.feedTime = 0;

    /**
     * Creates a new PressureControlParameters instance using the specified properties.
     * @function create
     * @memberof PressureControlParameters
     * @static
     * @param {IPressureControlParameters=} [properties] Properties to set
     * @returns {PressureControlParameters} PressureControlParameters instance
     */
    PressureControlParameters.create = function create(properties) {
        return new PressureControlParameters(properties);
    };

    /**
     * Encodes the specified PressureControlParameters message. Does not implicitly {@link PressureControlParameters.verify|verify} messages.
     * @function encode
     * @memberof PressureControlParameters
     * @static
     * @param {IPressureControlParameters} message PressureControlParameters message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PressureControlParameters.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.enabled != null && Object.hasOwnProperty.call(message, "enabled"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.enabled);
        if (message.algorithm != null && Object.hasOwnProperty.call(message, "algorithm"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.algorithm);
        if (message.targetPressure != null && Object.hasOwnProperty.call(message, "targetPressure"))
            writer.uint32(/* id 3, wireType 5 =*/29).float(message.targetPressure);
        if (message.direction != null && Object.hasOwnProperty.call(message, "direction"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.direction);
        if (message.limitPressure != null && Object.hasOwnProperty.call(message, "limitPressure"))
            writer.uint32(/* id 5, wireType 5 =*/45).float(message.limitPressure);
        if (message.feedPwm != null && Object.hasOwnProperty.call(message, "feedPwm"))
            writer.uint32(/* id 6, wireType 5 =*/53).float(message.feedPwm);
        if (message.feedTime != null && Object.hasOwnProperty.call(message, "feedTime"))
            writer.uint32(/* id 7, wireType 5 =*/61).float(message.feedTime);
        return writer;
    };

    /**
     * Encodes the specified PressureControlParameters message, length delimited. Does not implicitly {@link PressureControlParameters.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PressureControlParameters
     * @static
     * @param {IPressureControlParameters} message PressureControlParameters message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PressureControlParameters.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PressureControlParameters message from the specified reader or buffer.
     * @function decode
     * @memberof PressureControlParameters
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PressureControlParameters} PressureControlParameters
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PressureControlParameters.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.PressureControlParameters();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.enabled = reader.bool();
                    break;
                }
            case 2: {
                    message.algorithm = reader.int32();
                    break;
                }
            case 3: {
                    message.targetPressure = reader.float();
                    break;
                }
            case 4: {
                    message.direction = reader.int32();
                    break;
                }
            case 5: {
                    message.limitPressure = reader.float();
                    break;
                }
            case 6: {
                    message.feedPwm = reader.float();
                    break;
                }
            case 7: {
                    message.feedTime = reader.float();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a PressureControlParameters message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PressureControlParameters
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PressureControlParameters} PressureControlParameters
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PressureControlParameters.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PressureControlParameters message.
     * @function verify
     * @memberof PressureControlParameters
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PressureControlParameters.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            if (typeof message.enabled !== "boolean")
                return "enabled: boolean expected";
        if (message.algorithm != null && message.hasOwnProperty("algorithm"))
            switch (message.algorithm) {
            default:
                return "algorithm: enum value expected";
            case 0:
            case 1:
            case 2:
                break;
            }
        if (message.targetPressure != null && message.hasOwnProperty("targetPressure"))
            if (typeof message.targetPressure !== "number")
                return "targetPressure: number expected";
        if (message.direction != null && message.hasOwnProperty("direction"))
            switch (message.direction) {
            default:
                return "direction: enum value expected";
            case 0:
            case 1:
            case 2:
                break;
            }
        if (message.limitPressure != null && message.hasOwnProperty("limitPressure"))
            if (typeof message.limitPressure !== "number")
                return "limitPressure: number expected";
        if (message.feedPwm != null && message.hasOwnProperty("feedPwm"))
            if (typeof message.feedPwm !== "number")
                return "feedPwm: number expected";
        if (message.feedTime != null && message.hasOwnProperty("feedTime"))
            if (typeof message.feedTime !== "number")
                return "feedTime: number expected";
        return null;
    };

    /**
     * Creates a PressureControlParameters message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PressureControlParameters
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PressureControlParameters} PressureControlParameters
     */
    PressureControlParameters.fromObject = function fromObject(object) {
        if (object instanceof $root.PressureControlParameters)
            return object;
        let message = new $root.PressureControlParameters();
        if (object.enabled != null)
            message.enabled = Boolean(object.enabled);
        switch (object.algorithm) {
        default:
            if (typeof object.algorithm === "number") {
                message.algorithm = object.algorithm;
                break;
            }
            break;
        case "PressureControlAlgorithm_UNSPECIFIED":
        case 0:
            message.algorithm = 0;
            break;
        case "PressureControlAlgorithm_TARGET_PRESSURE":
        case 1:
            message.algorithm = 1;
            break;
        case "PressureControlAlgorithm_FEED_WITH_LIMIT":
        case 2:
            message.algorithm = 2;
            break;
        }
        if (object.targetPressure != null)
            message.targetPressure = Number(object.targetPressure);
        switch (object.direction) {
        default:
            if (typeof object.direction === "number") {
                message.direction = object.direction;
                break;
            }
            break;
        case "PressureControlDirection_UNSPECIFIED":
        case 0:
            message.direction = 0;
            break;
        case "PressureControlDirection_VACUUM":
        case 1:
            message.direction = 1;
            break;
        case "PressureControlDirection_PRESSURE":
        case 2:
            message.direction = 2;
            break;
        }
        if (object.limitPressure != null)
            message.limitPressure = Number(object.limitPressure);
        if (object.feedPwm != null)
            message.feedPwm = Number(object.feedPwm);
        if (object.feedTime != null)
            message.feedTime = Number(object.feedTime);
        return message;
    };

    /**
     * Creates a plain object from a PressureControlParameters message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PressureControlParameters
     * @static
     * @param {PressureControlParameters} message PressureControlParameters
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PressureControlParameters.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.enabled = false;
            object.algorithm = options.enums === String ? "PressureControlAlgorithm_UNSPECIFIED" : 0;
            object.targetPressure = 0;
            object.direction = options.enums === String ? "PressureControlDirection_UNSPECIFIED" : 0;
            object.limitPressure = 0;
            object.feedPwm = 0;
            object.feedTime = 0;
        }
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            object.enabled = message.enabled;
        if (message.algorithm != null && message.hasOwnProperty("algorithm"))
            object.algorithm = options.enums === String ? $root.PressureControlAlgorithm[message.algorithm] === undefined ? message.algorithm : $root.PressureControlAlgorithm[message.algorithm] : message.algorithm;
        if (message.targetPressure != null && message.hasOwnProperty("targetPressure"))
            object.targetPressure = options.json && !isFinite(message.targetPressure) ? String(message.targetPressure) : message.targetPressure;
        if (message.direction != null && message.hasOwnProperty("direction"))
            object.direction = options.enums === String ? $root.PressureControlDirection[message.direction] === undefined ? message.direction : $root.PressureControlDirection[message.direction] : message.direction;
        if (message.limitPressure != null && message.hasOwnProperty("limitPressure"))
            object.limitPressure = options.json && !isFinite(message.limitPressure) ? String(message.limitPressure) : message.limitPressure;
        if (message.feedPwm != null && message.hasOwnProperty("feedPwm"))
            object.feedPwm = options.json && !isFinite(message.feedPwm) ? String(message.feedPwm) : message.feedPwm;
        if (message.feedTime != null && message.hasOwnProperty("feedTime"))
            object.feedTime = options.json && !isFinite(message.feedTime) ? String(message.feedTime) : message.feedTime;
        return object;
    };

    /**
     * Converts this PressureControlParameters to JSON.
     * @function toJSON
     * @memberof PressureControlParameters
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PressureControlParameters.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for PressureControlParameters
     * @function getTypeUrl
     * @memberof PressureControlParameters
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PressureControlParameters.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PressureControlParameters";
    };

    return PressureControlParameters;
})();

export const PressureControlSystemState = $root.PressureControlSystemState = (() => {

    /**
     * Properties of a PressureControlSystemState.
     * @exports IPressureControlSystemState
     * @interface IPressureControlSystemState
     * @property {number|null} [pressure] PressureControlSystemState pressure
     * @property {boolean|null} [enabled] PressureControlSystemState enabled
     * @property {IPressureControlParameters|null} [parameters] PressureControlSystemState parameters
     * @property {boolean|null} [done] PressureControlSystemState done
     */

    /**
     * Constructs a new PressureControlSystemState.
     * @exports PressureControlSystemState
     * @classdesc Represents a PressureControlSystemState.
     * @implements IPressureControlSystemState
     * @constructor
     * @param {IPressureControlSystemState=} [properties] Properties to set
     */
    function PressureControlSystemState(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PressureControlSystemState pressure.
     * @member {number} pressure
     * @memberof PressureControlSystemState
     * @instance
     */
    PressureControlSystemState.prototype.pressure = 0;

    /**
     * PressureControlSystemState enabled.
     * @member {boolean} enabled
     * @memberof PressureControlSystemState
     * @instance
     */
    PressureControlSystemState.prototype.enabled = false;

    /**
     * PressureControlSystemState parameters.
     * @member {IPressureControlParameters|null|undefined} parameters
     * @memberof PressureControlSystemState
     * @instance
     */
    PressureControlSystemState.prototype.parameters = null;

    /**
     * PressureControlSystemState done.
     * @member {boolean} done
     * @memberof PressureControlSystemState
     * @instance
     */
    PressureControlSystemState.prototype.done = false;

    /**
     * Creates a new PressureControlSystemState instance using the specified properties.
     * @function create
     * @memberof PressureControlSystemState
     * @static
     * @param {IPressureControlSystemState=} [properties] Properties to set
     * @returns {PressureControlSystemState} PressureControlSystemState instance
     */
    PressureControlSystemState.create = function create(properties) {
        return new PressureControlSystemState(properties);
    };

    /**
     * Encodes the specified PressureControlSystemState message. Does not implicitly {@link PressureControlSystemState.verify|verify} messages.
     * @function encode
     * @memberof PressureControlSystemState
     * @static
     * @param {IPressureControlSystemState} message PressureControlSystemState message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PressureControlSystemState.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.pressure != null && Object.hasOwnProperty.call(message, "pressure"))
            writer.uint32(/* id 1, wireType 5 =*/13).float(message.pressure);
        if (message.enabled != null && Object.hasOwnProperty.call(message, "enabled"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.enabled);
        if (message.parameters != null && Object.hasOwnProperty.call(message, "parameters"))
            $root.PressureControlParameters.encode(message.parameters, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.done != null && Object.hasOwnProperty.call(message, "done"))
            writer.uint32(/* id 4, wireType 0 =*/32).bool(message.done);
        return writer;
    };

    /**
     * Encodes the specified PressureControlSystemState message, length delimited. Does not implicitly {@link PressureControlSystemState.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PressureControlSystemState
     * @static
     * @param {IPressureControlSystemState} message PressureControlSystemState message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PressureControlSystemState.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PressureControlSystemState message from the specified reader or buffer.
     * @function decode
     * @memberof PressureControlSystemState
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PressureControlSystemState} PressureControlSystemState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PressureControlSystemState.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.PressureControlSystemState();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.pressure = reader.float();
                    break;
                }
            case 2: {
                    message.enabled = reader.bool();
                    break;
                }
            case 3: {
                    message.parameters = $root.PressureControlParameters.decode(reader, reader.uint32());
                    break;
                }
            case 4: {
                    message.done = reader.bool();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a PressureControlSystemState message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PressureControlSystemState
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PressureControlSystemState} PressureControlSystemState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PressureControlSystemState.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PressureControlSystemState message.
     * @function verify
     * @memberof PressureControlSystemState
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PressureControlSystemState.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.pressure != null && message.hasOwnProperty("pressure"))
            if (typeof message.pressure !== "number")
                return "pressure: number expected";
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            if (typeof message.enabled !== "boolean")
                return "enabled: boolean expected";
        if (message.parameters != null && message.hasOwnProperty("parameters")) {
            let error = $root.PressureControlParameters.verify(message.parameters);
            if (error)
                return "parameters." + error;
        }
        if (message.done != null && message.hasOwnProperty("done"))
            if (typeof message.done !== "boolean")
                return "done: boolean expected";
        return null;
    };

    /**
     * Creates a PressureControlSystemState message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PressureControlSystemState
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PressureControlSystemState} PressureControlSystemState
     */
    PressureControlSystemState.fromObject = function fromObject(object) {
        if (object instanceof $root.PressureControlSystemState)
            return object;
        let message = new $root.PressureControlSystemState();
        if (object.pressure != null)
            message.pressure = Number(object.pressure);
        if (object.enabled != null)
            message.enabled = Boolean(object.enabled);
        if (object.parameters != null) {
            if (typeof object.parameters !== "object")
                throw TypeError(".PressureControlSystemState.parameters: object expected");
            message.parameters = $root.PressureControlParameters.fromObject(object.parameters);
        }
        if (object.done != null)
            message.done = Boolean(object.done);
        return message;
    };

    /**
     * Creates a plain object from a PressureControlSystemState message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PressureControlSystemState
     * @static
     * @param {PressureControlSystemState} message PressureControlSystemState
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PressureControlSystemState.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.pressure = 0;
            object.enabled = false;
            object.parameters = null;
            object.done = false;
        }
        if (message.pressure != null && message.hasOwnProperty("pressure"))
            object.pressure = options.json && !isFinite(message.pressure) ? String(message.pressure) : message.pressure;
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            object.enabled = message.enabled;
        if (message.parameters != null && message.hasOwnProperty("parameters"))
            object.parameters = $root.PressureControlParameters.toObject(message.parameters, options);
        if (message.done != null && message.hasOwnProperty("done"))
            object.done = message.done;
        return object;
    };

    /**
     * Converts this PressureControlSystemState to JSON.
     * @function toJSON
     * @memberof PressureControlSystemState
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PressureControlSystemState.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for PressureControlSystemState
     * @function getTypeUrl
     * @memberof PressureControlSystemState
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PressureControlSystemState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PressureControlSystemState";
    };

    return PressureControlSystemState;
})();

export const GetPrinterSystemStateRequest = $root.GetPrinterSystemStateRequest = (() => {

    /**
     * Properties of a GetPrinterSystemStateRequest.
     * @exports IGetPrinterSystemStateRequest
     * @interface IGetPrinterSystemStateRequest
     */

    /**
     * Constructs a new GetPrinterSystemStateRequest.
     * @exports GetPrinterSystemStateRequest
     * @classdesc Represents a GetPrinterSystemStateRequest.
     * @implements IGetPrinterSystemStateRequest
     * @constructor
     * @param {IGetPrinterSystemStateRequest=} [properties] Properties to set
     */
    function GetPrinterSystemStateRequest(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new GetPrinterSystemStateRequest instance using the specified properties.
     * @function create
     * @memberof GetPrinterSystemStateRequest
     * @static
     * @param {IGetPrinterSystemStateRequest=} [properties] Properties to set
     * @returns {GetPrinterSystemStateRequest} GetPrinterSystemStateRequest instance
     */
    GetPrinterSystemStateRequest.create = function create(properties) {
        return new GetPrinterSystemStateRequest(properties);
    };

    /**
     * Encodes the specified GetPrinterSystemStateRequest message. Does not implicitly {@link GetPrinterSystemStateRequest.verify|verify} messages.
     * @function encode
     * @memberof GetPrinterSystemStateRequest
     * @static
     * @param {IGetPrinterSystemStateRequest} message GetPrinterSystemStateRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GetPrinterSystemStateRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified GetPrinterSystemStateRequest message, length delimited. Does not implicitly {@link GetPrinterSystemStateRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof GetPrinterSystemStateRequest
     * @static
     * @param {IGetPrinterSystemStateRequest} message GetPrinterSystemStateRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GetPrinterSystemStateRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a GetPrinterSystemStateRequest message from the specified reader or buffer.
     * @function decode
     * @memberof GetPrinterSystemStateRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {GetPrinterSystemStateRequest} GetPrinterSystemStateRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GetPrinterSystemStateRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.GetPrinterSystemStateRequest();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a GetPrinterSystemStateRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof GetPrinterSystemStateRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {GetPrinterSystemStateRequest} GetPrinterSystemStateRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GetPrinterSystemStateRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a GetPrinterSystemStateRequest message.
     * @function verify
     * @memberof GetPrinterSystemStateRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    GetPrinterSystemStateRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a GetPrinterSystemStateRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof GetPrinterSystemStateRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {GetPrinterSystemStateRequest} GetPrinterSystemStateRequest
     */
    GetPrinterSystemStateRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.GetPrinterSystemStateRequest)
            return object;
        return new $root.GetPrinterSystemStateRequest();
    };

    /**
     * Creates a plain object from a GetPrinterSystemStateRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof GetPrinterSystemStateRequest
     * @static
     * @param {GetPrinterSystemStateRequest} message GetPrinterSystemStateRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    GetPrinterSystemStateRequest.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this GetPrinterSystemStateRequest to JSON.
     * @function toJSON
     * @memberof GetPrinterSystemStateRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    GetPrinterSystemStateRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for GetPrinterSystemStateRequest
     * @function getTypeUrl
     * @memberof GetPrinterSystemStateRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    GetPrinterSystemStateRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/GetPrinterSystemStateRequest";
    };

    return GetPrinterSystemStateRequest;
})();

export const ChangePrinterSystemStateRequest = $root.ChangePrinterSystemStateRequest = (() => {

    /**
     * Properties of a ChangePrinterSystemStateRequest.
     * @exports IChangePrinterSystemStateRequest
     * @interface IChangePrinterSystemStateRequest
     * @property {PrinterSystemState|null} [state] ChangePrinterSystemStateRequest state
     */

    /**
     * Constructs a new ChangePrinterSystemStateRequest.
     * @exports ChangePrinterSystemStateRequest
     * @classdesc Represents a ChangePrinterSystemStateRequest.
     * @implements IChangePrinterSystemStateRequest
     * @constructor
     * @param {IChangePrinterSystemStateRequest=} [properties] Properties to set
     */
    function ChangePrinterSystemStateRequest(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ChangePrinterSystemStateRequest state.
     * @member {PrinterSystemState} state
     * @memberof ChangePrinterSystemStateRequest
     * @instance
     */
    ChangePrinterSystemStateRequest.prototype.state = 0;

    /**
     * Creates a new ChangePrinterSystemStateRequest instance using the specified properties.
     * @function create
     * @memberof ChangePrinterSystemStateRequest
     * @static
     * @param {IChangePrinterSystemStateRequest=} [properties] Properties to set
     * @returns {ChangePrinterSystemStateRequest} ChangePrinterSystemStateRequest instance
     */
    ChangePrinterSystemStateRequest.create = function create(properties) {
        return new ChangePrinterSystemStateRequest(properties);
    };

    /**
     * Encodes the specified ChangePrinterSystemStateRequest message. Does not implicitly {@link ChangePrinterSystemStateRequest.verify|verify} messages.
     * @function encode
     * @memberof ChangePrinterSystemStateRequest
     * @static
     * @param {IChangePrinterSystemStateRequest} message ChangePrinterSystemStateRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangePrinterSystemStateRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.state != null && Object.hasOwnProperty.call(message, "state"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.state);
        return writer;
    };

    /**
     * Encodes the specified ChangePrinterSystemStateRequest message, length delimited. Does not implicitly {@link ChangePrinterSystemStateRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ChangePrinterSystemStateRequest
     * @static
     * @param {IChangePrinterSystemStateRequest} message ChangePrinterSystemStateRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangePrinterSystemStateRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ChangePrinterSystemStateRequest message from the specified reader or buffer.
     * @function decode
     * @memberof ChangePrinterSystemStateRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ChangePrinterSystemStateRequest} ChangePrinterSystemStateRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangePrinterSystemStateRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChangePrinterSystemStateRequest();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.state = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a ChangePrinterSystemStateRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ChangePrinterSystemStateRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ChangePrinterSystemStateRequest} ChangePrinterSystemStateRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangePrinterSystemStateRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ChangePrinterSystemStateRequest message.
     * @function verify
     * @memberof ChangePrinterSystemStateRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ChangePrinterSystemStateRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.state != null && message.hasOwnProperty("state"))
            switch (message.state) {
            default:
                return "state: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
                break;
            }
        return null;
    };

    /**
     * Creates a ChangePrinterSystemStateRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ChangePrinterSystemStateRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ChangePrinterSystemStateRequest} ChangePrinterSystemStateRequest
     */
    ChangePrinterSystemStateRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.ChangePrinterSystemStateRequest)
            return object;
        let message = new $root.ChangePrinterSystemStateRequest();
        switch (object.state) {
        default:
            if (typeof object.state === "number") {
                message.state = object.state;
                break;
            }
            break;
        case "PrinterSystemState_UNSPECIFIED":
        case 0:
            message.state = 0;
            break;
        case "PrinterSystemState_STARTUP":
        case 1:
            message.state = 1;
            break;
        case "PrinterSystemState_IDLE":
        case 2:
            message.state = 2;
            break;
        case "PrinterSystemState_ERROR":
        case 3:
            message.state = 3;
            break;
        case "PrinterSystemState_DROPWATCHER":
        case 4:
            message.state = 4;
            break;
        }
        return message;
    };

    /**
     * Creates a plain object from a ChangePrinterSystemStateRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ChangePrinterSystemStateRequest
     * @static
     * @param {ChangePrinterSystemStateRequest} message ChangePrinterSystemStateRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ChangePrinterSystemStateRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.state = options.enums === String ? "PrinterSystemState_UNSPECIFIED" : 0;
        if (message.state != null && message.hasOwnProperty("state"))
            object.state = options.enums === String ? $root.PrinterSystemState[message.state] === undefined ? message.state : $root.PrinterSystemState[message.state] : message.state;
        return object;
    };

    /**
     * Converts this ChangePrinterSystemStateRequest to JSON.
     * @function toJSON
     * @memberof ChangePrinterSystemStateRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ChangePrinterSystemStateRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ChangePrinterSystemStateRequest
     * @function getTypeUrl
     * @memberof ChangePrinterSystemStateRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ChangePrinterSystemStateRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ChangePrinterSystemStateRequest";
    };

    return ChangePrinterSystemStateRequest;
})();

export const ChangeDropwatcherParametersRequest = $root.ChangeDropwatcherParametersRequest = (() => {

    /**
     * Properties of a ChangeDropwatcherParametersRequest.
     * @exports IChangeDropwatcherParametersRequest
     * @interface IChangeDropwatcherParametersRequest
     * @property {number|null} [delayNanos] ChangeDropwatcherParametersRequest delayNanos
     * @property {number|null} [flashOnTimeNanos] ChangeDropwatcherParametersRequest flashOnTimeNanos
     */

    /**
     * Constructs a new ChangeDropwatcherParametersRequest.
     * @exports ChangeDropwatcherParametersRequest
     * @classdesc Represents a ChangeDropwatcherParametersRequest.
     * @implements IChangeDropwatcherParametersRequest
     * @constructor
     * @param {IChangeDropwatcherParametersRequest=} [properties] Properties to set
     */
    function ChangeDropwatcherParametersRequest(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ChangeDropwatcherParametersRequest delayNanos.
     * @member {number} delayNanos
     * @memberof ChangeDropwatcherParametersRequest
     * @instance
     */
    ChangeDropwatcherParametersRequest.prototype.delayNanos = 0;

    /**
     * ChangeDropwatcherParametersRequest flashOnTimeNanos.
     * @member {number} flashOnTimeNanos
     * @memberof ChangeDropwatcherParametersRequest
     * @instance
     */
    ChangeDropwatcherParametersRequest.prototype.flashOnTimeNanos = 0;

    /**
     * Creates a new ChangeDropwatcherParametersRequest instance using the specified properties.
     * @function create
     * @memberof ChangeDropwatcherParametersRequest
     * @static
     * @param {IChangeDropwatcherParametersRequest=} [properties] Properties to set
     * @returns {ChangeDropwatcherParametersRequest} ChangeDropwatcherParametersRequest instance
     */
    ChangeDropwatcherParametersRequest.create = function create(properties) {
        return new ChangeDropwatcherParametersRequest(properties);
    };

    /**
     * Encodes the specified ChangeDropwatcherParametersRequest message. Does not implicitly {@link ChangeDropwatcherParametersRequest.verify|verify} messages.
     * @function encode
     * @memberof ChangeDropwatcherParametersRequest
     * @static
     * @param {IChangeDropwatcherParametersRequest} message ChangeDropwatcherParametersRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangeDropwatcherParametersRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.delayNanos != null && Object.hasOwnProperty.call(message, "delayNanos"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.delayNanos);
        if (message.flashOnTimeNanos != null && Object.hasOwnProperty.call(message, "flashOnTimeNanos"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.flashOnTimeNanos);
        return writer;
    };

    /**
     * Encodes the specified ChangeDropwatcherParametersRequest message, length delimited. Does not implicitly {@link ChangeDropwatcherParametersRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ChangeDropwatcherParametersRequest
     * @static
     * @param {IChangeDropwatcherParametersRequest} message ChangeDropwatcherParametersRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangeDropwatcherParametersRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ChangeDropwatcherParametersRequest message from the specified reader or buffer.
     * @function decode
     * @memberof ChangeDropwatcherParametersRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ChangeDropwatcherParametersRequest} ChangeDropwatcherParametersRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangeDropwatcherParametersRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChangeDropwatcherParametersRequest();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.delayNanos = reader.int32();
                    break;
                }
            case 2: {
                    message.flashOnTimeNanos = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a ChangeDropwatcherParametersRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ChangeDropwatcherParametersRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ChangeDropwatcherParametersRequest} ChangeDropwatcherParametersRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangeDropwatcherParametersRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ChangeDropwatcherParametersRequest message.
     * @function verify
     * @memberof ChangeDropwatcherParametersRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ChangeDropwatcherParametersRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.delayNanos != null && message.hasOwnProperty("delayNanos"))
            if (!$util.isInteger(message.delayNanos))
                return "delayNanos: integer expected";
        if (message.flashOnTimeNanos != null && message.hasOwnProperty("flashOnTimeNanos"))
            if (!$util.isInteger(message.flashOnTimeNanos))
                return "flashOnTimeNanos: integer expected";
        return null;
    };

    /**
     * Creates a ChangeDropwatcherParametersRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ChangeDropwatcherParametersRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ChangeDropwatcherParametersRequest} ChangeDropwatcherParametersRequest
     */
    ChangeDropwatcherParametersRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.ChangeDropwatcherParametersRequest)
            return object;
        let message = new $root.ChangeDropwatcherParametersRequest();
        if (object.delayNanos != null)
            message.delayNanos = object.delayNanos | 0;
        if (object.flashOnTimeNanos != null)
            message.flashOnTimeNanos = object.flashOnTimeNanos | 0;
        return message;
    };

    /**
     * Creates a plain object from a ChangeDropwatcherParametersRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ChangeDropwatcherParametersRequest
     * @static
     * @param {ChangeDropwatcherParametersRequest} message ChangeDropwatcherParametersRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ChangeDropwatcherParametersRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.delayNanos = 0;
            object.flashOnTimeNanos = 0;
        }
        if (message.delayNanos != null && message.hasOwnProperty("delayNanos"))
            object.delayNanos = message.delayNanos;
        if (message.flashOnTimeNanos != null && message.hasOwnProperty("flashOnTimeNanos"))
            object.flashOnTimeNanos = message.flashOnTimeNanos;
        return object;
    };

    /**
     * Converts this ChangeDropwatcherParametersRequest to JSON.
     * @function toJSON
     * @memberof ChangeDropwatcherParametersRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ChangeDropwatcherParametersRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ChangeDropwatcherParametersRequest
     * @function getTypeUrl
     * @memberof ChangeDropwatcherParametersRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ChangeDropwatcherParametersRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ChangeDropwatcherParametersRequest";
    };

    return ChangeDropwatcherParametersRequest;
})();

export const CameraFrameRequest = $root.CameraFrameRequest = (() => {

    /**
     * Properties of a CameraFrameRequest.
     * @exports ICameraFrameRequest
     * @interface ICameraFrameRequest
     */

    /**
     * Constructs a new CameraFrameRequest.
     * @exports CameraFrameRequest
     * @classdesc Represents a CameraFrameRequest.
     * @implements ICameraFrameRequest
     * @constructor
     * @param {ICameraFrameRequest=} [properties] Properties to set
     */
    function CameraFrameRequest(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new CameraFrameRequest instance using the specified properties.
     * @function create
     * @memberof CameraFrameRequest
     * @static
     * @param {ICameraFrameRequest=} [properties] Properties to set
     * @returns {CameraFrameRequest} CameraFrameRequest instance
     */
    CameraFrameRequest.create = function create(properties) {
        return new CameraFrameRequest(properties);
    };

    /**
     * Encodes the specified CameraFrameRequest message. Does not implicitly {@link CameraFrameRequest.verify|verify} messages.
     * @function encode
     * @memberof CameraFrameRequest
     * @static
     * @param {ICameraFrameRequest} message CameraFrameRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CameraFrameRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified CameraFrameRequest message, length delimited. Does not implicitly {@link CameraFrameRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof CameraFrameRequest
     * @static
     * @param {ICameraFrameRequest} message CameraFrameRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CameraFrameRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CameraFrameRequest message from the specified reader or buffer.
     * @function decode
     * @memberof CameraFrameRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {CameraFrameRequest} CameraFrameRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CameraFrameRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.CameraFrameRequest();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a CameraFrameRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof CameraFrameRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {CameraFrameRequest} CameraFrameRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CameraFrameRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CameraFrameRequest message.
     * @function verify
     * @memberof CameraFrameRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CameraFrameRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a CameraFrameRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof CameraFrameRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {CameraFrameRequest} CameraFrameRequest
     */
    CameraFrameRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.CameraFrameRequest)
            return object;
        return new $root.CameraFrameRequest();
    };

    /**
     * Creates a plain object from a CameraFrameRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof CameraFrameRequest
     * @static
     * @param {CameraFrameRequest} message CameraFrameRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CameraFrameRequest.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this CameraFrameRequest to JSON.
     * @function toJSON
     * @memberof CameraFrameRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CameraFrameRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CameraFrameRequest
     * @function getTypeUrl
     * @memberof CameraFrameRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CameraFrameRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/CameraFrameRequest";
    };

    return CameraFrameRequest;
})();

export const PressureControlChangeParametersRequest = $root.PressureControlChangeParametersRequest = (() => {

    /**
     * Properties of a PressureControlChangeParametersRequest.
     * @exports IPressureControlChangeParametersRequest
     * @interface IPressureControlChangeParametersRequest
     * @property {IPressureControlParameters|null} [parameters] PressureControlChangeParametersRequest parameters
     */

    /**
     * Constructs a new PressureControlChangeParametersRequest.
     * @exports PressureControlChangeParametersRequest
     * @classdesc Represents a PressureControlChangeParametersRequest.
     * @implements IPressureControlChangeParametersRequest
     * @constructor
     * @param {IPressureControlChangeParametersRequest=} [properties] Properties to set
     */
    function PressureControlChangeParametersRequest(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PressureControlChangeParametersRequest parameters.
     * @member {IPressureControlParameters|null|undefined} parameters
     * @memberof PressureControlChangeParametersRequest
     * @instance
     */
    PressureControlChangeParametersRequest.prototype.parameters = null;

    /**
     * Creates a new PressureControlChangeParametersRequest instance using the specified properties.
     * @function create
     * @memberof PressureControlChangeParametersRequest
     * @static
     * @param {IPressureControlChangeParametersRequest=} [properties] Properties to set
     * @returns {PressureControlChangeParametersRequest} PressureControlChangeParametersRequest instance
     */
    PressureControlChangeParametersRequest.create = function create(properties) {
        return new PressureControlChangeParametersRequest(properties);
    };

    /**
     * Encodes the specified PressureControlChangeParametersRequest message. Does not implicitly {@link PressureControlChangeParametersRequest.verify|verify} messages.
     * @function encode
     * @memberof PressureControlChangeParametersRequest
     * @static
     * @param {IPressureControlChangeParametersRequest} message PressureControlChangeParametersRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PressureControlChangeParametersRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.parameters != null && Object.hasOwnProperty.call(message, "parameters"))
            $root.PressureControlParameters.encode(message.parameters, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified PressureControlChangeParametersRequest message, length delimited. Does not implicitly {@link PressureControlChangeParametersRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PressureControlChangeParametersRequest
     * @static
     * @param {IPressureControlChangeParametersRequest} message PressureControlChangeParametersRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PressureControlChangeParametersRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PressureControlChangeParametersRequest message from the specified reader or buffer.
     * @function decode
     * @memberof PressureControlChangeParametersRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PressureControlChangeParametersRequest} PressureControlChangeParametersRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PressureControlChangeParametersRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.PressureControlChangeParametersRequest();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.parameters = $root.PressureControlParameters.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a PressureControlChangeParametersRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PressureControlChangeParametersRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PressureControlChangeParametersRequest} PressureControlChangeParametersRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PressureControlChangeParametersRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PressureControlChangeParametersRequest message.
     * @function verify
     * @memberof PressureControlChangeParametersRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PressureControlChangeParametersRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.parameters != null && message.hasOwnProperty("parameters")) {
            let error = $root.PressureControlParameters.verify(message.parameters);
            if (error)
                return "parameters." + error;
        }
        return null;
    };

    /**
     * Creates a PressureControlChangeParametersRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PressureControlChangeParametersRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PressureControlChangeParametersRequest} PressureControlChangeParametersRequest
     */
    PressureControlChangeParametersRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.PressureControlChangeParametersRequest)
            return object;
        let message = new $root.PressureControlChangeParametersRequest();
        if (object.parameters != null) {
            if (typeof object.parameters !== "object")
                throw TypeError(".PressureControlChangeParametersRequest.parameters: object expected");
            message.parameters = $root.PressureControlParameters.fromObject(object.parameters);
        }
        return message;
    };

    /**
     * Creates a plain object from a PressureControlChangeParametersRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PressureControlChangeParametersRequest
     * @static
     * @param {PressureControlChangeParametersRequest} message PressureControlChangeParametersRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PressureControlChangeParametersRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.parameters = null;
        if (message.parameters != null && message.hasOwnProperty("parameters"))
            object.parameters = $root.PressureControlParameters.toObject(message.parameters, options);
        return object;
    };

    /**
     * Converts this PressureControlChangeParametersRequest to JSON.
     * @function toJSON
     * @memberof PressureControlChangeParametersRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PressureControlChangeParametersRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for PressureControlChangeParametersRequest
     * @function getTypeUrl
     * @memberof PressureControlChangeParametersRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PressureControlChangeParametersRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PressureControlChangeParametersRequest";
    };

    return PressureControlChangeParametersRequest;
})();

export const PrinterRequest = $root.PrinterRequest = (() => {

    /**
     * Properties of a PrinterRequest.
     * @exports IPrinterRequest
     * @interface IPrinterRequest
     * @property {IGetPrinterSystemStateRequest|null} [getPrinterSystemStateRequest] PrinterRequest getPrinterSystemStateRequest
     * @property {IChangePrinterSystemStateRequest|null} [changePrinterSystemStateRequest] PrinterRequest changePrinterSystemStateRequest
     * @property {IChangeDropwatcherParametersRequest|null} [changeDropwatcherParametersRequest] PrinterRequest changeDropwatcherParametersRequest
     * @property {ICameraFrameRequest|null} [cameraFrameRequest] PrinterRequest cameraFrameRequest
     * @property {IPressureControlChangeParametersRequest|null} [pressureControlChangeParametersRequest] PrinterRequest pressureControlChangeParametersRequest
     */

    /**
     * Constructs a new PrinterRequest.
     * @exports PrinterRequest
     * @classdesc Represents a PrinterRequest.
     * @implements IPrinterRequest
     * @constructor
     * @param {IPrinterRequest=} [properties] Properties to set
     */
    function PrinterRequest(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PrinterRequest getPrinterSystemStateRequest.
     * @member {IGetPrinterSystemStateRequest|null|undefined} getPrinterSystemStateRequest
     * @memberof PrinterRequest
     * @instance
     */
    PrinterRequest.prototype.getPrinterSystemStateRequest = null;

    /**
     * PrinterRequest changePrinterSystemStateRequest.
     * @member {IChangePrinterSystemStateRequest|null|undefined} changePrinterSystemStateRequest
     * @memberof PrinterRequest
     * @instance
     */
    PrinterRequest.prototype.changePrinterSystemStateRequest = null;

    /**
     * PrinterRequest changeDropwatcherParametersRequest.
     * @member {IChangeDropwatcherParametersRequest|null|undefined} changeDropwatcherParametersRequest
     * @memberof PrinterRequest
     * @instance
     */
    PrinterRequest.prototype.changeDropwatcherParametersRequest = null;

    /**
     * PrinterRequest cameraFrameRequest.
     * @member {ICameraFrameRequest|null|undefined} cameraFrameRequest
     * @memberof PrinterRequest
     * @instance
     */
    PrinterRequest.prototype.cameraFrameRequest = null;

    /**
     * PrinterRequest pressureControlChangeParametersRequest.
     * @member {IPressureControlChangeParametersRequest|null|undefined} pressureControlChangeParametersRequest
     * @memberof PrinterRequest
     * @instance
     */
    PrinterRequest.prototype.pressureControlChangeParametersRequest = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * PrinterRequest _getPrinterSystemStateRequest.
     * @member {"getPrinterSystemStateRequest"|undefined} _getPrinterSystemStateRequest
     * @memberof PrinterRequest
     * @instance
     */
    Object.defineProperty(PrinterRequest.prototype, "_getPrinterSystemStateRequest", {
        get: $util.oneOfGetter($oneOfFields = ["getPrinterSystemStateRequest"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * PrinterRequest _changePrinterSystemStateRequest.
     * @member {"changePrinterSystemStateRequest"|undefined} _changePrinterSystemStateRequest
     * @memberof PrinterRequest
     * @instance
     */
    Object.defineProperty(PrinterRequest.prototype, "_changePrinterSystemStateRequest", {
        get: $util.oneOfGetter($oneOfFields = ["changePrinterSystemStateRequest"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * PrinterRequest _changeDropwatcherParametersRequest.
     * @member {"changeDropwatcherParametersRequest"|undefined} _changeDropwatcherParametersRequest
     * @memberof PrinterRequest
     * @instance
     */
    Object.defineProperty(PrinterRequest.prototype, "_changeDropwatcherParametersRequest", {
        get: $util.oneOfGetter($oneOfFields = ["changeDropwatcherParametersRequest"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * PrinterRequest _cameraFrameRequest.
     * @member {"cameraFrameRequest"|undefined} _cameraFrameRequest
     * @memberof PrinterRequest
     * @instance
     */
    Object.defineProperty(PrinterRequest.prototype, "_cameraFrameRequest", {
        get: $util.oneOfGetter($oneOfFields = ["cameraFrameRequest"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * PrinterRequest _pressureControlChangeParametersRequest.
     * @member {"pressureControlChangeParametersRequest"|undefined} _pressureControlChangeParametersRequest
     * @memberof PrinterRequest
     * @instance
     */
    Object.defineProperty(PrinterRequest.prototype, "_pressureControlChangeParametersRequest", {
        get: $util.oneOfGetter($oneOfFields = ["pressureControlChangeParametersRequest"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new PrinterRequest instance using the specified properties.
     * @function create
     * @memberof PrinterRequest
     * @static
     * @param {IPrinterRequest=} [properties] Properties to set
     * @returns {PrinterRequest} PrinterRequest instance
     */
    PrinterRequest.create = function create(properties) {
        return new PrinterRequest(properties);
    };

    /**
     * Encodes the specified PrinterRequest message. Does not implicitly {@link PrinterRequest.verify|verify} messages.
     * @function encode
     * @memberof PrinterRequest
     * @static
     * @param {IPrinterRequest} message PrinterRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PrinterRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.getPrinterSystemStateRequest != null && Object.hasOwnProperty.call(message, "getPrinterSystemStateRequest"))
            $root.GetPrinterSystemStateRequest.encode(message.getPrinterSystemStateRequest, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.changePrinterSystemStateRequest != null && Object.hasOwnProperty.call(message, "changePrinterSystemStateRequest"))
            $root.ChangePrinterSystemStateRequest.encode(message.changePrinterSystemStateRequest, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.changeDropwatcherParametersRequest != null && Object.hasOwnProperty.call(message, "changeDropwatcherParametersRequest"))
            $root.ChangeDropwatcherParametersRequest.encode(message.changeDropwatcherParametersRequest, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.cameraFrameRequest != null && Object.hasOwnProperty.call(message, "cameraFrameRequest"))
            $root.CameraFrameRequest.encode(message.cameraFrameRequest, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.pressureControlChangeParametersRequest != null && Object.hasOwnProperty.call(message, "pressureControlChangeParametersRequest"))
            $root.PressureControlChangeParametersRequest.encode(message.pressureControlChangeParametersRequest, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified PrinterRequest message, length delimited. Does not implicitly {@link PrinterRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PrinterRequest
     * @static
     * @param {IPrinterRequest} message PrinterRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PrinterRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PrinterRequest message from the specified reader or buffer.
     * @function decode
     * @memberof PrinterRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PrinterRequest} PrinterRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PrinterRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.PrinterRequest();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.getPrinterSystemStateRequest = $root.GetPrinterSystemStateRequest.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    message.changePrinterSystemStateRequest = $root.ChangePrinterSystemStateRequest.decode(reader, reader.uint32());
                    break;
                }
            case 3: {
                    message.changeDropwatcherParametersRequest = $root.ChangeDropwatcherParametersRequest.decode(reader, reader.uint32());
                    break;
                }
            case 4: {
                    message.cameraFrameRequest = $root.CameraFrameRequest.decode(reader, reader.uint32());
                    break;
                }
            case 5: {
                    message.pressureControlChangeParametersRequest = $root.PressureControlChangeParametersRequest.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a PrinterRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PrinterRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PrinterRequest} PrinterRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PrinterRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PrinterRequest message.
     * @function verify
     * @memberof PrinterRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PrinterRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message.getPrinterSystemStateRequest != null && message.hasOwnProperty("getPrinterSystemStateRequest")) {
            properties._getPrinterSystemStateRequest = 1;
            {
                let error = $root.GetPrinterSystemStateRequest.verify(message.getPrinterSystemStateRequest);
                if (error)
                    return "getPrinterSystemStateRequest." + error;
            }
        }
        if (message.changePrinterSystemStateRequest != null && message.hasOwnProperty("changePrinterSystemStateRequest")) {
            properties._changePrinterSystemStateRequest = 1;
            {
                let error = $root.ChangePrinterSystemStateRequest.verify(message.changePrinterSystemStateRequest);
                if (error)
                    return "changePrinterSystemStateRequest." + error;
            }
        }
        if (message.changeDropwatcherParametersRequest != null && message.hasOwnProperty("changeDropwatcherParametersRequest")) {
            properties._changeDropwatcherParametersRequest = 1;
            {
                let error = $root.ChangeDropwatcherParametersRequest.verify(message.changeDropwatcherParametersRequest);
                if (error)
                    return "changeDropwatcherParametersRequest." + error;
            }
        }
        if (message.cameraFrameRequest != null && message.hasOwnProperty("cameraFrameRequest")) {
            properties._cameraFrameRequest = 1;
            {
                let error = $root.CameraFrameRequest.verify(message.cameraFrameRequest);
                if (error)
                    return "cameraFrameRequest." + error;
            }
        }
        if (message.pressureControlChangeParametersRequest != null && message.hasOwnProperty("pressureControlChangeParametersRequest")) {
            properties._pressureControlChangeParametersRequest = 1;
            {
                let error = $root.PressureControlChangeParametersRequest.verify(message.pressureControlChangeParametersRequest);
                if (error)
                    return "pressureControlChangeParametersRequest." + error;
            }
        }
        return null;
    };

    /**
     * Creates a PrinterRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PrinterRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PrinterRequest} PrinterRequest
     */
    PrinterRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.PrinterRequest)
            return object;
        let message = new $root.PrinterRequest();
        if (object.getPrinterSystemStateRequest != null) {
            if (typeof object.getPrinterSystemStateRequest !== "object")
                throw TypeError(".PrinterRequest.getPrinterSystemStateRequest: object expected");
            message.getPrinterSystemStateRequest = $root.GetPrinterSystemStateRequest.fromObject(object.getPrinterSystemStateRequest);
        }
        if (object.changePrinterSystemStateRequest != null) {
            if (typeof object.changePrinterSystemStateRequest !== "object")
                throw TypeError(".PrinterRequest.changePrinterSystemStateRequest: object expected");
            message.changePrinterSystemStateRequest = $root.ChangePrinterSystemStateRequest.fromObject(object.changePrinterSystemStateRequest);
        }
        if (object.changeDropwatcherParametersRequest != null) {
            if (typeof object.changeDropwatcherParametersRequest !== "object")
                throw TypeError(".PrinterRequest.changeDropwatcherParametersRequest: object expected");
            message.changeDropwatcherParametersRequest = $root.ChangeDropwatcherParametersRequest.fromObject(object.changeDropwatcherParametersRequest);
        }
        if (object.cameraFrameRequest != null) {
            if (typeof object.cameraFrameRequest !== "object")
                throw TypeError(".PrinterRequest.cameraFrameRequest: object expected");
            message.cameraFrameRequest = $root.CameraFrameRequest.fromObject(object.cameraFrameRequest);
        }
        if (object.pressureControlChangeParametersRequest != null) {
            if (typeof object.pressureControlChangeParametersRequest !== "object")
                throw TypeError(".PrinterRequest.pressureControlChangeParametersRequest: object expected");
            message.pressureControlChangeParametersRequest = $root.PressureControlChangeParametersRequest.fromObject(object.pressureControlChangeParametersRequest);
        }
        return message;
    };

    /**
     * Creates a plain object from a PrinterRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PrinterRequest
     * @static
     * @param {PrinterRequest} message PrinterRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PrinterRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (message.getPrinterSystemStateRequest != null && message.hasOwnProperty("getPrinterSystemStateRequest")) {
            object.getPrinterSystemStateRequest = $root.GetPrinterSystemStateRequest.toObject(message.getPrinterSystemStateRequest, options);
            if (options.oneofs)
                object._getPrinterSystemStateRequest = "getPrinterSystemStateRequest";
        }
        if (message.changePrinterSystemStateRequest != null && message.hasOwnProperty("changePrinterSystemStateRequest")) {
            object.changePrinterSystemStateRequest = $root.ChangePrinterSystemStateRequest.toObject(message.changePrinterSystemStateRequest, options);
            if (options.oneofs)
                object._changePrinterSystemStateRequest = "changePrinterSystemStateRequest";
        }
        if (message.changeDropwatcherParametersRequest != null && message.hasOwnProperty("changeDropwatcherParametersRequest")) {
            object.changeDropwatcherParametersRequest = $root.ChangeDropwatcherParametersRequest.toObject(message.changeDropwatcherParametersRequest, options);
            if (options.oneofs)
                object._changeDropwatcherParametersRequest = "changeDropwatcherParametersRequest";
        }
        if (message.cameraFrameRequest != null && message.hasOwnProperty("cameraFrameRequest")) {
            object.cameraFrameRequest = $root.CameraFrameRequest.toObject(message.cameraFrameRequest, options);
            if (options.oneofs)
                object._cameraFrameRequest = "cameraFrameRequest";
        }
        if (message.pressureControlChangeParametersRequest != null && message.hasOwnProperty("pressureControlChangeParametersRequest")) {
            object.pressureControlChangeParametersRequest = $root.PressureControlChangeParametersRequest.toObject(message.pressureControlChangeParametersRequest, options);
            if (options.oneofs)
                object._pressureControlChangeParametersRequest = "pressureControlChangeParametersRequest";
        }
        return object;
    };

    /**
     * Converts this PrinterRequest to JSON.
     * @function toJSON
     * @memberof PrinterRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PrinterRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for PrinterRequest
     * @function getTypeUrl
     * @memberof PrinterRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PrinterRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PrinterRequest";
    };

    return PrinterRequest;
})();

/**
 * PrinterSystemState enum.
 * @exports PrinterSystemState
 * @enum {number}
 * @property {number} PrinterSystemState_UNSPECIFIED=0 PrinterSystemState_UNSPECIFIED value
 * @property {number} PrinterSystemState_STARTUP=1 PrinterSystemState_STARTUP value
 * @property {number} PrinterSystemState_IDLE=2 PrinterSystemState_IDLE value
 * @property {number} PrinterSystemState_ERROR=3 PrinterSystemState_ERROR value
 * @property {number} PrinterSystemState_DROPWATCHER=4 PrinterSystemState_DROPWATCHER value
 */
export const PrinterSystemState = $root.PrinterSystemState = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "PrinterSystemState_UNSPECIFIED"] = 0;
    values[valuesById[1] = "PrinterSystemState_STARTUP"] = 1;
    values[valuesById[2] = "PrinterSystemState_IDLE"] = 2;
    values[valuesById[3] = "PrinterSystemState_ERROR"] = 3;
    values[valuesById[4] = "PrinterSystemState_DROPWATCHER"] = 4;
    return values;
})();

export const PrinterSystemStateResponse = $root.PrinterSystemStateResponse = (() => {

    /**
     * Properties of a PrinterSystemStateResponse.
     * @exports IPrinterSystemStateResponse
     * @interface IPrinterSystemStateResponse
     * @property {PrinterSystemState|null} [state] PrinterSystemStateResponse state
     * @property {number|null} [errorFlags] PrinterSystemStateResponse errorFlags
     * @property {IPressureControlSystemState|null} [pressureControl] PrinterSystemStateResponse pressureControl
     */

    /**
     * Constructs a new PrinterSystemStateResponse.
     * @exports PrinterSystemStateResponse
     * @classdesc Represents a PrinterSystemStateResponse.
     * @implements IPrinterSystemStateResponse
     * @constructor
     * @param {IPrinterSystemStateResponse=} [properties] Properties to set
     */
    function PrinterSystemStateResponse(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PrinterSystemStateResponse state.
     * @member {PrinterSystemState} state
     * @memberof PrinterSystemStateResponse
     * @instance
     */
    PrinterSystemStateResponse.prototype.state = 0;

    /**
     * PrinterSystemStateResponse errorFlags.
     * @member {number} errorFlags
     * @memberof PrinterSystemStateResponse
     * @instance
     */
    PrinterSystemStateResponse.prototype.errorFlags = 0;

    /**
     * PrinterSystemStateResponse pressureControl.
     * @member {IPressureControlSystemState|null|undefined} pressureControl
     * @memberof PrinterSystemStateResponse
     * @instance
     */
    PrinterSystemStateResponse.prototype.pressureControl = null;

    /**
     * Creates a new PrinterSystemStateResponse instance using the specified properties.
     * @function create
     * @memberof PrinterSystemStateResponse
     * @static
     * @param {IPrinterSystemStateResponse=} [properties] Properties to set
     * @returns {PrinterSystemStateResponse} PrinterSystemStateResponse instance
     */
    PrinterSystemStateResponse.create = function create(properties) {
        return new PrinterSystemStateResponse(properties);
    };

    /**
     * Encodes the specified PrinterSystemStateResponse message. Does not implicitly {@link PrinterSystemStateResponse.verify|verify} messages.
     * @function encode
     * @memberof PrinterSystemStateResponse
     * @static
     * @param {IPrinterSystemStateResponse} message PrinterSystemStateResponse message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PrinterSystemStateResponse.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.state != null && Object.hasOwnProperty.call(message, "state"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.state);
        if (message.errorFlags != null && Object.hasOwnProperty.call(message, "errorFlags"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.errorFlags);
        if (message.pressureControl != null && Object.hasOwnProperty.call(message, "pressureControl"))
            $root.PressureControlSystemState.encode(message.pressureControl, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified PrinterSystemStateResponse message, length delimited. Does not implicitly {@link PrinterSystemStateResponse.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PrinterSystemStateResponse
     * @static
     * @param {IPrinterSystemStateResponse} message PrinterSystemStateResponse message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PrinterSystemStateResponse.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PrinterSystemStateResponse message from the specified reader or buffer.
     * @function decode
     * @memberof PrinterSystemStateResponse
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PrinterSystemStateResponse} PrinterSystemStateResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PrinterSystemStateResponse.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.PrinterSystemStateResponse();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.state = reader.int32();
                    break;
                }
            case 2: {
                    message.errorFlags = reader.uint32();
                    break;
                }
            case 3: {
                    message.pressureControl = $root.PressureControlSystemState.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a PrinterSystemStateResponse message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PrinterSystemStateResponse
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PrinterSystemStateResponse} PrinterSystemStateResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PrinterSystemStateResponse.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PrinterSystemStateResponse message.
     * @function verify
     * @memberof PrinterSystemStateResponse
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PrinterSystemStateResponse.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.state != null && message.hasOwnProperty("state"))
            switch (message.state) {
            default:
                return "state: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
                break;
            }
        if (message.errorFlags != null && message.hasOwnProperty("errorFlags"))
            if (!$util.isInteger(message.errorFlags))
                return "errorFlags: integer expected";
        if (message.pressureControl != null && message.hasOwnProperty("pressureControl")) {
            let error = $root.PressureControlSystemState.verify(message.pressureControl);
            if (error)
                return "pressureControl." + error;
        }
        return null;
    };

    /**
     * Creates a PrinterSystemStateResponse message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PrinterSystemStateResponse
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PrinterSystemStateResponse} PrinterSystemStateResponse
     */
    PrinterSystemStateResponse.fromObject = function fromObject(object) {
        if (object instanceof $root.PrinterSystemStateResponse)
            return object;
        let message = new $root.PrinterSystemStateResponse();
        switch (object.state) {
        default:
            if (typeof object.state === "number") {
                message.state = object.state;
                break;
            }
            break;
        case "PrinterSystemState_UNSPECIFIED":
        case 0:
            message.state = 0;
            break;
        case "PrinterSystemState_STARTUP":
        case 1:
            message.state = 1;
            break;
        case "PrinterSystemState_IDLE":
        case 2:
            message.state = 2;
            break;
        case "PrinterSystemState_ERROR":
        case 3:
            message.state = 3;
            break;
        case "PrinterSystemState_DROPWATCHER":
        case 4:
            message.state = 4;
            break;
        }
        if (object.errorFlags != null)
            message.errorFlags = object.errorFlags >>> 0;
        if (object.pressureControl != null) {
            if (typeof object.pressureControl !== "object")
                throw TypeError(".PrinterSystemStateResponse.pressureControl: object expected");
            message.pressureControl = $root.PressureControlSystemState.fromObject(object.pressureControl);
        }
        return message;
    };

    /**
     * Creates a plain object from a PrinterSystemStateResponse message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PrinterSystemStateResponse
     * @static
     * @param {PrinterSystemStateResponse} message PrinterSystemStateResponse
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PrinterSystemStateResponse.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.state = options.enums === String ? "PrinterSystemState_UNSPECIFIED" : 0;
            object.errorFlags = 0;
            object.pressureControl = null;
        }
        if (message.state != null && message.hasOwnProperty("state"))
            object.state = options.enums === String ? $root.PrinterSystemState[message.state] === undefined ? message.state : $root.PrinterSystemState[message.state] : message.state;
        if (message.errorFlags != null && message.hasOwnProperty("errorFlags"))
            object.errorFlags = message.errorFlags;
        if (message.pressureControl != null && message.hasOwnProperty("pressureControl"))
            object.pressureControl = $root.PressureControlSystemState.toObject(message.pressureControl, options);
        return object;
    };

    /**
     * Converts this PrinterSystemStateResponse to JSON.
     * @function toJSON
     * @memberof PrinterSystemStateResponse
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PrinterSystemStateResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for PrinterSystemStateResponse
     * @function getTypeUrl
     * @memberof PrinterSystemStateResponse
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PrinterSystemStateResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PrinterSystemStateResponse";
    };

    return PrinterSystemStateResponse;
})();

export { $root as default };
