import AHRS from '../ahrs.js';
/**
 * Computes the sum of the values returned by the `iteratee` function for each element in the given array.
 * If all results are `undefined`, returns `undefined`.
 *
 * @typeParam T - The type of elements in the input array.
 * @param array - The array of elements to iterate over.
 * @param iteratee - A function invoked per element, returning a number or `undefined`.
 * @returns The sum of the numbers returned by `iteratee`, or `undefined` if no numbers are returned.
 */
function baseSum(array, iteratee) {
    let result;
    for (const value of array) {
        const current = iteratee(value);
        if (current !== undefined) {
            result = result === undefined ? current : result + current;
        }
    }
    return result;
}
/**
 * Calculates the mean (average) of an array of values.
 *
 * @typeParam T - The type of elements in the input array.
 * @param array - The array of values to calculate the mean from.
 * @param iteratee - Optional. A function that transforms each element of the array into a number. Defaults to the identity function.
 * @returns The mean of the array values, or NaN if the array is empty or null.
 */
function mean(array, iteratee = (value) => value) {
    const length = array == null ? 0 : array.length;
    const sum = baseSum(array, iteratee);
    return length ? sum / length : Number.NaN;
}
/**
 * Determines the battery level description based on the first character of the input string.
 *
 * @param value - A string where the first character represents the battery status code.
 *                Expected values for the first character are:
 *                - "8": full
 *                - "4": medium
 *                - "2": low
 *                - "1": critical
 *                - "0": empty
 *                Any other value is interpreted as "charging".
 * @returns A string representing the battery level: "full", "medium", "low", "critical", "empty", or "charging".
 */
function calculateBatteryLevel(value) {
    let level;
    switch (value[0]) {
        case '8':
            level = 'full';
            break;
        case '4':
            level = 'medium';
            break;
        case '2':
            level = 'low';
            break;
        case '1':
            level = 'critical';
            break;
        case '0':
            level = 'empty';
            break;
        default:
            level = 'charging';
    }
    return level;
}
const ControllerType = {
    // biome-ignore lint/complexity/useSimpleNumberKeys:
    0x1: 'Left Joy-Con',
    // biome-ignore lint/complexity/useSimpleNumberKeys:
    0x2: 'Right Joy-Con',
    // biome-ignore lint/complexity/useSimpleNumberKeys:
    0x3: 'Pro Controller',
};
const bias = 0.75;
const zeroBias = 0.0125;
const scale = Math.PI / 2;
/**
 * Converts gyroscope and accelerometer readings into Euler angles (alpha, beta, gamma).
 *
 * This function uses sensor fusion to estimate the orientation of a Joy-Con controller.
 * It updates the last known values with the current sensor readings and computes the
 * Euler angles in degrees, applying product-specific adjustments as needed.
 *
 * @param lastValues - The last known orientation values and timestamp.
 * @param gyroscope - The current gyroscope readings (angular velocity).
 * @param accelerometer - The current accelerometer readings (acceleration).
 * @param productId - The product ID of the Joy-Con, used for device-specific calculations.
 * @returns An object containing the Euler angles (`alpha`, `beta`, `gamma`) as strings, each formatted to six decimal places.
 */
export function toEulerAngles(lastValues, gyroscope, accelerometer, productId) {
    const now = Date.now();
    const dt = lastValues.timestamp ? (now - lastValues.timestamp) / 1000 : 0;
    lastValues.timestamp = now;
    const norm = Math.sqrt(accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2);
    lastValues.alpha = (1 - zeroBias) * (lastValues.alpha + gyroscope.z * dt);
    if (norm !== 0) {
        lastValues.beta =
            bias * (lastValues.beta + gyroscope.x * dt) +
                (1.0 - bias) * ((accelerometer.x * scale) / norm);
        lastValues.gamma =
            bias * (lastValues.gamma + gyroscope.y * dt) +
                (1.0 - bias) * ((accelerometer.y * -scale) / norm);
    }
    return {
        alpha: productId === 0x2006
            ? ((((-1 * (lastValues.alpha * 180)) / Math.PI) * 430) % 90).toFixed(6)
            : ((((lastValues.alpha * 180) / Math.PI) * 430) % 360).toFixed(6),
        beta: ((-1 * (lastValues.beta * 180)) / Math.PI).toFixed(6),
        gamma: productId === 0x2006
            ? ((-1 * (lastValues.gamma * 180)) / Math.PI).toFixed(6)
            : ((lastValues.gamma * 180) / Math.PI).toFixed(6),
    };
}
/**
 * Converts a quaternion to Euler angles (alpha, beta, gamma) in degrees.
 *
 * @param q - The quaternion to convert.
 * @returns An object containing the Euler angles as strings with six decimal places:
 * - `alpha`: Rotation around the Z axis (in degrees).
 * - `beta`: Rotation around the X axis (in degrees).
 * - `gamma`: Rotation around the Y axis (in degrees).
 */
