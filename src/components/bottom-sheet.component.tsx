import React, { ReactNode, RefObject } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import BottomSheet from '@gorhom/bottom-sheet';

import Colors from '../constants/colors';
import NalliLinearGradient from './linear-gradient.component';
import NalliText, { ETextSize } from './text.component';

interface BottomSheetProps {
	children: ReactNode;
	enableLinearGradient?: boolean;
	enablePanDownToClose?: boolean;
	header: string;
	headerIconComponent?: any;
	initialSnap: number;
	onClose?: () => void;
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
			enableLinearGradient,
			enablePanDownToClose,
			header,
			headerIconComponent,
			initialSnap,
			onClose,
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
					onClose={onClose}
					handleIndicatorStyle={styles.panelHandle}
					style={styles.shadow}>
				<View style={styles.headerContainer}>
					<NalliText
							size={ETextSize.H1}>
						{header}
					</NalliText>
					{headerIconComponent}
				</View>
				<View style={{ height: '100%' }}>
					{enableLinearGradient && <NalliLinearGradient />}
					{children}
				</View>
				{enableLinearGradient && <NalliLinearGradient bottom />}
			</BottomSheet>
		);
	}

}

const styles = StyleSheet.create({
	panelHandle: {
		backgroundColor: Colors.borderColor,
	},
	headerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
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
				borderRightWidth: 7,
				borderLeftWidth: 7,
				marginHorizontal: -7,
				borderRadius: 25,
			},
		}),
		borderColor: 'rgba(0, 0, 0, 0.05)',
	},
});
