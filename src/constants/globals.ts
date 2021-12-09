export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
};

export function replacer(_, value) {
	if (value instanceof Map) {
		return {
			dataType: 'Map',
			value: [...value],
		};
	} else {
		return value;
	}
}

export function reviver(_, value) {
	if (typeof value === 'object' && value !== null) {
		if (value.dataType === 'Map') {
			return new Map(value.value);
		}
	}
	return value;
}