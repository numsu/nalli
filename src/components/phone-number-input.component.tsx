import * as Localization from 'expo-localization';
import React from 'react';
import {
	Platform,
	StyleSheet,
	View,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import RNPickerSelect from 'react-native-picker-select';

import Colors from '../constants/colors';
import layout from '../constants/layout';
import ContactsService, { CountryItem } from '../service/contacts.service';
import VariableStore, { NalliVariable } from '../service/variable-store';

interface PhoneNumberInputProps {
	onChangeNumber: (val: string) => void;
	onChangeCountry: (val: string) => void;
	value: string;
	countryInputContainerStyle?: any;
	countryTextInputStyle?: any;
	countryInputTextStyle?: any;
}

interface PhoneNumberInputState {
	borderColor: string;
	cca2: any;
}

export default class PhoneNumberInput extends React.PureComponent<PhoneNumberInputProps, PhoneNumberInputState> {

	countries: CountryItem[];

	constructor(props) {
		super(props);
		this.state = {
			borderColor: Colors.borderColor,
			cca2: 'US',
		};
	}

	componentDidMount = () => {
		this.init();
		this.countries = ContactsService.getCountriesList();
	}

	init = async () => {
		const country = (await VariableStore.getVariable<string>(NalliVariable.COUNTRY)) || Localization.locale.split('-')[1] || 'US';
		this.selectCountry(country.toUpperCase(), this.props.onChangeCountry);
	}

	onFocus = () => {
		this.setState({ borderColor: Colors.main });
	}

	onBlur = (outerBlurEvent) => {
		if (outerBlurEvent) {
			outerBlurEvent();
		}
		this.setState({ borderColor: Colors.borderColor });
	}

	selectCountry = (country, callback?) => {
		if (country) {
			VariableStore.setVariable(NalliVariable.COUNTRY, country.toLowerCase());
			this.setState({ cca2: country });
		}
		if (callback) {
			callback(country);
		}
	}

	render = () => {
		const { onChangeNumber, onChangeCountry, countryInputContainerStyle, countryTextInputStyle, countryInputTextStyle } = this.props;
		const { cca2 } = this.state;

		const countrySelectList = this.countries?.map(country => ({
			label: `${country.cca2}  (+${country.code})`,
			value: country.cca2,
		}));

		return (
			<View>
				{this.countries &&
					<View style={styles.container}>
						<RNPickerSelect
								onValueChange={(e) => this.selectCountry(e, onChangeCountry)}
								value={cca2}
								items={countrySelectList}
								useNativeAndroidPickerStyle={false}
								fixAndroidTouchableBug={true}
								style={{
									inputIOS: { ...styles.countryInput, ...countryInputTextStyle },
									inputAndroid: { ...styles.countryInput, ...countryInputTextStyle },
									inputIOSContainer: { ...styles.countryInputContainer, ...countryInputContainerStyle },
									inputAndroidContainer: { ...styles.countryInputContainer, ...countryInputContainerStyle },
								}} />
						<TextInput
								onChangeText={onChangeNumber}
								keyboardType={'numeric'}
								style={{ ...styles.phoneNumberInput, ...countryTextInputStyle }} />
					</View>

				}
			</View>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
	},
	countryInputContainer: {
		backgroundColor: 'white',
		paddingHorizontal: 10,
		...Platform.select({
			ios: {
				paddingVertical: 15,
			},
			android: {
				paddingVertical: 5,
			}
		}),
		borderRadius: 15,
		width: layout.window.width * 0.25,
	},
	countryInput: {
		fontSize: 14,
	},
	phoneNumberInput: {
		backgroundColor: 'white',
		borderRadius: 15,
		paddingHorizontal: 10,
		...Platform.select({
			ios: {
				paddingVertical: 15,
			},
			android: {
				paddingVertical: 5,
			}
		}),
		flexGrow: 1,
		marginLeft: 5,
		fontSize: 14,
	},
});
