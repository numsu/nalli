import React, { ReactNode, RefObject } from 'react';
import { Platform, StyleSheet } from 'react-native';

import BottomSheet from '@gorhom/bottom-sheet';

import Colors from '../constants/colors';
import NalliText, { ETextSize } from './text.component';

interface BottomSheetProps {
	children: ReactNode;
	enablePanDownToClose?: boolean;
	header: string;
	initialSnap: number;
	reference?: RefObject<any>;
	snapPoints: (string | number)[];
}

interface BottomSheetState {
}

export default class MyBottomSheet extends React.Component<BottomSheetProps, BottomSheetState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const {
			children,
			enablePanDownToClose,
			header,
			initialSnap,
			reference,
			snapPoints,
		} = this.props;
		return (
			<BottomSheet
					index={initialSnap}
					snapPoints={snapPoints}
					enablePanDownToClose={enablePanDownToClose}
					animateOnMount={false}
					ref={reference}
					handleIndicatorStyle={styles.panelHandle}
					style={styles.shadow}>
				<NalliText
						size={ETextSize.H1}
						style={styles.header}>
					{ header }
				</NalliText>
				{ children }
			</BottomSheet>
		);
	}

}

const styles = StyleSheet.create({
	panelHandle: {
		backgroundColor: Colors.borderColor,
	},
	header: {
		marginBottom: 10,
		paddingHorizontal: 15,
	},
	shadow: {
		shadowOffset: { width: 0, height: -5 },
		shadowRadius: 4,
		shadowColor: Colors.shadowColor,
		shadowOpacity: 0.1,
		...Platform.select({
			android: {
				borderTopWidth: 3,
				borderRightWidth: 3,
				borderLeftWidth: 3,
				marginHorizontal: -3,
			},
		}),
		borderColor: 'rgba(0, 0, 0, 0.05)',
	},
});
