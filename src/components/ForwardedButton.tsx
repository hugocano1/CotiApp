// src/components/ForwardedButton.tsx
import React from 'react';
import { Button, ButtonProps } from '@rneui/themed';
import { TouchableOpacity } from 'react-native'; // O el componente base que use RNE

// Este es un componente wrapper que simplemente reenvía la ref.
// El tipo `any` en `React.forwardRef<any, ...>` es una solución común
// cuando los tipos exactos de la ref de la librería subyacente no se exportan claramente.
const ForwardedButton = React.forwardRef<TouchableOpacity, ButtonProps>((props, ref) => {
  // @ts-ignore - RNE Button no expone su tipo de ref, pero internamente acepta una.
  return <Button {...props} ref={ref} />;
});

export default ForwardedButton;