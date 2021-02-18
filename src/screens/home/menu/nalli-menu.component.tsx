import { Linking } from 'expo';
import React from 'react';
import { Alert, EmitterSubscription, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-elements';

import Colors from '../../../constants/colors';
import ClientService from '../../../service/client.service';
import VariableStore, { NalliVariable } from '../../../service/variable-store';
import CurrencyModal from './currency-modal.component';
import NalliMenuPreference from './nalli-menu-preference.component';
import NotificationModal from './notification-modal.component';
import WalletInfoModal from './wallet-info-modal.component';

interface NalliMenuProps {
	onDonatePress: () => void;
}

interface NalliMenuState {
	invitedCount: number;
	pushEnabled: boolean;
	currency: string;
	currencyModalOpen: boolean;
	notificationModalOpen: boolean;
	walletInfoModalOpen: boolean;
}

export default class NalliMenu extends React.Component<NalliMenuProps, NalliMenuState> {

	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.state = {
			invitedCount: 0,
			pushEnabled: true,
			currency: 'usd',
			currencyModalOpen: false,
			notificationModalOpen: false,
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
		this.setState({
			currency: currency.toUpperCase(),
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

	toggleWalletInfo = () => {
		this.setState({ walletInfoModalOpen: !this.state.walletInfoModalOpen });
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
			currency,
			currencyModalOpen,
			invitedCount,
			notificationModalOpen,
			pushEnabled,
			walletInfoModalOpen,
		} = this.state;
		const { onDonatePress } = this.props;

		return (
			<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
				<View style={styles.content}>
					<Text style={styles.header}>New users adopted</Text>
					<View style={styles.border} />
					<Text style={styles.invitedNumber}>{invitedCount}</Text>
				</View>
				<View style={styles.content}>
					<Text style={styles.header}>Settings</Text>
					<View style={styles.border} />
					<NalliMenuPreference
							icon="home-currency-usd"
							header="Currency"
							onPress={this.toggleSelectCurrency}
							subheader={currency} />
					<NalliMenuPreference
							icon="bell"
							header="Notifications"
							onPress={this.toggleSelectNotification}
							subheader={pushEnabled ? "On" : "Off"} />
				</View>
				<View style={styles.content}>
					<Text style={styles.header}>Manage</Text>
					<View style={styles.border} />
					<NalliMenuPreference
							icon="wallet"
							header="Wallet"
							onPress={this.toggleWalletInfo}
							subheader="Recovery phrase" />
				</View>
				<View style={styles.content}>
					<Text style={styles.header}>Support</Text>
					<View style={styles.border} />
					<NalliMenuPreference
							icon="information-outline"
							header="Support"
							onPress={this.openSupportPage}
							subheader="Get help by contacting us" />
				</View>
				<View style={styles.content}>
					<Text style={styles.header}>Contribute</Text>
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
						close={this.toggleSelectNotification} />
				<WalletInfoModal
						isOpen={walletInfoModalOpen}
						close={this.toggleWalletInfo} />
			</ScrollView>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		height: '100%',
		width: '100%',
		paddingTop: 30,
		backgroundColor: 'rgba(0, 0, 0, 0.05)',
	},
	content: {
		padding: 20,
	},
	border: {
		borderBottomWidth: 1,
		borderBottomColor: Colors.darkText,
	},
	header: {
		fontSize: 15,
		fontFamily: 'OpenSansBold',
		color: Colors.darkText,
	},
	invitedNumber: {
		fontSize: 40,
		fontFamily: 'OpenSansBold',
		color: Colors.main,
	},
});
