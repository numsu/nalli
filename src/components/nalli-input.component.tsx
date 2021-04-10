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
	reference?: RefObject<any>;
	label?: string;
	placeholder?: string;
	readonly?: boolean;
	onChangeText: (str: string) => any;
	onBlur?: () => any;
	keyboardType?: KeyboardTypeOptions;
	autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
	secureTextEntry?: boolean;
	style?: any;
	value?: string;
	multiline?: boolean;
	numberOfLines?: number;
	returnKeyType?: ReturnKeyTypeOptions;
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
			reference,
			label,
			placeholder,
			readonly,
			onChangeText,
			keyboardType,
			autoCapitalize,
			secureTextEntry,
			style,
			value,
			multiline,
			numberOfLines,
			returnKeyType,
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
						returnKeyType={returnKeyType}
						ref={reference}
						editable={!readonly}
						onFocus={this.onFocus}
						placeholder={placeholder}
						style={[styles.input, style, { borderColor }]}
						secureTextEntry={secureTextEntry}
						keyboardType={keyboardType}
						autoCapitalize={autoCapitalize}
						placeholderTextColor={Colors.inputPlaceholder}
						onBlur={this.onBlur}
						multiline={multiline}
						numberOfLines={numberOfLines}
						value={value}
						onChangeText={onChangeText} />
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
