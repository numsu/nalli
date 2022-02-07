import moment from 'moment';
import React from 'react';
import {
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { Avatar } from 'react-native-elements';

import { Ionicons } from '@expo/vector-icons';

import colors from '../constants/colors';
import Colors from '../constants/colors';
import NalliBadge from './badge.component';
import NalliText, { ETextSize } from './text.component';

interface SelectedContactProps {
	contact: any;
	isNalliUser: boolean;
	lastLoginDate: string;
	onSwapPress: () => void;
}

interface SelectedContactState {
}

export default class SelectedContact extends React.Component<SelectedContactProps, SelectedContactState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const {
			contact,
			isNalliUser,
			lastLoginDate,
			onSwapPress,
		} = this.props;

		const recipientLastLoginOverMonthAgo = moment(lastLoginDate).isBefore(moment().subtract(1, 'month'));

		return (
			<View style={styles.contactContainer}>
				<Avatar
						rounded
						title={contact.initials}
						size='medium'
						titleStyle={{ fontSize: 18 }}
						containerStyle={{ marginRight: 15 }}
						overlayContainerStyle={{ backgroundColor: Colors.main }} />
				<View>
					<View style={{ flexDirection: 'row' }}>
						<NalliText size={ETextSize.H2} style={styles.contactName}>
							{contact.name}
						</NalliText>
						{isNalliUser &&
							<NalliBadge>
								<View style={styles.online}></View>
								<NalliText>Nalli user</NalliText>
							</NalliBadge>
						}
						{!isNalliUser &&
							<NalliBadge>
								<View style={styles.offline}></View>
								<NalliText>New user</NalliText>
							</NalliBadge>
						}
					</View>
					<NalliText>
						{contact.formattedNumber}
					</NalliText>
					{recipientLastLoginOverMonthAgo &&
						<NalliText style={styles.incativeUserWarning}>
							This user hasn't been active for a while
						</NalliText>
					}
				</View>
				<TouchableOpacity
						onPress={onSwapPress}
						style={styles.contactSelectArrow}>
					<Ionicons
							name='ios-swap-horizontal'
							style={styles.contactSelectArrow}
							size={32} />
				</TouchableOpacity>
			</View>
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
	offline: {
		backgroundColor: Colors.main,
		width: 6,
		height: 6,
		marginRight: 3,
		borderRadius: 30,
	},
	incativeUserWarning: {
		color: Colors.shadowColor,
		fontSize: 10,
	},
});