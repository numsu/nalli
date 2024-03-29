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

export default class NalliNanoAddress extends React.PureComponent<NalliNanoAddressProps, NalliNanoAddressState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const { contentContainerStyle, style } = this.props;
		const address = this.props.children.toString();
		const addressPart1 = address.substring(0, 12);
		const addressPart2 = address.substring(13, 35);
		const addressPart3 = address.substring(36, 57);
		const addressPart4 = address.substring(58, 65);

		return (
			<View style={contentContainerStyle}>
				<NalliText style={[style, styles.address, styles.coloredAddress ]}>
					{ addressPart1 }
				</NalliText>
				<NalliText style={[ style, styles.address ]}>
					{ addressPart2 }
				</NalliText>
				<NalliText style={[ style, styles.address ]}>
					{ addressPart3 }
				</NalliText>
				<NalliText style={[ style, styles.address, styles.coloredAddress ]}>
					{ addressPart4 }
				</NalliText>
			</View>
		);
	}

}

const styles = StyleSheet.create({
	address: {
		fontSize: 18,
	},
	coloredAddress: {
		color: Colors.main,
		fontFamily: 'OpenSansBold',
	},
});