export function toEulerAnglesQuaternion(q) {
    const rad2deg = 180.0 / Math.PI;
    const ww = q.w * q.w;
    const xx = q.x * q.x;
    const yy = q.y * q.y;
    const zz = q.z * q.z;
    return {
        alpha: (rad2deg * Math.atan2(2 * (q.x * q.y + q.z * q.w), xx - yy - zz + ww)).toFixed(6),
        beta: (rad2deg * -Math.asin(2 * (q.x * q.z - q.y * q.w))).toFixed(6),
        gamma: (rad2deg * Math.atan2(2 * (q.y * q.z + q.x * q.w), -xx - yy + zz + ww)).toFixed(6),
    };
}
/**
 * Converts gyroscope and accelerometer data to a quaternion representation.
 *
 * Depending on the provided `productId`, this function updates either the left or right Madgwick filter
 * with the given gyroscope and accelerometer values, and returns the resulting quaternion.
 *
 * @param gyro - The gyroscope data containing x, y, and z axis values.
 * @param accl - The accelerometer data containing x, y, and z axis values.
 * @param productId - The product identifier used to determine which Madgwick filter to update.
 * @returns The computed quaternion representing the orientation.
 */
export function toQuaternion(gyro, accl, productId) {
    if (productId === 0x2006) {
        const leftMadgwick = new AHRS({
            sampleInterval: 10,
            algorithm: 'Madgwick',
        });
        leftMadgwick.update(gyro.x, gyro.y, gyro.z, accl.x, accl.y, accl.z);
        return leftMadgwick.getQuaternion();
    }
    const rightMadgwick = new AHRS({ sampleInterval: 10, algorithm: 'Madgwick' });
    rightMadgwick.update(gyro.x, gyro.y, gyro.z, accl.x, accl.y, accl.z);
    return rightMadgwick.getQuaternion();
}
/**
 * Converts a 2-byte little-endian signed integer from a Uint8Array into an acceleration value.
 *
 * The function interprets the first two bytes of the input array as a signed 16-bit integer,
 * multiplies it by 0.000244 to scale it to acceleration units, and returns the result rounded
 * to six decimal places.
 *
 * @param value - A Uint8Array containing at least two bytes representing the raw acceleration data.
 * @returns The scaled acceleration value as a number.
 */
function toAcceleration(value) {
    const view = new DataView(value.buffer);
    return Number.parseFloat((0.000244 * view.getInt16(0, true)).toFixed(6));
}
/**
 * Converts a 2-byte little-endian signed integer from a Uint8Array to degrees per second.
 *
 * The function interprets the first two bytes of the input array as a signed 16-bit integer,
 * multiplies it by a scaling factor (0.06103), and returns the result rounded to six decimal places.
 *
 * @param value - A Uint8Array containing at least two bytes representing a signed 16-bit integer in little-endian order.
 * @returns The converted value in degrees per second as a number.
 */
function toDegreesPerSecond(value) {
    const view = new DataView(value.buffer);
    return Number.parseFloat((0.06103 * view.getInt16(0, true)).toFixed(6));
}
/**
 * Converts a 2-byte little-endian Uint8Array value to revolutions per second (RPS).
 *
 * Interprets the input as a signed 16-bit integer, multiplies it by a scaling factor (0.0001694),
 * and returns the result rounded to six decimal places.
 *
 * @param value - A Uint8Array containing at least 2 bytes representing the raw sensor value.
 * @returns The calculated revolutions per second as a number.
 */
