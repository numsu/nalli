import moment from 'moment';
import { PureComponent } from 'react';
import {
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { Avatar } from 'react-native-elements';

import colors from '../constants/colors';
import Colors from '../constants/colors';
import NalliBadge from './badge.component';
import NalliIcon, { IconType } from './icon.component';
import NalliText, { ETextSize } from './text.component';

interface SelectedContactProps {
	contact: any;
	disableSwap?: boolean;
	isNalliUser: boolean;
	lastLoginDate: string;
	onSwapPress: () => void;
}

interface SelectedContactState {
}

export default class SelectedContact extends PureComponent<SelectedContactProps, SelectedContactState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const {
			contact,
			disableSwap,
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
						titleStyle={{ fontSize: 16 }}
						containerStyle={{ marginRight: 15 }}
						overlayContainerStyle={{ backgroundColor: Colors.main }} />
				<View>
					<View style={{ flexDirection: 'row', height: 21 }}>
						<NalliText size={ETextSize.H2} style={styles.contactName}>
							{contact.name}
						</NalliText>
					</View>
					{isNalliUser &&
						<NalliBadge style={{ width: 45, justifyContent: 'center' }}>
							<View style={styles.online}></View>
							<NalliText>User</NalliText>
						</NalliBadge>
					}
					{!isNalliUser &&
						<NalliBadge style={{ width: 75, justifyContent: 'center' }}>
							<View style={styles.offline}></View>
							<NalliText>New user</NalliText>
						</NalliBadge>
					}
					<NalliText>
						{contact.formattedNumber}
					</NalliText>
					{recipientLastLoginOverMonthAgo &&
						<NalliText style={styles.incativeUserWarning}>
							This user hasn't been active for a while
						</NalliText>
					}
				</View>
				{!disableSwap &&
					<TouchableOpacity
							onPress={onSwapPress}
							style={styles.contactSelectArrow}>
						<NalliIcon style={styles.contactSelectArrow} icon='ios-swap-horizontal' size={25} type={IconType.ION} />
					</TouchableOpacity>
				}
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
		fontSize: 8,
	},
});
