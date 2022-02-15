import * as Haptics from 'expo-haptics';
import { tools } from 'nanocurrency-web';
import React from 'react';
import { Alert, EmitterSubscription, StyleSheet, TouchableHighlight, View } from 'react-native';
import Carousel from 'react-native-snap-carousel';

import Colors from '../constants/colors';
import layout from '../constants/layout';
import ContactsService from '../service/contacts.service';
import CurrencyService from '../service/currency.service';
import RequestService, { Request } from '../service/request.service';
import VariableStore, { NalliVariable } from '../service/variable-store';
import { DateUtil } from '../util/date.util';
import Card from './card.component';
import NalliButton from './nalli-button.component';
import NalliText, { ETextSize } from './text.component';

interface RequestsProps {
	onAcceptPress: (request: Request) => void;
}

interface RequestsState {
	requests: Request[];
}

export default class NalliRequests extends React.Component<RequestsProps, RequestsState> {

	subscriptions: EmitterSubscription[] = [];
	interval;

	constructor(props) {
		super(props);
		this.state = {
			requests: [],
		};
	}

	componentDidMount = () => {
		this.fetchRequests();
		this.subscriptions.push(VariableStore.watchVariable(NalliVariable.APP_STATE, () => this.fetchRequests()));
		// Update component every minute
		this.interval = setInterval(() => this.forceUpdate(), 1000 * 60);
	}

	componentWillUnmount() {
		this.subscriptions.forEach(VariableStore.unwatchVariable);
		clearInterval(this.interval);
	}

	fetchRequests = async () => {
		const requests = await RequestService.getRequestsReceived();
		this.setState({ requests });
		if (this.state.requests.length > requests.length) {
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
		const { requests } = this.state;
		const { onAcceptPress } = this.props;

		return (
			<Carousel
					layout={'tinder'}
					sliderWidth={layout.window.width}
					itemWidth={layout.window.width - 40}
					activeSlideAlignment={'start'}
					containerCustomStyle={styles.carouselContainer}
					lockScrollWhileSnapping={false}
					shouldOptimizeUpdates
					layoutCardOffset={8}
					data={requests}
					renderItem={(data: { item: Request; index: number }) => {
						const amount = CurrencyService.formatNanoAmount(Number(tools.convert(data.item.amount, 'RAW', 'NANO')));
						const contact = ContactsService.getContactByHash(data.item.phoneHash);
						const senderName = contact.name || 'Someone not in your contacts';
						return (
							<TouchableHighlight style={{ marginLeft: 3 }}>
								<Card style={styles.card} contentContainerStyle={styles.cardContainer} title='Request'>
									<View style={styles.text}>
										<NalliText size={ETextSize.H2}>{senderName} requested <NalliText style={{ color: Colors.main }} size={ETextSize.H2}>Ӿ&nbsp;{amount}</NalliText> from you {DateUtil.getRelativeTime(data.item.created).toLowerCase()}.</NalliText>
										<NalliText style={styles.marginTop}>{data.item.message}</NalliText>
									</View>
									<View style={styles.actions}>
										<NalliButton small solid text='Accept' onPress={() => onAcceptPress(data.item)} />
										<NalliButton style={styles.marginTop} small text='Ignore' onPress={() => this.confirmIgnoreRequest(data.item)} />
									</View>
								</Card>
							</TouchableHighlight>
						);
					}} />
		);
	}

}

const styles = StyleSheet.create({
	carouselContainer: {
		paddingHorizontal: 20,
		paddingTop: 18,
		paddingBottom: 18,
		marginLeft: -3,
		marginTop: -20,
	},
	card: {
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