function toRevolutionsPerSecond(value) {
    const view = new DataView(value.buffer);
    return Number.parseFloat((0.0001694 * view.getInt16(0, true)).toFixed(6));
}
export function parseDeviceInfo(rawData) {
    const bytes = rawData.slice(15, 15 + 11);
    const firmwareMajorVersionRaw = bytes.slice(0, 1)[0]; // index 0
    const firmwareMinorVersionRaw = bytes.slice(1, 2)[0]; // index 1
    const typeRaw = bytes.slice(2, 3); // index 2
    const macAddressRaw = bytes.slice(4, 10); // index 4-9
    const macAddress = [];
    for (const number of macAddressRaw) {
        macAddress.push(number.toString(16));
    }
    const spiColorInUseRaw = bytes.slice(11, 12); // index 11
    const result = {
        _raw: bytes.slice(0, 12),
        _hex: bytes.slice(0, 12),
        firmwareVersion: {
            major: firmwareMajorVersionRaw,
            minor: firmwareMinorVersionRaw,
        },
        type: ControllerType[typeRaw[0]],
        macAddress: macAddress.join(':'),
        spiColorInUse: spiColorInUseRaw[0] === 0x1,
    };
    return result;
}
/**
 * Parses the input report ID from the provided raw data and string representation.
 *
 * @param rawData - The raw input data as a Uint8Array.
 * @param data - The string representation of the input data.
 * @returns A partial object containing the parsed input report ID, including the raw byte and its hexadecimal representation.
 */
export function parseInputReportID(rawData, data) {
    const inputReportID = {
        _raw: rawData.slice(0, 1), // index 0
        _hex: data.slice(0, 1),
    };
    return inputReportID;
}
/**
 * Parses timer information from the provided raw data and string data.
 *
 * @param rawData - The raw data as a Uint8Array, typically representing a packet.
 * @param data - The string representation of the data.
 * @returns A partial object containing the timer information, including:
 *   - `_raw`: A slice of the raw data at index 1.
 *   - `_hex`: A slice of the string data at index 1.
 */
export function parseTimer(rawData, data) {
    const timer = {
        _raw: rawData.slice(1, 2), // index 1
        _hex: data.slice(1, 2),
    };
    return timer;
}
/**
 * Parses the battery level information from the provided raw data and string data.
 *
 * @param rawData - The raw data as a Uint8Array, typically received from the device.
 * @param data - The string representation of the data, used for extracting battery information.
 * @returns A partial `ParsedPacketData` object containing:
 *   - `_raw`: The raw battery level byte (high nibble) extracted from `rawData`.
 *   - `_hex`: The hexadecimal string representation of the battery level.
 *   - `level`: The calculated battery level using `calculateBatteryLevel`.
 */
