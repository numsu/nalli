import React from 'react';
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { Avatar } from 'react-native-elements';

import { Ionicons } from '@expo/vector-icons';

import colors from '../constants/colors';

interface ContactProps {
	onSelectContact: (contact: any) => void;
	contact: any;
}

interface ContactState {
}

export default class Contact extends React.Component<ContactProps, ContactState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const { contact, onSelectContact } = this.props;
		return (
			<TouchableOpacity
					onPress={() => onSelectContact(contact)}
					style={styles.contactContainer}>
				<Avatar
						rounded={true}
						title={contact.initials}
						size="medium"
						titleStyle={{ fontSize: 18 }}
						containerStyle={{ marginRight: 15 }}
						overlayContainerStyle={{ backgroundColor: colors.main }} />
				<View>
					<Text style={styles.contactName}>
						{contact.name}
					</Text>
					<Text style={styles.contactText}>
						{contact.formattedNumber}
					</Text>
				</View>
				<Ionicons
						style={styles.contactSelectArrow}
						name="ios-arrow-forward"
						size={32} />
			</TouchableOpacity>
		);
	}

}

const styles = StyleSheet.create({
	contactContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderColor,
	},
	contactName: {
		fontSize: 18,
		fontWeight: '600',
		color: colors.main,
		marginBottom: 5,
	},
	contactText: {
	},
	contactSelectArrow: {
		color: colors.main,
		marginLeft: 'auto',
	},
});
