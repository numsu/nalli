import React from 'react';
import {
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import layout from '../constants/layout';
import { EBiometricsType } from '../service/biometrics.service';
import VariableStore, { NalliVariable } from '../service/variable-store';
import NalliText, { ETextSize } from './text.component';

interface NalliNumberPadProps {
	onChangeText: (pin: string) => any;
	onBiometricLoginPress?: () => void;
	enableBiometrics?: boolean;
	style?: any;
	maxLength?: number;
	pin?: string;
}

interface NalliNumberPadState {
	pin: string;
	biometricsType: EBiometricsType;
}

export default class NalliNumberPad extends React.Component<NalliNumberPadProps, NalliNumberPadState> {

	numbers = '123456789';

	constructor(props) {
		super(props);
		this.state = {
			pin: '',
			biometricsType: EBiometricsType.NO_BIOMETRICS,
		};
	}

	static getDerivedStateFromProps(nextProps, _) {
		if (nextProps.pin === '') {
			return { pin: '' };
		}
		return null;
	}

	componentDidMount = () => {
		this.init();
	}

	init = async () => {
		let biometricsType;
		if (this.props.enableBiometrics) {
			biometricsType = await VariableStore.getVariable(NalliVariable.BIOMETRICS_TYPE, EBiometricsType.NO_BIOMETRICS);
		} else {
			biometricsType = EBiometricsType.NO_BIOMETRICS;
		}

		this.setState({
			biometricsType,
		});
	}

	onChangeText = (val: string, callback) => {
		const pin = this.state.pin + val;
		if (!this.props.maxLength || this.props.maxLength >= pin.length) {
			this.setState({ pin });
			callback(pin);
		}
	}

	onRemoveText = (callback) => {
		const pin = this.state.pin.slice(0, -1);
		this.setState({ pin });
		callback(pin);
	}

	render = () => {
		const { style, onChangeText, onBiometricLoginPress } = this.props;
		const { biometricsType } = this.state;

		const numberElements = [...this.numbers].map(n => (
			<TouchableOpacity
					key={n}
					style={[styles.number, style]}
					onPress={() => this.onChangeText(n, onChangeText)}>
				<NalliText size={ETextSize.BUTTON} style={[styles.numberText, style]}>
					{n}
				</NalliText>
			</TouchableOpacity>
		));

		return (
			<View style={styles.container}>
				{numberElements}
				{biometricsType != EBiometricsType.NO_BIOMETRICS &&
					<TouchableOpacity
						key={20}
						style={[styles.number, style, { borderWidth: 0 }]}
						onPress={onBiometricLoginPress}>
						<MaterialCommunityIcons style={[styles.biometricsIcon, style]} name={EBiometricsType.getBiometricsTypeIcon(biometricsType)} />
					</TouchableOpacity>
				}
				{biometricsType == EBiometricsType.NO_BIOMETRICS &&
					<View style={{ flexBasis: '33%' }}></View>
				}
				<TouchableOpacity
						key={0}
						style={[styles.number, style]}
						onPress={() => this.onChangeText('0', onChangeText)}>
					<NalliText size={ETextSize.BUTTON} style={[styles.numberText, style]}>
						0
					</NalliText>
				</TouchableOpacity>
				<TouchableOpacity
						key={10}
						style={[styles.number, style, { borderWidth: 0 }]}
						onPress={() => this.onRemoveText(onChangeText)}>
					<Ionicons style={[{ color: 'white' }, style]} name="ios-backspace" size={30} />
				</TouchableOpacity>
			</View>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		justifyContent: 'center',
		paddingLeft: 50,
		paddingRight: 40,
	},
	number: {
		paddingVertical: layout.isSmallDevice ? 10 : 20,
		borderColor: 'white',
		borderWidth: 1,
		borderRadius: 40,
		color: 'white',
		flexBasis: '28%',
		alignItems: 'center',
		marginBottom: 10,
		marginRight: 10,
		opacity: 0.8,
	},
	biometricsIcon: {
		fontSize: 40,
		color: 'white',
	},
	numberText: {
		color: 'white',
	},
});
