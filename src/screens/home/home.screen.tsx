import { wallet } from 'nanocurrency-web';
import React from 'react';
import {
	EmitterSubscription,
	KeyboardAvoidingView,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { Avatar } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import SideMenu from 'react-native-side-menu-updated'
import { NavigationInjectedProps } from 'react-navigation';

import { Ionicons } from '@expo/vector-icons';

import NalliCarousel from '../../components/carousel.component';
import DismissKeyboardView from '../../components/dismiss-keyboard-hoc.component';
import NalliButton from '../../components/nalli-button.component';
import NalliRequests from '../../components/requests.component';
import NalliLogo from '../../components/svg/nalli-logo';
import Colors from '../../constants/colors';
import Layout from '../../constants/layout';
import layout from '../../constants/layout';
import AuthStore from '../../service/auth-store';
import CurrencyService from '../../service/currency.service';
import NotificationService from '../../service/notification.service';
import { Request } from '../../service/request.service';
import VariableStore, { NalliVariable } from '../../service/variable-store';
import WalletHandler from '../../service/wallet-handler.service';
import WalletStore, { WalletType } from '../../service/wallet-store';
import WalletService from '../../service/wallet.service';
import WsService, { EWebSocketNotificationType } from '../../service/ws.service';
import NalliMenu from './menu/nalli-menu.component';
import PrivacyShield, { NalliAppState } from './privacy-shield.component';
import RequestSheet from './request-sheet.component';
import SendSheet from './send-sheet.component';
import TransactionsSheet from './transactions-sheet.component';

interface HomeScreenProps extends NavigationInjectedProps {
}

interface HomeScreenState {
	price: number;
	process: boolean;
	walletIsOpen: boolean;
}

export default class HomeScreen extends React.PureComponent<HomeScreenProps, HomeScreenState> {

	requestsRef: NalliRequests;
	sendSheetRef: SendSheet;
	requestSheetRef: RequestSheet;
	sidemenuRef: SideMenu;
	subscriptions: EmitterSubscription[] = [];
	transactionSheetRef: TransactionsSheet;

	constructor(props) {
		super(props);
		this.state = {
			price: undefined,
			process: false,
			walletIsOpen: true,
		};
	}

	static navigationOptions = () => ({
		headerShown: false,
	});

	componentDidMount = () => {
		this.subscriptions.push(VariableStore.watchVariable(NalliVariable.CURRENCY, () => this.getCurrentPrice()));
		this.init();
	}

	init = async () => {
		this.getCurrentPrice();
		this.subscribeToNotifications();
		NotificationService.checkPushNotificationRegistrationStatusAndRenewIfNecessary();
	}

	componentWillUnmount = () => {
		try {
			WsService.unsubscribe();
			this.subscriptions.forEach(VariableStore.unwatchVariable);
		} catch {
			// nothing
		}
	}

	handleAppChangeState = (nextState: NalliAppState) => {
		if (nextState == NalliAppState.ACTIVE) {
			this.subscribeToNotifications();
			this.getCurrentPrice();
			WalletHandler.getAccountsBalancesAndHandlePending();
		}
	}

	subscribeToNotifications = () => {
		WsService.subscribe(event => {
			switch (event.type) {
				case EWebSocketNotificationType.CONFIRMATION_RECEIVE:
					WalletHandler.getAccountsBalancesAndHandlePending();
					break;
				case EWebSocketNotificationType.PENDING_RECEIVED:
					this.transactionSheetRef.getTransactions();
					break;
				case EWebSocketNotificationType.NEW_REQUEST:
					this.requestsRef.fetchRequests();
					break;
			}
		});
	}

	onChangeAccount = async (index: number, fetchTransactions = true) => {
		const storedWallet = await WalletStore.getWallet();

		if (storedWallet.accounts[index] !== undefined) {
			await VariableStore.setVariable(NalliVariable.SELECTED_ACCOUNT, storedWallet.accounts[index].address);
			await VariableStore.setVariable(NalliVariable.SELECTED_ACCOUNT_INDEX, index);
			if (fetchTransactions) {
				this.transactionSheetRef.getTransactions();
			}
			this.setState({ walletIsOpen: true });
		} else {
			this.setState({ walletIsOpen: false });
		}
	}

	addNewAccount = async (index: number): Promise<boolean> => {
		if (this.state.process) {
			return false;
		}
		this.setState({ process: true });
		const storedWallet = await WalletStore.getWallet();

		// If account not already present and all previous indexes are present
		if (!storedWallet.accounts[index] && storedWallet.accounts.length === index) {
			let accounts;
			if (storedWallet.type == WalletType.HD_WALLET) {
				accounts = wallet.accounts(storedWallet.seed, index, index);
			} else {
				accounts = wallet.legacyAccounts(storedWallet.seed, index, index);
			}
			const newWallet = { ...storedWallet };
			newWallet.accounts[index] = accounts[0];
			await WalletService.saveNewAccount(accounts[0]);
			await WalletStore.setWallet(newWallet);
			WalletHandler.getAccountsBalancesAndHandlePending();
			this.onChangeAccount(index, false);
		}
		this.setState({ process: false });
		return true;
	}

	hideAccount = async (index: number): Promise<boolean> => {
		if (this.state.process) {
			return false;
		}
		this.setState({ process: true });
		if (index > 0) {
			const storedWallet = await WalletStore.getWallet();
			const accounts = storedWallet.accounts;
			const newWallet = { ...storedWallet };
			const removed = accounts.pop();
			newWallet.accounts = accounts;
			await WalletService.removeAccount(removed);
			await WalletStore.setWallet(newWallet);
			WalletHandler.getAccountsBalancesAndHandlePending();
			this.onChangeAccount(index - 1, false);
		}
		this.setState({ process: false });
		return true;
	}

	getCurrentPrice = async () => {
		const currency = await VariableStore.getVariable(NalliVariable.CURRENCY, 'usd');
		const price = await CurrencyService.getCurrentPrice('xno', currency);
		this.setState({ price });
		return price;
	}

	logout = async () => {
		await AuthStore.clearAuthentication();
		await AuthStore.clearExpires();
		await VariableStore.setVariable(NalliVariable.NO_AUTOLOGIN, true);
		this.props.navigation.navigate('Login');
	}

	onSendPress = () => {
		this.sendSheetRef.open();
	}

	onReceivePress = () => {
		this.requestSheetRef.open();
	}

	onSendSuccess = () => {
		this.requestsRef.fetchRequests();
	}

	onDonatePress = () => {
		this.sidemenuRef.openMenu(false);
		this.onSendPress();
		this.sendSheetRef.toggleDonate(true);
	}

	onRequestAcceptPress = (request: Request) => {
		this.onSendPress();
		this.sendSheetRef.fillWithRequest(request);
	}

	openMenu = () => {
		this.sidemenuRef.openMenu(true);
	}

	render = () => {
		const { navigation } = this.props;
		const {
			price,
			walletIsOpen,
		} = this.state;

		return (
			<PrivacyShield
					onAppStateChange={this.handleAppChangeState}>
				<SideMenu
						ref={menu => this.sidemenuRef = menu}
						menu={<NalliMenu navigation={navigation} onDonatePress={this.onDonatePress} />}
						bounceBackOnOverdraw={false}
						toleranceX={20}
						autoClosing={false}>
					<ScrollView scrollEnabled={false}>
						<KeyboardAvoidingView>
							<DismissKeyboardView style={styles.container}>
								<SafeAreaView edges={['top']}>
									<View style={styles.header}>
										<TouchableOpacity style={styles.menuIconContainer} onPress={this.openMenu}>
											<Ionicons style={styles.menuIcon} name='ios-menu' size={40} />
										</TouchableOpacity>
										<NalliLogo style={styles.headerLogo} width={90} height={30} />
										<Avatar
												rounded
												onPress={this.logout}
												icon={{ name: 'lock', type: 'font-awesome' }}
												size='small'
												containerStyle={styles.logoutButton}
												overlayContainerStyle={{ backgroundColor: Colors.main }} />
									</View>
								</SafeAreaView>
								<View style={styles.content}>
									<View style={{ height: 165 }}>
										<NalliCarousel
												onChangeAccount={this.onChangeAccount}
												onAddNewAccount={this.addNewAccount}
												onHideAccount={this.hideAccount}
												price={price} />
									</View>
									<View>
										<NalliRequests
												ref={c => this.requestsRef = c}
												onAcceptPress={this.onRequestAcceptPress} />
									</View>
									<View style={styles.actions}>
										<NalliButton
												text='Send'
												solid
												icon='md-arrow-up'
												style={styles.action}
												onPress={this.onSendPress}
												disabled={!walletIsOpen} />
										<NalliButton
												text='Request'
												solid
												icon='md-arrow-down'
												style={styles.action}
												onPress={this.onReceivePress}
												disabled={!walletIsOpen} />
									</View>
								</View>
								<TransactionsSheet ref={c => this.transactionSheetRef = c} />
								<SendSheet
										ref={c => this.sendSheetRef = c}
										onSendSuccess={this.onSendSuccess} />
								<RequestSheet ref={c => this.requestSheetRef = c} />
							</DismissKeyboardView>
						</KeyboardAvoidingView>
					</ScrollView>
				</SideMenu>
			</PrivacyShield>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		height: layout.window.height,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingBottom: 4,
	},
	menuIconContainer: {
		marginTop: 10,
		marginLeft: 20,
		marginRight: -20,
		color: Colors.main,
	},
	menuIcon: {
		color: Colors.main,
	},
	logoutButton: {
		marginRight: 20,
		marginTop: 15,
		shadowColor: Colors.shadowColor,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 3,
	},
	headerLogo: {
		marginTop: 15,
		marginLeft: 15,
		color: Colors.main,
	},
	content: {
		flex: 2,
		backgroundColor: 'white',
		flexDirection: 'column',
		marginBottom: layout.window.height * 0.24,
	},
	actions: {
		marginTop: 'auto',
		marginBottom: 10,
		padding: 15,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	action: {
		width: (Number(Layout.window.width) - 50) / 2,
	},
});
