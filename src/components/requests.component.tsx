import * as Haptics from 'expo-haptics';
import { box, tools } from 'nanocurrency-web';
import React from 'react';
import { Alert, EmitterSubscription, StyleSheet, TouchableHighlight, View } from 'react-native';
import Carousel from 'react-native-snap-carousel';

import Colors from '../constants/colors';
import layout from '../constants/layout';
import { NalliAppState } from '../screens/home/privacy-shield.component';
import AuthStore from '../service/auth-store';
import ContactsService from '../service/contacts.service';
import CurrencyService from '../service/currency.service';
import RequestService, { Request } from '../service/request.service';
import VariableStore, { NalliVariable } from '../service/variable-store';
import WalletStore from '../service/wallet-store';
import { DateUtil } from '../util/date.util';
import Card from './card.component';
import NalliIcon, { IconType } from './icon.component';
import NalliButton from './nalli-button.component';
import NalliText, { ETextSize } from './text.component';

interface RequestsProps {
	onAcceptPress: (request: Request) => void;
}

interface RequestsState {
	requests: Request[];
	hasMore: boolean;
}

export default class NalliRequests extends React.PureComponent<RequestsProps, RequestsState> {

	subscriptions: EmitterSubscription[] = [];
	interval;

	constructor(props) {
		super(props);
		this.state = {
			requests: [],
			hasMore: false,
		};
	}

	componentDidMount = () => {
		this.fetchRequests();
		this.subscriptions.push(VariableStore.watchVariable<NalliAppState>(NalliVariable.APP_STATE, state => {
			if (state == NalliAppState.ACTIVE) {
				this.fetchRequests();
			}
		}));
		// Update component every minute
		this.interval = setInterval(() => this.forceUpdate(), 1000 * 60);
	}

	componentWillUnmount() {
		this.subscriptions.forEach(VariableStore.unwatchVariable);
		clearInterval(this.interval);
	}

	fetchRequests = async () => {
		if (!await AuthStore.isPhoneNumberFunctionsEnabled()) {
			return;
		}

		const { requests, hasMore } = await RequestService.getRequestsReceived();
		if (requests.length > 0) {
			if (this.state.requests.length == 0
					|| requests[0].requestId != this.state.requests[0].requestId) {
				await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
			}
		}

		const privateKey = (await WalletStore.getWallet()).accounts[0].privateKey; // Always the home account
		const decryptedRequests = requests.map(request => {
			if (!!request.message) {
				request.message = box.decrypt(request.message, request.address, privateKey);
			}
			return request;
		});

		if (requests.length == 10 && hasMore) {
			decryptedRequests.push({} as Request); // Display the has more card
		}
		this.setState({ requests: decryptedRequests, hasMore });
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
		if (this.state.requests.length == 10 && this.state.hasMore) {
			this.fetchRequests();
		}
	}

	render = () => {
		if (this.state.requests.length === 0) {
			return null;
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
					enableMomentum
					decelerationRate={0.9}
					shouldOptimizeUpdates
					layoutCardOffset={8}
					data={requests}
					keyExtractor={(data, _) => data.requestId}
					renderItem={(data: { item: Request; index: number }) => {
						if (data.item?.requestId) {
							const amount = CurrencyService.formatNanoAmount(Number(tools.convert(data.item.amount, 'RAW', 'NANO')));
							const contact = ContactsService.getContactByHash(data.item.phoneHash);
							const senderName = contact?.name || 'Someone not in your contacts';
							return (
								<TouchableHighlight style={{ marginLeft: 3 }}>
									<Card style={styles.card} contentContainerStyle={styles.cardContainer} title='Request'>
										<View style={styles.text}>
											<NalliText size={ETextSize.H2}>{senderName} requested <NalliText style={{ color: Colors.main }} size={ETextSize.H2}>Ӿ&nbsp;{amount}</NalliText> from you {DateUtil.getRelativeTime(data.item.created).toLowerCase()}.</NalliText>
											{!!data.item.message &&
												<NalliText style={styles.marginTop}>
													<NalliIcon style={styles.chatIcon} icon='chatbox' type={IconType.ION} size={12} />&nbsp;&nbsp;{data.item.message}
												</NalliText>
											}
										</View>
										<View style={styles.actions}>
											<NalliButton small solid text='Accept' onPress={() => onAcceptPress(data.item)} />
											<NalliButton style={styles.marginTop} small text='Ignore' onPress={() => this.confirmIgnoreRequest(data.item)} />
										</View>
									</Card>
								</TouchableHighlight>
							);
						} else {
							return (
								<TouchableHighlight style={{ marginLeft: 3 }}>
									<Card style={styles.card} contentContainerStyle={styles.cardContainer} title='Request'>
										<NalliText size={ETextSize.H2}>There are more requests to be fetched. Handle some of the newer requests to fetch more.</NalliText>
									</Card>
								</TouchableHighlight>
							);
						}
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
	chatIcon: {
		color: Colors.main,
	},
});