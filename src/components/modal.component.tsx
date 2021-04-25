import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
	EmitterSubscription,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	View,
} from 'react-native';
import { Avatar } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';

import Colors from '../constants/colors';
import { sleep } from '../constants/globals';
import layout from '../constants/layout';
import { NalliAppState } from '../screens/home/privacy-shield.component';
import VariableStore, { NalliVariable } from '../service/variable-store';
import NalliText, { ETextSize } from './text.component';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	header: string;
	noScroll?: boolean;
	size?: EModalSize;
}

interface ModalState {
	isOpen: boolean;
	isRendered: boolean;
	appState: NalliAppState;
}

export default class NalliModal extends React.Component<ModalProps, ModalState> {

	static animationDelay = 200;

	constructor(props) {
		super(props);
		this.state = {
			isOpen: props.isOpen,
			isRendered: props.isOpen,
			appState: NalliAppState.ACTIVE,
		};
	}

	subscriptions: EmitterSubscription[] = [];

	componentDidMount = () => {
		this.subscriptions.push(VariableStore.watchVariable<NalliAppState>(NalliVariable.APP_STATE, appState => this.setState({ appState })));
	}

	componentWillUnmount = () => {
		this.subscriptions.forEach(VariableStore.unwatchVariable);
	}

	componentDidUpdate = async () => {
		if (this.props.isOpen != this.state.isOpen) {
			this.setState({ isOpen: this.props.isOpen });
			if (this.props.isOpen == false) {
				await sleep(NalliModal.animationDelay);
			}
			this.setState({ isRendered: this.props.isOpen });
		}
	}

	render = () => {
		const { header, children, size, noScroll, onClose } = this.props;
		const { isOpen, isRendered, appState } = this.state;

		if (isRendered) {
			return (
				<Modal
						propagateSwipe
						avoidKeyboard={true}
						hideModalContentWhileAnimating={true}
						animationIn={'zoomIn'}
						animationOut={'fadeOut'}
						animationInTiming={NalliModal.animationDelay}
						animationOutTiming={NalliModal.animationDelay}
						isVisible={isOpen && appState == NalliAppState.ACTIVE}
						onBackdropPress={onClose}
						onBackButtonPress={onClose}
						useNativeDriverForBackdrop={true}
						useNativeDriver={true}>
					<KeyboardAvoidingView
							enabled={Platform.OS == 'android'}
							behavior={'height'}
							style={[styles.containerBase, size == EModalSize.MINI
								? styles.containerMini
								: size == EModalSize.LARGE
									? styles.containerLarge
									: styles.containerMedium]}>
						<View style={styles.headerContainer}>
							<LinearGradient
									colors={['white', 'rgba(255, 255, 255, 0.0)']}
									style={styles.topContainerBackground}
									start={{ x: 0.5, y: 0.5 }}
									end={{ x: 0.5, y: 1 }} />
							<View style={styles.headerContentContainer}>
								<NalliText size={ETextSize.H1}>
									{header}
								</NalliText>
								<Avatar
										rounded={true}
										onPress={onClose}
										icon={{ name: 'close', type: 'material' }}
										size="small"
										overlayContainerStyle={{ backgroundColor: Colors.main }} />
							</View>
						</View>
						{noScroll &&
							<View style={styles.contentContainer}>
								<View style={styles.pushTop} />
								{children}
							</View>
						}
						{!noScroll &&
							<ScrollView style={styles.contentContainer}>
								<View style={styles.pushTop} />
								{children}
							</ScrollView>
						}

						<LinearGradient
									colors={['rgba(255, 255, 255, 0.0)', 'white']}
									style={styles.bottomContainerBackground}
									start={{ x: 0.5, y: 0 }}
									end={{ x: 0.5, y: 1 }} />
					</KeyboardAvoidingView>
				</Modal>
			);
		} else {
			return (<></>);
		}
	}

}

export enum EModalSize {
	LARGE,
	MEDIUM,
	MINI,
}

const styles = StyleSheet.create({
	containerLarge: {
		top: layout.window.height * 0.12,
		...Platform.select({
			android: {
				height: layout.window.height * 0.7,
			},
			ios: {
				height: layout.window.height * 0.7,
			},
		}),
	},
	containerMedium: {
		top: layout.window.height * 0.25,
		...Platform.select({
			android: {
				height: layout.window.height * 0.5,
			},
			ios: {
				height: layout.window.height * 0.5,
			},
		}),
	},
	containerMini: {
		top: layout.window.height * 0.18,
		...Platform.select({
			android: {
				height: 230,
			},
			ios: {
				height: 230,
			},
		}),
	},
	containerBase: {
		backgroundColor: 'white',
		borderRadius: 15,
		position: 'absolute',
		right: 0,
		left: 0,
		marginHorizontal: 15,
		overflow: 'scroll',
	},
	headerContainer: {
		backgroundColor: 'transparent',
		position: 'absolute',
		top: 0,
		height: 78,
		width: '100%',
		zIndex: 100,
	},
	topContainerBackground: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		width: '100%',
		height: '100%',
		borderRadius: 15,
	},
	bottomContainerBackground: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		width: '100%',
		height: 40,
		borderRadius: 15,
	},
	headerContentContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 15,
		paddingTop: 15,
	},
	contentContainer: {
		paddingHorizontal: 15,
		flex: 1,
	},
	pushTop: {
		paddingTop: 70,
	},
});
