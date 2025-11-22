import React from 'react';
import { Button, ButtonProps } from '@rneui/themed';
import { TouchableOpacity } from 'react-native';

// Este es un componente wrapper que permite que el Botón de RNEUI sea usado dentro de un Link de Expo Router con la prop 'asChild'.
// Usa React.forwardRef para pasar correctamente la 'ref' que el Link necesita entregarle al componente hijo.
const ForwardedButton = React.forwardRef<TouchableOpacity, ButtonProps>((props, ref) => {
  return <Button {...props} ref={ref} />;
});

export default ForwardedButton;
