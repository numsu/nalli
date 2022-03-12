import React, { RefObject } from 'react';
import {
	EmitterSubscription,
	LogBox,
	StyleSheet,
	TouchableOpacity,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet';

import MyBottomSheet from '../../components/bottom-sheet.component';
import NalliButton from '../../components/nalli-button.component';
import NalliText, { ETextSize } from '../../components/text.component';
import colors from '../../constants/colors';
import { ANIMATION_DELAY, sleep } from '../../constants/globals';
import ContactsService from '../../service/contacts.service';
import CurrencyService from '../../service/currency.service';
import VariableStore, { NalliVariable } from '../../service/variable-store';
import WalletService, { EPendingStatus, WalletTransaction } from '../../service/wallet.service';
import { DateUtil } from '../../util/date.util';
import TransactionModal from './transaction-modal.component';

interface TransactionsSheetProps {
}

interface TransactionSheetState {
	hasMoreTransactions: boolean;
	selectedTransaction: WalletTransaction;
	transactionModalOpen: boolean;
	transactions: WalletTransaction[];
}

export default class TransactionsSheet extends React.PureComponent<TransactionsSheetProps, TransactionSheetState> {

	ref: RefObject<any>;
	interval;
	subscriptions = [] as EmitterSubscription[];

	constructor(props) {
		super(props);
		this.ref = React.createRef();
		this.state = {
			hasMoreTransactions: false,
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

	fetchTransactions(force = false) {
		if (!this.state.transactions || !this.state.transactions.length || force) {
			this.getTransactions();
		}
	}

	getTransactions = async () => {
		const res = await WalletService.getWalletTransactions(25, 0);
		this.setState({
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

	render = () => {
		const {
			hasMoreTransactions,
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
					linearGradientTopStyle={{ height: 35, top: 20 }}
					header='Transactions'>
				<BottomSheetView style={styles.transactionList}>
					<BottomSheetFlatList
							data={transactions}
							keyExtractor={(item => item.hash)}
							initialNumToRender={10}
							showsVerticalScrollIndicator={false}
							ListHeaderComponent={() => <BottomSheetView style={{ paddingTop: 20 }}><></></BottomSheetView>}
							ListEmptyComponent={() => <NalliText style={styles.noMoreText}>Your transactions will appear here</NalliText>}
							renderItem={itemInfo => {
								const item = itemInfo.item;
								const amount = CurrencyService.formatNanoAmount(Number(item.amount));
								return (
									<Animated.View entering={FadeIn} key={item.hash} style={styles.transactionContainer}>
										<TouchableOpacity onPress={() => this.openTransaction(item)}>
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
										</TouchableOpacity>
									</Animated.View>
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
		paddingHorizontal: 15,
		minHeight: '100%',
		zIndex: -1,
		paddingTop: 25,
	},
	transactionContainer: {
		justifyContent: 'space-between',
		borderBottomWidth: 1,
		borderBottomColor: colors.borderColor,
		paddingVertical: 5,
	},
	transactionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingTop: -3,
		paddingBottom: 3,
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
