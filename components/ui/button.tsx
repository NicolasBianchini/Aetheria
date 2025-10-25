import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'flex flex-row items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background text-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
}

function Button({ className, variant, size, onPress, children }: ButtonProps) {
  return (
    <TouchableOpacity
      style={StyleSheet.flatten([
        buttonVariants({ variant, size }),
        className ? { /* Apply Tailwind styles from className here */ } : {},
      ])}
      onPress={onPress}
    >
      <Text>{children}</Text>
    </TouchableOpacity>
  );
}

export { Button, buttonVariants };
