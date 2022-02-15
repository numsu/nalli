import React from 'react';
import {
	Alert,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';

import AsyncStorage from '@react-native-async-storage/async-storage';

import NalliModal, { EModalSize } from '../../../components/modal.component';
import NalliButton from '../../../components/nalli-button.component';
import NalliNumberPad from '../../../components/nalli-number-pad.component';
import NalliText, { ETextSize } from '../../../components/text.component';
import Colors from '../../../constants/colors';
import layout from '../../../constants/layout';
import AuthStore from '../../../service/auth-store';
import BiometricsService, { EBiometricsType } from '../../../service/biometrics.service';
import ClientService from '../../../service/client.service';
import VariableStore, { NalliVariable } from '../../../service/variable-store';
import WalletStore from '../../../service/wallet-store';
import ChangePinModal from './change-pin-modal.component';

interface AccountModalProps extends NavigationInjectedProps {
	isOpen: boolean;
	close: () => void;
}

interface AccountModalState {
	isBiometricProcess: boolean;
	isOpen: boolean;
	isUnlocked: boolean;
	changePinModalOpen: boolean;
	pin: string;
}

export default class AccountModal extends React.Component<AccountModalProps, AccountModalState> {

	constructor(props) {
		super(props);
		this.state = {
			isBiometricProcess: false,
			isOpen: false,
			isUnlocked: false,
			changePinModalOpen: false,
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
				this.setState({ isUnlocked: true, pin: '' });
			} else {
				this.setState({ pin: '' });
			}
		} else {
			this.setState({ pin });
		}
	}

	closeAndLock = () => {
		setTimeout(() => this.setState({ isUnlocked: false }), NalliModal.animationDelay); // Wait for animation
		this.props.close();
	}

	toggleChangePinModal = () => {
		this.setState({ changePinModalOpen: !this.state.changePinModalOpen });
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
		await ClientService.deleteAccount();
		try {
			await VariableStore.clear();
			await AuthStore.clearAuthentication();
			await AuthStore.clearExpires();
			await AuthStore.clearClient();
			await AuthStore.clearPin();
			await WalletStore.clearWallet();
			AsyncStorage.clear();
		} catch (e) {
			console.error(e);
			Alert.alert('Error', 'Something went wrong deleting your information from your phone, but your information is deleted from our servers.');
		}
		this.props.navigation.navigate('Welcome');
	}

	render = () => {
		const {
			isBiometricProcess,
			isOpen,
			isUnlocked,
			changePinModalOpen,
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
						<NalliText>Change the PIN used in login</NalliText>
						<NalliButton
								style={styles.changePinButton}
								small
								solid
								onPress={this.toggleChangePinModal}
								text='Change PIN'
								icon={'key-outline'} />
						<NalliText size={ETextSize.H2} style={styles.header}>Delete my account</NalliText>
						<NalliText>This deletes all of your data from our servers and removes the wallet from your phone. The data deleted is not recoverable. Use with caution.</NalliText>
						<NalliButton
								small
								solid
								style={styles.deleteButton}
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
								value={pin}
								secureTextEntry
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
		fontSize: 38,
		width: '100%',
		textAlign: 'center',
	},
	changePinButton: {
		width: '80%',
		marginTop: 20,
	},
	deleteButton: {
		width: '80%',
		marginTop: 20,
		backgroundColor: Colors.danger,
	}
});