export function parseBatteryLevel(rawData, data) {
    return {
        _raw: rawData.slice(2, 3), // high nibble
        _hex: data.slice(2, 3),
        level: calculateBatteryLevel(data.slice(2, 3)),
    };
}
export function parseConnectionInfo(rawData, data) {
    const connectionInfo = {
        _raw: rawData.slice(2, 3), // low nibble
        _hex: data.slice(2, 3),
    };
    return connectionInfo;
}
export function parseButtonStatus(rawData, data) {
    const buttonStatus = {
        _raw: rawData.slice(1, 3), // index 1,2
        _hex: data.slice(1, 3),
    };
    return buttonStatus;
}
export function parseCompleteButtonStatus(rawData, data) {
    const buttonStatus = {
        _raw: rawData.slice(3, 6), // index 3,4,5
        _hex: data.slice(3, 6),
        // Byte 3 (Right Joy-Con)
        y: Boolean(0x01 & rawData[3]),
        x: Boolean(0x02 & rawData[3]),
        b: Boolean(0x04 & rawData[3]),
        a: Boolean(0x08 & rawData[3]),
        r: Boolean(0x40 & rawData[3]),
        zr: Boolean(0x80 & rawData[3]),
        // Byte 5 (Left Joy-Con)
        down: Boolean(0x01 & rawData[5]),
        up: Boolean(0x02 & rawData[5]),
        right: Boolean(0x04 & rawData[5]),
        left: Boolean(0x08 & rawData[5]),
        l: Boolean(0x40 & rawData[5]),
        zl: Boolean(0x80 & rawData[5]),
        // Byte 3,5 (Shared)
        sr: Boolean(0x10 & rawData[3]) || Boolean(0x10 & rawData[5]),
        sl: Boolean(0x20 & rawData[3]) || Boolean(0x20 & rawData[5]),
        // Byte 4 (Shared)
        minus: Boolean(0x01 & rawData[4]),
        plus: Boolean(0x02 & rawData[4]),
        rightStick: Boolean(0x04 & rawData[4]),
        leftStick: Boolean(0x08 & rawData[4]),
        home: Boolean(0x10 & rawData[4]),
        capture: Boolean(0x20 & rawData[4]),
        chargingGrip: Boolean(0x80 & rawData[4]),
    };
    return buttonStatus;
}
export function parseAnalogStick(rawData, data) {
    const analogStick = {
        _raw: rawData.slice(3, 4), // index 3
        _hex: data.slice(3, 4),
    };
    return analogStick;
}
export function parseAnalogStickLeft(rawData, data) {
    let horizontal = rawData[6] | ((rawData[7] & 0xf) << 8);
    // ToDo: This should use proper calibration data and not a magic number
    // (1995).
    horizontal = (horizontal / 1995 - 1) * 2;
    let vertical = ((rawData[7] >> 4) | (rawData[8] << 4)) * -1;
    // ToDo: This should use proper calibration data and not a magic number
    // (2220).
    vertical = (vertical / 2220 + 1) * 2;
    const analogStickLeft = {
        _raw: rawData.slice(6, 9), // index 6,7,8
        _hex: data.slice(6, 9),
        horizontal: horizontal.toFixed(1),
        vertical: vertical.toFixed(1),
    };
    return analogStickLeft;
}
export function parseAnalogStickRight(rawData, data) {
    let horizontal = rawData[9] | ((rawData[10] & 0xf) << 8);
    // ToDo: This should use proper calibration data and not a magic number
    // (1995).
    horizontal = (horizontal / 1995 - 1) * 2;
    let vertical = ((rawData[10] >> 4) | (rawData[11] << 4)) * -1;
    // ToDo: This should use proper calibration data and not a magic number
    // (2220).
    vertical = (vertical / 2220 + 1) * 2;
    const analogStickRight = {
        _raw: rawData.slice(9, 12), // index 9,10,11
        _hex: data.slice(9, 12),
        horizontal: horizontal.toFixed(1),
        vertical: vertical.toFixed(1),
    };
    return analogStickRight;
}
export function parseFilter(rawData, data) {
    const filter = {
        _raw: rawData.slice(4), // index 4
        _hex: data.slice(4),
    };
    return filter;
}
export function parseVibrator(rawData, data) {
    const vibrator = {
        _raw: rawData.slice(12, 13), // index 12
        _hex: data.slice(12, 13),
    };
    return vibrator;
}
export function parseAck(rawData, data) {
    const ack = {
        _raw: rawData.slice(13, 14), // index 13
        _hex: data.slice(13, 14),
    };
    return ack;
}
export function parseSubcommandID(rawData, data) {
    const subcommandID = {
        _raw: rawData.slice(14, 15), // index 14
        _hex: data.slice(14, 15),
    };
    return subcommandID;
}
export function parseSubcommandReplyData(rawData, data) {
    const subcommandReplyData = {
        _raw: rawData.slice(15), // index 15 ~
        _hex: data.slice(15),
    };
    return subcommandReplyData;
}
export function parseAccelerometers(rawData, data) {
    const accelerometers = [
        {
            x: {
                _raw: rawData.slice(13, 15), // index 13,14
                _hex: data.slice(13, 15),
                acc: toAcceleration(rawData.slice(13, 15)),
            },
            y: {
                _raw: rawData.slice(15, 17), // index 15,16
                _hex: data.slice(15, 17),
                acc: toAcceleration(rawData.slice(15, 17)),
            },
            z: {
                _raw: rawData.slice(17, 19), // index 17,18
                _hex: data.slice(17, 19),
                acc: toAcceleration(rawData.slice(17, 19)),
            },
        },
        {
            x: {
                _raw: rawData.slice(25, 27), // index 25,26
                _hex: data.slice(25, 27),
                acc: toAcceleration(rawData.slice(25, 27)),
            },
            y: {
                _raw: rawData.slice(27, 29), // index 27,28
                _hex: data.slice(27, 29),
                acc: toAcceleration(rawData.slice(27, 29)),
            },
            z: {
                _raw: rawData.slice(29, 31), // index 29,30
                _hex: data.slice(29, 31),
                acc: toAcceleration(rawData.slice(29, 31)),
            },
        },
        {
            x: {
                _raw: rawData.slice(37, 39), // index 37,38
                _hex: data.slice(37, 39),
                acc: toAcceleration(rawData.slice(37, 39)),
            },
            y: {
                _raw: rawData.slice(39, 41), // index 39,40
                _hex: data.slice(39, 41),
                acc: toAcceleration(rawData.slice(39, 41)),
            },
            z: {
                _raw: rawData.slice(41, 43), // index 41,42
                _hex: data.slice(41, 43),
                acc: toAcceleration(rawData.slice(41, 43)),
            },
        },
    ];
    return accelerometers;
}
export function parseGyroscopes(rawData, data) {
    return [
        [
            {
                _raw: rawData.slice(19, 21), // index 19,20
                _hex: data.slice(19, 21),
                dps: toDegreesPerSecond(rawData.slice(19, 21)),
                rps: toRevolutionsPerSecond(rawData.slice(19, 21)),
            },
            {
                _raw: rawData.slice(21, 23), // index 21,22
                _hex: data.slice(21, 23),
                dps: toDegreesPerSecond(rawData.slice(21, 23)),
                rps: toRevolutionsPerSecond(rawData.slice(21, 23)),
            },
            {
                _raw: rawData.slice(23, 25), // index 23,24
                _hex: data.slice(23, 25),
                dps: toDegreesPerSecond(rawData.slice(23, 25)),
                rps: toRevolutionsPerSecond(rawData.slice(23, 25)),
            },
        ],
        [
            {
                _raw: rawData.slice(31, 33), // index 31,32
                _hex: data.slice(31, 33),
                dps: toDegreesPerSecond(rawData.slice(31, 33)),
                rps: toRevolutionsPerSecond(rawData.slice(31, 33)),
            },
            {
                _raw: rawData.slice(33, 35), // index 33,34
                _hex: data.slice(33, 35),
                dps: toDegreesPerSecond(rawData.slice(33, 35)),
                rps: toRevolutionsPerSecond(rawData.slice(33, 35)),
            },
            {
                _raw: rawData.slice(35, 37), // index 35,36
                _hex: data.slice(35, 37),
                dps: toDegreesPerSecond(rawData.slice(35, 37)),
                rps: toRevolutionsPerSecond(rawData.slice(35, 37)),
            },
        ],
        [
            {
                _raw: rawData.slice(43, 45), // index 43,44
                _hex: data.slice(43, 45),
                dps: toDegreesPerSecond(rawData.slice(43, 45)),
                rps: toRevolutionsPerSecond(rawData.slice(43, 45)),
            },
            {
                _raw: rawData.slice(45, 47), // index 45,46
                _hex: data.slice(45, 47),
                dps: toDegreesPerSecond(rawData.slice(45, 47)),
                rps: toRevolutionsPerSecond(rawData.slice(45, 47)),
            },
            {
                _raw: rawData.slice(47, 49), // index 47,48
                _hex: data.slice(47, 49),
                dps: toDegreesPerSecond(rawData.slice(47, 49)),
                rps: toRevolutionsPerSecond(rawData.slice(47, 49)),
            },
        ],
    ];
}
export function calculateActualAccelerometer(accelerometers) {
    const elapsedTime = 0.005 * accelerometers.length; // Spent 5ms to collect each data.
    const actualAccelerometer = {
        x: Number.parseFloat((mean(accelerometers.map(([x]) => x)) * elapsedTime).toFixed(6)),
        y: Number.parseFloat((mean(accelerometers.map(([, y]) => y)) * elapsedTime).toFixed(6)),
        z: Number.parseFloat((mean(accelerometers.map(([, , z]) => z)) * elapsedTime).toFixed(6)),
    };
    return actualAccelerometer;
}
export function calculateActualGyroscope(gyroscopes) {
    const elapsedTime = 0.005 * gyroscopes.length; // Spent 5ms to collect each data.
    const actualGyroscopes = [
        mean(gyroscopes.map((g) => g[0])),
        mean(gyroscopes.map((g) => g[1])),
        mean(gyroscopes.map((g) => g[2])),
    ].map((v) => Number.parseFloat((v * elapsedTime).toFixed(6)));
    return {
        x: actualGyroscopes[0],
        y: actualGyroscopes[1],
        z: actualGyroscopes[2],
    };
}
/**
 * Parses raw data from a Ring-Con device and extracts relevant information.
 *
 * @param rawData - The raw data buffer received from the device as a Uint8Array.
 * @param data - The raw data as a hexadecimal string.
 * @returns An object containing:
 *   - `_raw`: A slice of the raw data buffer.
 *   - `_hex`: A slice of the hexadecimal string.
 *   - `strain`: The strain value as a signed 16-bit integer, little-endian.
 */
export function parseRingCon(rawData, data) {
    return {
        _raw: rawData.slice(38, 2),
        _hex: data.slice(38, 2),
        strain: new DataView(rawData.buffer, 39, 2).getInt16(0, true),
    };
}
