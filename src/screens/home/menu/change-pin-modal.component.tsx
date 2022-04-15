import { PureComponent } from 'react';
import {
	StyleSheet,
	TextInput,
	View,
} from 'react-native';

import NalliModal, { EModalSize } from '../../../components/modal.component';
import NalliNumberPad from '../../../components/nalli-number-pad.component';
import NalliText, { ETextSize } from '../../../components/text.component';
import Colors from '../../../constants/colors';
import { ANIMATION_DELAY } from '../../../constants/globals';
import layout from '../../../constants/layout';
import AuthStore from '../../../service/auth-store';

interface ChangePinModalProps {
	isOpen: boolean;
	close: () => void;
}

interface ChangePinModalState {
	isConfirm: boolean;
	isOpen: boolean;
	pin: string;
	confirm: string;
}

export default class ChangePinModal extends PureComponent<ChangePinModalProps, ChangePinModalState> {

	constructor(props) {
		super(props);
		this.state = {
			isConfirm: false,
			isOpen: false,
			pin: '',
			confirm: '',
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen };
		}
		return null;
	}

	validatePin = async (pin: string) => {
		if (!this.state.isConfirm) {
			if (pin.length == 6) {
				this.setState({ pin, isConfirm: true });
			} else {
				this.setState({ pin });
			}
		} else {
			this.setState({ confirm: pin });
			if (this.state.pin == pin) {
				await AuthStore.setPin(pin);
				this.close();
			}
		}
	}

	close = () => {
		setTimeout(() => this.setState({ isConfirm: false, pin: '', confirm: '' }), ANIMATION_DELAY);
		this.props.close();
	}

	render = () => {
		const {
			isOpen,
			isConfirm,
			pin,
			confirm,
		} = this.state;

		return (
			<NalliModal
					size={EModalSize.LARGE}
					isOpen={isOpen}
					onClose={this.close}
					header='Change PIN'>
				<View style={styles.pinContainer}>
					<NalliText size={ETextSize.H2} style={styles.header}>{isConfirm ? 'Confirm new PIN' : 'New PIN'}</NalliText>
					<TextInput
							style={styles.numberPadPin}
							value={'*'.repeat(isConfirm ? confirm.length : pin.length)}
							allowFontScaling={false}
							editable={false} />
					<NalliNumberPad
							style={styles.numberPad}
							pin={isConfirm ? confirm : pin}
							onChangeText={this.validatePin} />
				</View>
			</NalliModal>
		);
	}

}

const styles = StyleSheet.create({
	numberPad: {
		borderColor: Colors.main,
		color: Colors.main,
	},
	pinContainer: {
		marginHorizontal: -28,
		marginTop: layout.isSmallDevice ? 0 : 30,
		alignItems: 'center',
		paddingBottom: 30,
	},
	header: {
		marginBottom: 15,
		marginTop: 20,
	},
	numberPadPin: {
		color: Colors.main,
		fontSize: 38,
		width: '100%',
		textAlign: 'center',
	},
});
