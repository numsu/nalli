import React from "react";
import { StyleSheet, View } from "react-native";

import Colors from "../constants/colors";

interface NalliBadgeProps {
}

interface NalliBadgeState {
}

export default class NalliBadge extends React.Component<NalliBadgeProps, NalliBadgeState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const { children } = this.props;
		return (
			<View style={styles.badge}>
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
		borderRadius: 30,
		marginLeft: 10,
	},
});