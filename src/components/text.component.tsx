import React from 'react';
import {
	StyleSheet,
	Text,
} from 'react-native';

import Colors from '../constants/colors';

interface TextProps {
	size?: ETextSize;
	style?: any;
	onPress?: () => any;
}

interface TextState {
}

export enum ETextSize {
	P,
	P_LARGE,
	H1,
	H2,
	BUTTON,
	BUTTON_SMALL,
}

export default class NalliText extends React.Component<TextProps, TextState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const { size, style, children, onPress } = this.props;

		let baseStyle;
		switch (size) {
			case ETextSize.H1:
				baseStyle = styles.h1;
				break;
			case ETextSize.H2:
				baseStyle = styles.h2;
				break;
			case ETextSize.BUTTON:
				baseStyle = styles.button;
				break;
			case ETextSize.BUTTON_SMALL:
				baseStyle = styles.buttonSmall;
				break;
			case ETextSize.P_LARGE:
				baseStyle = styles.pLarge;
				break;
			case ETextSize.P:
			default:
				baseStyle = styles.p;
				break;
		}

		return (
			<Text
					style={[baseStyle, style ? style : undefined]}
					onPress={onPress}>
				{children}
			</Text>
		);
	}

}

const styles = StyleSheet.create({
	p: {
		fontSize: 14,
		fontFamily: 'OpenSans',
	},
	pLarge: {
		fontSize: 20,
		fontFamily: 'OpenSans',
	},
	h1: {
		fontSize: 25,
		fontFamily: 'MontserratBold',
		color: Colors.darkText,
	},
	h2: {
		fontSize: 16,
		fontFamily: 'MontserratBold',
		color: Colors.darkText,
	},
	button: {
		fontSize: 20,
		fontFamily: 'OpenSans',
	},
	buttonSmall: {
		fontSize: 18,
		fontFamily: 'OpenSans',
	},
});
