import React, { ReactNode, RefObject } from 'react';
import { Platform } from 'react-native';
import BottomSheet from 'reanimated-bottom-sheet';

import BottomSheetHeader from './bottom-sheet-header.component';

interface BottomSheetProps {
	initialSnap: number;
	snapPoints: (string | number)[];
	enabledInnerScrolling?: boolean;
	reference?: RefObject<any>;
	children: ReactNode;
	header: string;
}

interface BottomSheetState {
}

export default class MyBottomSheet extends React.Component<BottomSheetProps, BottomSheetState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const {
			initialSnap,
			snapPoints,
			enabledInnerScrolling,
			reference,
			header,
			children,
		} = this.props;
		return (
			<BottomSheet
					initialSnap={initialSnap}
					snapPoints={snapPoints}
					enabledContentTapInteraction={Platform.OS == 'ios'}
					enabledContentGestureInteraction={enabledInnerScrolling || false}
					enabledBottomClamp={true}
					ref={reference}
					enabledInnerScrolling={enabledInnerScrolling || false}
					renderHeader={() => (
						<BottomSheetHeader header={header} />
					)}
					renderContent={() => (
						children
					)} />
		);
	}

}
