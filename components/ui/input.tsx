import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  className?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextInput
        style={StyleSheet.flatten([
          styles.input,
          className ? { /* Apply Tailwind styles from className here */ } : {},
        ])}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    color: '#333',
  },
});

export { Input };
