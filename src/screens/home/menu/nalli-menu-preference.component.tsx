import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import NalliText, { ETextSize } from '../../../components/text.component';
import Colors from '../../../constants/colors';

interface NalliMenuPreferenceProps {
	icon: any;
	header: string;
	subheader: string;
	onPress?: () => void;
}

export default class NalliMenuPreference extends React.Component<NalliMenuPreferenceProps, any> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const { icon, header, subheader, onPress } = this.props;

		return (
			<TouchableOpacity disabled={!onPress} onPress={onPress}>
				<View style={styles.preference}>
					<MaterialCommunityIcons style={styles.preferenceIcon} name={icon} />
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
		fontSize: 20,
		marginTop: 4,
	},
});
