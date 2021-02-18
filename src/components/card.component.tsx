import React from 'react';
import {
	StyleSheet,
	Text,
	View,
} from 'react-native';

import Colors from '../constants/colors';

interface CardProps {
	title: string;
	style: any;
}

interface CardState {
}

export default class Card extends React.Component<CardProps, CardState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const { title, style, children } = this.props;
		return (
			<View style={[style, styles.card]}>
				<Text style={styles.h2}>{title}</Text>
				{children}
			</View>
		);
	}

}

const styles = StyleSheet.create({
	card: {
		backgroundColor: 'white',
		shadowOffset: { width: 0, height: 0 },
		shadowRadius: 10,
		shadowColor: Colors.shadowColor,
		shadowOpacity: 0.2,
		elevation: 4,
		borderRadius: 15,
		padding: 15,
	},
	h2: {
		fontSize: 25,
		marginBottom: 10,
		marginTop: -5,
		fontFamily: 'OpenSansBold',
	},
});
