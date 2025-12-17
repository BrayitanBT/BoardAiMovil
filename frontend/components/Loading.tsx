import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle
} from 'react-native';
import { LoadingProps } from '../types';
import { styles } from '../styles/global';

const Loading: React.FC<LoadingProps> = ({
  message = 'Cargando...',
  size = 'large',
  color = '#3498db',
  type = 'default',
  containerStyle,
  textStyle,
  showSpinner = true
}) => {
  const getContainerStyle = (): StyleProp<ViewStyle> => {
    switch (type) {
      case 'fullscreen':
        return {
          ...styles.centerContainer,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        };
      case 'inline':
        return {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
        };
      default:
        return styles.centerContainer;
    }
  };

  const containerStyles: StyleProp<ViewStyle> = [
    getContainerStyle(),
    containerStyle
  ];

  // ✅ Asegurar que message sea siempre string
  const displayMessage = String(message || 'Cargando...');

  return (
    <View style={containerStyles}>
      {showSpinner && (
        <ActivityIndicator
          size={size}
          color={color}
          style={{ marginBottom: type === 'default' || type === 'fullscreen' ? 10 : 0 }}
        />
      )}
      <Text style={[styles.text, textStyle]}>
        {displayMessage} {/* ✅ Usar displayMessage en lugar de message directamente */}
      </Text>
    </View>
  );
};

export default Loading;