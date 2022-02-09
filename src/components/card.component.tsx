import React from 'react';
import {
	StyleSheet,
	TouchableWithoutFeedback,
	View,
} from 'react-native';

import Colors from '../constants/colors';
import NalliText, { ETextSize } from './text.component';

interface CardProps {
	onPress?: () => void;
	onLongPress?: () => void;
	style: any;
	title: string;
}

interface CardState {
}

export default class Card extends React.Component<CardProps, CardState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const {
			children,
			onLongPress,
			onPress,
			style,
			title,
		} = this.props;
		return (
			<TouchableWithoutFeedback onLongPress={onLongPress} onPress={onPress}>
				<View style={[style, styles.card]}>
					<NalliText
							size={ETextSize.H1}
							style={styles.header}>
						{title}
					</NalliText>
					{children}
				</View>
			</TouchableWithoutFeedback>
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
