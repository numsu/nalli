import React from 'react';
import { ActivityIndicator, Alert, EmitterSubscription, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';

import Card from '../../components/card.component';
import NalliButton from '../../components/nalli-button.component';
import NanoLogo from '../../components/svg/nano-logo';
import Colors from '../../constants/colors';
import CurrencyService from '../../service/currency.service';
import VariableStore, { NalliVariable } from '../../service/variable-store';

interface CarouselCardProps {
	price: number;
	balance: string;
	showAddAccountView: boolean;
	isLastAccount: boolean;
	accountActive: boolean;
	accountIndex: number;
	processing: boolean;
	onAddNewAccount: (index: number) => void;
	onHideAccount: (index: number) => void;
}

interface CarouselCardState {
	displayedCurrency: string;
	currency: string;
	processing: boolean;
}

export default class CarouselCard extends React.Component<CarouselCardProps, CarouselCardState> {

	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.state = {
			displayedCurrency: 'nano',
			currency: '$',
			processing: false,
		};
	}

	componentDidMount = () => {
		this.init();
		this.subscriptions.push(VariableStore.watchVariable(NalliVariable.CURRENCY, () => this.init()));
		this.subscriptions.push(VariableStore.watchVariable(NalliVariable.DISPLAYED_CURRENCY, () => this.init()));
	}

	componentWillUnmount = () => {
		this.subscriptions.forEach(VariableStore.unwatchVariable);
	}

	init = async () => {
		const displayedCurrency = await VariableStore.getVariable(NalliVariable.DISPLAYED_CURRENCY, 'nano');
		const currency = await VariableStore.getVariable(NalliVariable.CURRENCY, 'usd');
		this.setState({ displayedCurrency, currency: CurrencyService.getCurrencyByISO(currency).icon });
	}

	onChangeDisplayedCurrencyPress = async () => {
		let displayedCurrency;
		if (this.state.displayedCurrency == 'nano') {
			displayedCurrency = 'fiat';
		} else if (this.state.displayedCurrency == 'fiat') {
			displayedCurrency = 'hidden';
		} else {
			displayedCurrency = 'nano';
		}
		await VariableStore.setVariable(NalliVariable.DISPLAYED_CURRENCY, displayedCurrency);
		this.setState({ displayedCurrency });
	}

	onHomeAccountPress = () => {
		Alert.alert('Home account', 'This is the account which will receive when someone sends to your phone number');
	}

	render = () => {
		const {
			price,
			balance,
			showAddAccountView,
			accountIndex,
			accountActive,
			processing,
			onAddNewAccount,
			onHideAccount,
			isLastAccount,
		} = this.props;
		const { displayedCurrency, currency } = this.state;

		if (!showAddAccountView) {
			return (
				<Card style={styles.row} title={`Account balance`}>
					<TouchableOpacity
							style={styles.changeDisplayedCurrencyButton}
							onPress={this.onChangeDisplayedCurrencyPress}>
						<Ionicons
								style={styles.changeDisplayedCurrencyArrow}
								name="ios-swap"
								size={25} />
					</TouchableOpacity>
					{accountActive &&
						<TouchableOpacity
								onPress={this.onHomeAccountPress}
								style={styles.homeAccount}>
							<Text style={{ color: Colors.main }}>
								<MaterialIcons size={25} name='home' />
							</Text>
						</TouchableOpacity>
					}
					{isLastAccount &&
						<TouchableOpacity
								style={styles.hideAccount}
								onPress={() => onHideAccount(accountIndex)}>
							<Text style={{ color: Colors.main }}>
								<FontAwesome5 size={17} name='eye-slash' />
							</Text>
						</TouchableOpacity>
					}
					<View style={styles.balancewrapper}>
						{(displayedCurrency == 'nano' || displayedCurrency == 'hidden') &&
							<NanoLogo style={styles.nanomark} />
						}
						{displayedCurrency == 'fiat' &&
							<Text style={styles.usdmark}>{currency}</Text>
						}
						<Text style={styles.balance}>
							{displayedCurrency == 'nano' &&
								balance
							}
							{displayedCurrency == 'fiat' && price &&
								(price * +balance).toFixed(2)
							}
							{displayedCurrency == 'fiat' && !price &&
								'-.--'
							}
							{displayedCurrency == 'hidden' &&
								'****'
							}
						</Text>
						{processing &&
							<ActivityIndicator size={40} color={Colors.main} />
						}
					</View>
				</Card>
			);
		} else {
			return (
				<Card style={styles.row} title={`Show account #${accountIndex}`}>
					<View style={styles.balancewrapper}>
						<NalliButton
								onPress={() => onAddNewAccount(accountIndex)}
								text='Show account'
								icon='ios-add'
								style={styles.addNewAccountButton} />
					</View>
				</Card>
			);
		}
	}

}

const styles = StyleSheet.create({
	row: {
		marginTop: 10,
		marginBottom: 10,
	},
	homeAccount: {
		position: 'absolute',
		right: 48,
		top: 14,
	},
	hideAccount: {
		position: 'absolute',
		right: 50,
		top: 16,
	},
	changeDisplayedCurrencyButton: {
		position: 'absolute',
		top: 13,
		right: 16,
	},
	changeDisplayedCurrencyArrow: {
		color: Colors.main,
	},
	balancewrapper: {
		flexDirection: 'row',
	},
	balance: {
		color: Colors.main,
		fontSize: 40,
		fontFamily: 'OpenSans',
	},
	usdmark: {
		fontSize: 36,
		marginRight: 20,
		marginTop: 2,
		color: Colors.main,
		fontFamily: 'OpenSans',
	},
	nanomark: {
		marginTop: 17,
		marginRight: 10,
	},
	addNewAccountButton: {
		alignSelf: 'center',
	},
});
