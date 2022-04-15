import * as Clipboard from 'expo-clipboard';
import { PureComponent } from 'react';
import { Alert, TouchableOpacity } from 'react-native';

import NalliIcon, { IconType } from './icon.component';

interface NalliCopyProps {
	value: string;
	style?: any;
	confirm?: boolean;
}

interface NalliCopyState {
}

export default class NalliCopy extends PureComponent<NalliCopyProps, NalliCopyState> {

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
				<NalliIcon icon='ios-copy' size={18} type={IconType.ION} />
			</TouchableOpacity>
		);
	}

}
