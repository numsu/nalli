import React from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { Avatar } from 'react-native-elements';
import Modal from 'react-native-modal';

import Colors from '../constants/colors';
import layout from '../constants/layout';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	header: string;
	size?: EModalSize;
}

interface ModalState {
}

export default class NalliModal extends React.Component<ModalProps, ModalState> {

	constructor(props) {
		super(props);
		this.state = {
			isOpen: props.isOpen,
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen };
		}
		return null;
	}

	close = () => {
		this.props.onClose();
	}

	render = () => {
		const { isOpen, header, children, size } = this.props;

		return (
			<Modal
					propagateSwipe
					animationIn={'zoomIn'}
					animationOut={'zoomOut'}
					animationInTiming={200}
					animationOutTiming={200}
					isVisible={isOpen}
					onBackdropPress={this.close}
					onBackButtonPress={this.close}
					useNativeDriver={false}>
				<KeyboardAvoidingView enabled={Platform.OS == 'android'} behavior={'height'} style={size == EModalSize.MINI ? styles.containerMini : styles.containerBig}>
					<View style={styles.headerContainer}>
						<Text style={styles.header}>
							{header}
						</Text>
						<Avatar
							rounded={true}
							onPress={this.close}
							icon={{ name: 'close', type: 'material' }}
							size="small"
							overlayContainerStyle={{ backgroundColor: Colors.main }} />
					</View>
					{children}
				</KeyboardAvoidingView>
			</Modal>
		);
	}

}

export enum EModalSize {
	BIG,
	MINI,
}

const styles = StyleSheet.create({
	containerBig: {
		...Platform.select({
			android: {
				height: layout.window.height * 0.8,
			},
			ios: {
				height: layout.window.height * 0.85,
			},
		}),
		backgroundColor: 'white',
		paddingHorizontal: 15,
		paddingVertical: 15,
		borderRadius: 15,
		position: 'absolute',
		top: 30,
		right: 0,
		left: 0,
		overflow: 'scroll',
	},
	containerMini: {
		...Platform.select({
			android: {
				height: layout.window.height * 0.36,
			},
			ios: {
				height: layout.window.height * 0.35,
			},
		}),
		backgroundColor: 'white',
		paddingHorizontal: 15,
		paddingVertical: 15,
		borderRadius: 15,
		position: 'absolute',
		top: 30,
		right: 0,
		left: 0,
		overflow: 'scroll',
	},
	headerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	header: {
		fontSize: 25,
		fontFamily: 'OpenSansBold',
	},
});
