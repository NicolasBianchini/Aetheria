import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils';

function Card({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <View
      style={StyleSheet.flatten([
        styles.card,
        className ? { /* Apply Tailwind styles from className here */ } : {},
      ])}
      {...props}
    >
      {children}
    </View>
  );
}

function CardHeader({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <View
      style={StyleSheet.flatten([
        styles.cardHeader,
        className ? { /* Apply Tailwind styles from className here */ } : {},
      ])}
      {...props}
    >
      {children}
    </View>
  );
}

function CardTitle({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <Text
      style={StyleSheet.flatten([
        styles.cardTitle,
        className ? { /* Apply Tailwind styles from className here */ } : {},
      ])}
      {...props}
    >
      {children}
    </Text>
  );
}

function CardDescription({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <Text
      style={StyleSheet.flatten([
        styles.cardDescription,
        className ? { /* Apply Tailwind styles from className here */ } : {},
      ])}
      {...props}
    >
      {children}
    </Text>
  );
}

function CardContent({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <View
      style={StyleSheet.flatten([
        styles.cardContent,
        className ? { /* Apply Tailwind styles from className here */ } : {},
      ])}
      {...props}
    >
      {children}
    </View>
  );
}

function CardFooter({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <View
      style={StyleSheet.flatten([
        styles.cardFooter,
        className ? { /* Apply Tailwind styles from className here */ } : {},
      ])}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardHeader: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  cardContent: {
    padding: 16,
  },
  cardFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
