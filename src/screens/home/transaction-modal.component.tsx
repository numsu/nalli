import moment from 'moment';
import React from 'react';
import {
	Alert,
	StyleSheet,
	View,
} from 'react-native';

import Link from '../../components/link.component';
import Message from '../../components/message.component';
import NalliModal from '../../components/modal.component';
import NalliButton from '../../components/nalli-button.component';
import ShowHide from '../../components/show-hide.component';
import NalliText, { ETextSize } from '../../components/text.component';
import Colors from '../../constants/colors';
import ContactsService from '../../service/contacts.service';
import WalletService, { EPendingStatus, WalletTransaction } from '../../service/wallet.service';

export interface TransactionModalProps {
	contactName: string;
	transaction: WalletTransaction;
	isOpen: boolean;
	onClose: () => void;
}

export interface TransactionModalState {
	isOpen: boolean;
	transaction: WalletTransaction;
}

export default class TransactionModal extends React.PureComponent<TransactionModalProps, TransactionModalState> {

	constructor(props) {
		super(props);
		this.state = {
			isOpen: props.isOpen,
			transaction: props.transaction,
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen };
		}
		return null;
	}

	close = () => {
		this.props.onClose();
	}

	componentDidUpdate = () => {
		if (this.props.transaction != this.state.transaction) {
			this.setState({ transaction: this.props.transaction });
		}
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
		const { contactName } = this.props;
		const { isOpen, transaction } = this.state;

		let phoneNumber;
		if (transaction.phoneHash && contactName != 'Unknown' && transaction.pendingStatus != EPendingStatus.RETURNED) {
			phoneNumber = ContactsService.getContactByHash(transaction.phoneHash).fullNumber;
		}

		return (
			<NalliModal
					isOpen={isOpen}
					onClose={this.close}
					header='Transaction'>
				<View style={styles.content}>
					<View style={styles.row}>
						<NalliText size={ETextSize.H2}>Time</NalliText>
						<NalliText>
							{moment.unix(transaction.timestamp).format('D MMMM YYYY HH:mm:ss')}
						</NalliText>
					</View>
					<View style={styles.row}>
						<NalliText size={ETextSize.H2}>
							{transaction.type == 'send' ? 'Recipient' : 'Sender'}
						</NalliText>
						<NalliText>
							{contactName}
						</NalliText>
						{!!phoneNumber &&
							<NalliText>
								{phoneNumber}
							</NalliText>
						}
					</View>
					<View style={styles.row}>
						<NalliText size={ETextSize.H2}>
							{transaction.type == 'send' ? 'Sent' : 'Received'}
						</NalliText>
						{transaction.type == 'send' ?
							<NalliText>
								Ӿ&nbsp;{transaction.amount}
							</NalliText> :
							<NalliText>
								Ӿ&nbsp;{transaction.amount}
							</NalliText>
						}
					</View>
					{!!transaction.message &&
						<View style={styles.row}>
							<Message
									disableEditing
									message={transaction.message} />
						</View>
					}
					{transaction.pendingStatus == EPendingStatus.CREATED || transaction.pendingStatus == EPendingStatus.FILLED &&
						<View style={styles.row}>
							<NalliText size={ETextSize.H2}>Custodial transaction status</NalliText>
							<NalliText>Funds are in custodial account</NalliText>
						</View>
					}
					{transaction.pendingStatus == EPendingStatus.SETTLED && transaction.type == 'send' &&
						<View style={styles.row}>
							<NalliText size={ETextSize.H2}>Custodial transaction status</NalliText>
							<NalliText>Funds are received by the recipient</NalliText>
						</View>
					}
					{transaction.pendingStatus == EPendingStatus.RETURNED &&
						<View style={styles.row}>
							<NalliText size={ETextSize.H2}>Custodial transaction status</NalliText>
							<NalliText>Funds are returned to you</NalliText>
						</View>
					}
					<ShowHide
							containerStyle={styles.details}
							showText='Show details'
							hideText='Hide details'>
						{transaction.custodialAccount && transaction.type == 'send' &&
							<View>
								<NalliText style={styles.info}>
									When sending funds to a user who has not yet registered to the service,
									the funds are first sent to a temporary custodial account.
								</NalliText>
								{transaction.pendingStatus != EPendingStatus.RETURNED &&
									<NalliText style={styles.info}>
										You are able to cancel the transaction and return your funds up until the recipient has claimed them.
									</NalliText>
								}
							</View>
						}
						{!!transaction.custodialAccount && transaction.type == 'receive' && transaction.pendingStatus != EPendingStatus.RETURNED &&
							<View>
								<NalliText style={styles.info}>
									You received these funds from a custodial account upon registration.
								</NalliText>
							</View>
						}
						{!!transaction.account &&
							<View style={styles.row}>
								<NalliText size={ETextSize.H2}>Account</NalliText>
								<Link url={`https://nanolooker.com/account/${transaction.account}`}>
									{transaction.account}
								</Link>
							</View>
						}
						<View style={styles.row}>
							<NalliText size={ETextSize.H2}>Hash</NalliText>
							<Link url={`https://nanolooker.com/block/${transaction.hash}`}>
								{transaction.hash}
							</Link>
						</View>
						{!!transaction.custodialAccount &&
							<View style={styles.row}>
								<NalliText size={ETextSize.H2}>Custodial account</NalliText>
								<Link url={`https://nanolooker.com/account/${transaction.custodialAccount}`}>
									{transaction.custodialAccount}
								</Link>
							</View>
						}
						{!!transaction.custodialHash &&
							<View style={[styles.row]}>
								<NalliText size={ETextSize.H2}>Custodial hash</NalliText>
								<Link url={`https://nanolooker.com/block/${transaction.custodialHash}`}>
									{transaction.custodialHash}
								</Link>
							</View>
						}
						{!!transaction.custodialAccount
								&& transaction.type == 'send'
								&& (transaction.pendingStatus == EPendingStatus.FILLED
									|| transaction.pendingStatus == EPendingStatus.CREATED) &&
							<View>
								<NalliButton
										text='Cancel transaction'
										solid
										style={styles.cancelButton}
										onPress={this.returnPendingSend} />
							</View>
						}
					</ShowHide>
				</View>
			</NalliModal>
		);
	}

}

const styles = StyleSheet.create({
	content: {
		paddingBottom: 20,
	},
	row: {
		paddingVertical: 5,
	},
	info: {
		marginBottom: 15,
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
