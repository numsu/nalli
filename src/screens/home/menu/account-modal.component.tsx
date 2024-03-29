import React from 'react';
import {
	Alert,
	Platform,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import uuid from 'react-native-uuid';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { IconType } from '../../../components/icon.component';
import NalliModal, { EModalSize } from '../../../components/modal.component';
import NalliButton from '../../../components/nalli-button.component';
import NalliNumberPad from '../../../components/nalli-number-pad.component';
import NalliText, { ETextSize } from '../../../components/text.component';
import Colors from '../../../constants/colors';
import { ANIMATION_DELAY } from '../../../constants/globals';
import layout from '../../../constants/layout';
import AuthStore from '../../../service/auth-store';
import BiometricsService, { EBiometricsType } from '../../../service/biometrics.service';
import ClientService from '../../../service/client.service';
import NavigationService from '../../../service/navigation.service';
import VariableStore, { NalliVariable } from '../../../service/variable-store';
import WalletStore from '../../../service/wallet-store';
import WalletService from '../../../service/wallet.service';
import ChangePinModal from './change-pin-modal.component';

interface AccountModalProps {
	isOpen: boolean;
	close: () => void;
}

interface AccountModalState {
	changePinModalOpen: boolean;
	isBiometricProcess: boolean;
	isOpen: boolean;
	isUnlocked: boolean;
	pendingSendAmount: number;
	pin: string;
}

export default class AccountModal extends React.PureComponent<AccountModalProps, AccountModalState> {

	constructor(props) {
		super(props);
		this.state = {
			changePinModalOpen: false,
			isBiometricProcess: false,
			isOpen: false,
			isUnlocked: false,
			pendingSendAmount: 0,
			pin: '',
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen };
		}
		return null;
	}

	signInWithBiometrics = async () => {
		const isBiometricsEnabled = await BiometricsService.isBiometricsEnabled();
		if (isBiometricsEnabled) {
			const biometricsType = await VariableStore.getVariable<EBiometricsType>(NalliVariable.BIOMETRICS_TYPE);
			this.setState({ isBiometricProcess: true }, async () => {
				const success = await BiometricsService.authenticate(`Login with ${EBiometricsType.getBiometricsTypeText(biometricsType)}`);
				if (success) {
					this.setState({ isUnlocked: true, pin: '', isBiometricProcess: false });
				} else {
					this.setState({ isBiometricProcess: false });
				}
			});
		}
	}

	validatePin = async (pin: string) => {
		if (pin.length == 6) {
			const isValid = await AuthStore.isValidPin(pin);
			if (isValid) {
				const pendingSendAmount = await WalletService.getPendingSendAmount();
				this.setState({ isUnlocked: true, pin: '', pendingSendAmount });
			} else {
				this.setState({ pin: '' });
			}
		} else {
			this.setState({ pin });
		}
	}

	closeAndLock = () => {
		setTimeout(() => this.setState({ isUnlocked: false }), ANIMATION_DELAY);
		this.props.close();
	}

	toggleChangePinModal = () => {
		this.setState({ changePinModalOpen: !this.state.changePinModalOpen });
	}

	returnAllPendingSends = () => {
		Alert.alert(
			'Confirm',
			'Are you sure that you want to return all pending custodial funds? This means that the recipient(s) will no longer be able to claim them.',
			[
				{ text: 'No', style: 'cancel', onPress: () => undefined  },
				{ text: 'Yes', style: 'destructive', onPress: this.doReturnAllPendingSends  },
			]
		);
	}

	doReturnAllPendingSends = async () => {
		await WalletService.returnAllPendingSends();
		Alert.alert('Done');
		this.setState({ pendingSendAmount: 0 });
	}

	deleteAccount = () => {
		Alert.alert(
			'Confirm',
			'Have you got a backup of your wallet?',
			[
				{ text: 'No', style: 'cancel', onPress: () => undefined  },
				{
					text: 'Yes',
					style: 'default',
					onPress: () =>
						Alert.alert(
							'Confirm',
							'Do you really want to delete your account and your wallet data?',
							[
								{ text: 'No', style: 'cancel', onPress: () => undefined  },
								{ text: 'Yes', style: 'destructive', onPress: this.doAccountDeletion  },
							]),
				},
			],
		);
	}

	doAccountDeletion = async () => {
		try {
			await ClientService.deleteAccount();
		} catch (e) {
			console.error(e);
			Alert.alert('Error', 'Something went wrong. Your information is not deleted.');
			return;
		}

		try {
			await VariableStore.clear();
			await AuthStore.clearAuthentication();
			await AuthStore.clearExpires();
			await AuthStore.clearClient();
			await AuthStore.clearPin();
			await WalletStore.clearWallet();
			await AsyncStorage.clear();
			await VariableStore.setVariable(NalliVariable.DEVICE_ID, uuid.v4());
		} catch (e) {
			console.error(e);
			Alert.alert('Error', 'Something went wrong deleting your information from your phone, but your information is deleted from our servers.');
		}
		NavigationService.navigate('Auth');
	}

	render = () => {
		const {
			changePinModalOpen,
			isBiometricProcess,
			isOpen,
			isUnlocked,
			pendingSendAmount,
			pin,
		} = this.state;

		return (
			<NalliModal
					size={EModalSize.LARGE}
					isOpen={isOpen}
					onClose={this.closeAndLock}
					header='Account'>
				{isUnlocked &&
					<ScrollView contentContainerStyle={styles.container}>
						<NalliText>Manage your account settings</NalliText>

						<NalliText size={ETextSize.H2} style={styles.header}>Change PIN</NalliText>
						<NalliText>Change the PIN used to login.</NalliText>
						<NalliButton
								style={styles.defaultButton}
								small
								solid
								onPress={this.toggleChangePinModal}
								text='Change PIN'
								icon={'key-outline'} />

						{pendingSendAmount > 0 &&
							<View>
								<NalliText size={ETextSize.H2} style={styles.header}>Return all pending custodial funds</NalliText>
								<NalliText>You have {pendingSendAmount} transactions waiting for the recipient to claim them. This option will return all of them back to you.</NalliText>
								<NalliButton
										small
										solid
										style={styles.defaultButton}
										onPress={this.returnAllPendingSends}
										text='Return funds'
										iconType={IconType.MATERIAL_COMMUNITY}
										icon={'cash-refund'} />
							</View>
						}

						<NalliText size={ETextSize.H2} style={styles.header}>Delete my account</NalliText>
						<NalliText>This deletes all of your data from our servers and removes the wallet from your phone. The data deleted is not recoverable. Use with caution.</NalliText>
						<NalliButton
								small
								solid
								style={styles.dangerButton}
								onPress={this.deleteAccount}
								text='Delete my account'
								icon={'key-outline'} />
						<ChangePinModal
								isOpen={changePinModalOpen}
								close={this.toggleChangePinModal} />
					</ScrollView>
				}
				{!isUnlocked && !isBiometricProcess &&
					<View style={styles.pinContainer}>
						<NalliText size={ETextSize.H2} style={styles.header}>Enter pin to view</NalliText>
						<TextInput
								style={styles.numberPadPin}
								value={'⬤'.repeat(pin.length)}
								allowFontScaling={false}
								editable={false} />
						<NalliNumberPad
								style={styles.numberPad}
								pin={pin}
								onChangeText={this.validatePin}
								enableBiometrics
								onBiometricLoginPress={this.signInWithBiometrics} />
					</View>
				}
			</NalliModal>
		);
	}

}

const styles = StyleSheet.create({
	numberPad: {
		borderColor: Colors.main,
		color: Colors.main,
	},
	container: {
		marginHorizontal: 5,
		paddingBottom: 30,
	},
	pinContainer: {
		marginHorizontal: -28,
		marginTop: layout.isSmallDevice ? 0 : 30,
		alignItems: 'center',
		paddingBottom: 30,
	},
	header: {
		marginBottom: 15,
		marginTop: 20,
	},
	numberPadPin: {
		color: Colors.main,
		...Platform.select({
			android: {
				fontSize: 14,
			},
			ios: {
				fontSize: 10,
			},
		}),
		letterSpacing: 2,
		width: '100%',
		textAlign: 'center',
		marginBottom: 10,
	},
	defaultButton: {
		width: '80%',
		marginTop: 20,
	},
	dangerButton: {
		width: '80%',
		marginTop: 20,
		backgroundColor: Colors.danger,
	}
});
