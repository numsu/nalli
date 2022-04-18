import React from 'react';
import {
	StyleSheet,
	View,
} from 'react-native';

import NalliModal, { EModalSize } from '../../components/modal.component';
import NalliButton from '../../components/nalli-button.component';
import NalliInput from '../../components/nalli-input.component';

interface MessageModalProps {
	isOpen: boolean;
	maxLength?: number;
	onConfirmMessage: (message: string) => void;
}

interface MessageModalState {
	isOpen: boolean;
	message: string;
}

export default class MessageModal extends React.PureComponent<MessageModalProps, MessageModalState> {

	constructor(props) {
		super(props);
		this.state = {
			isOpen: props.isOpen,
			message: '',
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen };
		}
		return null;
	}

	hide = () => {
		this.props.onConfirmMessage(this.state.message);
	}

	onChangeMessage = (message: string) => {
		this.setState({ message });
	}

	onConfirmMessage = (message: string) => {
		this.props.onConfirmMessage(message);
	}

	render = () => {
		const { isOpen, message } = this.state;
		const { maxLength } = this.props;

		return (
			<NalliModal
					noScroll
					isOpen={isOpen}
					onClose={this.hide}
					header='Message'
					size={EModalSize.MINI}>
				<View style={styles.container}>
					<NalliInput
							onChangeText={this.onChangeMessage}
							label='Message'
							maxLength={maxLength}
							value={message} />
					<NalliButton
							style={styles.button}
							text='Confirm'
							solid
							onPress={() => this.onConfirmMessage(message)} />
				</View>
			</NalliModal>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	button: {
		position: 'absolute',
		bottom: 20,
	},
});
