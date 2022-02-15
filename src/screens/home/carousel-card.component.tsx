import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert, EmitterSubscription, StyleSheet, TouchableOpacity, View } from 'react-native';

import Card from '../../components/card.component';
import NalliIcon, { IconType } from '../../components/icon.component';
import Loading, { LoadingStyle } from '../../components/loading.component';
import NalliButton from '../../components/nalli-button.component';
import NalliText from '../../components/text.component';
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
}

export default class CarouselCard extends React.Component<CarouselCardProps, CarouselCardState> {

	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.state = {
			displayedCurrency: 'nano',
			currency: '$',
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

	onChangeDisplayedCurrencyPress = () => {
		if (this.state.displayedCurrency == 'hidden') {
			return;
		}

		let displayedCurrency;
		if (this.state.displayedCurrency == 'nano') {
			displayedCurrency = 'fiat';
		} else {
			displayedCurrency = 'nano';
		}
		VariableStore.setVariable(NalliVariable.DISPLAYED_CURRENCY, displayedCurrency);
		this.setState({ displayedCurrency });
	}

	hideAmount = () => {
		let displayedCurrency;
		if (this.state.displayedCurrency == 'hidden') {
			displayedCurrency = 'nano';
		} else {
			displayedCurrency = 'hidden';
		}
		VariableStore.setVariable(NalliVariable.DISPLAYED_CURRENCY, displayedCurrency);
		this.setState({ displayedCurrency });
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
	}

	onHomeAccountPress = () => {
		Alert.alert('Home account', 'This is the account which will receive when someone sends to your phone number or when you send a request');
	}

	render = () => {
		const {
			accountActive,
			accountIndex,
			balance,
			isLastAccount,
			onAddNewAccount,
			onHideAccount,
			price,
			processing,
			showAddAccountView,
		} = this.props;
		const { displayedCurrency, currency } = this.state;
		const formattedBalance = CurrencyService.formatNanoAmount(+balance);

		if (!showAddAccountView) {
			let headerAddonComponent;
			if (accountActive) {
				headerAddonComponent = (
					<TouchableOpacity
							onPress={this.onHomeAccountPress}
							style={styles.homeAccount}>
						<NalliIcon type={IconType.MATERIAL} icon='home' size={25} style={{ color: Colors.main }} />
					</TouchableOpacity>
				);
			} else if (isLastAccount) {
				headerAddonComponent = (
					<TouchableOpacity
							style={styles.hideAccount}
							onPress={() => onHideAccount(accountIndex)}>
						<NalliIcon type={IconType.FONT_AWESOME5} icon='eye-slash' size={17} style={{ color: Colors.main }} />
					</TouchableOpacity>
				);
			}

			return (
				<Card
						onPress={this.onChangeDisplayedCurrencyPress}
						onLongPress={this.hideAmount}
						title={`Account balance`}
						headerAddonComponent={headerAddonComponent}>
					<View style={styles.balancewrapper}>
						{(displayedCurrency == 'nano' || displayedCurrency == 'hidden') &&
							<NalliText style={styles.currencySign}>Ӿ</NalliText>
						}
						{displayedCurrency == 'fiat' &&
							<NalliText style={styles.currencySign}>{currency}</NalliText>
						}
						<NalliText style={styles.balance}>
							{displayedCurrency == 'nano' &&
								formattedBalance
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
						</NalliText>
						{processing &&
							<View style={styles.loadingContainer}>
								<Loading style={LoadingStyle.NONE} show />
							</View>
						}
					</View>
				</Card>
			);
		} else {
			return (
				<Card title={`Show account #${accountIndex}`}>
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
	homeAccount: {
		position: 'absolute',
		right: 16,
		top: 14,
	},
	hideAccount: {
		position: 'absolute',
		right: 18,
		top: 16,
	},
	balancewrapper: {
		flexDirection: 'row',
	},
	balance: {
		color: Colors.main,
		fontSize: 34,
	},
	currencySign: {
		fontSize: 34,
		marginRight: 20,
		color: Colors.main,
	},
	loadingContainer: {
		height: 91,
		width: 75,
		marginTop: -20,
		marginBottom: -23,
	},
	addNewAccountButton: {
		alignSelf: 'center',
	},
});
