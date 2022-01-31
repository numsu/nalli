import React from 'react';
import { Alert, EmitterSubscription, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';

import NalliText, { ETextSize } from '../../../components/text.component';
import Colors from '../../../constants/colors';
import BiometricsService, { EBiometricsType } from '../../../service/biometrics.service';
import ClientService from '../../../service/client.service';
import VariableStore, { NalliVariable } from '../../../service/variable-store';
import AccountModal from './account-modal.component';
import CurrencyModal from './currency-modal.component';
import NalliMenuPreference from './nalli-menu-preference.component';
import NotificationModal from './notification-modal.component';
import WalletInfoModal from './wallet-info-modal.component';

interface NalliMenuProps extends NavigationInjectedProps {
	onDonatePress: () => void;
}

interface NalliMenuState {
	accountModalOpen: boolean;
	biometricsEnabled: boolean;
	currency: string;
	currencyModalOpen: boolean;
	invitedCount: number;
	notificationModalOpen: boolean;
	pushEnabled: boolean;
	supportedBiometricsType: EBiometricsType;
	walletInfoModalOpen: boolean;
}

export default class NalliMenu extends React.Component<NalliMenuProps, NalliMenuState> {

	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.state = {
			accountModalOpen: false,
			biometricsEnabled: false,
			currency: 'usd',
			currencyModalOpen: false,
			invitedCount: 0,
			notificationModalOpen: false,
			pushEnabled: true,
			supportedBiometricsType: EBiometricsType.NO_BIOMETRICS,
			walletInfoModalOpen: false,
		};
	}

	componentDidMount = () => {
		this.fetchInviteCount();
		this.fetchNotificationState();
		this.initConfig();
		this.subscriptions.push(VariableStore.watchVariable(NalliVariable.CURRENCY, () => this.initConfig()));
	}

	componentWillUnmount = () => {
		this.subscriptions.forEach(VariableStore.unwatchVariable);
	}

	initConfig = async () => {
		const currency = await VariableStore.getVariable(NalliVariable.CURRENCY, 'usd') as string;
		const supportedBiometricsType = await BiometricsService.getSupportedBiometricsType();

		let biometricsEnabled = false;
		if (supportedBiometricsType != EBiometricsType.NO_BIOMETRICS) {
			biometricsEnabled = await BiometricsService.isBiometricsEnabled();
		}

		this.setState({
			biometricsEnabled,
			currency: currency.toUpperCase(),
			supportedBiometricsType,
		});
	}

	fetchInviteCount = async () => {
		const invitedCount = await ClientService.getInvitedCount();
		this.setState({ invitedCount });
	}

	fetchNotificationState = async () => {
		const pushEnabled = await ClientService.isPushEnabled();
		this.setState({ pushEnabled });
	}

	toggleSelectCurrency = () => {
		this.setState({ currencyModalOpen: !this.state.currencyModalOpen });
	}

	toggleSelectNotification = (status?: boolean) => {
		if (status !== undefined) {
			this.setState({ pushEnabled: status });
		}
		this.setState({ notificationModalOpen: !this.state.notificationModalOpen });
	}

	toggleBiometricsEnabled = async () => {
		const biometricsType = await VariableStore.getVariable<EBiometricsType>(NalliVariable.BIOMETRICS_TYPE, EBiometricsType.NO_BIOMETRICS);
		if (biometricsType == EBiometricsType.NO_BIOMETRICS) {
			const typeText = EBiometricsType.getBiometricsTypeText(this.state.supportedBiometricsType);
			const success = await BiometricsService.authenticate(`Enable ${typeText} to use instead of PIN`);
			if (success) {
				await VariableStore.setVariable(NalliVariable.BIOMETRICS_TYPE, this.state.supportedBiometricsType);
				this.setState({
					biometricsEnabled: true,
				});
			}
		} else {
			await VariableStore.setVariable(NalliVariable.BIOMETRICS_TYPE, EBiometricsType.NO_BIOMETRICS);
			this.setState({
				biometricsEnabled: false,
			});
		}
	}

	toggleWalletInfoModal = () => {
		this.setState({ walletInfoModalOpen: !this.state.walletInfoModalOpen });
	}

	toggleAccountModal = () => {
		this.setState({ accountModalOpen: !this.state.accountModalOpen });
	}

	openSupportPage = () => {
		Alert.alert(
			'Leave Nalli?',
			'This link will take you outside of the application. Are you sure?',
			[
				{
					text: 'Cancel',
					onPress: () => undefined,
					style: 'cancel',
				}, {
					text: 'Open',
					onPress: () => Linking.openURL('https://nalli.app/support'),
					style: 'default',
				},
			]
		);
	}

	render = () => {
		const {
			accountModalOpen,
			biometricsEnabled,
			currency,
			currencyModalOpen,
			invitedCount,
			notificationModalOpen,
			pushEnabled,
			supportedBiometricsType,
			walletInfoModalOpen,
		} = this.state;
		const { onDonatePress, navigation } = this.props;

		return (
			<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
				<View style={styles.content}>
					<NalliText size={ETextSize.H2} style={styles.header}>New users adopted</NalliText>
					<View style={styles.border} />
					<NalliText style={styles.invitedNumber}>{invitedCount}</NalliText>
				</View>
				<View style={styles.content}>
					<NalliText size={ETextSize.H2} style={styles.header}>Settings</NalliText>
					<View style={styles.border} />
					<NalliMenuPreference
							icon="home-currency-usd"
							header="Currency"
							onPress={this.toggleSelectCurrency}
							subheader={currency} />
					<NalliMenuPreference
							icon="bell"
							header="Notifications"
							onPress={() => this.toggleSelectNotification()}
						subheader={pushEnabled ? "On" : "Off"} />
					{supportedBiometricsType != EBiometricsType.NO_BIOMETRICS &&
						<NalliMenuPreference
								icon={EBiometricsType.getBiometricsTypeIcon(supportedBiometricsType)}
								header={EBiometricsType.getBiometricsTypeText(supportedBiometricsType)}
								onPress={() => this.toggleBiometricsEnabled()}
								subheader={biometricsEnabled ? "On" : "Off"} />
					}
				</View>
				<View style={styles.content}>
					<NalliText size={ETextSize.H2} style={styles.header}>Manage</NalliText>
					<View style={styles.border} />
					<NalliMenuPreference
							icon="wallet"
							header="Wallet"
							onPress={this.toggleWalletInfoModal}
							subheader="Recovery phrase" />
					<NalliMenuPreference
							icon="account"
							header="Account"
							onPress={this.toggleAccountModal}
							subheader="Account settings" />
				</View>
				<View style={styles.content}>
					<NalliText size={ETextSize.H2} style={styles.header}>Support</NalliText>
					<View style={styles.border} />
					<NalliMenuPreference
							icon="information-outline"
							header="Support"
							onPress={this.openSupportPage}
							subheader="Get help by contacting us" />
				</View>
				<View style={styles.content}>
					<NalliText size={ETextSize.H2} style={styles.header}>Contribute</NalliText>
					<View style={styles.border} />
					<NalliMenuPreference
							icon="rocket"
							header="Donate"
							onPress={onDonatePress}
							subheader="Donations are used for app maintenance and further development" />
				</View>
				<CurrencyModal
						isOpen={currencyModalOpen}
						close={this.toggleSelectCurrency} />
				<NotificationModal
						isOpen={notificationModalOpen}
						enabled={pushEnabled}
						close={(status) => this.toggleSelectNotification(status)} />
				<WalletInfoModal
						isOpen={walletInfoModalOpen}
						close={this.toggleWalletInfoModal} />
				<AccountModal
						navigation={navigation}
						isOpen={accountModalOpen}
						close={this.toggleAccountModal} />
			</ScrollView>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		height: '100%',
		width: '100%',
		paddingTop: 40,
		backgroundColor: 'rgba(0, 0, 0, 0.05)',
	},
	content: {
		paddingVertical: 15,
		paddingHorizontal: 20,
	},
	border: {
		borderBottomWidth: 1,
		paddingTop: 2,
		borderBottomColor: '#bbb',
	},
	header: {
		color: Colors.darkText,
	},
	invitedNumber: {
		fontSize: 40,
		fontFamily: 'OpenSansBold',
		color: Colors.main,
	},
});
