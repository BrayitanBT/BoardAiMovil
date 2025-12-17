import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity 
} from 'react-native';
import { CardProps } from '../types';
import { styles } from '../styles/global';

const Card: React.FC<CardProps> = ({
  title,
  description,
  onPress,
  children,
  style
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      {description ? <Text style={styles.cardText}>{description}</Text> : null}
      {children}
    </Container>
  );
};

export default Card;