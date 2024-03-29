import React from 'react';
import {
	Alert,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';

import NalliModal, { EModalSize } from '../../../components/modal.component';
import Setting from '../../../components/setting.component';
import Colors from '../../../constants/colors';
import { openSettings } from '../../../constants/globals';
import AuthStore from '../../../service/auth-store';
import AuthService from '../../../service/auth.service';
import BiometricsService, { EBiometricsType } from '../../../service/biometrics.service';
import ClientService from '../../../service/client.service';
import NotificationService from '../../../service/notification.service';
import VariableStore, { NalliVariable } from '../../../service/variable-store';

interface PreferencesModalProps {
	isOpen: boolean;
	close: () => void;
}

export default class PreferencesModal extends React.PureComponent<PreferencesModalProps, any> {

	private readonly PREFERENCES_KEYS = [
		{ key: NalliVariable.ONLY_NALLI_USERS, def: false },
	];

	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen };
		}
		return null;
	}

	componentDidMount = () => {
		this.init();
	}

	init = async () => {
		this.PREFERENCES_KEYS
				.map(async ({ key, def }) => ({ key, value: await VariableStore.getVariable(key, def) }))
				.map(promise => promise.then(value => this.setState({ [value.key]: value.value })));

		const pushEnabled = await ClientService.isPushEnabled();
		const supportedBiometricsType = await BiometricsService.getSupportedBiometricsType();
		const isBiometricsEnabled = await BiometricsService.isBiometricsEnabled();
		const isPhoneNumberUser = await AuthStore.isPhoneNumberFunctionsEnabled();
		this.setState({ pushEnabled, supportedBiometricsType, isBiometricsEnabled, isPhoneNumberUser });
	}

	toggleGeneralSetting = (key: NalliVariable, setting: any) => {
		this.setState({ [key]: setting });
		VariableStore.setVariable(key, setting);
	}

	toggleBiometrics = async () => {
		const biometricsType = await VariableStore.getVariable<EBiometricsType>(NalliVariable.BIOMETRICS_TYPE, EBiometricsType.NO_BIOMETRICS);
		const nextStateEnabled = biometricsType == EBiometricsType.NO_BIOMETRICS;
		this.setState({ isBiometricsEnabled: nextStateEnabled });

		const typeText = EBiometricsType.getBiometricsTypeText(this.state.supportedBiometricsType);
		const success = await BiometricsService.authenticate(`${nextStateEnabled ? 'Enable' : 'Disable'} login with ${typeText.toLowerCase()}`);

		if (!success) {
			this.setState({ isBiometricsEnabled: !nextStateEnabled });
			return;
		}

		if (nextStateEnabled) {
			await VariableStore.setVariable(NalliVariable.BIOMETRICS_TYPE, this.state.supportedBiometricsType);
		} else {
			await VariableStore.setVariable(NalliVariable.BIOMETRICS_TYPE, EBiometricsType.NO_BIOMETRICS);
		}
	}

	togglePushEnabled = async () => {
		if (!this.state.pushEnabled) {
			this.setState({ pushEnabled: true });
			const success = await NotificationService.registerForPushNotifications();
			if (!success) {
				this.setState({ pushEnabled: false });
				Alert.alert(
					'No permission',
					'You haven\'t given us a permission to send you notifications. Please allow Nalli to send notifications in your settings.',
					[
						{
							text: 'Don\'t allow',
							style: 'cancel',
						}, {
							text: 'Open settings',
							style: 'default',
							onPress: () => openSettings(),
						},
					],
				);
			}
		} else {
			AuthService.registerPush({ token: '' });
			this.setState({ pushEnabled: false });
		}
	}

	render = () => {
		const { close } = this.props;
		const {
			isBiometricsEnabled,
			isOpen,
			isPhoneNumberUser,
			pushEnabled,
			supportedBiometricsType,
		} = this.state;

		return (
			<NalliModal
					noScroll
					size={EModalSize.LARGE}
					isOpen={isOpen}
					onClose={close}
					linearGradientTopStyle={{ height: 20, top: 70 }}
					linearGradientTopStart={0}
					header='Preferences'>
				<ScrollView style={styles.container}>
					{supportedBiometricsType != EBiometricsType.NO_BIOMETRICS &&
						<Setting
								text={EBiometricsType.getBiometricsTypeText(supportedBiometricsType) + ' login'}
								description={`Enable login with biometrics`}
								value={isBiometricsEnabled}
								onValueChange={() => this.toggleBiometrics()} />
					}
					<Setting
							text='Notifications'
							description='Whether or not you wish to receive push notifications'
							value={pushEnabled}
							onValueChange={() => this.togglePushEnabled()} />
					{isPhoneNumberUser &&
						<Setting
								text='Show only Nalli users'
								description='Only show registered users in contacts list'
								value={this.state[NalliVariable.ONLY_NALLI_USERS]}
								onValueChange={value => this.toggleGeneralSetting(NalliVariable.ONLY_NALLI_USERS, value)} />
					}
					<View style={styles.lastBorder} />
				</ScrollView>
			</NalliModal>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		paddingTop: 15
	},
	lastBorder: {
		borderBottomColor: Colors.borderColor,
		borderBottomWidth: 1,
	},
});
