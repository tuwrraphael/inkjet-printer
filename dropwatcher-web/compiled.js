/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.GetPrinterSystemStateRequest = (function() {

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
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
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
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GetPrinterSystemStateRequest();
        while (reader.pos < end) {
            var tag = reader.uint32();
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

$root.ChangePrinterSystemStateRequest = (function() {

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
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
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
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChangePrinterSystemStateRequest();
        while (reader.pos < end) {
            var tag = reader.uint32();
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
        var message = new $root.ChangePrinterSystemStateRequest();
        switch (object.state) {
        default:
            if (typeof object.state === "number") {
                message.state = object.state;
                break;
            }
            break;
        case "UNSPECIFIED":
        case 0:
            message.state = 0;
            break;
        case "STARTUP":
        case 1:
            message.state = 1;
            break;
        case "IDLE":
        case 2:
            message.state = 2;
            break;
        case "ERROR":
        case 3:
            message.state = 3;
            break;
        case "DROPWATCHER":
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
        var object = {};
        if (options.defaults)
            object.state = options.enums === String ? "UNSPECIFIED" : 0;
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

$root.ChangeDropwatcherParametersRequest = (function() {

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
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
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
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChangeDropwatcherParametersRequest();
        while (reader.pos < end) {
            var tag = reader.uint32();
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
        var message = new $root.ChangeDropwatcherParametersRequest();
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
        var object = {};
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

$root.CameraFrameRequest = (function() {

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
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
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
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.CameraFrameRequest();
        while (reader.pos < end) {
            var tag = reader.uint32();
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

$root.PrinterRequest = (function() {

    /**
     * Properties of a PrinterRequest.
     * @exports IPrinterRequest
     * @interface IPrinterRequest
     * @property {IGetPrinterSystemStateRequest|null} [getPrinterSystemStateRequest] PrinterRequest getPrinterSystemStateRequest
     * @property {IChangePrinterSystemStateRequest|null} [changePrinterSystemStateRequest] PrinterRequest changePrinterSystemStateRequest
     * @property {IChangeDropwatcherParametersRequest|null} [changeDropwatcherParametersRequest] PrinterRequest changeDropwatcherParametersRequest
     * @property {ICameraFrameRequest|null} [cameraFrameRequest] PrinterRequest cameraFrameRequest
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
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
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

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

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
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PrinterRequest();
        while (reader.pos < end) {
            var tag = reader.uint32();
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
        var properties = {};
        if (message.getPrinterSystemStateRequest != null && message.hasOwnProperty("getPrinterSystemStateRequest")) {
            properties._getPrinterSystemStateRequest = 1;
            {
                var error = $root.GetPrinterSystemStateRequest.verify(message.getPrinterSystemStateRequest);
                if (error)
                    return "getPrinterSystemStateRequest." + error;
            }
        }
        if (message.changePrinterSystemStateRequest != null && message.hasOwnProperty("changePrinterSystemStateRequest")) {
            properties._changePrinterSystemStateRequest = 1;
            {
                var error = $root.ChangePrinterSystemStateRequest.verify(message.changePrinterSystemStateRequest);
                if (error)
                    return "changePrinterSystemStateRequest." + error;
            }
        }
        if (message.changeDropwatcherParametersRequest != null && message.hasOwnProperty("changeDropwatcherParametersRequest")) {
            properties._changeDropwatcherParametersRequest = 1;
            {
                var error = $root.ChangeDropwatcherParametersRequest.verify(message.changeDropwatcherParametersRequest);
                if (error)
                    return "changeDropwatcherParametersRequest." + error;
            }
        }
        if (message.cameraFrameRequest != null && message.hasOwnProperty("cameraFrameRequest")) {
            properties._cameraFrameRequest = 1;
            {
                var error = $root.CameraFrameRequest.verify(message.cameraFrameRequest);
                if (error)
                    return "cameraFrameRequest." + error;
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
        var message = new $root.PrinterRequest();
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
        var object = {};
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
 * @property {number} UNSPECIFIED=0 UNSPECIFIED value
 * @property {number} STARTUP=1 STARTUP value
 * @property {number} IDLE=2 IDLE value
 * @property {number} ERROR=3 ERROR value
 * @property {number} DROPWATCHER=4 DROPWATCHER value
 */
$root.PrinterSystemState = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "UNSPECIFIED"] = 0;
    values[valuesById[1] = "STARTUP"] = 1;
    values[valuesById[2] = "IDLE"] = 2;
    values[valuesById[3] = "ERROR"] = 3;
    values[valuesById[4] = "DROPWATCHER"] = 4;
    return values;
})();

$root.PrinterSystemStateResponse = (function() {

    /**
     * Properties of a PrinterSystemStateResponse.
     * @exports IPrinterSystemStateResponse
     * @interface IPrinterSystemStateResponse
     * @property {number|null} [pressure] PrinterSystemStateResponse pressure
     * @property {PrinterSystemState|null} [state] PrinterSystemStateResponse state
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
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PrinterSystemStateResponse pressure.
     * @member {number} pressure
     * @memberof PrinterSystemStateResponse
     * @instance
     */
    PrinterSystemStateResponse.prototype.pressure = 0;

    /**
     * PrinterSystemStateResponse state.
     * @member {PrinterSystemState} state
     * @memberof PrinterSystemStateResponse
     * @instance
     */
    PrinterSystemStateResponse.prototype.state = 0;

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
        if (message.pressure != null && Object.hasOwnProperty.call(message, "pressure"))
            writer.uint32(/* id 1, wireType 5 =*/13).float(message.pressure);
        if (message.state != null && Object.hasOwnProperty.call(message, "state"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.state);
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
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PrinterSystemStateResponse();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.pressure = reader.float();
                    break;
                }
            case 2: {
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
        if (message.pressure != null && message.hasOwnProperty("pressure"))
            if (typeof message.pressure !== "number")
                return "pressure: number expected";
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
        var message = new $root.PrinterSystemStateResponse();
        if (object.pressure != null)
            message.pressure = Number(object.pressure);
        switch (object.state) {
        default:
            if (typeof object.state === "number") {
                message.state = object.state;
                break;
            }
            break;
        case "UNSPECIFIED":
        case 0:
            message.state = 0;
            break;
        case "STARTUP":
        case 1:
            message.state = 1;
            break;
        case "IDLE":
        case 2:
            message.state = 2;
            break;
        case "ERROR":
        case 3:
            message.state = 3;
            break;
        case "DROPWATCHER":
        case 4:
            message.state = 4;
            break;
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
        var object = {};
        if (options.defaults) {
            object.pressure = 0;
            object.state = options.enums === String ? "UNSPECIFIED" : 0;
        }
        if (message.pressure != null && message.hasOwnProperty("pressure"))
            object.pressure = options.json && !isFinite(message.pressure) ? String(message.pressure) : message.pressure;
        if (message.state != null && message.hasOwnProperty("state"))
            object.state = options.enums === String ? $root.PrinterSystemState[message.state] === undefined ? message.state : $root.PrinterSystemState[message.state] : message.state;
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

module.exports = $root;
