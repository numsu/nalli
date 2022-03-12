import { Linking, Platform } from "react-native";

export const ANIMATION_DELAY = 150;

export function sleep(ms: number) {
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

export function openSettings() {
	if (Platform.OS == 'ios') {
		Linking.openURL('app-settings:');
	} else {
		Linking.openSettings();
	}
}
