import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import Colors from '../../constants/colors';

export default class NanoLogo extends React.PureComponent<any, any> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const { style, height, width, color } = this.props;
		return (
			<View style={style}>
				<Svg style={{ fill: color || Colors.main }} viewBox='0 0 1730 760.9' width={width || '30'} height={height || '15'}>
					<Circle cx='124.5' cy='625.3' r='124.5' />
					<Path d='M1608.1 8c-67.4 0-124.5 54.5-124.5 124.5 0 98.6-15.6 124.5-124.5 124.5h-10.4c-62.2 5.2-111.5 57.1-111.5 121.9v2.6c0 96-18.2 119.3-124.5 119.3-5.2 0-10.4 0-13 2.6-62.2 7.8-111.5 59.7-111.5 121.9 0 67.4 54.5 124.5 124.5 124.5 64.8 0 119.3-51.9 121.9-114.1v-10.4c0-88.2 28.5-121.9 121.9-124.5h2.6c64.8 0 119.3-51.9 121.9-116.7v-7.8c0-90.8 28.5-124.5 124.5-124.5 67.4 0 124.5-54.5 124.5-124.5C1730 62.5 1675.5 8 1608.1 8zM876.7 257h-10.4c-108.9 0-124.5-25.9-124.5-124.5C741.8 65.1 687.3 8 617.3 8c-67.4 0-124.5 54.5-124.5 124.5 0 98.6-15.6 121.9-124.5 121.9h-10.4c-62.2 5.2-111.5 57.1-111.5 121.9 0 67.4 54.5 124.5 124.5 124.5 64.8 0 119.3-51.9 121.9-114.1v-7.8c0-90.8 28.5-124.5 124.5-124.5s124.5 33.7 124.5 121.9c0 67.4 54.5 124.5 124.5 124.5s124.5-54.5 124.5-124.5c-2.6-62.2-51.9-114.1-114.1-119.3z' />
				</Svg>
			</View>
		);
	}

}
