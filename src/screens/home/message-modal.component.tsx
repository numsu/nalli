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
	message: string;
	onConfirmMessage: (message?: string) => void;
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
			message: props.message,
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen, message: nextProps.message };
		}
		return null;
	}

	hide = () => {
		this.props.onConfirmMessage();
		this.setState({ message: this.props.message });
	}

	onChangeMessage = (message: string) => {
		if (message.split('\n').length > 8) {
			return;
		}
		this.setState({ message });
	}

	onConfirmMessage = (message: string) => {
		const trimmed = this.cleanMessage(message);
		if (message.length == 0 || trimmed != '') {
			this.props.onConfirmMessage(trimmed);
		}
	}

	cleanMessage = (message: string): string => {
		const trimmed = message.trim();
		const whitespaceTrimmed = trimmed.replace(/  +/g, ' ');
		let lineBreaksTrimmed = whitespaceTrimmed;
		while (lineBreaksTrimmed.includes('\n\n\n')) {
			lineBreaksTrimmed = lineBreaksTrimmed.replace('\n\n\n', '\n\n');
		}
		return lineBreaksTrimmed;
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
							style={styles.input}
							onChangeText={this.onChangeMessage}
							label='Message'
							multiline
							numberOfLines={2}
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
		paddingBottom: 70,
		marginTop: -8,
	},
	input: {
		minHeight: 70,
	},
	button: {
		position: 'absolute',
		bottom: 20,
	},
});
