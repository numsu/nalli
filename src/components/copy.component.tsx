import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

interface NalliCopyProps {
	value: string;
	style?: any;
	confirm?: boolean;
}

interface NalliCopyState {
}

export default class NalliCopy extends React.PureComponent<NalliCopyProps, NalliCopyState> {

	constructor(props) {
		super(props);
	}

	copy = () => {
		if (this.props.confirm) {
			Alert.alert(
				'Confirm',
				'Are you sure that you want to copy this information? It\'s sensitive information and the clipboard can compromise it.',
				[
					{
						text: 'Cancel',
						onPress: () => undefined,
						style: 'default',
					}, {
						text: 'Copy',
						onPress: this.setClipboard,
						style: 'destructive',
					},
				],
			);
		} else {
			this.setClipboard();
		}
	}

	setClipboard = () => {
		Clipboard.setString(this.props.value);
	}

	render = () => {
		const { style } = this.props;
		return (
			<TouchableOpacity
					style={style}
					onPress={this.copy}>
				<Ionicons
						name='ios-copy'
						size={18} />
			</TouchableOpacity>
		);
	}

}
