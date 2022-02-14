import React from 'react';
import { StyleSheet, View } from 'react-native';

import Colors from '../constants/colors';

interface NalliBadgeProps {
	style?: any;
}

interface NalliBadgeState {
}

export default class NalliBadge extends React.Component<NalliBadgeProps, NalliBadgeState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const { children, style } = this.props;
		return (
			<View style={[ styles.badge, style ]}>
				{children}
			</View>
		);
	}

}

const styles = StyleSheet.create({
	badge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.borderColor,
		paddingHorizontal: 6,
		paddingVertical: 1,
		borderRadius: 30,
	},
});