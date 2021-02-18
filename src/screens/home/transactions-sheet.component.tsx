import moment from 'moment';
import React from 'react';
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

import MyBottomSheet from '../../components/bottom-sheet.component';
import NalliButton from '../../components/nalli-button.component';
import colors from '../../constants/colors';
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
			selectedTransaction: undefined,
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
		const diffInDays = time.diff(now, 'days');

		let date;
		if (diffInDays == 0) {
			date = 'Today';
		} else if (diffInDays == 1) {
			date = 'Yesterday';
		} else if (diffInDays > 200) {
			date = time.format('D MMM YYYY');
		} else {
			date = time.format('D MMM');
		}

		return `${date} ${time.format('hh:mm A')}`;
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

	closeTransaction = () => {
		this.setState({ selectedTransaction: undefined, transactionModalOpen: false });
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
							? <Text style={styles.transactionTitle}>Sent</Text>
							: item.pendingStatus == EPendingStatus.RETURNED
								? <Text style={styles.transactionTitle}>Returned</Text>
								: <Text style={styles.transactionTitle}>Received</Text>
						}
						<Text style={styles.transactionName}>
							{this.getRelativeTime(item.timestamp)}
						</Text>
					</View>
					<View style={styles.transactionRow}>
						<Text style={styles.transactionName}>
							{this.getContactName(item)}
						</Text>
						{item.type == 'send' ?
							<Text style={styles.transactionAmount}>
								- {item.amount}
							</Text> :
							<Text style={[styles.transactionAmount, { color: colors.main }]}>
								+ {item.amount}
							</Text>
						}
					</View>
				</TouchableOpacity>
			</View>
		));

		return (
			<MyBottomSheet
					initialSnap={2}
					snapPoints={['87.5%', '68%', '25%']}
					enabledInnerScrolling={true}
					header="Transactions">
				<View style={styles.transactionList}>
					{!hasTransactions && <Text>No transactions so far</Text>}
					{transactionListElements}
					{selectedTransaction ?
						<TransactionModal
								isOpen={transactionModalOpen}
								transaction={selectedTransaction}
								contactName={this.getContactName(selectedTransaction)}
								onClose={this.closeTransaction} />
						: undefined
					}
					{hasTransactions && hasMoreTransactions &&
						<NalliButton
								text='Fetch more...'
								onPress={onFetchMore} />
					}
					{hasTransactions && !hasMoreTransactions &&
						<Text style={styles.noMoreText}>Nothing more to see here</Text>
					}
				</View>
			</MyBottomSheet>
		);
	}

}

const styles = StyleSheet.create({
	transactionList: {
		backgroundColor: 'white',
		paddingHorizontal: 15,
		paddingBottom: 100,
		minHeight: '100%',
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
		paddingVertical: 3,
	},
	transactionName: {
		fontSize: 16,
	},
	transactionAmount: {
		fontSize: 20,
		fontFamily: 'OpenSansBold',
	},
	transactionTitle: {
		fontSize: 16,
		fontFamily: 'OpenSansBold',
	},
	noMoreText: {
		fontSize: 16,
		fontFamily: 'OpenSans',
		alignSelf: 'center',
		marginTop: 20,
	},
});
