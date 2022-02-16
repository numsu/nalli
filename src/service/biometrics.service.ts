import * as LocalAuthentication from 'expo-local-authentication';

import VariableStore, { NalliVariable } from './variable-store';

export default class BiometricsService {

	static async getSupportedBiometricsType(): Promise<EBiometricsType> {
		const hasHardware = await LocalAuthentication.hasHardwareAsync();
		if (hasHardware) {
			const hasBiometricsConfigured = await LocalAuthentication.isEnrolledAsync();
			if (hasBiometricsConfigured) {
				const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
				if (supportedTypes.length == 1) {
					if (supportedTypes[0] == LocalAuthentication.AuthenticationType.FINGERPRINT) {
						return EBiometricsType.FINGERPRINT;
					} else if (supportedTypes[0] == LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
						return EBiometricsType.FACE;
					}
				} else if (supportedTypes.length > 1) {
					return EBiometricsType.MULTIPLE;
				}
			}
		}

		return EBiometricsType.NO_BIOMETRICS;
	}

	static async isBiometricsEnabled(): Promise<boolean> {
		return (await VariableStore.getVariable(NalliVariable.BIOMETRICS_TYPE, EBiometricsType.NO_BIOMETRICS)) != EBiometricsType.NO_BIOMETRICS;
	}

	static async authenticate(promptMessage: string): Promise<boolean> {
		await VariableStore.setVariable(NalliVariable.DISABLE_PRIVACY_SHIELD, true);
		const result = await LocalAuthentication.authenticateAsync({
			disableDeviceFallback: true,
			cancelLabel: 'Cancel',
			promptMessage,
		});
		VariableStore.setVariable(NalliVariable.DISABLE_PRIVACY_SHIELD, false);
		return result.success;
	}

}

export enum EBiometricsType {
	NO_BIOMETRICS = 0,
	FINGERPRINT = 1,
	FACE = 2,
	MULTIPLE = 3,
}

export namespace EBiometricsType {

	export function getBiometricsTypeIcon(type: EBiometricsType): string {
		switch (type) {
			case EBiometricsType.FINGERPRINT:
				return 'fingerprint';
			case EBiometricsType.FACE:
				return 'face-recognition';
			case EBiometricsType.MULTIPLE:
				return 'fingerprint';
			default:
				return '';
		}
	}

	export function getBiometricsTypeText(type: EBiometricsType): string {
		switch (type) {
			case EBiometricsType.FINGERPRINT:
				return 'Fingerprint';
			case EBiometricsType.FACE:
				return 'Face ID';
			case EBiometricsType.MULTIPLE:
				return 'Biometrics';
			default:
				return '';
		}
	}

}