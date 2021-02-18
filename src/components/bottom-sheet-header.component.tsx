import React from 'react';
import {
	Platform,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import colors from '../constants/colors';
import Colors from '../constants/colors';

interface BottomSheetHeaderProps {
	header: string;
}

interface BottomSheetHeaderState {
}

export default class BottomSheetHeader extends React.Component<BottomSheetHeaderProps, BottomSheetHeaderState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const { header } = this.props;
		return (
			<View style={styles.headerStyle}>
				<View style={styles.panelHandle} />
				<Text style={styles.h2}>
					{header}
				</Text>
			</View>
		);
	}

}

const styles = StyleSheet.create({
	panelHandle: {
		width: 50,
		height: 5,
		borderRadius: 4,
		backgroundColor: colors.borderColor,
		marginBottom: 20,
		alignSelf: 'center',
	},
	h2: {
		fontSize: 25,
		marginBottom: 10,
		marginTop: -15,
		fontFamily: 'OpenSansBold',
	},
	headerStyle: {
		shadowOffset: { width: 0, height: -5 },
		shadowRadius: 4,
		shadowColor: Colors.shadowColor,
		shadowOpacity: 0.1,
		backgroundColor: 'white',
		borderTopRightRadius: 20,
		borderTopLeftRadius: 20,
		...Platform.select({
			android: {
				borderTopWidth: 3,
				borderRightWidth: 3,
				borderLeftWidth: 3,
				marginHorizontal: -3,
			},
		}),
		borderColor: 'rgba(0, 0, 0, 0.05)',
		paddingHorizontal: 15,
		paddingTop: 10,
	},
});
