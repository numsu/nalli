import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-elements';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import Colors from '../../../constants/colors';

interface NalliMenuPreferenceProps {
	icon: string;
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
						<Text style={styles.preferenceHeader}>{header}</Text>
						<Text style={styles.preferenceSubheader}>{subheader}</Text>
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
		fontSize: 20,
		fontFamily: 'OpenSans',
		marginLeft: 10,
	},
	preferenceSubheader: {
		marginLeft: 10,
		fontFamily: 'OpenSans',
		color: Colors.darkText,
	},
	preferenceIcon: {
		color: Colors.main,
		fontSize: 35,
		marginTop: 5,
	},
});
