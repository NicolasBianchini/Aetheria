import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-base font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

interface LabelProps extends VariantProps<typeof labelVariants> {
  children: React.ReactNode;
  className?: string;
}

const Label = React.forwardRef<Text, LabelProps>(
  ({ className, children, ...props }, ref) => (
    <Text
      ref={ref}
      style={StyleSheet.flatten([
        labelVariants(),
        className ? { /* Apply Tailwind styles from className here */ } : {},
      ])}
      {...props}
    >
      {children}
    </Text>
  )
);
Label.displayName = 'Label';

export { Label };
