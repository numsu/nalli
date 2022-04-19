import React from 'react';
import {
	StyleSheet,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { BottomSheetView } from '@gorhom/bottom-sheet';

import Colors from '../constants/colors';
import MessageModal from '../screens/home/message-modal.component';
import NalliIcon, { IconType } from './icon.component';
import NalliText, { ETextSize } from './text.component';

interface MessageProps {
	message: string;
	onChangeMessage?: (message?: string) => void;
	disableEditing?: boolean;
}

interface MessageState {
	message: string;
	messageModalOpen: boolean;
}

export default class Message extends React.PureComponent<MessageProps, MessageState> {

	constructor(props) {
		super(props);
		this.state = {
			message: props.message,
			messageModalOpen: false,
		}
	}

	onAddMessagePress = () => {
		this.setState({ messageModalOpen: true });
	}

	onChangeMessage = (message?: string) => {
		if (message === undefined) {
			this.setState({ messageModalOpen: false });
		} else {
			this.setState({ message, messageModalOpen: false });
			this.props.onChangeMessage(message);
		}
	}

	render = () => {
		const { message, messageModalOpen } = this.state;
		const { disableEditing } = this.props;
		return (
			<BottomSheetView style={{ marginVertical: 10 }}>
				<NalliText size={ETextSize.H2}>Message</NalliText>
				{!message && !disableEditing &&
					<TouchableOpacity onPress={this.onAddMessagePress}>
						<NalliText style={styles.addMessageText}><NalliIcon icon='plus' type={IconType.ANT_DESIGN} size={16} />&nbsp;Add a message</NalliText>
					</TouchableOpacity>
				}
				{!!message &&
					<BottomSheetView>
						<BottomSheetView style={styles.messageContainer}>
							<NalliText style={styles.message} size={ETextSize.P_MEDIUM}>{message}</NalliText>
						</BottomSheetView>
						{!disableEditing &&
							<TouchableOpacity onPress={this.onAddMessagePress}>
								<NalliText style={styles.addMessageText}><NalliIcon icon='edit' type={IconType.MATERIAL} size={16} />&nbsp;Edit message</NalliText>
							</TouchableOpacity>
						}
					</BottomSheetView>
				}
				{!disableEditing &&
					<MessageModal
							message={message}
							maxLength={128}
							isOpen={messageModalOpen}
							onConfirmMessage={this.onChangeMessage} />
				}
			</BottomSheetView>
		);
	}

}

const styles = StyleSheet.create({
	addMessageText: {
		color: Colors.main,
		fontSize: 16,
		marginTop: 5,
	},
	messageContainer: {
		flex: 1,
		backgroundColor: Colors.lightGrey,
		paddingHorizontal: 15,
		paddingBottom: 10,
		paddingTop: 10,
		borderRadius: 25,
		marginTop: 10,
	},
	message: {
	},
});
