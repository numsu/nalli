import { PureComponent, ReactNode, RefObject } from 'react';
import { Platform, StyleSheet } from 'react-native';

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

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
	linearGradientTopStart?: number;
	linearGradientTopStyle?: any;
	onClose?: () => void;
	reference?: RefObject<any>;
	snapPoints: (string | number)[];
}

interface BottomSheetState {
}

export default class MyBottomSheet extends PureComponent<BottomSheetProps, BottomSheetState> {

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
			linearGradientTopStyle,
			linearGradientTopStart,
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
				<BottomSheetView style={styles.headerContainer}>
					<NalliText
							size={ETextSize.H1}>
						{header}
					</NalliText>
					{headerIconComponent}
				</BottomSheetView>
				<BottomSheetView style={styles.contentContainer}>
					{enableLinearGradient && <NalliLinearGradient style={linearGradientTopStyle} start={linearGradientTopStart} />}
					{children}
				</BottomSheetView>
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
		zIndex: 100,
	},
	contentContainer: {
		height: '100%',
		marginTop: -20,
		zIndex: 1,
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
