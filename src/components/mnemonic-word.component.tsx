import React, { RefObject } from 'react';
import {
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';

import Colors from '../constants/colors';

interface MnemonicWordProps {
	editable?: boolean;
	index: number;
	onChangeText?: (index: number, val: string) => void;
	reference?: RefObject<any>;
	value?: string;
}

interface MnemonicWordState {
}

export default class MnemonicWord extends React.Component<MnemonicWordProps, MnemonicWordState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const { children, editable, index, onChangeText, reference, value } = this.props;
		return (
			<View style={styles.container}>
				<Text style={styles.index}>
					{index}
				</Text>
				{!editable &&
					<View style={styles.word}>
						<Text>{children}</Text>
					</View>
				}
				{editable &&
					<TextInput
							ref={reference}
							style={styles.word}
							secureTextEntry={false}
							keyboardType="visible-password"
							autoCorrect={false}
							autoCompleteType={'off'}
							autoCapitalize={'none'}
							onChangeText={val => onChangeText(index - 1, val)}
							value={value} />
				}
			</View>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		marginTop: 5,
		borderWidth: 1,
		borderStyle: 'solid',
		borderColor: Colors.main,
		borderRadius: 10,
		flexDirection: 'row',
		width: '45%',
	},
	index: {
		fontWeight: 'bold',
		width: 23,
		color: Colors.main,
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 4,
		alignSelf: 'center',
		textAlign: 'center',
	},
	word: {
		borderLeftWidth: 1,
		borderLeftColor: Colors.main,
		marginLeft: 5,
		paddingTop: 4,
		paddingBottom: 4,
		paddingLeft: 5,
		width: '100%',
		fontSize: 18,
		fontFamily: 'OpenSans',
	},
});
