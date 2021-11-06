import React from 'react';
import {
	StyleSheet,
	TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import NalliText, { ETextSize } from './text.component';

interface NalliButtonProps {
	disabled?: boolean;
	icon?: any;
	text?: string;
	textStyle?: any;
	style?: any;
	solid?: boolean;
	onPress?: () => void;
}

interface NalliButtonState {
}

export default class NalliButton extends React.Component<NalliButtonProps, NalliButtonState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const { disabled, icon, text, textStyle, style, solid, onPress } = this.props;
		return (
			<TouchableOpacity
					activeOpacity={disabled ? 1 : 0.7}
					disabled={disabled}
					style={[styles.action, (solid ? styles.solidAction : styles.transparent), style, disabled ? styles.disabled : {}]}
					onPress={onPress}>
				<NalliText size={ETextSize.BUTTON} style={[(solid ? styles.solidText : styles.transparent), textStyle]}>
					{icon && <Ionicons style={styles.icon} name={icon} size={20} />}
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
		padding: 15,
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
	transparent: {
		backgroundColor: 'transparent',
		color: Colors.main,
	},
	disabled: {
		opacity: 0.5,
	},
	icon: {
		alignSelf: 'flex-end',
	},
});
