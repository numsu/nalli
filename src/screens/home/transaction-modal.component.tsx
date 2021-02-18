import moment from 'moment';
import React from 'react';
import {
	Alert,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import Link from '../../components/link.component';
import NalliModal from '../../components/modal.component';
import NalliButton from '../../components/nalli-button.component';
import ShowHide from '../../components/show-hide.component';
import Colors from '../../constants/colors';
import WalletService, { EPendingStatus, WalletTransaction } from '../../service/wallet.service';

export interface TransactionModalProps {
	contactName: string;
	transaction: WalletTransaction;
	isOpen: boolean;
	onClose: () => void;
}

export interface TransactionModalState {
	isOpen: boolean;
}

export default class TransactionModal extends React.Component<TransactionModalProps, TransactionModalState> {

	constructor(props) {
		super(props);
		this.state = {
			isOpen: props.isOpen,
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen };
		}
		if (prevState.transaction != nextProps.transaction) {
			return { transaction: nextProps.transaction };
		}
		return null;
	}

	close = () => {
		this.props.onClose();
	}

	returnPendingSend = async () => {
		Alert.alert(
			'Confirm',
			'Are you sure you want to cancel the transaction?',
			[
				{
					text: 'No',
					style: 'default',
					onPress: () => undefined,
				}, {
					text: 'Yes',
					style: 'destructive',
					onPress: async () => {
						this.props.onClose();
						await WalletService.returnPendingSend(this.props.transaction.pendingId);
					},
				},
			]
		)
	}

	render = () => {
		const { transaction, contactName } = this.props;
		const { isOpen } = this.state;

		return (
			<NalliModal
					isOpen={isOpen}
					onClose={this.close}
					header='Transaction'>
				<ScrollView style={styles.content}>
					<View style={styles.row}>
						<Text style={styles.title}>Time</Text>
						<Text style={styles.text}>
							{moment.unix(transaction.timestamp).format('D MMMM YYYY HH:mm:ss')}
						</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.title}>
							{transaction.type == 'send' ? 'Recipient' : 'Sender'}
						</Text>
						<Text style={styles.text}>
							{contactName}
						</Text>
						{transaction.phone && contactName != 'Unknown' && transaction.pendingStatus != EPendingStatus.RETURNED ?
							<Text style={styles.text}>
								{transaction.phone}
							</Text> : undefined
						}
					</View>
					<View style={styles.row}>
						<Text style={styles.title}>
							{transaction.type == 'send' ? 'Sent' : 'Received'}
						</Text>
						{transaction.type == 'send' ?
							<Text style={styles.text}>
								- {transaction.amount} NANO
							</Text> :
							<Text style={styles.text}>
								+ {transaction.amount} NANO
							</Text>
						}
					</View>
					{transaction.pendingStatus == EPendingStatus.CREATED || transaction.pendingStatus == EPendingStatus.FILLED ?
						<View style={styles.row}>
							<Text style={styles.title}>Custodial transaction status</Text>
							<Text style={styles.text}>Funds are in custodial account</Text>
						</View>
						: undefined
					}
					{transaction.pendingStatus == EPendingStatus.SETTLED && transaction.type == 'send' ?
						<View style={styles.row}>
							<Text style={styles.title}>Custodial transaction status</Text>
							<Text style={styles.text}>Funds are received by the recipient</Text>
						</View>
						: undefined
					}
					{transaction.pendingStatus == EPendingStatus.RETURNED ?
						<View style={styles.row}>
							<Text style={styles.title}>Custodial transaction status</Text>
							<Text style={styles.text}>Funds are returned to you</Text>
						</View>
						: undefined
					}
					{transaction.custodialAccount && transaction.type == 'send' ?
							<View>
								<Text style={styles.info}>
									When sending funds to a user who has not yet registered to the service,
									the funds are first sent to a temporary custodial account.
								</Text>
								{transaction.pendingStatus != EPendingStatus.RETURNED ?
									<Text style={styles.info}>
										You are able to cancel the transaction and return your funds up until the recipient has claimed them.
									</Text>
									: undefined
								}
							</View>
						: undefined
					}
					{transaction.custodialAccount && transaction.type == 'receive' && transaction.pendingStatus != EPendingStatus.RETURNED ?
							<View>
								<Text style={styles.info}>
									You received these funds from a custodial account upon registration.
								</Text>
							</View>
						: undefined
					}
					<ShowHide
							containerStyle={styles.details}
							showText='Show details'
							hideText='Hide details'>
						{transaction.account ?
							<View style={styles.row}>
								<Text style={styles.title}>Account</Text>
								<Link url={`https://nanocrawler.cc/explorer/account/${transaction.account}`}>
									{transaction.account}
								</Link>
							</View>
							: undefined
						}
						<View style={styles.row}>
							<Text style={styles.title}>Hash</Text>
							<Link url={`https://nanocrawler.cc/explorer/block/${transaction.hash}`}>
								{transaction.hash}
							</Link>
						</View>
						{transaction.custodialAccount ?
							<View style={styles.row}>
								<Text style={styles.title}>Custodial account</Text>
								<Link url={`https://nanocrawler.cc/explorer/account/${transaction.custodialAccount}`}>
									{transaction.custodialAccount}
								</Link>
							</View>
							: undefined
						}
						{transaction.custodialHash ?
							<View style={styles.row}>
								<Text style={styles.title}>Custodial hash</Text>
								<Link url={`https://nanocrawler.cc/explorer/block/${transaction.custodialHash}`}>
									{transaction.custodialHash}
								</Link>
							</View>
							: undefined
						}
					</ShowHide>
					{transaction.custodialAccount
							&& transaction.type == 'send'
							&& (transaction.pendingStatus == EPendingStatus.FILLED
								|| transaction.pendingStatus == EPendingStatus.CREATED) ?
						<View>
							<NalliButton
									text='Cancel transaction'
									solid={true}
									style={styles.cancelButton}
									onPress={this.returnPendingSend} />
									{/* disabled={!moment().subtract(24, 'hours').isBefore(moment.unix(transaction.timestamp))} */}
						</View>
						: undefined
					}
				</ScrollView>
			</NalliModal>
		);
	}

}

const styles = StyleSheet.create({
	content: {
	},
	row: {
		paddingVertical: 5,
		borderBottomWidth: 1,
		borderBottomColor: Colors.borderColor,
	},
	title: {
		fontSize: 16,
		fontFamily: 'OpenSansBold',
	},
	text: {
		fontSize: 16,
		fontFamily: 'OpenSans',
	},
	link: {
		fontSize: 16,
		color: Colors.main,
	},
	info: {
		marginTop: 20,
		fontSize: 16,
		textAlign: 'center',
		fontFamily: 'OpenSans',
	},
	details: {
		marginTop: 30,
		paddingBottom: 10,
	},
	cancelButton: {
		marginTop: 20,
		backgroundColor: Colors.danger,
	},
});
