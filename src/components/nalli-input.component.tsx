import React, { RefObject } from 'react';
import {
	KeyboardTypeOptions,
	ReturnKeyTypeOptions,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';

import Colors from '../constants/colors';
import NalliText from './text.component';

interface NalliInputProps {
	autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
	keyboardType?: KeyboardTypeOptions;
	label?: string;
	maxLength?: number,
	multiline?: boolean;
	numberOfLines?: number;
	onBlur?: () => any;
	onChangeText: (str: string) => any;
	placeholder?: string;
	readonly?: boolean;
	reference?: RefObject<any>;
	returnKeyType?: ReturnKeyTypeOptions;
	secureTextEntry?: boolean;
	style?: any;
	value?: string;
}

interface NalliInputState {
	borderColor?: string;
}

export default class NalliInput extends React.Component<NalliInputProps, NalliInputState> {

	constructor(props) {
		super(props);
		this.state = {
			borderColor: Colors.borderColor,
		};
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

	render = () => {
		const {
			autoCapitalize,
			keyboardType,
			label,
			maxLength,
			multiline,
			numberOfLines,
			onChangeText,
			placeholder,
			readonly,
			reference,
			returnKeyType,
			secureTextEntry,
			style,
			value,
		} = this.props;
		const { borderColor } = this.state;
		return (
			<View>
				{label &&
					<NalliText style={styles.label}>
						{label}
					</NalliText>
				}
				<TextInput
						autoCapitalize={autoCapitalize}
						editable={!readonly}
						keyboardType={keyboardType}
						maxLength={maxLength}
						multiline={multiline}
						numberOfLines={numberOfLines}
						onBlur={this.onBlur}
						onChangeText={onChangeText}
						onFocus={this.onFocus}
						placeholder={placeholder}
						placeholderTextColor={Colors.inputPlaceholder}
						ref={reference}
						returnKeyType={returnKeyType}
						secureTextEntry={secureTextEntry}
						style={[styles.input, style, { borderColor }]}
						value={value}
						 />
			</View>
		);
	}

}

const styles = StyleSheet.create({
	label: {
		marginBottom: -12,
		marginLeft: 12,
		backgroundColor: 'white',
		padding: 5,
		zIndex: 105,
		alignSelf: 'flex-start',
	},
	input: {
		backgroundColor: 'white',
		borderWidth: 1,
		borderRadius: 15,
		padding: 12,
		marginBottom: 10,
		color: 'black',
		fontSize: 18,
		zIndex: 100,
		fontFamily: 'OpenSans',
	},
});
