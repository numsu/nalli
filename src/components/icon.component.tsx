import React from 'react';

import { AntDesign, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';

export enum IconType {
	ANT_DESIGN,
	FONT_AWESOME,
	FONT_AWESOME5,
	ION,
	MATERIAL_COMMUNITY,
	MATERIAL,
	SIMPLE_LINE,
}

interface IconProps {
	icon: string,
	size?: number,
	style?: any,
	type: IconType,
}

export default class NalliIcon extends React.PureComponent<IconProps, any> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const {
			icon,
			size,
			style,
			type,
		} = this.props;

		switch (type) {
			case IconType.ANT_DESIGN:
				return <AntDesign name={icon as any} size={size} style={style} />;
			case IconType.FONT_AWESOME:
				return <FontAwesome name={icon as any} size={size} style={style} />;
			case IconType.FONT_AWESOME5:
				return <FontAwesome5 name={icon as any} size={size} style={style} />;
			case IconType.ION:
				return <Ionicons name={icon as any} size={size} style={style} />;
			case IconType.MATERIAL_COMMUNITY:
				return <MaterialCommunityIcons name={icon as any} size={size} style={style} />;
			case IconType.MATERIAL:
				return <MaterialIcons name={icon as any} size={size} style={style} />;
			case IconType.SIMPLE_LINE:
				return <SimpleLineIcons name={icon as any} size={size} style={style} />;
		}
	}

}
