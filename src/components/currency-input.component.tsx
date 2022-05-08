import React, { RefObject } from 'react';
import {
	EmitterSubscription,
	StyleSheet,
	Text,
	TextInput,
	TouchableHighlight,
	View,
} from 'react-native';

import Colors from '../constants/colors';
import CurrencyService from '../service/currency.service';
import VariableStore, { NalliVariable } from '../service/variable-store';
import { NalliAccount } from '../service/wallet-handler.service';
import NalliIcon, { IconType } from './icon.component';
import NalliText from './text.component';

interface CurrencyInputProps {
	convertedValue: string;
	disabled?: boolean;
	hideMaxButton?: boolean;
	onBlur?: () => void;
	onChangeText: (value: string, convertedValue: string, convertedCurrency: string) => void;
	reference?: RefObject<any>;
	style?: any;
	value: string;
}

interface CurrencyInputState {
	borderColor: string;
	convertedCurrency: string;
	convertedValue: string;
	currency: string;
	value: string;
}

export default class CurrencyInput extends React.PureComponent<CurrencyInputProps, CurrencyInputState> {

	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.state = {
			borderColor: Colors.borderColor,
			convertedCurrency: 'usd',
			convertedValue: '0',
			currency: 'xno',
			value: props.value,
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		let changes = null;
		if (nextProps.value != prevState.value) {
			changes = { value: nextProps.value };
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
		this.subscriptions.push(VariableStore.watchVariable(NalliVariable.SHOW_FIAT_DEFAULT, async () => {
			await this.init();
		}));
	}

	componentWillUnmount = () => {
		this.subscriptions.forEach(VariableStore.unwatchVariable);
	}

	init = async () => {
		const showFiatDefault = await VariableStore.getVariable(NalliVariable.SHOW_FIAT_DEFAULT, false);
		const currency = await VariableStore.getVariable(NalliVariable.CURRENCY, 'usd');
		if (showFiatDefault) {
			this.setState({ currency: currency, convertedCurrency: 'xno' });
		} else {
			this.setState({ currency: 'xno', convertedCurrency: currency });
		}
		await CurrencyService.convert('0', this.state.currency, this.state.convertedCurrency);
	}

	forceXno = () => {
		this.onChangeText(this.props.value, true, true);
	}

	onChangeText = async (val: string, strip = true, forceXno = false) => {
		val = val ? val.replace(',', '.') : val;
		const isAddition = val?.length > this.state.value?.length;
		if (strip && isAddition && val?.split('.')[1]?.length > 6) {
			return;
		}
		this.setState({ value: val }, async () => {
			let convertedValue;
			if (forceXno && this.state.currency != 'xno') {
				convertedValue = await CurrencyService.convert(val, 'xno', this.state.currency);
			} else {
				convertedValue = await CurrencyService.convert(val, this.state.currency, this.state.convertedCurrency);
			}
			if (isNaN(+convertedValue)) {
				convertedValue = '0';
			}

			if (forceXno && this.state.currency != 'xno') {
				this.setState({ convertedValue: val, value: convertedValue }, () => {
					this.props.onChangeText(convertedValue, val, this.state.currency);
				});
			} else {
				this.setState({ convertedValue }, () => {
					this.props.onChangeText(val, convertedValue, this.state.currency);
				});
			}
		});
	}

	onFocus = () => {
		this.setState({ borderColor: Colors.main });
	}

	onBlur = () => {
		if (this.props.onBlur) {
			this.props.onBlur();
		}
		this.setState({ borderColor: Colors.borderColor });
	}

	onSendMaxButton = async () => {
		const index = await VariableStore.getVariable<number>(NalliVariable.SELECTED_ACCOUNT_INDEX, 0);
		const accountsBalances = await VariableStore.getVariable<NalliAccount[]>(NalliVariable.ACCOUNTS_BALANCES, []);
		const balance = accountsBalances[index].balance;
		this.onChangeText(balance, false, this.state.currency != 'xno');
	}

	onCurrencySwitchPress = () => {
		const tempConvertedCurrency = this.state.convertedCurrency;
		let tempConvertedValue = Number(this.state.convertedValue).toString(); // Strip insignificant zeroes
		if (tempConvertedValue == '0') {
			tempConvertedValue = undefined;
		}
		VariableStore.getVariable(NalliVariable.SHOW_FIAT_DEFAULT, false).then(() => {
			const newValue = this.state.convertedCurrency == 'xno';
			VariableStore.setVariable(NalliVariable.SHOW_FIAT_DEFAULT, newValue);
		});
		this.setState({
			convertedCurrency: this.state.currency,
			convertedValue: this.state.value,
			currency: tempConvertedCurrency,
			value: tempConvertedValue,
		}, () => this.onChangeText(tempConvertedValue));
	}

	render = () => {
		const { disabled, hideMaxButton, reference, style } = this.props;
		const { borderColor, currency, convertedCurrency, convertedValue, value } = this.state;

		return (
			<View>
				<View style={styles.inputContainer}>
					{this.renderCurrencySign(currency, false)}
					<TextInput
							editable={!disabled}
							ref={reference}
							placeholder='0'
							onBlur={this.onBlur}
							onFocus={this.onFocus}
							allowFontScaling={false}
							placeholderTextColor={Colors.inputPlaceholder}
							style={[styles.input, style, { borderBottomColor: borderColor }]}
							keyboardType='decimal-pad'
							value={value}
							onChangeText={this.onChangeText} />
				</View>
				{!hideMaxButton && !disabled &&
					<TouchableHighlight
							style={styles.sendMaxButton}
							underlayColor={Colors.borderColor}
							onPress={this.onSendMaxButton}>
						<NalliText style={styles.maxIcon}>MAX</NalliText>
					</TouchableHighlight>
				}
				{!disabled &&
					<TouchableHighlight
							style={[ styles.switchButton, hideMaxButton ? styles.switchButtonMiddle : undefined ]}
							underlayColor={Colors.borderColor}
							onPress={this.onCurrencySwitchPress}>
						<NalliIcon style={styles.switchIcon} icon='ios-swap-horizontal' size={32} type={IconType.ION} />
					</TouchableHighlight>
				}
				<View style={[styles.inputConvertedCurrencyContainer, { borderTopColor: borderColor }]}>
					{this.renderCurrencySign(convertedCurrency, true)}
					<Text style={styles.inputConvertedAmount}>
						{convertedValue || '-.--'}
					</Text>
					<Text />
				</View>
			</View>
		);
	}

	renderCurrencySign = (currency, converted) => {
		switch (currency) {
			case 'xno':
				return (
					<Text style={styles.asciiSign}>
						Ӿ
					</Text>
				);
			default:
				const icon = CurrencyService.getCurrencyByISO(currency).icon;
				return (
					<Text style={[styles.asciiSign, converted ? styles.convertedSign : {}, icon.length > 1 ? styles.longSign : {}]}>
						{icon}
					</Text>
				);
		}
	}

}

const styles = StyleSheet.create({
	inputContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	input: {
		paddingHorizontal: 35,
		paddingVertical: 10,
		color: Colors.main,
		fontSize: 32,
		textAlign: 'center',
		fontFamily: 'OpenSans',
		borderBottomWidth: 1,
		width: '100%',
		zIndex: 100,
	},
	asciiSign: {
		width: 40,
		marginRight: -38,
		alignSelf: 'center',
		fontSize: 32,
		color: Colors.main,
		fontFamily: 'OpenSans',
	},
	longSign: {
		fontSize: 18,
		fontFamily: 'OpenSansBold',
	},
	convertedSign: {
		color: Colors.inputPlaceholder,
	},
	sendMaxButton: {
		borderWidth: 1,
		borderColor: Colors.main,
		backgroundColor: 'white',
		paddingHorizontal: 9,
		paddingVertical: 13,
		borderRadius: 30,
		alignSelf: 'center',
		position: 'absolute',
		top: 10,
		right: 0,
		zIndex: 200,
	},
	switchButton: {
		borderWidth: 1,
		borderColor: Colors.main,
		backgroundColor: 'white',
		paddingHorizontal: 11,
		paddingVertical: 10,
		borderRadius: 30,
		alignSelf: 'center',
		position: 'absolute',
		top: 74,
		right: 0,
		zIndex: 200,
	},
	switchButtonMiddle: {
		top: 42,
	},
	maxIcon: {
		fontSize: 9,
		color: Colors.main,
		fontFamily: 'OpenSansBold',
	},
	switchIcon: {
		fontSize: 16,
		color: Colors.main,
		marginRight: 1,
		transform: [{ rotate: '90deg' }],
	},
	inputConvertedCurrencyContainer: {
		borderTopWidth: 1,
		width: '100%',
		marginLeft: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 2,
		paddingTop: 8,
		zIndex: 100,
	},
	inputConvertedCurrency: {
		fontSize: 32,
		color: Colors.inputPlaceholder,
	},
	inputConvertedAmount: {
		alignSelf: 'center',
		fontSize: 32,
		fontFamily: 'OpenSans',
		color: Colors.inputPlaceholder,
	},
});
