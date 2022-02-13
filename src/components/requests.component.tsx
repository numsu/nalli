import * as Haptics from 'expo-haptics';
import { tools } from 'nanocurrency-web';
import React from 'react';
import { Alert, EmitterSubscription, StyleSheet, View } from 'react-native';

import Colors from '../constants/colors';
import ContactsService from '../service/contacts.service';
import CurrencyService from '../service/currency.service';
import RequestService, { Request } from '../service/request.service';
import VariableStore, { NalliVariable } from '../service/variable-store';
import Card from './card.component';
import NalliButton from './nalli-button.component';
import NalliText, { ETextSize } from './text.component';

interface RequestsProps {
}

interface RequestsState {
	requests: Request[];
}

export default class NalliRequests extends React.Component<RequestsProps, RequestsState> {

	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.state = {
			requests: [],
		};
	}

	componentDidMount = () => {
		this.fetchRequests();
		this.subscriptions.push(VariableStore.watchVariable(NalliVariable.APP_STATE, () => this.fetchRequests()));
	}

	componentWillUnmount() {
		this.subscriptions.forEach(VariableStore.unwatchVariable);
	}

	fetchRequests = async () => {
		const requests = await RequestService.getRequestsReceived();
		this.setState({ requests });
		if (this.state.requests.length === 0 && requests.length > 0) {
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
		}
	}

	confirmIgnoreRequest = (request: Request) => {
		Alert.alert(
			'Confirm',
			'Are you sure you want to ignore this request?',
			[
				{ text: 'No' },
				{ text: 'Yes', onPress: () => this.ignoreRequest(request)}
			],
		);
	}

	ignoreRequest = async (request: Request) => {
		await RequestService.ignoreRequest(request.requestId);
		this.setState({ requests: this.state.requests.filter(req => req.requestId != request.requestId) });
	}

	render = () => {
		if (this.state.requests.length === 0) {
			return <></>;
		}

		const displayedRequest = this.state.requests[0];
		const amount = CurrencyService.formatNanoAmount(Number(tools.convert(displayedRequest.amount, 'RAW', 'NANO')));
		const contact = ContactsService.getContactByHash(displayedRequest.phoneHash);
		const senderName = contact.name || 'Unknown';
		return (
			<Card style={styles.card} contentContainerStyle={styles.cardContainer} title='New request'>
				<View style={styles.text}>
					<NalliText size={ETextSize.H2}>{senderName} has requested <NalliText style={{ color: Colors.main }} size={ETextSize.H2}>Ӿ {amount}</NalliText> from you</NalliText>
					<NalliText style={styles.marginTop}>{displayedRequest.message}</NalliText>
				</View>
				<View style={styles.actions}>
					<NalliButton style={styles.marginTop} small solid text='Accept' />
					<NalliButton style={styles.marginTop} small text='Ignore' onPress={() => this.confirmIgnoreRequest(displayedRequest)} />
				</View>
			</Card>
		);
	}

}

const styles = StyleSheet.create({
	card: {
		marginHorizontal: 20,
	},
	cardContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	text: {
		width: '70%',
	},
	actions: {
		width: '23%',
	},
	marginTop: {
		marginTop: 8,
	},
});