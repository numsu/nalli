import React from 'react';
import {
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { Avatar } from 'react-native-elements';

import { Ionicons } from '@expo/vector-icons';

import colors from '../constants/colors';
import { ContactItem } from '../service/contacts.service';
import NalliBadge from './badge.component';
import NalliText, { ETextSize } from './text.component';

interface ContactProps {
	onSelectContact: (contact: any) => void;
	contact: ContactItem;
}

interface ContactState {
}

class Contact extends React.PureComponent<ContactProps, ContactState> {

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
						rounded
						title={contact.initials}
						size='medium'
						titleStyle={{ fontSize: 18 }}
						containerStyle={{ marginRight: 15 }}
						overlayContainerStyle={{ backgroundColor: colors.main }} />
				<View>
					<View style={{ flexDirection: 'row', height: 21 }}>
						<NalliText size={ETextSize.H2} style={styles.contactName}>
							{contact.name}
						</NalliText>
					</View>
					{contact.isNalliUser &&
						<NalliBadge style={{ width: 45, justifyContent: 'center' }}>
							<View style={styles.online}></View>
							<NalliText size={ETextSize.P_SMALL}>User</NalliText>
						</NalliBadge>
					}
					<NalliText>
						{contact.formattedNumber}
					</NalliText>
				</View>
				<Ionicons
						style={styles.contactSelectArrow}
						name='ios-arrow-forward'
						size={32} />
			</TouchableOpacity>
		);
	}

}

export default React.memo(Contact);

const styles = StyleSheet.create({
	contactContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderColor,
	},
	contactName: {
		color: colors.main,
		marginBottom: 5,
	},
	contactSelectArrow: {
		color: colors.main,
		marginLeft: 'auto',
	},
	online: {
		backgroundColor: 'forestgreen',
		width: 6,
		height: 6,
		marginRight: 3,
		borderRadius: 30,
	},
});
