import React from 'react';
import {
	StyleSheet,
	View,
} from 'react-native';

import Colors from '../constants/colors';
import NalliText, { ETextSize } from './text.component';

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
				<NalliText
						size={ETextSize.H1}
						style={styles.header}>
					{title}
				</NalliText>
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
	header: {
		marginBottom: 10,
		marginTop: -5,
	},
});
