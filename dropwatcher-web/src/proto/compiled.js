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
 * @property {number} PressureControlAlgorithm_NONE=3 PressureControlAlgorithm_NONE value
 */
export const PressureControlAlgorithm = $root.PressureControlAlgorithm = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "PressureControlAlgorithm_UNSPECIFIED"] = 0;
    values[valuesById[1] = "PressureControlAlgorithm_TARGET_PRESSURE"] = 1;
    values[valuesById[2] = "PressureControlAlgorithm_FEED_WITH_LIMIT"] = 2;
    values[valuesById[3] = "PressureControlAlgorithm_NONE"] = 3;
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

export const PressureControlPumpParameters = $root.PressureControlPumpParameters = (() => {

    /**
     * Properties of a PressureControlPumpParameters.
     * @exports IPressureControlPumpParameters
     * @interface IPressureControlPumpParameters
     * @property {PressureControlAlgorithm|null} [algorithm] PressureControlPumpParameters algorithm
     * @property {number|null} [targetPressure] PressureControlPumpParameters targetPressure
     * @property {PressureControlDirection|null} [direction] PressureControlPumpParameters direction
     * @property {number|null} [maxPressureLimit] PressureControlPumpParameters maxPressureLimit
     * @property {number|null} [minPressureLimit] PressureControlPumpParameters minPressureLimit
     * @property {number|null} [feedPwm] PressureControlPumpParameters feedPwm
     * @property {number|null} [feedTime] PressureControlPumpParameters feedTime
     */

    /**
     * Constructs a new PressureControlPumpParameters.
     * @exports PressureControlPumpParameters
     * @classdesc Represents a PressureControlPumpParameters.
     * @implements IPressureControlPumpParameters
     * @constructor
     * @param {IPressureControlPumpParameters=} [properties] Properties to set
     */
    function PressureControlPumpParameters(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PressureControlPumpParameters algorithm.
     * @member {PressureControlAlgorithm} algorithm
     * @memberof PressureControlPumpParameters
     * @instance
     */
    PressureControlPumpParameters.prototype.algorithm = 0;

    /**
     * PressureControlPumpParameters targetPressure.
     * @member {number} targetPressure
     * @memberof PressureControlPumpParameters
     * @instance
     */
    PressureControlPumpParameters.prototype.targetPressure = 0;

    /**
     * PressureControlPumpParameters direction.
     * @member {PressureControlDirection} direction
     * @memberof PressureControlPumpParameters
     * @instance
     */
    PressureControlPumpParameters.prototype.direction = 0;

    /**
     * PressureControlPumpParameters maxPressureLimit.
     * @member {number} maxPressureLimit
     * @memberof PressureControlPumpParameters
     * @instance
     */
    PressureControlPumpParameters.prototype.maxPressureLimit = 0;

    /**
     * PressureControlPumpParameters minPressureLimit.
     * @member {number} minPressureLimit
     * @memberof PressureControlPumpParameters
     * @instance
     */
    PressureControlPumpParameters.prototype.minPressureLimit = 0;

    /**
     * PressureControlPumpParameters feedPwm.
     * @member {number} feedPwm
     * @memberof PressureControlPumpParameters
     * @instance
     */
    PressureControlPumpParameters.prototype.feedPwm = 0;

    /**
     * PressureControlPumpParameters feedTime.
     * @member {number} feedTime
     * @memberof PressureControlPumpParameters
     * @instance
     */
    PressureControlPumpParameters.prototype.feedTime = 0;

    /**
     * Creates a new PressureControlPumpParameters instance using the specified properties.
     * @function create
     * @memberof PressureControlPumpParameters
     * @static
     * @param {IPressureControlPumpParameters=} [properties] Properties to set
     * @returns {PressureControlPumpParameters} PressureControlPumpParameters instance
     */
    PressureControlPumpParameters.create = function create(properties) {
        return new PressureControlPumpParameters(properties);
    };

    /**
     * Encodes the specified PressureControlPumpParameters message. Does not implicitly {@link PressureControlPumpParameters.verify|verify} messages.
     * @function encode
     * @memberof PressureControlPumpParameters
     * @static
     * @param {IPressureControlPumpParameters} message PressureControlPumpParameters message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PressureControlPumpParameters.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.algorithm != null && Object.hasOwnProperty.call(message, "algorithm"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.algorithm);
        if (message.targetPressure != null && Object.hasOwnProperty.call(message, "targetPressure"))
            writer.uint32(/* id 3, wireType 5 =*/29).float(message.targetPressure);
        if (message.direction != null && Object.hasOwnProperty.call(message, "direction"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.direction);
        if (message.maxPressureLimit != null && Object.hasOwnProperty.call(message, "maxPressureLimit"))
            writer.uint32(/* id 5, wireType 5 =*/45).float(message.maxPressureLimit);
        if (message.minPressureLimit != null && Object.hasOwnProperty.call(message, "minPressureLimit"))
            writer.uint32(/* id 6, wireType 5 =*/53).float(message.minPressureLimit);
        if (message.feedPwm != null && Object.hasOwnProperty.call(message, "feedPwm"))
            writer.uint32(/* id 7, wireType 5 =*/61).float(message.feedPwm);
        if (message.feedTime != null && Object.hasOwnProperty.call(message, "feedTime"))
            writer.uint32(/* id 8, wireType 5 =*/69).float(message.feedTime);
        return writer;
    };

    /**
     * Encodes the specified PressureControlPumpParameters message, length delimited. Does not implicitly {@link PressureControlPumpParameters.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PressureControlPumpParameters
     * @static
     * @param {IPressureControlPumpParameters} message PressureControlPumpParameters message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PressureControlPumpParameters.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PressureControlPumpParameters message from the specified reader or buffer.
     * @function decode
     * @memberof PressureControlPumpParameters
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PressureControlPumpParameters} PressureControlPumpParameters
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PressureControlPumpParameters.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.PressureControlPumpParameters();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
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
                    message.maxPressureLimit = reader.float();
                    break;
                }
            case 6: {
                    message.minPressureLimit = reader.float();
                    break;
                }
            case 7: {
                    message.feedPwm = reader.float();
                    break;
                }
            case 8: {
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
     * Decodes a PressureControlPumpParameters message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PressureControlPumpParameters
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PressureControlPumpParameters} PressureControlPumpParameters
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PressureControlPumpParameters.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PressureControlPumpParameters message.
     * @function verify
     * @memberof PressureControlPumpParameters
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PressureControlPumpParameters.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.algorithm != null && message.hasOwnProperty("algorithm"))
            switch (message.algorithm) {
            default:
                return "algorithm: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
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
        if (message.maxPressureLimit != null && message.hasOwnProperty("maxPressureLimit"))
            if (typeof message.maxPressureLimit !== "number")
                return "maxPressureLimit: number expected";
        if (message.minPressureLimit != null && message.hasOwnProperty("minPressureLimit"))
            if (typeof message.minPressureLimit !== "number")
                return "minPressureLimit: number expected";
        if (message.feedPwm != null && message.hasOwnProperty("feedPwm"))
            if (typeof message.feedPwm !== "number")
                return "feedPwm: number expected";
        if (message.feedTime != null && message.hasOwnProperty("feedTime"))
            if (typeof message.feedTime !== "number")
                return "feedTime: number expected";
        return null;
    };

    /**
     * Creates a PressureControlPumpParameters message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PressureControlPumpParameters
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PressureControlPumpParameters} PressureControlPumpParameters
     */
    PressureControlPumpParameters.fromObject = function fromObject(object) {
        if (object instanceof $root.PressureControlPumpParameters)
            return object;
        let message = new $root.PressureControlPumpParameters();
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
        case "PressureControlAlgorithm_NONE":
        case 3:
            message.algorithm = 3;
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
        if (object.maxPressureLimit != null)
            message.maxPressureLimit = Number(object.maxPressureLimit);
        if (object.minPressureLimit != null)
            message.minPressureLimit = Number(object.minPressureLimit);
        if (object.feedPwm != null)
            message.feedPwm = Number(object.feedPwm);
        if (object.feedTime != null)
            message.feedTime = Number(object.feedTime);
        return message;
    };

    /**
     * Creates a plain object from a PressureControlPumpParameters message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PressureControlPumpParameters
     * @static
     * @param {PressureControlPumpParameters} message PressureControlPumpParameters
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PressureControlPumpParameters.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.algorithm = options.enums === String ? "PressureControlAlgorithm_UNSPECIFIED" : 0;
            object.targetPressure = 0;
            object.direction = options.enums === String ? "PressureControlDirection_UNSPECIFIED" : 0;
            object.maxPressureLimit = 0;
            object.minPressureLimit = 0;
            object.feedPwm = 0;
            object.feedTime = 0;
        }
        if (message.algorithm != null && message.hasOwnProperty("algorithm"))
            object.algorithm = options.enums === String ? $root.PressureControlAlgorithm[message.algorithm] === undefined ? message.algorithm : $root.PressureControlAlgorithm[message.algorithm] : message.algorithm;
        if (message.targetPressure != null && message.hasOwnProperty("targetPressure"))
            object.targetPressure = options.json && !isFinite(message.targetPressure) ? String(message.targetPressure) : message.targetPressure;
        if (message.direction != null && message.hasOwnProperty("direction"))
            object.direction = options.enums === String ? $root.PressureControlDirection[message.direction] === undefined ? message.direction : $root.PressureControlDirection[message.direction] : message.direction;
        if (message.maxPressureLimit != null && message.hasOwnProperty("maxPressureLimit"))
            object.maxPressureLimit = options.json && !isFinite(message.maxPressureLimit) ? String(message.maxPressureLimit) : message.maxPressureLimit;
        if (message.minPressureLimit != null && message.hasOwnProperty("minPressureLimit"))
            object.minPressureLimit = options.json && !isFinite(message.minPressureLimit) ? String(message.minPressureLimit) : message.minPressureLimit;
        if (message.feedPwm != null && message.hasOwnProperty("feedPwm"))
            object.feedPwm = options.json && !isFinite(message.feedPwm) ? String(message.feedPwm) : message.feedPwm;
        if (message.feedTime != null && message.hasOwnProperty("feedTime"))
            object.feedTime = options.json && !isFinite(message.feedTime) ? String(message.feedTime) : message.feedTime;
        return object;
    };

    /**
     * Converts this PressureControlPumpParameters to JSON.
     * @function toJSON
     * @memberof PressureControlPumpParameters
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PressureControlPumpParameters.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for PressureControlPumpParameters
     * @function getTypeUrl
     * @memberof PressureControlPumpParameters
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PressureControlPumpParameters.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PressureControlPumpParameters";
    };

    return PressureControlPumpParameters;
})();

export const PressureControlParameters = $root.PressureControlParameters = (() => {

    /**
     * Properties of a PressureControlParameters.
     * @exports IPressureControlParameters
     * @interface IPressureControlParameters
     * @property {boolean|null} [enable] PressureControlParameters enable
     * @property {IPressureControlPumpParameters|null} [inkPump] PressureControlParameters inkPump
     * @property {IPressureControlPumpParameters|null} [cappingPump] PressureControlParameters cappingPump
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
     * PressureControlParameters enable.
     * @member {boolean} enable
     * @memberof PressureControlParameters
     * @instance
     */
    PressureControlParameters.prototype.enable = false;

    /**
     * PressureControlParameters inkPump.
     * @member {IPressureControlPumpParameters|null|undefined} inkPump
     * @memberof PressureControlParameters
     * @instance
     */
    PressureControlParameters.prototype.inkPump = null;

    /**
     * PressureControlParameters cappingPump.
     * @member {IPressureControlPumpParameters|null|undefined} cappingPump
     * @memberof PressureControlParameters
     * @instance
     */
    PressureControlParameters.prototype.cappingPump = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * PressureControlParameters _inkPump.
     * @member {"inkPump"|undefined} _inkPump
     * @memberof PressureControlParameters
     * @instance
     */
    Object.defineProperty(PressureControlParameters.prototype, "_inkPump", {
        get: $util.oneOfGetter($oneOfFields = ["inkPump"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * PressureControlParameters _cappingPump.
     * @member {"cappingPump"|undefined} _cappingPump
     * @memberof PressureControlParameters
     * @instance
     */
    Object.defineProperty(PressureControlParameters.prototype, "_cappingPump", {
        get: $util.oneOfGetter($oneOfFields = ["cappingPump"]),
        set: $util.oneOfSetter($oneOfFields)
    });

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
        if (message.enable != null && Object.hasOwnProperty.call(message, "enable"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.enable);
        if (message.inkPump != null && Object.hasOwnProperty.call(message, "inkPump"))
            $root.PressureControlPumpParameters.encode(message.inkPump, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.cappingPump != null && Object.hasOwnProperty.call(message, "cappingPump"))
            $root.PressureControlPumpParameters.encode(message.cappingPump, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
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
                    message.enable = reader.bool();
                    break;
                }
            case 2: {
                    message.inkPump = $root.PressureControlPumpParameters.decode(reader, reader.uint32());
                    break;
                }
            case 3: {
                    message.cappingPump = $root.PressureControlPumpParameters.decode(reader, reader.uint32());
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
        let properties = {};
        if (message.enable != null && message.hasOwnProperty("enable"))
            if (typeof message.enable !== "boolean")
                return "enable: boolean expected";
        if (message.inkPump != null && message.hasOwnProperty("inkPump")) {
            properties._inkPump = 1;
            {
                let error = $root.PressureControlPumpParameters.verify(message.inkPump);
                if (error)
                    return "inkPump." + error;
            }
        }
        if (message.cappingPump != null && message.hasOwnProperty("cappingPump")) {
            properties._cappingPump = 1;
            {
                let error = $root.PressureControlPumpParameters.verify(message.cappingPump);
                if (error)
                    return "cappingPump." + error;
            }
        }
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
        if (object.enable != null)
            message.enable = Boolean(object.enable);
        if (object.inkPump != null) {
            if (typeof object.inkPump !== "object")
                throw TypeError(".PressureControlParameters.inkPump: object expected");
            message.inkPump = $root.PressureControlPumpParameters.fromObject(object.inkPump);
        }
        if (object.cappingPump != null) {
            if (typeof object.cappingPump !== "object")
                throw TypeError(".PressureControlParameters.cappingPump: object expected");
            message.cappingPump = $root.PressureControlPumpParameters.fromObject(object.cappingPump);
        }
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
        if (options.defaults)
            object.enable = false;
        if (message.enable != null && message.hasOwnProperty("enable"))
            object.enable = message.enable;
        if (message.inkPump != null && message.hasOwnProperty("inkPump")) {
            object.inkPump = $root.PressureControlPumpParameters.toObject(message.inkPump, options);
            if (options.oneofs)
                object._inkPump = "inkPump";
        }
        if (message.cappingPump != null && message.hasOwnProperty("cappingPump")) {
            object.cappingPump = $root.PressureControlPumpParameters.toObject(message.cappingPump, options);
            if (options.oneofs)
                object._cappingPump = "cappingPump";
        }
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

export const PrintControlEncoderModeSettings = $root.PrintControlEncoderModeSettings = (() => {

    /**
     * Properties of a PrintControlEncoderModeSettings.
     * @exports IPrintControlEncoderModeSettings
     * @interface IPrintControlEncoderModeSettings
     * @property {number|null} [sequentialFires] PrintControlEncoderModeSettings sequentialFires
     * @property {number|null} [fireEveryTicks] PrintControlEncoderModeSettings fireEveryTicks
     * @property {number|null} [printFirstLineAfterEncoderTick] PrintControlEncoderModeSettings printFirstLineAfterEncoderTick
     * @property {boolean|null} [startPaused] PrintControlEncoderModeSettings startPaused
     * @property {number|null} [linesToPrint] PrintControlEncoderModeSettings linesToPrint
     */

    /**
     * Constructs a new PrintControlEncoderModeSettings.
     * @exports PrintControlEncoderModeSettings
     * @classdesc Represents a PrintControlEncoderModeSettings.
     * @implements IPrintControlEncoderModeSettings
     * @constructor
     * @param {IPrintControlEncoderModeSettings=} [properties] Properties to set
     */
    function PrintControlEncoderModeSettings(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PrintControlEncoderModeSettings sequentialFires.
     * @member {number} sequentialFires
     * @memberof PrintControlEncoderModeSettings
     * @instance
     */
    PrintControlEncoderModeSettings.prototype.sequentialFires = 0;

    /**
     * PrintControlEncoderModeSettings fireEveryTicks.
     * @member {number} fireEveryTicks
     * @memberof PrintControlEncoderModeSettings
     * @instance
     */
    PrintControlEncoderModeSettings.prototype.fireEveryTicks = 0;

    /**
     * PrintControlEncoderModeSettings printFirstLineAfterEncoderTick.
     * @member {number} printFirstLineAfterEncoderTick
     * @memberof PrintControlEncoderModeSettings
     * @instance
     */
    PrintControlEncoderModeSettings.prototype.printFirstLineAfterEncoderTick = 0;

    /**
     * PrintControlEncoderModeSettings startPaused.
     * @member {boolean|null|undefined} startPaused
     * @memberof PrintControlEncoderModeSettings
     * @instance
     */
    PrintControlEncoderModeSettings.prototype.startPaused = null;

    /**
     * PrintControlEncoderModeSettings linesToPrint.
     * @member {number} linesToPrint
     * @memberof PrintControlEncoderModeSettings
     * @instance
     */
    PrintControlEncoderModeSettings.prototype.linesToPrint = 0;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * PrintControlEncoderModeSettings _startPaused.
     * @member {"startPaused"|undefined} _startPaused
     * @memberof PrintControlEncoderModeSettings
     * @instance
     */
    Object.defineProperty(PrintControlEncoderModeSettings.prototype, "_startPaused", {
        get: $util.oneOfGetter($oneOfFields = ["startPaused"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new PrintControlEncoderModeSettings instance using the specified properties.
     * @function create
     * @memberof PrintControlEncoderModeSettings
     * @static
     * @param {IPrintControlEncoderModeSettings=} [properties] Properties to set
     * @returns {PrintControlEncoderModeSettings} PrintControlEncoderModeSettings instance
     */
    PrintControlEncoderModeSettings.create = function create(properties) {
        return new PrintControlEncoderModeSettings(properties);
    };

    /**
     * Encodes the specified PrintControlEncoderModeSettings message. Does not implicitly {@link PrintControlEncoderModeSettings.verify|verify} messages.
     * @function encode
     * @memberof PrintControlEncoderModeSettings
     * @static
     * @param {IPrintControlEncoderModeSettings} message PrintControlEncoderModeSettings message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PrintControlEncoderModeSettings.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.sequentialFires != null && Object.hasOwnProperty.call(message, "sequentialFires"))
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.sequentialFires);
        if (message.fireEveryTicks != null && Object.hasOwnProperty.call(message, "fireEveryTicks"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.fireEveryTicks);
        if (message.printFirstLineAfterEncoderTick != null && Object.hasOwnProperty.call(message, "printFirstLineAfterEncoderTick"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.printFirstLineAfterEncoderTick);
        if (message.startPaused != null && Object.hasOwnProperty.call(message, "startPaused"))
            writer.uint32(/* id 4, wireType 0 =*/32).bool(message.startPaused);
        if (message.linesToPrint != null && Object.hasOwnProperty.call(message, "linesToPrint"))
            writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.linesToPrint);
        return writer;
    };

    /**
     * Encodes the specified PrintControlEncoderModeSettings message, length delimited. Does not implicitly {@link PrintControlEncoderModeSettings.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PrintControlEncoderModeSettings
     * @static
     * @param {IPrintControlEncoderModeSettings} message PrintControlEncoderModeSettings message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PrintControlEncoderModeSettings.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PrintControlEncoderModeSettings message from the specified reader or buffer.
     * @function decode
     * @memberof PrintControlEncoderModeSettings
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PrintControlEncoderModeSettings} PrintControlEncoderModeSettings
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PrintControlEncoderModeSettings.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.PrintControlEncoderModeSettings();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.sequentialFires = reader.uint32();
                    break;
                }
            case 2: {
                    message.fireEveryTicks = reader.uint32();
                    break;
                }
            case 3: {
                    message.printFirstLineAfterEncoderTick = reader.uint32();
                    break;
                }
            case 4: {
                    message.startPaused = reader.bool();
                    break;
                }
            case 5: {
                    message.linesToPrint = reader.uint32();
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
     * Decodes a PrintControlEncoderModeSettings message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PrintControlEncoderModeSettings
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PrintControlEncoderModeSettings} PrintControlEncoderModeSettings
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PrintControlEncoderModeSettings.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PrintControlEncoderModeSettings message.
     * @function verify
     * @memberof PrintControlEncoderModeSettings
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PrintControlEncoderModeSettings.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message.sequentialFires != null && message.hasOwnProperty("sequentialFires"))
            if (!$util.isInteger(message.sequentialFires))
                return "sequentialFires: integer expected";
        if (message.fireEveryTicks != null && message.hasOwnProperty("fireEveryTicks"))
            if (!$util.isInteger(message.fireEveryTicks))
                return "fireEveryTicks: integer expected";
        if (message.printFirstLineAfterEncoderTick != null && message.hasOwnProperty("printFirstLineAfterEncoderTick"))
            if (!$util.isInteger(message.printFirstLineAfterEncoderTick))
                return "printFirstLineAfterEncoderTick: integer expected";
        if (message.startPaused != null && message.hasOwnProperty("startPaused")) {
            properties._startPaused = 1;
            if (typeof message.startPaused !== "boolean")
                return "startPaused: boolean expected";
        }
        if (message.linesToPrint != null && message.hasOwnProperty("linesToPrint"))
            if (!$util.isInteger(message.linesToPrint))
                return "linesToPrint: integer expected";
        return null;
    };

    /**
     * Creates a PrintControlEncoderModeSettings message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PrintControlEncoderModeSettings
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PrintControlEncoderModeSettings} PrintControlEncoderModeSettings
     */
    PrintControlEncoderModeSettings.fromObject = function fromObject(object) {
        if (object instanceof $root.PrintControlEncoderModeSettings)
            return object;
        let message = new $root.PrintControlEncoderModeSettings();
        if (object.sequentialFires != null)
            message.sequentialFires = object.sequentialFires >>> 0;
        if (object.fireEveryTicks != null)
            message.fireEveryTicks = object.fireEveryTicks >>> 0;
        if (object.printFirstLineAfterEncoderTick != null)
            message.printFirstLineAfterEncoderTick = object.printFirstLineAfterEncoderTick >>> 0;
        if (object.startPaused != null)
            message.startPaused = Boolean(object.startPaused);
        if (object.linesToPrint != null)
            message.linesToPrint = object.linesToPrint >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a PrintControlEncoderModeSettings message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PrintControlEncoderModeSettings
     * @static
     * @param {PrintControlEncoderModeSettings} message PrintControlEncoderModeSettings
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PrintControlEncoderModeSettings.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.sequentialFires = 0;
            object.fireEveryTicks = 0;
            object.printFirstLineAfterEncoderTick = 0;
            object.linesToPrint = 0;
        }
        if (message.sequentialFires != null && message.hasOwnProperty("sequentialFires"))
            object.sequentialFires = message.sequentialFires;
        if (message.fireEveryTicks != null && message.hasOwnProperty("fireEveryTicks"))
            object.fireEveryTicks = message.fireEveryTicks;
        if (message.printFirstLineAfterEncoderTick != null && message.hasOwnProperty("printFirstLineAfterEncoderTick"))
            object.printFirstLineAfterEncoderTick = message.printFirstLineAfterEncoderTick;
        if (message.startPaused != null && message.hasOwnProperty("startPaused")) {
            object.startPaused = message.startPaused;
            if (options.oneofs)
                object._startPaused = "startPaused";
        }
        if (message.linesToPrint != null && message.hasOwnProperty("linesToPrint"))
            object.linesToPrint = message.linesToPrint;
        return object;
    };

    /**
     * Converts this PrintControlEncoderModeSettings to JSON.
     * @function toJSON
     * @memberof PrintControlEncoderModeSettings
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PrintControlEncoderModeSettings.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for PrintControlEncoderModeSettings
     * @function getTypeUrl
     * @memberof PrintControlEncoderModeSettings
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PrintControlEncoderModeSettings.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PrintControlEncoderModeSettings";
    };

    return PrintControlEncoderModeSettings;
})();

/**
 * EncoderMode enum.
 * @exports EncoderMode
 * @enum {number}
 * @property {number} EncoderMode_UNSPECIFIED=0 EncoderMode_UNSPECIFIED value
 * @property {number} EncoderMode_OFF=1 EncoderMode_OFF value
 * @property {number} EncoderMode_ON=2 EncoderMode_ON value
 * @property {number} EncoderMode_PAUSED=3 EncoderMode_PAUSED value
 */
export const EncoderMode = $root.EncoderMode = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "EncoderMode_UNSPECIFIED"] = 0;
    values[valuesById[1] = "EncoderMode_OFF"] = 1;
    values[valuesById[2] = "EncoderMode_ON"] = 2;
    values[valuesById[3] = "EncoderMode_PAUSED"] = 3;
    return values;
})();

export const PrintControlState = $root.PrintControlState = (() => {

    /**
     * Properties of a PrintControlState.
     * @exports IPrintControlState
     * @interface IPrintControlState
     * @property {IPrintControlEncoderModeSettings|null} [encoderModeSettings] PrintControlState encoderModeSettings
     * @property {number|null} [encoderValue] PrintControlState encoderValue
     * @property {number|null} [expectedEncoderValue] PrintControlState expectedEncoderValue
     * @property {number|null} [lastPrintedLine] PrintControlState lastPrintedLine
     * @property {number|null} [lostLinesCount] PrintControlState lostLinesCount
     * @property {number|null} [printedLines] PrintControlState printedLines
     * @property {boolean|null} [nozzlePrimingActive] PrintControlState nozzlePrimingActive
     * @property {EncoderMode|null} [encoderMode] PrintControlState encoderMode
     * @property {number|null} [lostLinesBySlowData] PrintControlState lostLinesBySlowData
     */

    /**
     * Constructs a new PrintControlState.
     * @exports PrintControlState
     * @classdesc Represents a PrintControlState.
     * @implements IPrintControlState
     * @constructor
     * @param {IPrintControlState=} [properties] Properties to set
     */
    function PrintControlState(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PrintControlState encoderModeSettings.
     * @member {IPrintControlEncoderModeSettings|null|undefined} encoderModeSettings
     * @memberof PrintControlState
     * @instance
     */
    PrintControlState.prototype.encoderModeSettings = null;

    /**
     * PrintControlState encoderValue.
     * @member {number} encoderValue
     * @memberof PrintControlState
     * @instance
     */
    PrintControlState.prototype.encoderValue = 0;

    /**
     * PrintControlState expectedEncoderValue.
     * @member {number} expectedEncoderValue
     * @memberof PrintControlState
     * @instance
     */
    PrintControlState.prototype.expectedEncoderValue = 0;

    /**
     * PrintControlState lastPrintedLine.
     * @member {number} lastPrintedLine
     * @memberof PrintControlState
     * @instance
     */
    PrintControlState.prototype.lastPrintedLine = 0;

    /**
     * PrintControlState lostLinesCount.
     * @member {number} lostLinesCount
     * @memberof PrintControlState
     * @instance
     */
    PrintControlState.prototype.lostLinesCount = 0;

    /**
     * PrintControlState printedLines.
     * @member {number} printedLines
     * @memberof PrintControlState
     * @instance
     */
    PrintControlState.prototype.printedLines = 0;

    /**
     * PrintControlState nozzlePrimingActive.
     * @member {boolean} nozzlePrimingActive
     * @memberof PrintControlState
     * @instance
     */
    PrintControlState.prototype.nozzlePrimingActive = false;

    /**
     * PrintControlState encoderMode.
     * @member {EncoderMode} encoderMode
     * @memberof PrintControlState
     * @instance
     */
    PrintControlState.prototype.encoderMode = 0;

    /**
     * PrintControlState lostLinesBySlowData.
     * @member {number} lostLinesBySlowData
     * @memberof PrintControlState
     * @instance
     */
    PrintControlState.prototype.lostLinesBySlowData = 0;

    /**
     * Creates a new PrintControlState instance using the specified properties.
     * @function create
     * @memberof PrintControlState
     * @static
     * @param {IPrintControlState=} [properties] Properties to set
     * @returns {PrintControlState} PrintControlState instance
     */
    PrintControlState.create = function create(properties) {
        return new PrintControlState(properties);
    };

    /**
     * Encodes the specified PrintControlState message. Does not implicitly {@link PrintControlState.verify|verify} messages.
     * @function encode
     * @memberof PrintControlState
     * @static
     * @param {IPrintControlState} message PrintControlState message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PrintControlState.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.encoderModeSettings != null && Object.hasOwnProperty.call(message, "encoderModeSettings"))
            $root.PrintControlEncoderModeSettings.encode(message.encoderModeSettings, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.encoderValue != null && Object.hasOwnProperty.call(message, "encoderValue"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.encoderValue);
        if (message.expectedEncoderValue != null && Object.hasOwnProperty.call(message, "expectedEncoderValue"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.expectedEncoderValue);
        if (message.lastPrintedLine != null && Object.hasOwnProperty.call(message, "lastPrintedLine"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.lastPrintedLine);
        if (message.lostLinesCount != null && Object.hasOwnProperty.call(message, "lostLinesCount"))
            writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.lostLinesCount);
        if (message.printedLines != null && Object.hasOwnProperty.call(message, "printedLines"))
            writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.printedLines);
        if (message.nozzlePrimingActive != null && Object.hasOwnProperty.call(message, "nozzlePrimingActive"))
            writer.uint32(/* id 7, wireType 0 =*/56).bool(message.nozzlePrimingActive);
        if (message.encoderMode != null && Object.hasOwnProperty.call(message, "encoderMode"))
            writer.uint32(/* id 8, wireType 0 =*/64).int32(message.encoderMode);
        if (message.lostLinesBySlowData != null && Object.hasOwnProperty.call(message, "lostLinesBySlowData"))
            writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.lostLinesBySlowData);
        return writer;
    };

    /**
     * Encodes the specified PrintControlState message, length delimited. Does not implicitly {@link PrintControlState.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PrintControlState
     * @static
     * @param {IPrintControlState} message PrintControlState message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PrintControlState.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PrintControlState message from the specified reader or buffer.
     * @function decode
     * @memberof PrintControlState
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PrintControlState} PrintControlState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PrintControlState.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.PrintControlState();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.encoderModeSettings = $root.PrintControlEncoderModeSettings.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    message.encoderValue = reader.int32();
                    break;
                }
            case 3: {
                    message.expectedEncoderValue = reader.int32();
                    break;
                }
            case 4: {
                    message.lastPrintedLine = reader.int32();
                    break;
                }
            case 5: {
                    message.lostLinesCount = reader.uint32();
                    break;
                }
            case 6: {
                    message.printedLines = reader.uint32();
                    break;
                }
            case 7: {
                    message.nozzlePrimingActive = reader.bool();
                    break;
                }
            case 8: {
                    message.encoderMode = reader.int32();
                    break;
                }
            case 9: {
                    message.lostLinesBySlowData = reader.uint32();
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
     * Decodes a PrintControlState message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PrintControlState
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PrintControlState} PrintControlState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PrintControlState.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PrintControlState message.
     * @function verify
     * @memberof PrintControlState
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PrintControlState.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.encoderModeSettings != null && message.hasOwnProperty("encoderModeSettings")) {
            let error = $root.PrintControlEncoderModeSettings.verify(message.encoderModeSettings);
            if (error)
                return "encoderModeSettings." + error;
        }
        if (message.encoderValue != null && message.hasOwnProperty("encoderValue"))
            if (!$util.isInteger(message.encoderValue))
                return "encoderValue: integer expected";
        if (message.expectedEncoderValue != null && message.hasOwnProperty("expectedEncoderValue"))
            if (!$util.isInteger(message.expectedEncoderValue))
                return "expectedEncoderValue: integer expected";
        if (message.lastPrintedLine != null && message.hasOwnProperty("lastPrintedLine"))
            if (!$util.isInteger(message.lastPrintedLine))
                return "lastPrintedLine: integer expected";
        if (message.lostLinesCount != null && message.hasOwnProperty("lostLinesCount"))
            if (!$util.isInteger(message.lostLinesCount))
                return "lostLinesCount: integer expected";
        if (message.printedLines != null && message.hasOwnProperty("printedLines"))
            if (!$util.isInteger(message.printedLines))
                return "printedLines: integer expected";
        if (message.nozzlePrimingActive != null && message.hasOwnProperty("nozzlePrimingActive"))
            if (typeof message.nozzlePrimingActive !== "boolean")
                return "nozzlePrimingActive: boolean expected";
        if (message.encoderMode != null && message.hasOwnProperty("encoderMode"))
            switch (message.encoderMode) {
            default:
                return "encoderMode: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
                break;
            }
        if (message.lostLinesBySlowData != null && message.hasOwnProperty("lostLinesBySlowData"))
            if (!$util.isInteger(message.lostLinesBySlowData))
                return "lostLinesBySlowData: integer expected";
        return null;
    };

    /**
     * Creates a PrintControlState message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PrintControlState
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PrintControlState} PrintControlState
     */
    PrintControlState.fromObject = function fromObject(object) {
        if (object instanceof $root.PrintControlState)
            return object;
        let message = new $root.PrintControlState();
        if (object.encoderModeSettings != null) {
            if (typeof object.encoderModeSettings !== "object")
                throw TypeError(".PrintControlState.encoderModeSettings: object expected");
            message.encoderModeSettings = $root.PrintControlEncoderModeSettings.fromObject(object.encoderModeSettings);
        }
        if (object.encoderValue != null)
            message.encoderValue = object.encoderValue | 0;
        if (object.expectedEncoderValue != null)
            message.expectedEncoderValue = object.expectedEncoderValue | 0;
        if (object.lastPrintedLine != null)
            message.lastPrintedLine = object.lastPrintedLine | 0;
        if (object.lostLinesCount != null)
            message.lostLinesCount = object.lostLinesCount >>> 0;
        if (object.printedLines != null)
            message.printedLines = object.printedLines >>> 0;
        if (object.nozzlePrimingActive != null)
            message.nozzlePrimingActive = Boolean(object.nozzlePrimingActive);
        switch (object.encoderMode) {
        default:
            if (typeof object.encoderMode === "number") {
                message.encoderMode = object.encoderMode;
                break;
            }
            break;
        case "EncoderMode_UNSPECIFIED":
        case 0:
            message.encoderMode = 0;
            break;
        case "EncoderMode_OFF":
        case 1:
            message.encoderMode = 1;
            break;
        case "EncoderMode_ON":
        case 2:
            message.encoderMode = 2;
            break;
        case "EncoderMode_PAUSED":
        case 3:
            message.encoderMode = 3;
            break;
        }
        if (object.lostLinesBySlowData != null)
            message.lostLinesBySlowData = object.lostLinesBySlowData >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a PrintControlState message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PrintControlState
     * @static
     * @param {PrintControlState} message PrintControlState
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PrintControlState.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.encoderModeSettings = null;
            object.encoderValue = 0;
            object.expectedEncoderValue = 0;
            object.lastPrintedLine = 0;
            object.lostLinesCount = 0;
            object.printedLines = 0;
            object.nozzlePrimingActive = false;
            object.encoderMode = options.enums === String ? "EncoderMode_UNSPECIFIED" : 0;
            object.lostLinesBySlowData = 0;
        }
        if (message.encoderModeSettings != null && message.hasOwnProperty("encoderModeSettings"))
            object.encoderModeSettings = $root.PrintControlEncoderModeSettings.toObject(message.encoderModeSettings, options);
        if (message.encoderValue != null && message.hasOwnProperty("encoderValue"))
            object.encoderValue = message.encoderValue;
        if (message.expectedEncoderValue != null && message.hasOwnProperty("expectedEncoderValue"))
            object.expectedEncoderValue = message.expectedEncoderValue;
        if (message.lastPrintedLine != null && message.hasOwnProperty("lastPrintedLine"))
            object.lastPrintedLine = message.lastPrintedLine;
        if (message.lostLinesCount != null && message.hasOwnProperty("lostLinesCount"))
            object.lostLinesCount = message.lostLinesCount;
        if (message.printedLines != null && message.hasOwnProperty("printedLines"))
            object.printedLines = message.printedLines;
        if (message.nozzlePrimingActive != null && message.hasOwnProperty("nozzlePrimingActive"))
            object.nozzlePrimingActive = message.nozzlePrimingActive;
        if (message.encoderMode != null && message.hasOwnProperty("encoderMode"))
            object.encoderMode = options.enums === String ? $root.EncoderMode[message.encoderMode] === undefined ? message.encoderMode : $root.EncoderMode[message.encoderMode] : message.encoderMode;
        if (message.lostLinesBySlowData != null && message.hasOwnProperty("lostLinesBySlowData"))
            object.lostLinesBySlowData = message.lostLinesBySlowData;
        return object;
    };

    /**
     * Converts this PrintControlState to JSON.
     * @function toJSON
     * @memberof PrintControlState
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PrintControlState.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for PrintControlState
     * @function getTypeUrl
     * @memberof PrintControlState
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PrintControlState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PrintControlState";
    };

    return PrintControlState;
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
            case 5:
            case 6:
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
        case "PrinterSystemState_PRINT":
        case 5:
            message.state = 5;
            break;
        case "PrinterSystemState_KEEP_ALIVE":
        case 6:
            message.state = 6;
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

export const ChangePressureControlParametersRequest = $root.ChangePressureControlParametersRequest = (() => {

    /**
     * Properties of a ChangePressureControlParametersRequest.
     * @exports IChangePressureControlParametersRequest
     * @interface IChangePressureControlParametersRequest
     * @property {IPressureControlParameters|null} [parameters] ChangePressureControlParametersRequest parameters
     */

    /**
     * Constructs a new ChangePressureControlParametersRequest.
     * @exports ChangePressureControlParametersRequest
     * @classdesc Represents a ChangePressureControlParametersRequest.
     * @implements IChangePressureControlParametersRequest
     * @constructor
     * @param {IChangePressureControlParametersRequest=} [properties] Properties to set
     */
    function ChangePressureControlParametersRequest(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ChangePressureControlParametersRequest parameters.
     * @member {IPressureControlParameters|null|undefined} parameters
     * @memberof ChangePressureControlParametersRequest
     * @instance
     */
    ChangePressureControlParametersRequest.prototype.parameters = null;

    /**
     * Creates a new ChangePressureControlParametersRequest instance using the specified properties.
     * @function create
     * @memberof ChangePressureControlParametersRequest
     * @static
     * @param {IChangePressureControlParametersRequest=} [properties] Properties to set
     * @returns {ChangePressureControlParametersRequest} ChangePressureControlParametersRequest instance
     */
    ChangePressureControlParametersRequest.create = function create(properties) {
        return new ChangePressureControlParametersRequest(properties);
    };

    /**
     * Encodes the specified ChangePressureControlParametersRequest message. Does not implicitly {@link ChangePressureControlParametersRequest.verify|verify} messages.
     * @function encode
     * @memberof ChangePressureControlParametersRequest
     * @static
     * @param {IChangePressureControlParametersRequest} message ChangePressureControlParametersRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangePressureControlParametersRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.parameters != null && Object.hasOwnProperty.call(message, "parameters"))
            $root.PressureControlParameters.encode(message.parameters, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified ChangePressureControlParametersRequest message, length delimited. Does not implicitly {@link ChangePressureControlParametersRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ChangePressureControlParametersRequest
     * @static
     * @param {IChangePressureControlParametersRequest} message ChangePressureControlParametersRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangePressureControlParametersRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ChangePressureControlParametersRequest message from the specified reader or buffer.
     * @function decode
     * @memberof ChangePressureControlParametersRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ChangePressureControlParametersRequest} ChangePressureControlParametersRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangePressureControlParametersRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChangePressureControlParametersRequest();
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
     * Decodes a ChangePressureControlParametersRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ChangePressureControlParametersRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ChangePressureControlParametersRequest} ChangePressureControlParametersRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangePressureControlParametersRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ChangePressureControlParametersRequest message.
     * @function verify
     * @memberof ChangePressureControlParametersRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ChangePressureControlParametersRequest.verify = function verify(message) {
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
     * Creates a ChangePressureControlParametersRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ChangePressureControlParametersRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ChangePressureControlParametersRequest} ChangePressureControlParametersRequest
     */
    ChangePressureControlParametersRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.ChangePressureControlParametersRequest)
            return object;
        let message = new $root.ChangePressureControlParametersRequest();
        if (object.parameters != null) {
            if (typeof object.parameters !== "object")
                throw TypeError(".ChangePressureControlParametersRequest.parameters: object expected");
            message.parameters = $root.PressureControlParameters.fromObject(object.parameters);
        }
        return message;
    };

    /**
     * Creates a plain object from a ChangePressureControlParametersRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ChangePressureControlParametersRequest
     * @static
     * @param {ChangePressureControlParametersRequest} message ChangePressureControlParametersRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ChangePressureControlParametersRequest.toObject = function toObject(message, options) {
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
     * Converts this ChangePressureControlParametersRequest to JSON.
     * @function toJSON
     * @memberof ChangePressureControlParametersRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ChangePressureControlParametersRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ChangePressureControlParametersRequest
     * @function getTypeUrl
     * @memberof ChangePressureControlParametersRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ChangePressureControlParametersRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ChangePressureControlParametersRequest";
    };

    return ChangePressureControlParametersRequest;
})();

export const ChangeNozzleDataRequest = $root.ChangeNozzleDataRequest = (() => {

    /**
     * Properties of a ChangeNozzleDataRequest.
     * @exports IChangeNozzleDataRequest
     * @interface IChangeNozzleDataRequest
     * @property {Array.<number>|null} [data] ChangeNozzleDataRequest data
     */

    /**
     * Constructs a new ChangeNozzleDataRequest.
     * @exports ChangeNozzleDataRequest
     * @classdesc Represents a ChangeNozzleDataRequest.
     * @implements IChangeNozzleDataRequest
     * @constructor
     * @param {IChangeNozzleDataRequest=} [properties] Properties to set
     */
    function ChangeNozzleDataRequest(properties) {
        this.data = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ChangeNozzleDataRequest data.
     * @member {Array.<number>} data
     * @memberof ChangeNozzleDataRequest
     * @instance
     */
    ChangeNozzleDataRequest.prototype.data = $util.emptyArray;

    /**
     * Creates a new ChangeNozzleDataRequest instance using the specified properties.
     * @function create
     * @memberof ChangeNozzleDataRequest
     * @static
     * @param {IChangeNozzleDataRequest=} [properties] Properties to set
     * @returns {ChangeNozzleDataRequest} ChangeNozzleDataRequest instance
     */
    ChangeNozzleDataRequest.create = function create(properties) {
        return new ChangeNozzleDataRequest(properties);
    };

    /**
     * Encodes the specified ChangeNozzleDataRequest message. Does not implicitly {@link ChangeNozzleDataRequest.verify|verify} messages.
     * @function encode
     * @memberof ChangeNozzleDataRequest
     * @static
     * @param {IChangeNozzleDataRequest} message ChangeNozzleDataRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangeNozzleDataRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.data != null && message.data.length) {
            writer.uint32(/* id 1, wireType 2 =*/10).fork();
            for (let i = 0; i < message.data.length; ++i)
                writer.uint32(message.data[i]);
            writer.ldelim();
        }
        return writer;
    };

    /**
     * Encodes the specified ChangeNozzleDataRequest message, length delimited. Does not implicitly {@link ChangeNozzleDataRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ChangeNozzleDataRequest
     * @static
     * @param {IChangeNozzleDataRequest} message ChangeNozzleDataRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangeNozzleDataRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ChangeNozzleDataRequest message from the specified reader or buffer.
     * @function decode
     * @memberof ChangeNozzleDataRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ChangeNozzleDataRequest} ChangeNozzleDataRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangeNozzleDataRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChangeNozzleDataRequest();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    if (!(message.data && message.data.length))
                        message.data = [];
                    if ((tag & 7) === 2) {
                        let end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.data.push(reader.uint32());
                    } else
                        message.data.push(reader.uint32());
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
     * Decodes a ChangeNozzleDataRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ChangeNozzleDataRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ChangeNozzleDataRequest} ChangeNozzleDataRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangeNozzleDataRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ChangeNozzleDataRequest message.
     * @function verify
     * @memberof ChangeNozzleDataRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ChangeNozzleDataRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.data != null && message.hasOwnProperty("data")) {
            if (!Array.isArray(message.data))
                return "data: array expected";
            for (let i = 0; i < message.data.length; ++i)
                if (!$util.isInteger(message.data[i]))
                    return "data: integer[] expected";
        }
        return null;
    };

    /**
     * Creates a ChangeNozzleDataRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ChangeNozzleDataRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ChangeNozzleDataRequest} ChangeNozzleDataRequest
     */
    ChangeNozzleDataRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.ChangeNozzleDataRequest)
            return object;
        let message = new $root.ChangeNozzleDataRequest();
        if (object.data) {
            if (!Array.isArray(object.data))
                throw TypeError(".ChangeNozzleDataRequest.data: array expected");
            message.data = [];
            for (let i = 0; i < object.data.length; ++i)
                message.data[i] = object.data[i] >>> 0;
        }
        return message;
    };

    /**
     * Creates a plain object from a ChangeNozzleDataRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ChangeNozzleDataRequest
     * @static
     * @param {ChangeNozzleDataRequest} message ChangeNozzleDataRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ChangeNozzleDataRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.arrays || options.defaults)
            object.data = [];
        if (message.data && message.data.length) {
            object.data = [];
            for (let j = 0; j < message.data.length; ++j)
                object.data[j] = message.data[j];
        }
        return object;
    };

    /**
     * Converts this ChangeNozzleDataRequest to JSON.
     * @function toJSON
     * @memberof ChangeNozzleDataRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ChangeNozzleDataRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ChangeNozzleDataRequest
     * @function getTypeUrl
     * @memberof ChangeNozzleDataRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ChangeNozzleDataRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ChangeNozzleDataRequest";
    };

    return ChangeNozzleDataRequest;
})();

export const ChangeEncoderPositionRequest = $root.ChangeEncoderPositionRequest = (() => {

    /**
     * Properties of a ChangeEncoderPositionRequest.
     * @exports IChangeEncoderPositionRequest
     * @interface IChangeEncoderPositionRequest
     * @property {number|null} [position] ChangeEncoderPositionRequest position
     */

    /**
     * Constructs a new ChangeEncoderPositionRequest.
     * @exports ChangeEncoderPositionRequest
     * @classdesc Represents a ChangeEncoderPositionRequest.
     * @implements IChangeEncoderPositionRequest
     * @constructor
     * @param {IChangeEncoderPositionRequest=} [properties] Properties to set
     */
    function ChangeEncoderPositionRequest(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ChangeEncoderPositionRequest position.
     * @member {number} position
     * @memberof ChangeEncoderPositionRequest
     * @instance
     */
    ChangeEncoderPositionRequest.prototype.position = 0;

    /**
     * Creates a new ChangeEncoderPositionRequest instance using the specified properties.
     * @function create
     * @memberof ChangeEncoderPositionRequest
     * @static
     * @param {IChangeEncoderPositionRequest=} [properties] Properties to set
     * @returns {ChangeEncoderPositionRequest} ChangeEncoderPositionRequest instance
     */
    ChangeEncoderPositionRequest.create = function create(properties) {
        return new ChangeEncoderPositionRequest(properties);
    };

    /**
     * Encodes the specified ChangeEncoderPositionRequest message. Does not implicitly {@link ChangeEncoderPositionRequest.verify|verify} messages.
     * @function encode
     * @memberof ChangeEncoderPositionRequest
     * @static
     * @param {IChangeEncoderPositionRequest} message ChangeEncoderPositionRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangeEncoderPositionRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.position != null && Object.hasOwnProperty.call(message, "position"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.position);
        return writer;
    };

    /**
     * Encodes the specified ChangeEncoderPositionRequest message, length delimited. Does not implicitly {@link ChangeEncoderPositionRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ChangeEncoderPositionRequest
     * @static
     * @param {IChangeEncoderPositionRequest} message ChangeEncoderPositionRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangeEncoderPositionRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ChangeEncoderPositionRequest message from the specified reader or buffer.
     * @function decode
     * @memberof ChangeEncoderPositionRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ChangeEncoderPositionRequest} ChangeEncoderPositionRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangeEncoderPositionRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChangeEncoderPositionRequest();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.position = reader.int32();
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
     * Decodes a ChangeEncoderPositionRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ChangeEncoderPositionRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ChangeEncoderPositionRequest} ChangeEncoderPositionRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangeEncoderPositionRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ChangeEncoderPositionRequest message.
     * @function verify
     * @memberof ChangeEncoderPositionRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ChangeEncoderPositionRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.position != null && message.hasOwnProperty("position"))
            if (!$util.isInteger(message.position))
                return "position: integer expected";
        return null;
    };

    /**
     * Creates a ChangeEncoderPositionRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ChangeEncoderPositionRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ChangeEncoderPositionRequest} ChangeEncoderPositionRequest
     */
    ChangeEncoderPositionRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.ChangeEncoderPositionRequest)
            return object;
        let message = new $root.ChangeEncoderPositionRequest();
        if (object.position != null)
            message.position = object.position | 0;
        return message;
    };

    /**
     * Creates a plain object from a ChangeEncoderPositionRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ChangeEncoderPositionRequest
     * @static
     * @param {ChangeEncoderPositionRequest} message ChangeEncoderPositionRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ChangeEncoderPositionRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.position = 0;
        if (message.position != null && message.hasOwnProperty("position"))
            object.position = message.position;
        return object;
    };

    /**
     * Converts this ChangeEncoderPositionRequest to JSON.
     * @function toJSON
     * @memberof ChangeEncoderPositionRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ChangeEncoderPositionRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ChangeEncoderPositionRequest
     * @function getTypeUrl
     * @memberof ChangeEncoderPositionRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ChangeEncoderPositionRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ChangeEncoderPositionRequest";
    };

    return ChangeEncoderPositionRequest;
})();

export const ChangeEncoderModeSettingsRequest = $root.ChangeEncoderModeSettingsRequest = (() => {

    /**
     * Properties of a ChangeEncoderModeSettingsRequest.
     * @exports IChangeEncoderModeSettingsRequest
     * @interface IChangeEncoderModeSettingsRequest
     * @property {IPrintControlEncoderModeSettings|null} [encoderModeSettings] ChangeEncoderModeSettingsRequest encoderModeSettings
     */

    /**
     * Constructs a new ChangeEncoderModeSettingsRequest.
     * @exports ChangeEncoderModeSettingsRequest
     * @classdesc Represents a ChangeEncoderModeSettingsRequest.
     * @implements IChangeEncoderModeSettingsRequest
     * @constructor
     * @param {IChangeEncoderModeSettingsRequest=} [properties] Properties to set
     */
    function ChangeEncoderModeSettingsRequest(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ChangeEncoderModeSettingsRequest encoderModeSettings.
     * @member {IPrintControlEncoderModeSettings|null|undefined} encoderModeSettings
     * @memberof ChangeEncoderModeSettingsRequest
     * @instance
     */
    ChangeEncoderModeSettingsRequest.prototype.encoderModeSettings = null;

    /**
     * Creates a new ChangeEncoderModeSettingsRequest instance using the specified properties.
     * @function create
     * @memberof ChangeEncoderModeSettingsRequest
     * @static
     * @param {IChangeEncoderModeSettingsRequest=} [properties] Properties to set
     * @returns {ChangeEncoderModeSettingsRequest} ChangeEncoderModeSettingsRequest instance
     */
    ChangeEncoderModeSettingsRequest.create = function create(properties) {
        return new ChangeEncoderModeSettingsRequest(properties);
    };

    /**
     * Encodes the specified ChangeEncoderModeSettingsRequest message. Does not implicitly {@link ChangeEncoderModeSettingsRequest.verify|verify} messages.
     * @function encode
     * @memberof ChangeEncoderModeSettingsRequest
     * @static
     * @param {IChangeEncoderModeSettingsRequest} message ChangeEncoderModeSettingsRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangeEncoderModeSettingsRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.encoderModeSettings != null && Object.hasOwnProperty.call(message, "encoderModeSettings"))
            $root.PrintControlEncoderModeSettings.encode(message.encoderModeSettings, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified ChangeEncoderModeSettingsRequest message, length delimited. Does not implicitly {@link ChangeEncoderModeSettingsRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ChangeEncoderModeSettingsRequest
     * @static
     * @param {IChangeEncoderModeSettingsRequest} message ChangeEncoderModeSettingsRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangeEncoderModeSettingsRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ChangeEncoderModeSettingsRequest message from the specified reader or buffer.
     * @function decode
     * @memberof ChangeEncoderModeSettingsRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ChangeEncoderModeSettingsRequest} ChangeEncoderModeSettingsRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangeEncoderModeSettingsRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChangeEncoderModeSettingsRequest();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.encoderModeSettings = $root.PrintControlEncoderModeSettings.decode(reader, reader.uint32());
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
     * Decodes a ChangeEncoderModeSettingsRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ChangeEncoderModeSettingsRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ChangeEncoderModeSettingsRequest} ChangeEncoderModeSettingsRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangeEncoderModeSettingsRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ChangeEncoderModeSettingsRequest message.
     * @function verify
     * @memberof ChangeEncoderModeSettingsRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ChangeEncoderModeSettingsRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.encoderModeSettings != null && message.hasOwnProperty("encoderModeSettings")) {
            let error = $root.PrintControlEncoderModeSettings.verify(message.encoderModeSettings);
            if (error)
                return "encoderModeSettings." + error;
        }
        return null;
    };

    /**
     * Creates a ChangeEncoderModeSettingsRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ChangeEncoderModeSettingsRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ChangeEncoderModeSettingsRequest} ChangeEncoderModeSettingsRequest
     */
    ChangeEncoderModeSettingsRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.ChangeEncoderModeSettingsRequest)
            return object;
        let message = new $root.ChangeEncoderModeSettingsRequest();
        if (object.encoderModeSettings != null) {
            if (typeof object.encoderModeSettings !== "object")
                throw TypeError(".ChangeEncoderModeSettingsRequest.encoderModeSettings: object expected");
            message.encoderModeSettings = $root.PrintControlEncoderModeSettings.fromObject(object.encoderModeSettings);
        }
        return message;
    };

    /**
     * Creates a plain object from a ChangeEncoderModeSettingsRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ChangeEncoderModeSettingsRequest
     * @static
     * @param {ChangeEncoderModeSettingsRequest} message ChangeEncoderModeSettingsRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ChangeEncoderModeSettingsRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.encoderModeSettings = null;
        if (message.encoderModeSettings != null && message.hasOwnProperty("encoderModeSettings"))
            object.encoderModeSettings = $root.PrintControlEncoderModeSettings.toObject(message.encoderModeSettings, options);
        return object;
    };

    /**
     * Converts this ChangeEncoderModeSettingsRequest to JSON.
     * @function toJSON
     * @memberof ChangeEncoderModeSettingsRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ChangeEncoderModeSettingsRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ChangeEncoderModeSettingsRequest
     * @function getTypeUrl
     * @memberof ChangeEncoderModeSettingsRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ChangeEncoderModeSettingsRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ChangeEncoderModeSettingsRequest";
    };

    return ChangeEncoderModeSettingsRequest;
})();

export const ChangePrintMemoryRequest = $root.ChangePrintMemoryRequest = (() => {

    /**
     * Properties of a ChangePrintMemoryRequest.
     * @exports IChangePrintMemoryRequest
     * @interface IChangePrintMemoryRequest
     * @property {number|null} [offset] ChangePrintMemoryRequest offset
     * @property {Array.<number>|null} [data] ChangePrintMemoryRequest data
     */

    /**
     * Constructs a new ChangePrintMemoryRequest.
     * @exports ChangePrintMemoryRequest
     * @classdesc Represents a ChangePrintMemoryRequest.
     * @implements IChangePrintMemoryRequest
     * @constructor
     * @param {IChangePrintMemoryRequest=} [properties] Properties to set
     */
    function ChangePrintMemoryRequest(properties) {
        this.data = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ChangePrintMemoryRequest offset.
     * @member {number} offset
     * @memberof ChangePrintMemoryRequest
     * @instance
     */
    ChangePrintMemoryRequest.prototype.offset = 0;

    /**
     * ChangePrintMemoryRequest data.
     * @member {Array.<number>} data
     * @memberof ChangePrintMemoryRequest
     * @instance
     */
    ChangePrintMemoryRequest.prototype.data = $util.emptyArray;

    /**
     * Creates a new ChangePrintMemoryRequest instance using the specified properties.
     * @function create
     * @memberof ChangePrintMemoryRequest
     * @static
     * @param {IChangePrintMemoryRequest=} [properties] Properties to set
     * @returns {ChangePrintMemoryRequest} ChangePrintMemoryRequest instance
     */
    ChangePrintMemoryRequest.create = function create(properties) {
        return new ChangePrintMemoryRequest(properties);
    };

    /**
     * Encodes the specified ChangePrintMemoryRequest message. Does not implicitly {@link ChangePrintMemoryRequest.verify|verify} messages.
     * @function encode
     * @memberof ChangePrintMemoryRequest
     * @static
     * @param {IChangePrintMemoryRequest} message ChangePrintMemoryRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangePrintMemoryRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.offset != null && Object.hasOwnProperty.call(message, "offset"))
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.offset);
        if (message.data != null && message.data.length) {
            writer.uint32(/* id 2, wireType 2 =*/18).fork();
            for (let i = 0; i < message.data.length; ++i)
                writer.uint32(message.data[i]);
            writer.ldelim();
        }
        return writer;
    };

    /**
     * Encodes the specified ChangePrintMemoryRequest message, length delimited. Does not implicitly {@link ChangePrintMemoryRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ChangePrintMemoryRequest
     * @static
     * @param {IChangePrintMemoryRequest} message ChangePrintMemoryRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangePrintMemoryRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ChangePrintMemoryRequest message from the specified reader or buffer.
     * @function decode
     * @memberof ChangePrintMemoryRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ChangePrintMemoryRequest} ChangePrintMemoryRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangePrintMemoryRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChangePrintMemoryRequest();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.offset = reader.uint32();
                    break;
                }
            case 2: {
                    if (!(message.data && message.data.length))
                        message.data = [];
                    if ((tag & 7) === 2) {
                        let end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.data.push(reader.uint32());
                    } else
                        message.data.push(reader.uint32());
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
     * Decodes a ChangePrintMemoryRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ChangePrintMemoryRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ChangePrintMemoryRequest} ChangePrintMemoryRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangePrintMemoryRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ChangePrintMemoryRequest message.
     * @function verify
     * @memberof ChangePrintMemoryRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ChangePrintMemoryRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.offset != null && message.hasOwnProperty("offset"))
            if (!$util.isInteger(message.offset))
                return "offset: integer expected";
        if (message.data != null && message.hasOwnProperty("data")) {
            if (!Array.isArray(message.data))
                return "data: array expected";
            for (let i = 0; i < message.data.length; ++i)
                if (!$util.isInteger(message.data[i]))
                    return "data: integer[] expected";
        }
        return null;
    };

    /**
     * Creates a ChangePrintMemoryRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ChangePrintMemoryRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ChangePrintMemoryRequest} ChangePrintMemoryRequest
     */
    ChangePrintMemoryRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.ChangePrintMemoryRequest)
            return object;
        let message = new $root.ChangePrintMemoryRequest();
        if (object.offset != null)
            message.offset = object.offset >>> 0;
        if (object.data) {
            if (!Array.isArray(object.data))
                throw TypeError(".ChangePrintMemoryRequest.data: array expected");
            message.data = [];
            for (let i = 0; i < object.data.length; ++i)
                message.data[i] = object.data[i] >>> 0;
        }
        return message;
    };

    /**
     * Creates a plain object from a ChangePrintMemoryRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ChangePrintMemoryRequest
     * @static
     * @param {ChangePrintMemoryRequest} message ChangePrintMemoryRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ChangePrintMemoryRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.arrays || options.defaults)
            object.data = [];
        if (options.defaults)
            object.offset = 0;
        if (message.offset != null && message.hasOwnProperty("offset"))
            object.offset = message.offset;
        if (message.data && message.data.length) {
            object.data = [];
            for (let j = 0; j < message.data.length; ++j)
                object.data[j] = message.data[j];
        }
        return object;
    };

    /**
     * Converts this ChangePrintMemoryRequest to JSON.
     * @function toJSON
     * @memberof ChangePrintMemoryRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ChangePrintMemoryRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ChangePrintMemoryRequest
     * @function getTypeUrl
     * @memberof ChangePrintMemoryRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ChangePrintMemoryRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ChangePrintMemoryRequest";
    };

    return ChangePrintMemoryRequest;
})();

export const NozzlePrimingRequest = $root.NozzlePrimingRequest = (() => {

    /**
     * Properties of a NozzlePrimingRequest.
     * @exports INozzlePrimingRequest
     * @interface INozzlePrimingRequest
     */

    /**
     * Constructs a new NozzlePrimingRequest.
     * @exports NozzlePrimingRequest
     * @classdesc Represents a NozzlePrimingRequest.
     * @implements INozzlePrimingRequest
     * @constructor
     * @param {INozzlePrimingRequest=} [properties] Properties to set
     */
    function NozzlePrimingRequest(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new NozzlePrimingRequest instance using the specified properties.
     * @function create
     * @memberof NozzlePrimingRequest
     * @static
     * @param {INozzlePrimingRequest=} [properties] Properties to set
     * @returns {NozzlePrimingRequest} NozzlePrimingRequest instance
     */
    NozzlePrimingRequest.create = function create(properties) {
        return new NozzlePrimingRequest(properties);
    };

    /**
     * Encodes the specified NozzlePrimingRequest message. Does not implicitly {@link NozzlePrimingRequest.verify|verify} messages.
     * @function encode
     * @memberof NozzlePrimingRequest
     * @static
     * @param {INozzlePrimingRequest} message NozzlePrimingRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    NozzlePrimingRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified NozzlePrimingRequest message, length delimited. Does not implicitly {@link NozzlePrimingRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof NozzlePrimingRequest
     * @static
     * @param {INozzlePrimingRequest} message NozzlePrimingRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    NozzlePrimingRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a NozzlePrimingRequest message from the specified reader or buffer.
     * @function decode
     * @memberof NozzlePrimingRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {NozzlePrimingRequest} NozzlePrimingRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    NozzlePrimingRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.NozzlePrimingRequest();
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
     * Decodes a NozzlePrimingRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof NozzlePrimingRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {NozzlePrimingRequest} NozzlePrimingRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    NozzlePrimingRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a NozzlePrimingRequest message.
     * @function verify
     * @memberof NozzlePrimingRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    NozzlePrimingRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a NozzlePrimingRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof NozzlePrimingRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {NozzlePrimingRequest} NozzlePrimingRequest
     */
    NozzlePrimingRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.NozzlePrimingRequest)
            return object;
        return new $root.NozzlePrimingRequest();
    };

    /**
     * Creates a plain object from a NozzlePrimingRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof NozzlePrimingRequest
     * @static
     * @param {NozzlePrimingRequest} message NozzlePrimingRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    NozzlePrimingRequest.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this NozzlePrimingRequest to JSON.
     * @function toJSON
     * @memberof NozzlePrimingRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    NozzlePrimingRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for NozzlePrimingRequest
     * @function getTypeUrl
     * @memberof NozzlePrimingRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    NozzlePrimingRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/NozzlePrimingRequest";
    };

    return NozzlePrimingRequest;
})();

export const ChangeEncoderModeRequest = $root.ChangeEncoderModeRequest = (() => {

    /**
     * Properties of a ChangeEncoderModeRequest.
     * @exports IChangeEncoderModeRequest
     * @interface IChangeEncoderModeRequest
     * @property {boolean|null} [paused] ChangeEncoderModeRequest paused
     */

    /**
     * Constructs a new ChangeEncoderModeRequest.
     * @exports ChangeEncoderModeRequest
     * @classdesc Represents a ChangeEncoderModeRequest.
     * @implements IChangeEncoderModeRequest
     * @constructor
     * @param {IChangeEncoderModeRequest=} [properties] Properties to set
     */
    function ChangeEncoderModeRequest(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ChangeEncoderModeRequest paused.
     * @member {boolean} paused
     * @memberof ChangeEncoderModeRequest
     * @instance
     */
    ChangeEncoderModeRequest.prototype.paused = false;

    /**
     * Creates a new ChangeEncoderModeRequest instance using the specified properties.
     * @function create
     * @memberof ChangeEncoderModeRequest
     * @static
     * @param {IChangeEncoderModeRequest=} [properties] Properties to set
     * @returns {ChangeEncoderModeRequest} ChangeEncoderModeRequest instance
     */
    ChangeEncoderModeRequest.create = function create(properties) {
        return new ChangeEncoderModeRequest(properties);
    };

    /**
     * Encodes the specified ChangeEncoderModeRequest message. Does not implicitly {@link ChangeEncoderModeRequest.verify|verify} messages.
     * @function encode
     * @memberof ChangeEncoderModeRequest
     * @static
     * @param {IChangeEncoderModeRequest} message ChangeEncoderModeRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangeEncoderModeRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.paused != null && Object.hasOwnProperty.call(message, "paused"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.paused);
        return writer;
    };

    /**
     * Encodes the specified ChangeEncoderModeRequest message, length delimited. Does not implicitly {@link ChangeEncoderModeRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ChangeEncoderModeRequest
     * @static
     * @param {IChangeEncoderModeRequest} message ChangeEncoderModeRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangeEncoderModeRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ChangeEncoderModeRequest message from the specified reader or buffer.
     * @function decode
     * @memberof ChangeEncoderModeRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ChangeEncoderModeRequest} ChangeEncoderModeRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangeEncoderModeRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChangeEncoderModeRequest();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.paused = reader.bool();
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
     * Decodes a ChangeEncoderModeRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ChangeEncoderModeRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ChangeEncoderModeRequest} ChangeEncoderModeRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangeEncoderModeRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ChangeEncoderModeRequest message.
     * @function verify
     * @memberof ChangeEncoderModeRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ChangeEncoderModeRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.paused != null && message.hasOwnProperty("paused"))
            if (typeof message.paused !== "boolean")
                return "paused: boolean expected";
        return null;
    };

    /**
     * Creates a ChangeEncoderModeRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ChangeEncoderModeRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ChangeEncoderModeRequest} ChangeEncoderModeRequest
     */
    ChangeEncoderModeRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.ChangeEncoderModeRequest)
            return object;
        let message = new $root.ChangeEncoderModeRequest();
        if (object.paused != null)
            message.paused = Boolean(object.paused);
        return message;
    };

    /**
     * Creates a plain object from a ChangeEncoderModeRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ChangeEncoderModeRequest
     * @static
     * @param {ChangeEncoderModeRequest} message ChangeEncoderModeRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ChangeEncoderModeRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.paused = false;
        if (message.paused != null && message.hasOwnProperty("paused"))
            object.paused = message.paused;
        return object;
    };

    /**
     * Converts this ChangeEncoderModeRequest to JSON.
     * @function toJSON
     * @memberof ChangeEncoderModeRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ChangeEncoderModeRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ChangeEncoderModeRequest
     * @function getTypeUrl
     * @memberof ChangeEncoderModeRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ChangeEncoderModeRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ChangeEncoderModeRequest";
    };

    return ChangeEncoderModeRequest;
})();

export const ChangeWaveformControlSettingsRequest = $root.ChangeWaveformControlSettingsRequest = (() => {

    /**
     * Properties of a ChangeWaveformControlSettingsRequest.
     * @exports IChangeWaveformControlSettingsRequest
     * @interface IChangeWaveformControlSettingsRequest
     * @property {IWavefromControlSettings|null} [settings] ChangeWaveformControlSettingsRequest settings
     */

    /**
     * Constructs a new ChangeWaveformControlSettingsRequest.
     * @exports ChangeWaveformControlSettingsRequest
     * @classdesc Represents a ChangeWaveformControlSettingsRequest.
     * @implements IChangeWaveformControlSettingsRequest
     * @constructor
     * @param {IChangeWaveformControlSettingsRequest=} [properties] Properties to set
     */
    function ChangeWaveformControlSettingsRequest(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ChangeWaveformControlSettingsRequest settings.
     * @member {IWavefromControlSettings|null|undefined} settings
     * @memberof ChangeWaveformControlSettingsRequest
     * @instance
     */
    ChangeWaveformControlSettingsRequest.prototype.settings = null;

    /**
     * Creates a new ChangeWaveformControlSettingsRequest instance using the specified properties.
     * @function create
     * @memberof ChangeWaveformControlSettingsRequest
     * @static
     * @param {IChangeWaveformControlSettingsRequest=} [properties] Properties to set
     * @returns {ChangeWaveformControlSettingsRequest} ChangeWaveformControlSettingsRequest instance
     */
    ChangeWaveformControlSettingsRequest.create = function create(properties) {
        return new ChangeWaveformControlSettingsRequest(properties);
    };

    /**
     * Encodes the specified ChangeWaveformControlSettingsRequest message. Does not implicitly {@link ChangeWaveformControlSettingsRequest.verify|verify} messages.
     * @function encode
     * @memberof ChangeWaveformControlSettingsRequest
     * @static
     * @param {IChangeWaveformControlSettingsRequest} message ChangeWaveformControlSettingsRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangeWaveformControlSettingsRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.settings != null && Object.hasOwnProperty.call(message, "settings"))
            $root.WavefromControlSettings.encode(message.settings, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified ChangeWaveformControlSettingsRequest message, length delimited. Does not implicitly {@link ChangeWaveformControlSettingsRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ChangeWaveformControlSettingsRequest
     * @static
     * @param {IChangeWaveformControlSettingsRequest} message ChangeWaveformControlSettingsRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ChangeWaveformControlSettingsRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ChangeWaveformControlSettingsRequest message from the specified reader or buffer.
     * @function decode
     * @memberof ChangeWaveformControlSettingsRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ChangeWaveformControlSettingsRequest} ChangeWaveformControlSettingsRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangeWaveformControlSettingsRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChangeWaveformControlSettingsRequest();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.settings = $root.WavefromControlSettings.decode(reader, reader.uint32());
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
     * Decodes a ChangeWaveformControlSettingsRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ChangeWaveformControlSettingsRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ChangeWaveformControlSettingsRequest} ChangeWaveformControlSettingsRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ChangeWaveformControlSettingsRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ChangeWaveformControlSettingsRequest message.
     * @function verify
     * @memberof ChangeWaveformControlSettingsRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ChangeWaveformControlSettingsRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.settings != null && message.hasOwnProperty("settings")) {
            let error = $root.WavefromControlSettings.verify(message.settings);
            if (error)
                return "settings." + error;
        }
        return null;
    };

    /**
     * Creates a ChangeWaveformControlSettingsRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ChangeWaveformControlSettingsRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ChangeWaveformControlSettingsRequest} ChangeWaveformControlSettingsRequest
     */
    ChangeWaveformControlSettingsRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.ChangeWaveformControlSettingsRequest)
            return object;
        let message = new $root.ChangeWaveformControlSettingsRequest();
        if (object.settings != null) {
            if (typeof object.settings !== "object")
                throw TypeError(".ChangeWaveformControlSettingsRequest.settings: object expected");
            message.settings = $root.WavefromControlSettings.fromObject(object.settings);
        }
        return message;
    };

    /**
     * Creates a plain object from a ChangeWaveformControlSettingsRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ChangeWaveformControlSettingsRequest
     * @static
     * @param {ChangeWaveformControlSettingsRequest} message ChangeWaveformControlSettingsRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ChangeWaveformControlSettingsRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.settings = null;
        if (message.settings != null && message.hasOwnProperty("settings"))
            object.settings = $root.WavefromControlSettings.toObject(message.settings, options);
        return object;
    };

    /**
     * Converts this ChangeWaveformControlSettingsRequest to JSON.
     * @function toJSON
     * @memberof ChangeWaveformControlSettingsRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ChangeWaveformControlSettingsRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ChangeWaveformControlSettingsRequest
     * @function getTypeUrl
     * @memberof ChangeWaveformControlSettingsRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ChangeWaveformControlSettingsRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ChangeWaveformControlSettingsRequest";
    };

    return ChangeWaveformControlSettingsRequest;
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
     * @property {IChangePressureControlParametersRequest|null} [changePressureControlParameterRequest] PrinterRequest changePressureControlParameterRequest
     * @property {IChangeNozzleDataRequest|null} [changeNozzleDataRequest] PrinterRequest changeNozzleDataRequest
     * @property {IChangeEncoderPositionRequest|null} [changeEncoderPositionRequest] PrinterRequest changeEncoderPositionRequest
     * @property {IChangeEncoderModeSettingsRequest|null} [changeEncoderModeSettingsRequest] PrinterRequest changeEncoderModeSettingsRequest
     * @property {IChangePrintMemoryRequest|null} [changePrintMemoryRequest] PrinterRequest changePrintMemoryRequest
     * @property {INozzlePrimingRequest|null} [nozzlePrimingRequest] PrinterRequest nozzlePrimingRequest
     * @property {IChangeEncoderModeRequest|null} [changeEncoderModeRequest] PrinterRequest changeEncoderModeRequest
     * @property {IChangeWaveformControlSettingsRequest|null} [changeWaveformControlSettingsRequest] PrinterRequest changeWaveformControlSettingsRequest
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
     * PrinterRequest changePressureControlParameterRequest.
     * @member {IChangePressureControlParametersRequest|null|undefined} changePressureControlParameterRequest
     * @memberof PrinterRequest
     * @instance
     */
    PrinterRequest.prototype.changePressureControlParameterRequest = null;

    /**
     * PrinterRequest changeNozzleDataRequest.
     * @member {IChangeNozzleDataRequest|null|undefined} changeNozzleDataRequest
     * @memberof PrinterRequest
     * @instance
     */
    PrinterRequest.prototype.changeNozzleDataRequest = null;

    /**
     * PrinterRequest changeEncoderPositionRequest.
     * @member {IChangeEncoderPositionRequest|null|undefined} changeEncoderPositionRequest
     * @memberof PrinterRequest
     * @instance
     */
    PrinterRequest.prototype.changeEncoderPositionRequest = null;

    /**
     * PrinterRequest changeEncoderModeSettingsRequest.
     * @member {IChangeEncoderModeSettingsRequest|null|undefined} changeEncoderModeSettingsRequest
     * @memberof PrinterRequest
     * @instance
     */
    PrinterRequest.prototype.changeEncoderModeSettingsRequest = null;

    /**
     * PrinterRequest changePrintMemoryRequest.
     * @member {IChangePrintMemoryRequest|null|undefined} changePrintMemoryRequest
     * @memberof PrinterRequest
     * @instance
     */
    PrinterRequest.prototype.changePrintMemoryRequest = null;

    /**
     * PrinterRequest nozzlePrimingRequest.
     * @member {INozzlePrimingRequest|null|undefined} nozzlePrimingRequest
     * @memberof PrinterRequest
     * @instance
     */
    PrinterRequest.prototype.nozzlePrimingRequest = null;

    /**
     * PrinterRequest changeEncoderModeRequest.
     * @member {IChangeEncoderModeRequest|null|undefined} changeEncoderModeRequest
     * @memberof PrinterRequest
     * @instance
     */
    PrinterRequest.prototype.changeEncoderModeRequest = null;

    /**
     * PrinterRequest changeWaveformControlSettingsRequest.
     * @member {IChangeWaveformControlSettingsRequest|null|undefined} changeWaveformControlSettingsRequest
     * @memberof PrinterRequest
     * @instance
     */
    PrinterRequest.prototype.changeWaveformControlSettingsRequest = null;

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
     * PrinterRequest _changePressureControlParameterRequest.
     * @member {"changePressureControlParameterRequest"|undefined} _changePressureControlParameterRequest
     * @memberof PrinterRequest
     * @instance
     */
    Object.defineProperty(PrinterRequest.prototype, "_changePressureControlParameterRequest", {
        get: $util.oneOfGetter($oneOfFields = ["changePressureControlParameterRequest"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * PrinterRequest _changeNozzleDataRequest.
     * @member {"changeNozzleDataRequest"|undefined} _changeNozzleDataRequest
     * @memberof PrinterRequest
     * @instance
     */
    Object.defineProperty(PrinterRequest.prototype, "_changeNozzleDataRequest", {
        get: $util.oneOfGetter($oneOfFields = ["changeNozzleDataRequest"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * PrinterRequest _changeEncoderPositionRequest.
     * @member {"changeEncoderPositionRequest"|undefined} _changeEncoderPositionRequest
     * @memberof PrinterRequest
     * @instance
     */
    Object.defineProperty(PrinterRequest.prototype, "_changeEncoderPositionRequest", {
        get: $util.oneOfGetter($oneOfFields = ["changeEncoderPositionRequest"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * PrinterRequest _changeEncoderModeSettingsRequest.
     * @member {"changeEncoderModeSettingsRequest"|undefined} _changeEncoderModeSettingsRequest
     * @memberof PrinterRequest
     * @instance
     */
    Object.defineProperty(PrinterRequest.prototype, "_changeEncoderModeSettingsRequest", {
        get: $util.oneOfGetter($oneOfFields = ["changeEncoderModeSettingsRequest"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * PrinterRequest _changePrintMemoryRequest.
     * @member {"changePrintMemoryRequest"|undefined} _changePrintMemoryRequest
     * @memberof PrinterRequest
     * @instance
     */
    Object.defineProperty(PrinterRequest.prototype, "_changePrintMemoryRequest", {
        get: $util.oneOfGetter($oneOfFields = ["changePrintMemoryRequest"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * PrinterRequest _nozzlePrimingRequest.
     * @member {"nozzlePrimingRequest"|undefined} _nozzlePrimingRequest
     * @memberof PrinterRequest
     * @instance
     */
    Object.defineProperty(PrinterRequest.prototype, "_nozzlePrimingRequest", {
        get: $util.oneOfGetter($oneOfFields = ["nozzlePrimingRequest"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * PrinterRequest _changeEncoderModeRequest.
     * @member {"changeEncoderModeRequest"|undefined} _changeEncoderModeRequest
     * @memberof PrinterRequest
     * @instance
     */
    Object.defineProperty(PrinterRequest.prototype, "_changeEncoderModeRequest", {
        get: $util.oneOfGetter($oneOfFields = ["changeEncoderModeRequest"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * PrinterRequest _changeWaveformControlSettingsRequest.
     * @member {"changeWaveformControlSettingsRequest"|undefined} _changeWaveformControlSettingsRequest
     * @memberof PrinterRequest
     * @instance
     */
    Object.defineProperty(PrinterRequest.prototype, "_changeWaveformControlSettingsRequest", {
        get: $util.oneOfGetter($oneOfFields = ["changeWaveformControlSettingsRequest"]),
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
        if (message.changePressureControlParameterRequest != null && Object.hasOwnProperty.call(message, "changePressureControlParameterRequest"))
            $root.ChangePressureControlParametersRequest.encode(message.changePressureControlParameterRequest, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        if (message.changeNozzleDataRequest != null && Object.hasOwnProperty.call(message, "changeNozzleDataRequest"))
            $root.ChangeNozzleDataRequest.encode(message.changeNozzleDataRequest, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        if (message.changeEncoderPositionRequest != null && Object.hasOwnProperty.call(message, "changeEncoderPositionRequest"))
            $root.ChangeEncoderPositionRequest.encode(message.changeEncoderPositionRequest, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
        if (message.changeEncoderModeSettingsRequest != null && Object.hasOwnProperty.call(message, "changeEncoderModeSettingsRequest"))
            $root.ChangeEncoderModeSettingsRequest.encode(message.changeEncoderModeSettingsRequest, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
        if (message.changePrintMemoryRequest != null && Object.hasOwnProperty.call(message, "changePrintMemoryRequest"))
            $root.ChangePrintMemoryRequest.encode(message.changePrintMemoryRequest, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
        if (message.nozzlePrimingRequest != null && Object.hasOwnProperty.call(message, "nozzlePrimingRequest"))
            $root.NozzlePrimingRequest.encode(message.nozzlePrimingRequest, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
        if (message.changeEncoderModeRequest != null && Object.hasOwnProperty.call(message, "changeEncoderModeRequest"))
            $root.ChangeEncoderModeRequest.encode(message.changeEncoderModeRequest, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
        if (message.changeWaveformControlSettingsRequest != null && Object.hasOwnProperty.call(message, "changeWaveformControlSettingsRequest"))
            $root.ChangeWaveformControlSettingsRequest.encode(message.changeWaveformControlSettingsRequest, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
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
                    message.changePressureControlParameterRequest = $root.ChangePressureControlParametersRequest.decode(reader, reader.uint32());
                    break;
                }
            case 6: {
                    message.changeNozzleDataRequest = $root.ChangeNozzleDataRequest.decode(reader, reader.uint32());
                    break;
                }
            case 7: {
                    message.changeEncoderPositionRequest = $root.ChangeEncoderPositionRequest.decode(reader, reader.uint32());
                    break;
                }
            case 8: {
                    message.changeEncoderModeSettingsRequest = $root.ChangeEncoderModeSettingsRequest.decode(reader, reader.uint32());
                    break;
                }
            case 9: {
                    message.changePrintMemoryRequest = $root.ChangePrintMemoryRequest.decode(reader, reader.uint32());
                    break;
                }
            case 10: {
                    message.nozzlePrimingRequest = $root.NozzlePrimingRequest.decode(reader, reader.uint32());
                    break;
                }
            case 11: {
                    message.changeEncoderModeRequest = $root.ChangeEncoderModeRequest.decode(reader, reader.uint32());
                    break;
                }
            case 12: {
                    message.changeWaveformControlSettingsRequest = $root.ChangeWaveformControlSettingsRequest.decode(reader, reader.uint32());
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
        if (message.changePressureControlParameterRequest != null && message.hasOwnProperty("changePressureControlParameterRequest")) {
            properties._changePressureControlParameterRequest = 1;
            {
                let error = $root.ChangePressureControlParametersRequest.verify(message.changePressureControlParameterRequest);
                if (error)
                    return "changePressureControlParameterRequest." + error;
            }
        }
        if (message.changeNozzleDataRequest != null && message.hasOwnProperty("changeNozzleDataRequest")) {
            properties._changeNozzleDataRequest = 1;
            {
                let error = $root.ChangeNozzleDataRequest.verify(message.changeNozzleDataRequest);
                if (error)
                    return "changeNozzleDataRequest." + error;
            }
        }
        if (message.changeEncoderPositionRequest != null && message.hasOwnProperty("changeEncoderPositionRequest")) {
            properties._changeEncoderPositionRequest = 1;
            {
                let error = $root.ChangeEncoderPositionRequest.verify(message.changeEncoderPositionRequest);
                if (error)
                    return "changeEncoderPositionRequest." + error;
            }
        }
        if (message.changeEncoderModeSettingsRequest != null && message.hasOwnProperty("changeEncoderModeSettingsRequest")) {
            properties._changeEncoderModeSettingsRequest = 1;
            {
                let error = $root.ChangeEncoderModeSettingsRequest.verify(message.changeEncoderModeSettingsRequest);
                if (error)
                    return "changeEncoderModeSettingsRequest." + error;
            }
        }
        if (message.changePrintMemoryRequest != null && message.hasOwnProperty("changePrintMemoryRequest")) {
            properties._changePrintMemoryRequest = 1;
            {
                let error = $root.ChangePrintMemoryRequest.verify(message.changePrintMemoryRequest);
                if (error)
                    return "changePrintMemoryRequest." + error;
            }
        }
        if (message.nozzlePrimingRequest != null && message.hasOwnProperty("nozzlePrimingRequest")) {
            properties._nozzlePrimingRequest = 1;
            {
                let error = $root.NozzlePrimingRequest.verify(message.nozzlePrimingRequest);
                if (error)
                    return "nozzlePrimingRequest." + error;
            }
        }
        if (message.changeEncoderModeRequest != null && message.hasOwnProperty("changeEncoderModeRequest")) {
            properties._changeEncoderModeRequest = 1;
            {
                let error = $root.ChangeEncoderModeRequest.verify(message.changeEncoderModeRequest);
                if (error)
                    return "changeEncoderModeRequest." + error;
            }
        }
        if (message.changeWaveformControlSettingsRequest != null && message.hasOwnProperty("changeWaveformControlSettingsRequest")) {
            properties._changeWaveformControlSettingsRequest = 1;
            {
                let error = $root.ChangeWaveformControlSettingsRequest.verify(message.changeWaveformControlSettingsRequest);
                if (error)
                    return "changeWaveformControlSettingsRequest." + error;
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
        if (object.changePressureControlParameterRequest != null) {
            if (typeof object.changePressureControlParameterRequest !== "object")
                throw TypeError(".PrinterRequest.changePressureControlParameterRequest: object expected");
            message.changePressureControlParameterRequest = $root.ChangePressureControlParametersRequest.fromObject(object.changePressureControlParameterRequest);
        }
        if (object.changeNozzleDataRequest != null) {
            if (typeof object.changeNozzleDataRequest !== "object")
                throw TypeError(".PrinterRequest.changeNozzleDataRequest: object expected");
            message.changeNozzleDataRequest = $root.ChangeNozzleDataRequest.fromObject(object.changeNozzleDataRequest);
        }
        if (object.changeEncoderPositionRequest != null) {
            if (typeof object.changeEncoderPositionRequest !== "object")
                throw TypeError(".PrinterRequest.changeEncoderPositionRequest: object expected");
            message.changeEncoderPositionRequest = $root.ChangeEncoderPositionRequest.fromObject(object.changeEncoderPositionRequest);
        }
        if (object.changeEncoderModeSettingsRequest != null) {
            if (typeof object.changeEncoderModeSettingsRequest !== "object")
                throw TypeError(".PrinterRequest.changeEncoderModeSettingsRequest: object expected");
            message.changeEncoderModeSettingsRequest = $root.ChangeEncoderModeSettingsRequest.fromObject(object.changeEncoderModeSettingsRequest);
        }
        if (object.changePrintMemoryRequest != null) {
            if (typeof object.changePrintMemoryRequest !== "object")
                throw TypeError(".PrinterRequest.changePrintMemoryRequest: object expected");
            message.changePrintMemoryRequest = $root.ChangePrintMemoryRequest.fromObject(object.changePrintMemoryRequest);
        }
        if (object.nozzlePrimingRequest != null) {
            if (typeof object.nozzlePrimingRequest !== "object")
                throw TypeError(".PrinterRequest.nozzlePrimingRequest: object expected");
            message.nozzlePrimingRequest = $root.NozzlePrimingRequest.fromObject(object.nozzlePrimingRequest);
        }
        if (object.changeEncoderModeRequest != null) {
            if (typeof object.changeEncoderModeRequest !== "object")
                throw TypeError(".PrinterRequest.changeEncoderModeRequest: object expected");
            message.changeEncoderModeRequest = $root.ChangeEncoderModeRequest.fromObject(object.changeEncoderModeRequest);
        }
        if (object.changeWaveformControlSettingsRequest != null) {
            if (typeof object.changeWaveformControlSettingsRequest !== "object")
                throw TypeError(".PrinterRequest.changeWaveformControlSettingsRequest: object expected");
            message.changeWaveformControlSettingsRequest = $root.ChangeWaveformControlSettingsRequest.fromObject(object.changeWaveformControlSettingsRequest);
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
        if (message.changePressureControlParameterRequest != null && message.hasOwnProperty("changePressureControlParameterRequest")) {
            object.changePressureControlParameterRequest = $root.ChangePressureControlParametersRequest.toObject(message.changePressureControlParameterRequest, options);
            if (options.oneofs)
                object._changePressureControlParameterRequest = "changePressureControlParameterRequest";
        }
        if (message.changeNozzleDataRequest != null && message.hasOwnProperty("changeNozzleDataRequest")) {
            object.changeNozzleDataRequest = $root.ChangeNozzleDataRequest.toObject(message.changeNozzleDataRequest, options);
            if (options.oneofs)
                object._changeNozzleDataRequest = "changeNozzleDataRequest";
        }
        if (message.changeEncoderPositionRequest != null && message.hasOwnProperty("changeEncoderPositionRequest")) {
            object.changeEncoderPositionRequest = $root.ChangeEncoderPositionRequest.toObject(message.changeEncoderPositionRequest, options);
            if (options.oneofs)
                object._changeEncoderPositionRequest = "changeEncoderPositionRequest";
        }
        if (message.changeEncoderModeSettingsRequest != null && message.hasOwnProperty("changeEncoderModeSettingsRequest")) {
            object.changeEncoderModeSettingsRequest = $root.ChangeEncoderModeSettingsRequest.toObject(message.changeEncoderModeSettingsRequest, options);
            if (options.oneofs)
                object._changeEncoderModeSettingsRequest = "changeEncoderModeSettingsRequest";
        }
        if (message.changePrintMemoryRequest != null && message.hasOwnProperty("changePrintMemoryRequest")) {
            object.changePrintMemoryRequest = $root.ChangePrintMemoryRequest.toObject(message.changePrintMemoryRequest, options);
            if (options.oneofs)
                object._changePrintMemoryRequest = "changePrintMemoryRequest";
        }
        if (message.nozzlePrimingRequest != null && message.hasOwnProperty("nozzlePrimingRequest")) {
            object.nozzlePrimingRequest = $root.NozzlePrimingRequest.toObject(message.nozzlePrimingRequest, options);
            if (options.oneofs)
                object._nozzlePrimingRequest = "nozzlePrimingRequest";
        }
        if (message.changeEncoderModeRequest != null && message.hasOwnProperty("changeEncoderModeRequest")) {
            object.changeEncoderModeRequest = $root.ChangeEncoderModeRequest.toObject(message.changeEncoderModeRequest, options);
            if (options.oneofs)
                object._changeEncoderModeRequest = "changeEncoderModeRequest";
        }
        if (message.changeWaveformControlSettingsRequest != null && message.hasOwnProperty("changeWaveformControlSettingsRequest")) {
            object.changeWaveformControlSettingsRequest = $root.ChangeWaveformControlSettingsRequest.toObject(message.changeWaveformControlSettingsRequest, options);
            if (options.oneofs)
                object._changeWaveformControlSettingsRequest = "changeWaveformControlSettingsRequest";
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
 * @property {number} PrinterSystemState_PRINT=5 PrinterSystemState_PRINT value
 * @property {number} PrinterSystemState_KEEP_ALIVE=6 PrinterSystemState_KEEP_ALIVE value
 */
export const PrinterSystemState = $root.PrinterSystemState = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "PrinterSystemState_UNSPECIFIED"] = 0;
    values[valuesById[1] = "PrinterSystemState_STARTUP"] = 1;
    values[valuesById[2] = "PrinterSystemState_IDLE"] = 2;
    values[valuesById[3] = "PrinterSystemState_ERROR"] = 3;
    values[valuesById[4] = "PrinterSystemState_DROPWATCHER"] = 4;
    values[valuesById[5] = "PrinterSystemState_PRINT"] = 5;
    values[valuesById[6] = "PrinterSystemState_KEEP_ALIVE"] = 6;
    return values;
})();

export const WavefromControlSettings = $root.WavefromControlSettings = (() => {

    /**
     * Properties of a WavefromControlSettings.
     * @exports IWavefromControlSettings
     * @interface IWavefromControlSettings
     * @property {number|null} [voltageMv] WavefromControlSettings voltageMv
     */

    /**
     * Constructs a new WavefromControlSettings.
     * @exports WavefromControlSettings
     * @classdesc Represents a WavefromControlSettings.
     * @implements IWavefromControlSettings
     * @constructor
     * @param {IWavefromControlSettings=} [properties] Properties to set
     */
    function WavefromControlSettings(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * WavefromControlSettings voltageMv.
     * @member {number} voltageMv
     * @memberof WavefromControlSettings
     * @instance
     */
    WavefromControlSettings.prototype.voltageMv = 0;

    /**
     * Creates a new WavefromControlSettings instance using the specified properties.
     * @function create
     * @memberof WavefromControlSettings
     * @static
     * @param {IWavefromControlSettings=} [properties] Properties to set
     * @returns {WavefromControlSettings} WavefromControlSettings instance
     */
    WavefromControlSettings.create = function create(properties) {
        return new WavefromControlSettings(properties);
    };

    /**
     * Encodes the specified WavefromControlSettings message. Does not implicitly {@link WavefromControlSettings.verify|verify} messages.
     * @function encode
     * @memberof WavefromControlSettings
     * @static
     * @param {IWavefromControlSettings} message WavefromControlSettings message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WavefromControlSettings.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.voltageMv != null && Object.hasOwnProperty.call(message, "voltageMv"))
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.voltageMv);
        return writer;
    };

    /**
     * Encodes the specified WavefromControlSettings message, length delimited. Does not implicitly {@link WavefromControlSettings.verify|verify} messages.
     * @function encodeDelimited
     * @memberof WavefromControlSettings
     * @static
     * @param {IWavefromControlSettings} message WavefromControlSettings message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WavefromControlSettings.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a WavefromControlSettings message from the specified reader or buffer.
     * @function decode
     * @memberof WavefromControlSettings
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {WavefromControlSettings} WavefromControlSettings
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WavefromControlSettings.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.WavefromControlSettings();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.voltageMv = reader.uint32();
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
     * Decodes a WavefromControlSettings message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof WavefromControlSettings
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {WavefromControlSettings} WavefromControlSettings
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WavefromControlSettings.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a WavefromControlSettings message.
     * @function verify
     * @memberof WavefromControlSettings
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    WavefromControlSettings.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.voltageMv != null && message.hasOwnProperty("voltageMv"))
            if (!$util.isInteger(message.voltageMv))
                return "voltageMv: integer expected";
        return null;
    };

    /**
     * Creates a WavefromControlSettings message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof WavefromControlSettings
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {WavefromControlSettings} WavefromControlSettings
     */
    WavefromControlSettings.fromObject = function fromObject(object) {
        if (object instanceof $root.WavefromControlSettings)
            return object;
        let message = new $root.WavefromControlSettings();
        if (object.voltageMv != null)
            message.voltageMv = object.voltageMv >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a WavefromControlSettings message. Also converts values to other types if specified.
     * @function toObject
     * @memberof WavefromControlSettings
     * @static
     * @param {WavefromControlSettings} message WavefromControlSettings
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    WavefromControlSettings.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.voltageMv = 0;
        if (message.voltageMv != null && message.hasOwnProperty("voltageMv"))
            object.voltageMv = message.voltageMv;
        return object;
    };

    /**
     * Converts this WavefromControlSettings to JSON.
     * @function toJSON
     * @memberof WavefromControlSettings
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    WavefromControlSettings.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for WavefromControlSettings
     * @function getTypeUrl
     * @memberof WavefromControlSettings
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    WavefromControlSettings.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/WavefromControlSettings";
    };

    return WavefromControlSettings;
})();

export const WaveformControlState = $root.WaveformControlState = (() => {

    /**
     * Properties of a WaveformControlState.
     * @exports IWaveformControlState
     * @interface IWaveformControlState
     * @property {number|null} [voltageMv] WaveformControlState voltageMv
     * @property {number|null} [setVoltageMv] WaveformControlState setVoltageMv
     */

    /**
     * Constructs a new WaveformControlState.
     * @exports WaveformControlState
     * @classdesc Represents a WaveformControlState.
     * @implements IWaveformControlState
     * @constructor
     * @param {IWaveformControlState=} [properties] Properties to set
     */
    function WaveformControlState(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * WaveformControlState voltageMv.
     * @member {number|null|undefined} voltageMv
     * @memberof WaveformControlState
     * @instance
     */
    WaveformControlState.prototype.voltageMv = null;

    /**
     * WaveformControlState setVoltageMv.
     * @member {number} setVoltageMv
     * @memberof WaveformControlState
     * @instance
     */
    WaveformControlState.prototype.setVoltageMv = 0;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * WaveformControlState _voltageMv.
     * @member {"voltageMv"|undefined} _voltageMv
     * @memberof WaveformControlState
     * @instance
     */
    Object.defineProperty(WaveformControlState.prototype, "_voltageMv", {
        get: $util.oneOfGetter($oneOfFields = ["voltageMv"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new WaveformControlState instance using the specified properties.
     * @function create
     * @memberof WaveformControlState
     * @static
     * @param {IWaveformControlState=} [properties] Properties to set
     * @returns {WaveformControlState} WaveformControlState instance
     */
    WaveformControlState.create = function create(properties) {
        return new WaveformControlState(properties);
    };

    /**
     * Encodes the specified WaveformControlState message. Does not implicitly {@link WaveformControlState.verify|verify} messages.
     * @function encode
     * @memberof WaveformControlState
     * @static
     * @param {IWaveformControlState} message WaveformControlState message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WaveformControlState.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.voltageMv != null && Object.hasOwnProperty.call(message, "voltageMv"))
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.voltageMv);
        if (message.setVoltageMv != null && Object.hasOwnProperty.call(message, "setVoltageMv"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.setVoltageMv);
        return writer;
    };

    /**
     * Encodes the specified WaveformControlState message, length delimited. Does not implicitly {@link WaveformControlState.verify|verify} messages.
     * @function encodeDelimited
     * @memberof WaveformControlState
     * @static
     * @param {IWaveformControlState} message WaveformControlState message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    WaveformControlState.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a WaveformControlState message from the specified reader or buffer.
     * @function decode
     * @memberof WaveformControlState
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {WaveformControlState} WaveformControlState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WaveformControlState.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.WaveformControlState();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.voltageMv = reader.uint32();
                    break;
                }
            case 2: {
                    message.setVoltageMv = reader.uint32();
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
     * Decodes a WaveformControlState message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof WaveformControlState
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {WaveformControlState} WaveformControlState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    WaveformControlState.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a WaveformControlState message.
     * @function verify
     * @memberof WaveformControlState
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    WaveformControlState.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message.voltageMv != null && message.hasOwnProperty("voltageMv")) {
            properties._voltageMv = 1;
            if (!$util.isInteger(message.voltageMv))
                return "voltageMv: integer expected";
        }
        if (message.setVoltageMv != null && message.hasOwnProperty("setVoltageMv"))
            if (!$util.isInteger(message.setVoltageMv))
                return "setVoltageMv: integer expected";
        return null;
    };

    /**
     * Creates a WaveformControlState message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof WaveformControlState
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {WaveformControlState} WaveformControlState
     */
    WaveformControlState.fromObject = function fromObject(object) {
        if (object instanceof $root.WaveformControlState)
            return object;
        let message = new $root.WaveformControlState();
        if (object.voltageMv != null)
            message.voltageMv = object.voltageMv >>> 0;
        if (object.setVoltageMv != null)
            message.setVoltageMv = object.setVoltageMv >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a WaveformControlState message. Also converts values to other types if specified.
     * @function toObject
     * @memberof WaveformControlState
     * @static
     * @param {WaveformControlState} message WaveformControlState
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    WaveformControlState.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.setVoltageMv = 0;
        if (message.voltageMv != null && message.hasOwnProperty("voltageMv")) {
            object.voltageMv = message.voltageMv;
            if (options.oneofs)
                object._voltageMv = "voltageMv";
        }
        if (message.setVoltageMv != null && message.hasOwnProperty("setVoltageMv"))
            object.setVoltageMv = message.setVoltageMv;
        return object;
    };

    /**
     * Converts this WaveformControlState to JSON.
     * @function toJSON
     * @memberof WaveformControlState
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    WaveformControlState.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for WaveformControlState
     * @function getTypeUrl
     * @memberof WaveformControlState
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    WaveformControlState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/WaveformControlState";
    };

    return WaveformControlState;
})();

export const PrinterSystemStateResponse = $root.PrinterSystemStateResponse = (() => {

    /**
     * Properties of a PrinterSystemStateResponse.
     * @exports IPrinterSystemStateResponse
     * @interface IPrinterSystemStateResponse
     * @property {PrinterSystemState|null} [state] PrinterSystemStateResponse state
     * @property {number|null} [errorFlags] PrinterSystemStateResponse errorFlags
     * @property {IPressureControlSystemState|null} [pressureControl] PrinterSystemStateResponse pressureControl
     * @property {IPrintControlState|null} [printControl] PrinterSystemStateResponse printControl
     * @property {IWaveformControlState|null} [waveformControl] PrinterSystemStateResponse waveformControl
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
     * PrinterSystemStateResponse printControl.
     * @member {IPrintControlState|null|undefined} printControl
     * @memberof PrinterSystemStateResponse
     * @instance
     */
    PrinterSystemStateResponse.prototype.printControl = null;

    /**
     * PrinterSystemStateResponse waveformControl.
     * @member {IWaveformControlState|null|undefined} waveformControl
     * @memberof PrinterSystemStateResponse
     * @instance
     */
    PrinterSystemStateResponse.prototype.waveformControl = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * PrinterSystemStateResponse _pressureControl.
     * @member {"pressureControl"|undefined} _pressureControl
     * @memberof PrinterSystemStateResponse
     * @instance
     */
    Object.defineProperty(PrinterSystemStateResponse.prototype, "_pressureControl", {
        get: $util.oneOfGetter($oneOfFields = ["pressureControl"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * PrinterSystemStateResponse _printControl.
     * @member {"printControl"|undefined} _printControl
     * @memberof PrinterSystemStateResponse
     * @instance
     */
    Object.defineProperty(PrinterSystemStateResponse.prototype, "_printControl", {
        get: $util.oneOfGetter($oneOfFields = ["printControl"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * PrinterSystemStateResponse _waveformControl.
     * @member {"waveformControl"|undefined} _waveformControl
     * @memberof PrinterSystemStateResponse
     * @instance
     */
    Object.defineProperty(PrinterSystemStateResponse.prototype, "_waveformControl", {
        get: $util.oneOfGetter($oneOfFields = ["waveformControl"]),
        set: $util.oneOfSetter($oneOfFields)
    });

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
        if (message.printControl != null && Object.hasOwnProperty.call(message, "printControl"))
            $root.PrintControlState.encode(message.printControl, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.waveformControl != null && Object.hasOwnProperty.call(message, "waveformControl"))
            $root.WaveformControlState.encode(message.waveformControl, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
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
            case 4: {
                    message.printControl = $root.PrintControlState.decode(reader, reader.uint32());
                    break;
                }
            case 5: {
                    message.waveformControl = $root.WaveformControlState.decode(reader, reader.uint32());
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
        let properties = {};
        if (message.state != null && message.hasOwnProperty("state"))
            switch (message.state) {
            default:
                return "state: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
                break;
            }
        if (message.errorFlags != null && message.hasOwnProperty("errorFlags"))
            if (!$util.isInteger(message.errorFlags))
                return "errorFlags: integer expected";
        if (message.pressureControl != null && message.hasOwnProperty("pressureControl")) {
            properties._pressureControl = 1;
            {
                let error = $root.PressureControlSystemState.verify(message.pressureControl);
                if (error)
                    return "pressureControl." + error;
            }
        }
        if (message.printControl != null && message.hasOwnProperty("printControl")) {
            properties._printControl = 1;
            {
                let error = $root.PrintControlState.verify(message.printControl);
                if (error)
                    return "printControl." + error;
            }
        }
        if (message.waveformControl != null && message.hasOwnProperty("waveformControl")) {
            properties._waveformControl = 1;
            {
                let error = $root.WaveformControlState.verify(message.waveformControl);
                if (error)
                    return "waveformControl." + error;
            }
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
        case "PrinterSystemState_PRINT":
        case 5:
            message.state = 5;
            break;
        case "PrinterSystemState_KEEP_ALIVE":
        case 6:
            message.state = 6;
            break;
        }
        if (object.errorFlags != null)
            message.errorFlags = object.errorFlags >>> 0;
        if (object.pressureControl != null) {
            if (typeof object.pressureControl !== "object")
                throw TypeError(".PrinterSystemStateResponse.pressureControl: object expected");
            message.pressureControl = $root.PressureControlSystemState.fromObject(object.pressureControl);
        }
        if (object.printControl != null) {
            if (typeof object.printControl !== "object")
                throw TypeError(".PrinterSystemStateResponse.printControl: object expected");
            message.printControl = $root.PrintControlState.fromObject(object.printControl);
        }
        if (object.waveformControl != null) {
            if (typeof object.waveformControl !== "object")
                throw TypeError(".PrinterSystemStateResponse.waveformControl: object expected");
            message.waveformControl = $root.WaveformControlState.fromObject(object.waveformControl);
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
        }
        if (message.state != null && message.hasOwnProperty("state"))
            object.state = options.enums === String ? $root.PrinterSystemState[message.state] === undefined ? message.state : $root.PrinterSystemState[message.state] : message.state;
        if (message.errorFlags != null && message.hasOwnProperty("errorFlags"))
            object.errorFlags = message.errorFlags;
        if (message.pressureControl != null && message.hasOwnProperty("pressureControl")) {
            object.pressureControl = $root.PressureControlSystemState.toObject(message.pressureControl, options);
            if (options.oneofs)
                object._pressureControl = "pressureControl";
        }
        if (message.printControl != null && message.hasOwnProperty("printControl")) {
            object.printControl = $root.PrintControlState.toObject(message.printControl, options);
            if (options.oneofs)
                object._printControl = "printControl";
        }
        if (message.waveformControl != null && message.hasOwnProperty("waveformControl")) {
            object.waveformControl = $root.WaveformControlState.toObject(message.waveformControl, options);
            if (options.oneofs)
                object._waveformControl = "waveformControl";
        }
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
