// src/components/Button.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp
} from 'react-native';
import { ButtonProps } from '../types';
import { styles } from '../styles/global';

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  type = 'primary',
  style
}) => {
  const getButtonStyle = (): StyleProp<ViewStyle> => {
    const buttonStyles: any[] = [styles.button];
    
    if (disabled) {
      buttonStyles.push(styles.buttonDisabled);
    } else {
      switch (type) {
        case 'secondary':
          buttonStyles.push(styles.buttonSecondary);
          break;
        case 'danger':
          buttonStyles.push(styles.buttonDanger);
          break;
        default:
          break;
      }
    }
    
    if (style) {
      buttonStyles.push(style);
    }
    
    return StyleSheet.flatten(buttonStyles) as ViewStyle;
  };

  const getTextStyle = (): TextStyle => {
    if (disabled) {
      return { color: '#fff' };
    }
    
    if (type === 'secondary') {
      return { color: '#fff', fontSize: 16, fontWeight: '600' };
    }
    
    if (type === 'danger') {
      return { color: '#fff', fontSize: 16, fontWeight: '600' };
    }
    
    return { color: '#fff', fontSize: 16, fontWeight: '600' };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={type === 'secondary' ? '#3498db' : '#fff'} 
          style={{ marginRight: 8 }}
        />
      ) : null}
      <Text style={getTextStyle()}>
        {loading ? 'Cargando...' : title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;