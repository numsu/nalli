import React from 'react';
import {
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { Avatar } from 'react-native-elements';

import Colors from '../constants/colors';
import { ContactItem } from '../service/contacts.service';
import NalliBadge from './badge.component';
import NalliIcon, { IconType } from './icon.component';
import NalliText, { ETextSize } from './text.component';

interface ContactProps {
	onSelectContact: (contact: any) => void;
	contact: ContactItem;
}

interface ContactState {
}

export default class Contact extends React.PureComponent<ContactProps, ContactState> {

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
						overlayContainerStyle={{ backgroundColor: Colors.main }} />
				<View>
					<View style={{ flexDirection: 'row', height: 21 }}>
						<NalliText size={ETextSize.H2} style={styles.contactName}>
							{contact.name.length > 27 ? contact.name.substring(0, 27) + '...' : contact.name}
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
				<NalliIcon style={styles.contactSelectArrow} icon='ios-arrow-forward' size={25} type={IconType.ION} />
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
		borderBottomColor: Colors.borderColor,
	},
	contactName: {
		color: Colors.main,
		marginBottom: 5,
	},
	contactSelectArrow: {
		color: Colors.main,
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
