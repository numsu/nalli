import React from 'react';
import { Alert, EmitterSubscription, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';

import { IconType } from '../../../components/icon.component';
import NalliText, { ETextSize } from '../../../components/text.component';
import Colors from '../../../constants/colors';
import ClientService from '../../../service/client.service';
import VariableStore, { NalliVariable } from '../../../service/variable-store';
import AccountModal from './account-modal.component';
import CurrencyModal from './currency-modal.component';
import NalliMenuPreference from './nalli-menu-preference.component';
import PreferencesModal from './preferences-modal.component';
import WalletInfoModal from './wallet-info-modal.component';

interface NalliMenuProps extends NavigationInjectedProps {
	onDonatePress: () => void;
}

interface NalliMenuState {
	accountModalOpen: boolean;
	currency: string;
	currencyModalOpen: boolean;
	invitedCount: number;
	notificationModalOpen: boolean;
	preferencesModalOpen: boolean;
	walletInfoModalOpen: boolean;
}

export default class NalliMenu extends React.Component<NalliMenuProps, NalliMenuState> {

	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.state = {
			accountModalOpen: false,
			currency: 'usd',
			currencyModalOpen: false,
			invitedCount: 0,
			notificationModalOpen: false,
			preferencesModalOpen: false,
			walletInfoModalOpen: false,
		};
	}

	componentDidMount = () => {
		this.fetchInviteCount();
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

	toggleBooleanState = (state: string) => {
		//@ts-ignore
		this.setState({ [state]: !this.state[state] });
	}

	togglePreferencesModal = () => {
		this.setState({ preferencesModalOpen: !this.state.preferencesModalOpen });
	}

	toggleSelectCurrencyModal = () => {
		this.setState({ currencyModalOpen: !this.state.currencyModalOpen });
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
			currency,
			currencyModalOpen,
			invitedCount,
			preferencesModalOpen,
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
							icon='ios-settings-sharp'
							iconType={IconType.ION}
							header='Preferences'
							onPress={() => this.toggleBooleanState('preferencesModalOpen')}
							subheader='User settings' />
					<NalliMenuPreference
							icon='home-currency-usd'
							iconType={IconType.MATERIAL_COMMUNITY}
							header='Currency'
							onPress={() => this.toggleBooleanState('currencyModalOpen')}
							subheader={currency} />
				</View>
				<View style={styles.content}>
					<NalliText size={ETextSize.H2} style={styles.header}>Manage</NalliText>
					<View style={styles.border} />
					<NalliMenuPreference
							icon='wallet'
							iconType={IconType.MATERIAL_COMMUNITY}
							header='Wallet'
							onPress={() => this.toggleBooleanState('walletInfoModalOpen')}
							subheader='Recovery phrase' />
					<NalliMenuPreference
							icon='account'
							iconType={IconType.MATERIAL_COMMUNITY}
							header='Account'
							onPress={() => this.toggleBooleanState('accountModalOpen')}
							subheader='Account settings' />
				</View>
				<View style={styles.content}>
					<NalliText size={ETextSize.H2} style={styles.header}>Support</NalliText>
					<View style={styles.border} />
					<NalliMenuPreference
							icon='information-outline'
							iconType={IconType.MATERIAL_COMMUNITY}
							header='Support'
							onPress={this.openSupportPage}
							subheader='Get help by contacting us' />
				</View>
				<View style={styles.content}>
					<NalliText size={ETextSize.H2} style={styles.header}>Contribute</NalliText>
					<View style={styles.border} />
					<NalliMenuPreference
							icon='rocket'
							iconType={IconType.MATERIAL_COMMUNITY}
							header='Donate'
							onPress={onDonatePress}
							subheader='Donations are used for app maintenance and further development' />
				</View>
				<PreferencesModal
						isOpen={preferencesModalOpen}
						close={this.togglePreferencesModal} />
				<CurrencyModal
						isOpen={currencyModalOpen}
						close={this.toggleSelectCurrencyModal} />
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
		fontSize: 38,
		fontFamily: 'OpenSansBold',
		color: Colors.main,
	},
});
