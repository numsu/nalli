import React from 'react';

import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export enum IconType {
	ION,
	MATERIAL_COMMUNITY,
	MATERIAL,
	FONT_AWESOME5,
}

interface IconProps {
	icon: string,
	size?: number,
	style?: any,
	type: IconType,
}

interface IconState {
}

export default class NalliIcon extends React.Component<IconProps, IconState> {

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
			case IconType.ION:
				return <Ionicons name={icon as any} size={size} style={style} />
			case IconType.MATERIAL_COMMUNITY:
				return <MaterialCommunityIcons name={icon as any} size={size} style={style} />
			case IconType.MATERIAL:
				return <MaterialIcons name={icon as any} size={size} style={style} />
			case IconType.FONT_AWESOME5:
				return <FontAwesome5 name={icon as any} size={size} style={style} />
		}
	}

}
