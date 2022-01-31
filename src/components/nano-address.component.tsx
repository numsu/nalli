import React from 'react';
import {
	StyleSheet,
	View,
} from 'react-native';

import Colors from '../constants/colors';
import NalliText from './text.component';

interface NalliNanoAddressProps {
	style?: any;
	contentContainerStyle?: any;
}

interface NalliNanoAddressState {
}

export default class NalliNanoAddress extends React.Component<NalliNanoAddressProps, NalliNanoAddressState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const { contentContainerStyle, style } = this.props;
		const address = this.props.children.toString();
		const addressPart1 = address.substring(0, 12);
		const addressPart2 = address.substring(13, 57);
		const addressPart3 = address.substring(58, 65);

		return (
			<View style={contentContainerStyle}>
				<NalliText style={[style, styles.address, styles.coloredAddress ]}>
					{ addressPart1 }
				</NalliText>
				<NalliText style={[ style, styles.address ]}>
					{ addressPart2 }
				</NalliText>
				<NalliText style={[ style, styles.address, styles.coloredAddress ]}>
					{ addressPart3 }
				</NalliText>
			</View>
		);
	}

}

const styles = StyleSheet.create({
	address: {
		fontSize: 20,
	},
	coloredAddress: {
		color: Colors.main,
		fontFamily: 'OpenSansBold',
	},
});
