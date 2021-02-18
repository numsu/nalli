import React, { RefObject } from 'react';
import {
	EmitterSubscription,
	StyleSheet,
	Text,
	TextInput,
	TouchableHighlight,
	View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import CurrencyService from '../service/currency.service';
import VariableStore, { NalliVariable } from '../service/variable-store';
import NanoLogo from './svg/nano-logo';

interface CurrencyInputProps {
	reference: RefObject<any>;
	onChangeText: (value: string, convertedValue: string, convertedCurrency: string) => void;
	onBlur?: () => void;
	style?: any;
	value: string;
	convertedValue: string;
}

interface CurrencyInputState {
	currency: string;
	convertedCurrency: string;
	value: string;
	convertedValue: string;
	borderColor: string;
}

export default class CurrencyInput extends React.Component<CurrencyInputProps, CurrencyInputState> {

	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.state = {
			borderColor: Colors.borderColor,
			currency: 'xrb',
			convertedCurrency: 'usd',
			value: props.value,
			convertedValue: '0',
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		let changes = null;
		if (nextProps.value != prevState.value) {
			changes = { ...changes, value: nextProps.value };
		}
		if (nextProps.convertedValue != prevState.convertedValue) {
			changes = { ...changes, convertedValue: nextProps.convertedValue };
		}
		return changes;
	}

	componentDidMount = () => {
		this.init();
		this.subscriptions.push(VariableStore.watchVariable(NalliVariable.CURRENCY, async () => {
			await this.init();
			this.onChangeText(this.state.value);
		}));
	}

	componentWillUnmount = () => {
		this.subscriptions.forEach(VariableStore.unwatchVariable);
	}

	init = async () => {
		const showFiatDefault = await VariableStore.getVariable(NalliVariable.SHOW_FIAT_DEFAULT, false);
		const currency = await VariableStore.getVariable(NalliVariable.CURRENCY, 'usd');
		if (showFiatDefault) {
			this.setState({ currency: 'xrb', convertedCurrency: currency });
		} else {
			this.setState({ currency: currency, convertedCurrency: 'xrb' });
		}
		await CurrencyService.convert(0, this.state.currency, this.state.convertedCurrency);
	}

	onChangeText = async (val: string) => {
		val = val ? val.replace(',', '.') : val;
		if (val?.split('.')[1]?.length > 6) {
			return;
		}
		this.setState({ value: val }, async () => {
			let convertedValue = await CurrencyService.convert(val, this.state.currency, this.state.convertedCurrency);
			if (isNaN(+convertedValue)) {
				convertedValue = '0';
			}

			this.setState({ convertedValue }, () => {
				this.props.onChangeText(val, convertedValue, this.state.currency);
			});
		});
	}

	onFocus = () => {
		this.setState({ borderColor: Colors.main });
	}

	onBlur = (outerOnBlur) => {
		if (outerOnBlur) {
			outerOnBlur();
		}
		this.setState({ borderColor: Colors.borderColor });
	}

	onCurrencySwitchPress = () => {
		const tempConvertedCurrency = this.state.convertedCurrency;
		let tempConvertedValue = Number(this.state.convertedValue).toString(); // Strip insignificant zeroes
		if (tempConvertedValue == '0') {
			tempConvertedValue = undefined;
		}
		VariableStore.getVariable(NalliVariable.SHOW_FIAT_DEFAULT, false).then(showFiatDefault => {
			VariableStore.setVariable(NalliVariable.SHOW_FIAT_DEFAULT, this.state.currency == (showFiatDefault ? this.state.convertedCurrency : 'xrb'));
		});
		this.setState({
			convertedCurrency: this.state.currency,
			convertedValue: this.state.value,
			currency: tempConvertedCurrency,
			value: tempConvertedValue,
		}, () => this.onChangeText(tempConvertedValue));
	}

	render = () => {
		const { reference, onBlur, style } = this.props;
		const { borderColor, currency, convertedCurrency, convertedValue, value } = this.state;
		return (
			<View style={styles.container}>
				<View>
					<View style={styles.inputContainer}>
						{this.renderCurrencyMark(currency, false)}
						<TextInput
								ref={reference}
								placeholder="0"
								onBlur={() => this.onBlur(onBlur)}
								onFocus={() => this.onFocus()}
								style={[styles.input, style, { borderBottomColor: borderColor }]}
								keyboardType="decimal-pad"
								value={value}
								onChangeText={val => this.onChangeText(val)} />
					</View>
					<TouchableHighlight
							style={styles.switchButton}
							underlayColor={Colors.borderColor}
							onPress={this.onCurrencySwitchPress}>
						<Ionicons
								style={styles.switchIcon}
								name="ios-swap"
								size={32} />
					</TouchableHighlight>
					<View style={[styles.inputConvertedCurrencyContainer, { borderTopColor: borderColor }]}>
						{this.renderCurrencyMark(convertedCurrency, true)}
						<Text style={styles.inputConvertedAmount}>
							{convertedValue || '-.--'}
						</Text>
						<Text />
					</View>
				</View>
			</View>
		);
	}

	renderCurrencyMark = (currency, converted) => {
		switch (currency) {
			case 'xrb':
				return (
					<NanoLogo
							style={[styles.nanoMark]}
							width="40"
							height="20"
							color={(converted ? Colors.inputPlaceholder : Colors.main)} />
				);
			default:
				const icon = CurrencyService.getCurrencyByISO(currency).icon;
				return (
					<Text style={[styles.asciiMark, converted ? styles.convertedMark : {}, icon.length > 1 ? styles.longMark : {}]}>
						{icon}
					</Text>
				);
		}
	}

}

const styles = StyleSheet.create({
	container: {
	},
	inputContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	input: {
		paddingHorizontal: 35,
		paddingVertical: 10,
		color: Colors.main,
		fontSize: 34,
		textAlign: 'center',
		fontFamily: 'OpenSans',
		borderBottomWidth: 1,
		width: '100%',
		zIndex: 100,
	},
	nanoMark: {
		marginRight: -38,
		alignSelf: 'center',
	},
	asciiMark: {
		width: 40,
		marginRight: -38,
		alignSelf: 'center',
		fontSize: 35,
		color: Colors.main,
		fontFamily: 'OpenSans',
	},
	longMark: {
		fontSize: 20,
		fontFamily: 'OpenSansBold',
	},
	convertedMark: {
		color: Colors.inputPlaceholder,
	},
	switchButton: {
		borderWidth: 1,
		borderColor: Colors.main,
		backgroundColor: 'white',
		paddingHorizontal: 9,
		paddingVertical: 7,
		borderRadius: 30,
		alignSelf: 'center',
		position: 'absolute',
		top: 39,
		right: -1,
		zIndex: 200,
	},
	switchIcon: {
		fontSize: 20,
		color: Colors.main,
		marginRight: 1,
		transform: [{ rotate: '90deg' }],
	},
	inputConvertedCurrencyContainer: {
		borderTopWidth: 1,
		marginLeft: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 2,
		paddingTop: 8,
		zIndex: 100,
	},
	inputConvertedCurrency: {
		fontSize: 34,
		color: Colors.inputPlaceholder,
	},
	inputConvertedAmount: {
		alignSelf: 'center',
		fontSize: 34,
		fontFamily: 'OpenSans',
		color: Colors.inputPlaceholder,
	},
});
