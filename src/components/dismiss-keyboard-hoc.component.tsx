import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';

const DismissKeyboardHOC = (Comp) => {
	return ({ children, ...props }) => (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<Comp {...props}>
				{children}
			</Comp>
		</TouchableWithoutFeedback>
	);
};

const DismissKeyboardView = DismissKeyboardHOC(View);

export default DismissKeyboardView;
