import React from 'react';
import {
	StyleSheet,
	Switch,
	View
} from 'react-native';

import Colors from '../constants/colors';
import NalliText, { ETextSize } from './text.component';

interface SettingProps {
	description?: string;
	onValueChange: (value: boolean) => void;
	text: string;
	value: boolean;
}

interface SettingState {
}

export default class Setting extends React.Component<SettingProps, SettingState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const {
			description,
			onValueChange,
			text,
			value,
		} = this.props;

		return (
			<View style={styles.settingContainer}>
				<View>
					<NalliText size={ETextSize.BUTTON_SMALL}>{text}</NalliText>
					{description &&
						<NalliText size={ETextSize.P_SMALL}>{description}</NalliText>
					}
				</View>
				<Switch
						value={value}
						trackColor={{ true: Colors.main }}
						onValueChange={onValueChange} />
			</View>
		);
	}

}

const styles = StyleSheet.create({
	settingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 5,
		borderTopWidth: 1,
		borderColor: Colors.borderColor,
		paddingVertical: 7.5,
	},
});
