// src/components/Input.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleProp,
  ViewStyle
} from 'react-native';
import { InputProps } from '../types';
import { styles } from '../styles/global';

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder = '',
  secureTextEntry = false,
  error = '',
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete,
  editable = true,
  maxLength,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const containerStyle: StyleProp<ViewStyle> = [
    styles.inputContainer,
    style, // ✅ Aplicar estilo personalizado
  ];

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          isFocused ? styles.inputFocused : null,
          multiline ? styles.inputMultiline : null,
          !editable ? { backgroundColor: '#f5f5f5', color: '#999' } : null
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete as any}
        editable={editable}
        maxLength={maxLength}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default Input;