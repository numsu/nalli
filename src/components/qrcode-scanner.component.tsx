import { BarCodeScanningResult, Camera, PermissionStatus } from 'expo-camera';
import React from 'react';
import {
	Alert,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import Modal from 'react-native-modal';

import { openSettings } from '../constants/globals';
import layout from '../constants/layout';
import NalliIcon, { IconType } from './icon.component';
import NalliText, { ETextSize } from './text.component';

interface QRCodeScannerProps {
	onQRCodeScanned: (params: BarCodeScanningResult) => boolean;
}

interface QRCodeScannerState {
	open: boolean;
}

export default class QRCodeScanner extends React.PureComponent<QRCodeScannerProps, QRCodeScannerState> {

	constructor(props) {
		super(props);
		this.state = {
			open: false,
		};
	}

	scan = async () => {
		const { status } = await Camera.requestCameraPermissionsAsync();
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
						onPress: () => openSettings(),
					},
				],
			);
		}
	}

	close = () => {
		this.setState({ open: false });
	}

	onQRCodeScanned = (params: BarCodeScanningResult, callback) => {
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
							<NalliText size={ETextSize.P_LARGE} style={styles.text}>
								Scan a Nano address
							</NalliText>
							<TouchableOpacity
									onPress={this.close}>
								<NalliIcon style={styles.close} icon='close' size={40} type={IconType.MATERIAL} />
							</TouchableOpacity>
						</View>
						<Camera
								style={styles.container}
								onBarCodeScanned={(params: BarCodeScanningResult) => this.onQRCodeScanned(params, onQRCodeScanned)} />
						{/* <BarCodeScanner Does not work in Android on expo 43
								style={styles.container}
								onBarCodeScanned={(params: BarCodeEvent) => this.onQRCodeScanned(params, onQRCodeScanned)} /> */}
					</Modal>
				}
				<TouchableOpacity
						style={styles.qrCodeButton}
						onPress={this.scan}>
					<NalliIcon icon='qrcode' size={38} type={IconType.FONT_AWESOME} />
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
