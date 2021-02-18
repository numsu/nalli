import {
	BarCodeEvent,
	BarCodeScanner,
	PermissionStatus,
} from 'expo-barcode-scanner';
import React from 'react';
import {
	Alert,
	Linking,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import Modal from 'react-native-modal';

import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

import layout from '../constants/layout';

interface QRCodeScannerProps {
	onQRCodeScanned: (params: BarCodeEvent) => boolean;
}

interface QRCodeScannerState {
	open: boolean;
}

export default class QRCodeScanner extends React.Component<QRCodeScannerProps, QRCodeScannerState> {

	constructor(props) {
		super(props);
		this.state = {
			open: false,
		};
	}

	scan = async () => {
		const { status } = await BarCodeScanner.requestPermissionsAsync();
		if (status == PermissionStatus.GRANTED) {
			this.setState({ open: true });
		} else {
			Alert.alert(
				'No permission',
				'You haven\'t given permission to use your camera. Please allow Nalli to use your camera in your settings.',
				[
					{
						text: 'Don\'t allow',
						style: 'cancel',
						onPress: () => undefined,
					}, {
						text: 'Open settings',
						style: 'default',
						onPress: () => Linking.openURL('app-settings:'),
					},
				],
			);
		}
	}

	close = () => {
		this.setState({ open: false });
	}

	onQRCodeScanned = (params: BarCodeEvent, callback) => {
		const success = callback(params);
		if (success) {
			this.setState({ open: false });
		}
	}

	render = () => {
		const { onQRCodeScanned } = this.props;
		const { open } = this.state;

		return (
			<View>
				{open &&
					<Modal
							isVisible={open}
							animationIn={'zoomIn'}
							animationOut={'zoomOut'}
							animationInTiming={150}
							animationOutTiming={150}
							onBackButtonPress={this.close}>
						<View style={styles.header}>
							<Text style={styles.text}>
								Scan a Nano address
							</Text>
							<TouchableOpacity
									onPress={this.close}>
								<MaterialIcons
										style={styles.close}
										name='close'
										size={40} />
							</TouchableOpacity>
						</View>
						<BarCodeScanner
								style={styles.container}
								onBarCodeScanned={(params: BarCodeEvent) => this.onQRCodeScanned(params, onQRCodeScanned)} />
					</Modal>
				}
				<TouchableOpacity
						style={styles.qrCodeButton}
						onPress={this.scan}>
					<FontAwesome
							size={38}
							name='qrcode' />
				</TouchableOpacity>
			</View>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		height: layout.window.height * 0.8,
		width: layout.window.width * 0.9,
		flexDirection: 'column',
	},
	header: {
		flexDirection: 'row',
		marginBottom: 5,
	},
	text: {
		fontSize: 20,
		color: 'white',
		marginRight: 'auto',
		alignSelf: 'center',
	},
	close: {
		color: 'white',
		marginRight: -7,
	},
	qrCodeButton: {
		marginTop: 5,
	},
});
