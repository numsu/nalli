import React from 'react';
import {
	Alert,
	Linking,
	StyleSheet,
} from 'react-native';

import Colors from '../constants/colors';
import NalliIcon, { IconType } from './icon.component';
import NalliText from './text.component';

interface LinkProps {
	url: string;
	style?: any;
}

interface LinkState {
}

export default class Link extends React.PureComponent<LinkProps, LinkState> {

	constructor(props) {
		super(props);
	}

	open = () => {
		Alert.alert(
			'Leave Nalli?',
			'This link will take you outside of the application. Are you sure?',
			[
				{
					text: 'Cancel',
					onPress: () => undefined,
					style: 'cancel',
				}, {
					text: 'Open',
					onPress: () => Linking.openURL(this.props.url),
					style: 'default',
				},
			]
		);
	}

	render = () => {
		const { style, children } = this.props;
		return (
			<NalliText
					style={[styles.link, style ? style : undefined]}
					onPress={this.open}>
				<NalliIcon icon='ios-link' size={15} type={IconType.ION} />&nbsp;{children}
			</NalliText>
		);
	}

}

const styles = StyleSheet.create({
	link: {
		color: Colors.main,
	},
});
