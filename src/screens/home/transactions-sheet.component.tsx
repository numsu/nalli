import moment from 'moment';
import React, { RefObject } from 'react';
import {
	EmitterSubscription,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import MyBottomSheet from '../../components/bottom-sheet.component';
import NalliModal from '../../components/modal.component';
import NalliButton from '../../components/nalli-button.component';
import NalliText, { ETextSize } from '../../components/text.component';
import colors from '../../constants/colors';
import { sleep } from '../../constants/globals';
import ContactsService from '../../service/contacts.service';
import VariableStore, { NalliVariable } from '../../service/variable-store';
import WalletService, { EPendingStatus, WalletTransaction } from '../../service/wallet.service';
import TransactionModal from './transaction-modal.component';

interface TransactionsSheetProps {
}

interface TransactionSheetState {
	hasMoreTransactions: boolean;
	selectedTransaction: WalletTransaction;
	transactionModalOpen: boolean;
	transactions: WalletTransaction[];
}

export default class TransactionsSheet extends React.Component<TransactionsSheetProps, TransactionSheetState> {

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

	getRelativeTime = (timestamp) => {
		const time = moment.unix(timestamp);
		const now = moment();

		const diffInMinutes = now.diff(time, 'minutes');
		const diffInHours = now.diff(time, 'hours');
		const diffInDays = now.diff(time, 'days');
		const diffInWeeks = now.diff(time, 'weeks');
		const diffInMonths = now.diff(time, 'months');
		const diffInYears = now.diff(time, 'years');

		let date;
		if (diffInMinutes < 1) {
			date = 'Just now';
		} else if (diffInMinutes == 1) {
			date = 'a minute ago';
		} else if (diffInMinutes < 60) {
			date = `${diffInMinutes} minutes ago`;
		} else if (diffInHours == 1) {
			date = `an hour ago`;
		} else if (diffInHours < 24) {
			date = `${diffInHours} hours ago`;
		} else if (diffInDays == 0) {
			date = 'Today';
		} else if (diffInDays == 1) {
			date = 'Yesterday';
		} else if (diffInDays < 7) {
			date = `${diffInDays} days ago`;
		} else if (diffInWeeks < 2) {
			date = 'Last week'
		} else if (diffInWeeks >= 2 && diffInMonths < 1) {
			date = `${diffInWeeks} weeks ago`;
		} else if (diffInMonths == 1) {
			date = 'A month ago';
		} else if (diffInMonths < 12) {
			date = `${diffInMonths} months ago`;
		} else if (diffInYears < 2) {
			date = 'A year ago';
		} else {
			date = `${diffInYears} years ago`;
		}

		return date;
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
		await sleep(NalliModal.animationDelay);
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

		let transactionListElements;
		if (hasTransactions) {
			transactionListElements = transactions.map(item => (
				<Animated.View entering={SlideInDown} key={item.hash} style={styles.transactionContainer}>
					<TouchableOpacity onPress={() => this.openTransaction(item)}>
						<View style={styles.transactionRow}>
							{item.type == 'send'
								? <NalliText size={ETextSize.H2}>Sent</NalliText>
								: item.pendingStatus == EPendingStatus.RETURNED
									? <NalliText size={ETextSize.H2}>Returned</NalliText>
									: <NalliText size={ETextSize.H2}>Received</NalliText>
							}
							<NalliText>
								{this.getRelativeTime(item.timestamp)}
							</NalliText>
						</View>
						<View style={styles.transactionRow}>
							<NalliText style={styles.transactionTarget}>
								{this.getContactName(item)}
							</NalliText>
							{item.type == 'send' ?
								<NalliText style={styles.transactionAmount}>
									- {item.amount}
								</NalliText> :
								<NalliText style={{ color: colors.main, ...styles.transactionAmount }}>
									+ {item.amount}
								</NalliText>
							}
						</View>
					</TouchableOpacity>
				</Animated.View>
			));
		}

		return (
			<MyBottomSheet
					reference={this.ref}
					initialSnap={-1}
					snapPoints={['25%', '87.5%']}
					enableLinearGradient
					header='Transactions'>
				{!hasTransactions &&
					<NalliText style={styles.noMoreText}>Your transactions will appear here</NalliText>
				}
				{hasTransactions &&
					<BottomSheetScrollView style={styles.transactionList}>
						{transactionListElements}
						{hasMoreTransactions &&
							<NalliButton
									style={styles.fetchMoreButton}
									small
									text='Fetch more'
									onPress={this.getMoreTransactions} />
						}
						{!hasMoreTransactions &&
							<NalliText style={styles.noMoreText}>Nothing more to see here</NalliText>
						}
						<TransactionModal
								isOpen={selectedTransaction && transactionModalOpen}
								transaction={selectedTransaction}
								contactName={this.getContactName(selectedTransaction)}
								onClose={this.closeTransaction} />
					</BottomSheetScrollView>
				}
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
		paddingTop: 20,
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
		fontSize: 20,
		fontFamily: 'OpenSansBold',
	},
	transactionTarget: {
		marginTop: 4,
		fontSize: 16,
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
