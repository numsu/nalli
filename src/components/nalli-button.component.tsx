import React from 'react';
import {
	StyleSheet,
	TouchableOpacity,
} from 'react-native';

import Colors from '../constants/colors';
import NalliIcon, { IconType } from './icon.component';
import NalliText, { ETextSize } from './text.component';

interface NalliButtonProps {
	disabled?: boolean;
	icon?: any;
	iconType?: IconType;
	text?: string;
	textStyle?: any;
	style?: any;
	small?: boolean;
	solid?: boolean;
	onPress?: () => void;
}

interface NalliButtonState {
}

export default class NalliButton extends React.PureComponent<NalliButtonProps, NalliButtonState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const {
			disabled,
			icon,
			iconType,
			onPress,
			small,
			solid,
			style,
			text,
			textStyle,
		} = this.props;

		return (
			<TouchableOpacity
					activeOpacity={disabled ? 1 : 0.7}
					disabled={disabled}
					style={[
						styles.action,
						solid
							? styles.solidAction
							: styles.transparent,
						style,
						disabled
							? styles.disabled
							: {},
						small
							? styles.small
							: {}
					]}
					onPress={onPress}>
				<NalliText
						size={ETextSize.BUTTON}
						style={[
							solid
								? styles.solidText
								: styles.transparent,
							textStyle,
							small
								? styles.smallText
								: {}
						]}>
					{icon && <NalliIcon style={styles.icon} icon={icon} size={small ? 15 : 20} type={iconType || IconType.ION} />}
					{icon && '\xa0\xa0'}
					{text}
				</NalliText>
			</TouchableOpacity>
		);
	}

}

const styles = StyleSheet.create({
	action: {
		width: '100%',
		borderWidth: 1,
		borderRadius: 30,
		borderColor: Colors.main,
		padding: 12,
		alignItems: 'center',
	},
	solidAction: {
		backgroundColor: Colors.main,
		borderWidth: 0,
		shadowColor: Colors.shadowColor,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 3,
	},
	solidText: {
		color: 'white',
	},
	smallText: {
		fontSize: 14,
	},
	transparent: {
		backgroundColor: 'transparent',
		color: Colors.main,
	},
	disabled: {
		opacity: 0.5,
	},
	small: {
		padding: 5,
	},
	icon: {
		alignSelf: 'flex-end',
	},
});
