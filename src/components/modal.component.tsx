import React from 'react';
import {
	EmitterSubscription,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import { Avatar } from 'react-native-elements';
import Modal from 'react-native-modal';

import Colors from '../constants/colors';
import { ANIMATION_DELAY, sleep } from '../constants/globals';
import layout from '../constants/layout';
import { NalliAppState } from '../screens/home/privacy-shield.component';
import VariableStore, { NalliVariable } from '../service/variable-store';
import NalliLinearGradient from './linear-gradient.component';
import NalliText, { ETextSize } from './text.component';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	header: string;
	headerComponent?: any;
	headerContainerStyle?: any;
	linearGradientTopStyle?: any;
	linearGradientTopStart?: number;
	noScroll?: boolean;
	size?: EModalSize;
}

interface ModalState {
	isOpen: boolean;
	isRendered: boolean;
	appState: NalliAppState;
}

export default class NalliModal extends React.PureComponent<ModalProps, ModalState> {

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
				await sleep(ANIMATION_DELAY * 2);
			}
			this.setState({ isRendered: this.props.isOpen });
		}
	}

	render = () => {
		const {
			children,
			header,
			headerComponent,
			headerContainerStyle,
			linearGradientTopStyle,
			linearGradientTopStart,
			size,
			noScroll,
			onClose,
		} = this.props;
		const { isOpen, isRendered, appState } = this.state;

		if (isRendered) {
			return (
				<Modal
						propagateSwipe
						avoidKeyboard
						hideModalContentWhileAnimating
						animationIn={'zoomIn'}
						animationOut={'fadeOut'}
						animationInTiming={ANIMATION_DELAY}
						animationOutTiming={ANIMATION_DELAY}
						isVisible={isOpen && appState == NalliAppState.ACTIVE}
						onBackdropPress={onClose}
						onBackButtonPress={onClose}
						statusBarTranslucent
						useNativeDriverForBackdrop
						useNativeDriver>
					<KeyboardAvoidingView
							enabled={Platform.OS == 'android'}
							behavior={'height'}
							style={[styles.containerBase, size == EModalSize.MINI
								? styles.containerMini
								: size == EModalSize.LARGE
									? styles.containerLarge
									: styles.containerMedium]}>
						<View style={[styles.headerContainer, headerContainerStyle]}>
							<View style={styles.headerContentContainer}>
								<NalliText size={ETextSize.H1}>
									{header}
								</NalliText>
								<Avatar
										rounded
										onPress={onClose}
										icon={{ name: 'close', type: 'material' }}
										size='small'
										overlayContainerStyle={{ backgroundColor: Colors.main }} />
							</View>
							{headerComponent}
						</View>
						<NalliLinearGradient style={{ height: 30, top: 50, ...linearGradientTopStyle }} start={!linearGradientTopStart || linearGradientTopStart == 0 ? 0 : 0.1} />
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
						<NalliLinearGradient bottom />
					</KeyboardAvoidingView>
				</Modal>
			);
		} else {
			return null;
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
				minHeight: 230,
			},
			ios: {
				minHeight: 230,
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
		overflow: 'hidden',
	},
	headerContainer: {
		backgroundColor: 'white',
		position: 'absolute',
		top: 0,
		height: 50,
		width: '100%',
		zIndex: 100,
	},
	headerContentContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 15,
		paddingTop: 15,
		zIndex: 2,
	},
	contentContainer: {
		paddingHorizontal: 15,
		flex: 1,
	},
	pushTop: {
		paddingTop: 70,
	},
});
