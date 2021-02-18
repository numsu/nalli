export default class Convert {

	/**
	 * Convert a string (UTF-8 encoded) to a byte array
	 *
	 * @param {String} str UTF-8 encoded string
	 * @return {Uint8Array} Byte array
	 */
	static str2bin(str: string): Uint8Array {
		str = str.replace(/\r\n/g, '\n');
		const bin = new Uint8Array(str.length * 3);
		let p = 0;
		for (let i = 0, len = str.length; i < len; i++) {
			const c = str.charCodeAt(i);
			if (c < 128) {
				bin[p++] = c;
			} else if (c < 2048) {
				bin[p++] = (c >>> 6) | 192;
				bin[p++] = (c & 63) | 128;
			} else {
				bin[p++] = (c >>> 12) | 224;
				bin[p++] = ((c >>> 6) & 63) | 128;
				bin[p++] = (c & 63) | 128;
			}
		}
		return bin.subarray(0, p);
	}

	/**
	 * Convert Array of 8 bytes (int64) to hex string
	 *
	 * @param {Uint8Array} bin Array of bytes
	 * @return {String} Hex encoded string
	 */
	static ab2hex = (buf: ArrayBuffer): string => {
		return Array.prototype.map.call(new Uint8Array(buf), x => ('00' + x.toString(16)).slice(-2)).join('');
	}

}