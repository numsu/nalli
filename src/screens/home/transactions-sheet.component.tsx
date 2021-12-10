import moment from 'moment';
import React from 'react';
import {
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import MyBottomSheet from '../../components/bottom-sheet.component';
import NalliModal from '../../components/modal.component';
import NalliButton from '../../components/nalli-button.component';
import NalliText, { ETextSize } from '../../components/text.component';
import colors from '../../constants/colors';
import { sleep } from '../../constants/globals';
import ContactsService from '../../service/contacts.service';
import { EPendingStatus, WalletTransaction } from '../../service/wallet.service';
import TransactionModal from './transaction-modal.component';

interface TransactionsSheetProps {
	transactions: WalletTransaction[];
	hasMoreTransactions: boolean;
	onFetchMore: () => void;
}

interface TransactionSheetState {
	contacts: Map<string, string>;
	transactionModalOpen: boolean;
	selectedTransaction: WalletTransaction;
}

export default class TransactionsSheet extends React.Component<TransactionsSheetProps, TransactionSheetState> {

	constructor(props) {
		super(props);
		this.state = {
			contacts: new Map<string, string>(),
			transactionModalOpen: false,
			selectedTransaction: {} as WalletTransaction,
		};
	}

	componentDidMount = () => {
		this.getContacts();
	}

	getContacts = async () => {
		const phoneContacts = await ContactsService.getContacts(false);
		const contacts = new Map<string, string>();
		phoneContacts.forEach(contact =>
				contacts.set(contact.fullNumber, contact.name));
		this.setState({ contacts });
	}

	getRelativeTime = (timestamp) => {
		const time = moment.unix(timestamp);
		const now = moment();
		const diffInDays = now.diff(time, 'days');
		const diffInWeeks = now.diff(time, 'weeks');
		const diffInMonths = now.diff(time, 'months');
		const diffInYears = now.diff(time, 'years');

		let date;
		if (diffInDays == 0) {
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

		if (diffInDays < 7) {
			return `${date} at ${time.format('hh:mm A')}`;
		} else {
			return date;
		}
	}

	getContactName = (transaction: WalletTransaction) => {
		if (transaction.type == 'receive' && transaction.pendingStatus == EPendingStatus.RETURNED) {
			return 'Custodial account';
		}
		const name = this.state.contacts.get(transaction.phone);
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
		const { transactions, onFetchMore, hasMoreTransactions } = this.props;
		const { transactionModalOpen, selectedTransaction } = this.state;
		const hasTransactions = transactions && transactions.length > 0;

		const transactionListElements = transactions && transactions.map(item => (
			<View key={item.hash} style={styles.transactionContainer}>
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
			</View>
		));

		return (
			<MyBottomSheet
					initialSnap={0}
					snapPoints={['25%', '87.5%']}
					enableLinearGradient={true}
					header="Transactions">
				<BottomSheetScrollView style={styles.transactionList}>
					{!hasTransactions && <NalliText style={styles.noMoreText}>Your transactions will appear here</NalliText>}
					{transactionListElements}
					<TransactionModal
							isOpen={selectedTransaction && transactionModalOpen}
							transaction={selectedTransaction}
							contactName={this.getContactName(selectedTransaction)}
							onClose={this.closeTransaction} />
					{hasTransactions && hasMoreTransactions &&
						<NalliButton
								style={styles.fetchMoreButton}
								small={true}
								text='Fetch more'
								onPress={onFetchMore} />
					}
					{hasTransactions && !hasMoreTransactions &&
						<NalliText style={styles.noMoreText}>Nothing more to see here</NalliText>
					}
				</BottomSheetScrollView>
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
