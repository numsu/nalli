import * as LocalAuthentication from 'expo-local-authentication';

import VariableStore, { NalliVariable } from './variable-store';

export default class BiometricsService {

	static async getSupportedBiometricsType(): Promise<EBiometricsType> {
		const hasHardware = await LocalAuthentication.hasHardwareAsync();
		if (hasHardware) {
			const hasBiometricsConfigured = await LocalAuthentication.isEnrolledAsync();
			if (hasBiometricsConfigured) {
				const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
				if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
					return EBiometricsType.FINGERPRINT;
				} else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
					return EBiometricsType.FACIAL;
				}
			}
		}

		return EBiometricsType.NO_BIOMETRICS;
	}

	static async isBiometricsEnabled(): Promise<boolean> {
		return (await VariableStore.getVariable(NalliVariable.BIOMETRICS_TYPE, EBiometricsType.NO_BIOMETRICS)) != EBiometricsType.NO_BIOMETRICS;
	}

	static async authenticate(promptMessage: string): Promise<boolean> {
		const result = await LocalAuthentication.authenticateAsync({
			disableDeviceFallback: true,
			cancelLabel: 'Cancel',
			promptMessage,
		});
		return result.success;
	}

}

export enum EBiometricsType {
	NO_BIOMETRICS = 0,
	FINGERPRINT = 1,
	FACIAL = 2,
}

export namespace EBiometricsType {

	export function getBiometricsTypeIcon(type: EBiometricsType): string {
		switch (type) {
			case EBiometricsType.FINGERPRINT:
				return 'fingerprint';
			case EBiometricsType.FACIAL:
				return 'face-recognition';
			default:
				return '';
		}
	}

	export function getBiometricsTypeText(type: EBiometricsType): string {
		switch (type) {
			case EBiometricsType.FINGERPRINT:
				return 'Fingerprint';
			case EBiometricsType.FACIAL:
				return 'Face ID';
			default:
				return '';
		}
	}

}