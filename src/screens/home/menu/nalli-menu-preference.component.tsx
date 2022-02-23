import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import NalliIcon, { IconType } from '../../../components/icon.component';
import NalliText, { ETextSize } from '../../../components/text.component';
import Colors from '../../../constants/colors';

interface NalliMenuPreferenceProps {
	header: string;
	icon: any;
	iconType: IconType;
	onPress?: () => void;
	subheader: string;
}

export default class NalliMenuPreference extends React.PureComponent<NalliMenuPreferenceProps, any> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const {
			header,
			icon,
			iconType,
			onPress,
			subheader,
		} = this.props;

		return (
			<TouchableOpacity disabled={!onPress} onPress={onPress}>
				<View style={styles.preference}>
					<NalliIcon type={iconType} style={styles.preferenceIcon} icon={icon} />
					<View>
						<NalliText size={ETextSize.P_LARGE} style={styles.preferenceHeader}>{header}</NalliText>
						<NalliText style={styles.preferenceSubheader}>{subheader}</NalliText>
					</View>
				</View>
			</TouchableOpacity>
		);
	}

}

const styles = StyleSheet.create({
	preference: {
		flexDirection: 'row',
		paddingVertical: 5,
		paddingRight: 30,
	},
	preferenceHeader: {
		marginLeft: 6,
	},
	preferenceSubheader: {
		marginLeft: 6,
		color: Colors.darkText,
	},
	preferenceIcon: {
		color: Colors.main,
		fontSize: 18,
		marginTop: 4,
	},
});
