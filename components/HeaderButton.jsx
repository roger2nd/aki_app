import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const HeaderButton = ({ 
    iconName, 
    onPress, 
    color = '#6200ee',
    size = 24,
    style,
    isLoading = false
    }) => (
        <Pressable
            onPress={onPress}
            disabled={isLoading}
            style={({ pressed }) => ({
            marginRight: 15,
            opacity: pressed || isLoading ? 0.6 : 1,
            ...style
            })}
        >
            {isLoading ? (
            <ActivityIndicator color={color} size={size} />
            ) : (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
            )}
        </Pressable>
);