import React from 'react';
import { View, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<View, ProgressProps>(
  ({ value, className, indicatorClassName, ...props }, ref) => (
    <View
      ref={ref}
      style={StyleSheet.flatten([
        styles.container,
        className ? { /* Apply Tailwind styles from className here */ } : {},
      ])}
      {...props}
    >
      <View
        style={StyleSheet.flatten([
          styles.indicator,
          { width: `${value}%` },
          indicatorClassName ? { /* Apply Tailwind styles from indicatorClassName here */ } : {},
        ])}
      />
    </View>
  )
);
Progress.displayName = 'Progress';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 4,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 9999,
    backgroundColor: '#E5E7EB', // bg-secondary
  },
  indicator: {
    height: '100%',
    backgroundColor: '#2563EB', // bg-primary
    transitionProperty: 'width',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
  },
});

export { Progress };
