import * as Haptics from 'expo-haptics';
import { box } from 'nanocurrency-web';
import React, { RefObject } from 'react';
import {
	EmitterSubscription,
	LogBox,
	Platform,
	StyleSheet,
	TouchableHighlight,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';

import { BottomSheetView } from '@gorhom/bottom-sheet';

import MyBottomSheet from '../../components/bottom-sheet.component';
import NalliIcon, { IconType } from '../../components/icon.component';
import NalliButton from '../../components/nalli-button.component';
import NalliText, { ETextSize } from '../../components/text.component';
import colors from '../../constants/colors';
import Colors from '../../constants/colors';
import { ANIMATION_DELAY, sleep } from '../../constants/globals';
import AuthStore from '../../service/auth-store';
import ContactsService from '../../service/contacts.service';
import CurrencyService from '../../service/currency.service';
import VariableStore, { NalliVariable } from '../../service/variable-store';
import WalletStore from '../../service/wallet-store';
import WalletService, { EPendingStatus, WalletTransaction } from '../../service/wallet.service';
import { DateUtil } from '../../util/date.util';
import TransactionModal from './transaction-modal.component';

interface TransactionsSheetProps {
	onSwipeSend: (transaction: WalletTransaction) => void;
	onSwipeRequest: (transaction: WalletTransaction) => void;
}

interface TransactionSheetState {
	hasMoreTransactions: boolean;
	isPhoneNumberFunctionsEnabled: boolean;
	selectedTransaction: WalletTransaction;
	transactionModalOpen: boolean;
	transactions: WalletTransaction[];
}

export default class TransactionsSheet extends React.PureComponent<TransactionsSheetProps, TransactionSheetState> {

	ref: RefObject<any>;
	interval;
	subscriptions = [] as EmitterSubscription[];

	isLeftSwipeActivated = false;
	isRightSwipeActivated = false;
	activatedKey: string;

	constructor(props) {
		super(props);
		this.ref = React.createRef();
		this.state = {
			hasMoreTransactions: false,
			isPhoneNumberFunctionsEnabled: false,
			selectedTransaction: {} as WalletTransaction,
			transactionModalOpen: false,
			transactions: [],
		};
	}

	componentDidMount = () => {
		// Disable the error because it's complaining about the home screen's scrollview
		LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
		// Update component every minute
		this.interval = setInterval(() => this.forceUpdate(), 1000 * 60);
		this.init();
	}

	componentWillUnmount = () => {
		clearInterval(this.interval);
		this.subscriptions.forEach(VariableStore.unwatchVariable);
	}

	init = async () => {
		this.fetchTransactions();
		this.subscriptions.push(VariableStore.watchVariable(NalliVariable.ACCOUNTS_BALANCES, () => this.fetchTransactions(true)));
	}

	close = () => {
		this.ref.current.snapToIndex(0);
	}

	fetchTransactions(force = false) {
		if (!this.state.transactions || !this.state.transactions.length || force) {
			this.getTransactions();
		}
	}

	getTransactions = async () => {
		const res = (await WalletService.getWalletTransactions(25, 0));
		const selectedAccountIndex = await VariableStore.getVariable<number>(NalliVariable.SELECTED_ACCOUNT_INDEX, 0);
		const privateKey = (await WalletStore.getWallet()).accounts[selectedAccountIndex].privateKey;
		for (const transaction of res) {
			if (!!transaction.message) {
				const decrypted = box.decrypt(transaction.message, transaction.account, privateKey);
				transaction.message = decrypted;
			}
		}

		const isPhoneNumberUser = await AuthStore.isPhoneNumberFunctionsEnabled();

		this.setState({
			isPhoneNumberFunctionsEnabled: isPhoneNumberUser,
			transactions: res.sort((a, b) => b.timestamp - a.timestamp),
			hasMoreTransactions: res.length == 25,
		}, () => this.ref.current.snapToIndex(0));
	}

	getMoreTransactions = async () => {
		const res = await WalletService.getWalletTransactions(25, this.state.transactions.length);
		this.setState({
			transactions: [
				...this.state.transactions,
				...res.sort((a, b) => b.timestamp - a.timestamp),
			],
			hasMoreTransactions: res.length == 25,
		});
	}

	getContactName = (transaction: WalletTransaction) => {
		if (transaction.type == 'receive' && transaction.pendingStatus == EPendingStatus.RETURNED) {
			return 'Custodial account';
		}
		const name = ContactsService.getContactByHash(transaction.phoneHash)?.name;
		return name || 'Unknown';
	}

	openTransaction = (selectedTransaction) => {
		this.setState({ selectedTransaction, transactionModalOpen: true });
	}

	closeTransaction = async () => {
		this.setState({ transactionModalOpen: false });
		await sleep(ANIMATION_DELAY);
		this.setState({ selectedTransaction: {} as WalletTransaction });
	}

	onSwipeLeftAction = (data) => {
		this.isLeftSwipeActivated = data.isActivated;
		if (data.isActivated) {
			this.activatedKey = data.key;
			if (Platform.OS == 'ios') {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}
		} else {
			this.activatedKey = undefined;
		}
	}

	onSwipeRightAction = (data) => {
		this.isRightSwipeActivated = data.isActivated;
		if (data.isActivated) {
			this.activatedKey = data.key;
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		} else {
			this.activatedKey = undefined;
		}
	}

	onSwipeTouchEnd = () => {
		if (this.isRightSwipeActivated) {
			const transaction = this.state.transactions.find(t => t.hash == this.activatedKey);
			const contact = ContactsService.getContactByHash(transaction.phoneHash);
			if (!!contact) {
				this.props.onSwipeRequest(transaction);
			}
		} else if (this.isLeftSwipeActivated) {
			const transaction = this.state.transactions.find(t => t.hash == this.activatedKey);
			this.props.onSwipeSend(transaction);
		}
	}

	render = () => {
		const {
			hasMoreTransactions,
			isPhoneNumberFunctionsEnabled,
			selectedTransaction,
			transactionModalOpen,
			transactions,
		} = this.state;

		const hasTransactions = transactions?.length > 0;

		return (
			<MyBottomSheet
					reference={this.ref}
					initialSnap={-1}
					snapPoints={['25%', '87.5%']}
					enableLinearGradient
					header='Transactions'>
				<BottomSheetView style={styles.transactionList}>
					<SwipeListView
							data={transactions}
							keyExtractor={(item => item.hash)}
							initialNumToRender={10}
							showsVerticalScrollIndicator={false}
							ListHeaderComponent={() => <BottomSheetView style={{ paddingTop: 25 }}><></></BottomSheetView>}
							ListEmptyComponent={() => <NalliText style={styles.noMoreText}>Your transactions will appear here</NalliText>}
							renderHiddenItem={() => (
								<BottomSheetView style={styles.swipeRowBack}>
									<BottomSheetView style={styles.swipeRowItem}>
										<NalliText size={ETextSize.P_MEDIUM} style={styles.swipeRowText}>
											<NalliIcon icon='md-arrow-up' type={IconType.ION} />&nbsp;Send
										</NalliText>
									</BottomSheetView>
									<BottomSheetView style={{ ...styles.swipeRowItem, ...styles.swipeRowItemRight }}>
										<NalliText size={ETextSize.P_MEDIUM} style={styles.swipeRowText}>
											Request&nbsp;<NalliIcon icon='md-arrow-down' type={IconType.ION} />
										</NalliText>
									</BottomSheetView>
								</BottomSheetView>
							)}
							leftActionValue={0}
							leftActivationValue={100}
							stopLeftSwipe={150}
							disableLeftSwipe={!isPhoneNumberFunctionsEnabled}
							rightActionValue={0}
							rightActivationValue={-100}
							stopRightSwipe={-150}
							onLeftActionStatusChange={data => this.onSwipeLeftAction(data)}
							onRightActionStatusChange={data => this.onSwipeRightAction(data)}
							onTouchEnd={() => this.onSwipeTouchEnd()}
							renderItem={itemInfo => {
								const item = itemInfo.item;
								const amount = CurrencyService.formatNanoAmount(Number(item.amount));
								return (
									<TouchableHighlight underlayColor={Colors.lightGrey} key={item.hash} style={styles.transactionContainer} onPress={() => this.openTransaction(item)}>
										<BottomSheetView>
											<BottomSheetView style={styles.transactionRow}>
												{item.type == 'send'
													? <NalliText size={ETextSize.H2}>Sent</NalliText>
													: item.pendingStatus == EPendingStatus.RETURNED
														? <NalliText size={ETextSize.H2}>Returned</NalliText>
														: <NalliText size={ETextSize.H2}>Received</NalliText>
												}
												<NalliText>
													{DateUtil.getRelativeTime(item.timestamp)}
												</NalliText>
											</BottomSheetView>
											<BottomSheetView style={styles.transactionRow}>
												<NalliText style={styles.transactionTarget}>
													{this.getContactName(item)}
												</NalliText>
												{item.type == 'send' ?
													<NalliText style={styles.transactionAmount}>
														- {amount}
													</NalliText> :
													<NalliText style={{ color: colors.main, ...styles.transactionAmount }}>
														+ {amount}
													</NalliText>
												}
											</BottomSheetView>
											{!!item.message &&
												<BottomSheetView style={styles.transactionRow}>
													<NalliText style={styles.transactionTarget}>
														<NalliIcon style={styles.chatIcon} icon='chatbox' type={IconType.ION} size={14} />&nbsp;&nbsp;{item.message.length > 30 ? item.message.substring(0, 30).replaceAll('\n', ' ') + '...' : item.message.replaceAll('\n', ' ')}
													</NalliText>
												</BottomSheetView>
											}
										</BottomSheetView>
									</TouchableHighlight>
								);
							}}
							ListFooterComponent={() => {
								if (!hasTransactions) {
									return null;
								}
								if (hasMoreTransactions) {
									return (
										<NalliButton
												style={styles.fetchMoreButton}
												small
												text='Fetch more'
												onPress={this.getMoreTransactions} />
									);
								} else {
									return (
										<NalliText style={styles.noMoreText}>Nothing more to see here</NalliText>
									);
								}
							}} />
					<TransactionModal
							isOpen={selectedTransaction && transactionModalOpen}
							transaction={selectedTransaction}
							contactName={this.getContactName(selectedTransaction)}
							onClose={this.closeTransaction} />
				</BottomSheetView>
			</MyBottomSheet>
		);
	}

}

const styles = StyleSheet.create({
	transactionList: {
		backgroundColor: 'white',
		paddingHorizontal: 10,
		minHeight: '100%',
	},
	transactionContainer: {
        backgroundColor: 'white',
		justifyContent: 'space-between',
		borderBottomWidth: 1,
		borderBottomColor: colors.borderColor,
		padding: 5,
	},
	transactionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingTop: -3,
		paddingBottom: 3,
	},
	swipeRowBack: {
        alignItems: 'center',
        backgroundColor: Colors.lightGrey,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
	},
	swipeRowItem: {
		backgroundColor: Colors.main,
		width: '50%',
		height: '100%',
		justifyContent: 'center',
		paddingLeft: 10,
	},
	swipeRowItemRight: {
		alignContent: 'flex-end',
		alignItems: 'flex-end',
		paddingRight: 10,
	},
	swipeRowText: {
		color: 'white',
	},
	transactionAmount: {
		fontSize: 18,
		fontFamily: 'OpenSansBold',
	},
	transactionTarget: {
		marginTop: 4,
		fontSize: 14,
		lineHeight: 20,
		fontFamily: 'OpenSans',
	},
	chatIcon: {
		color: Colors.main,
	},
	fetchMoreButton: {
		width: '50%',
		alignSelf: 'center',
		marginTop: 20,
		marginBottom: 100,
	},
	noMoreText: {
		alignSelf: 'center',
		marginTop: 20,
		marginBottom: 100,
	},
});
