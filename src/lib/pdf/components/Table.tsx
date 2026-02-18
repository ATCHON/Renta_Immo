/**
 * PDF Table Component
 */
import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles as baseStyles, colors } from '../styles';

interface TableColumn<T> {
  key: keyof T;
  header: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], row: T) => string;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  showHeader?: boolean;
  striped?: boolean;
}

export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  showHeader = true,
  striped = true,
}: TableProps<T>) {
  const columnWidths = columns.map((col) => col.width || `${100 / columns.length}%`);

  const getAlignment = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'right':
        return 'flex-end';
      case 'center':
        return 'center';
      default:
        return 'flex-start';
    }
  };

  const getCellValue = (row: T, column: TableColumn<T>): string => {
    const value = row[column.key];
    if (column.render) {
      return column.render(value, row);
    }
    return String(value ?? '');
  };

  return (
    <View style={baseStyles.table}>
      {/* Header */}
      {showHeader && (
        <View style={baseStyles.tableHeader}>
          {columns.map((col, index) => (
            <View
              key={String(col.key)}
              style={{
                width: columnWidths[index],
                alignItems: getAlignment(col.align),
              }}
            >
              <Text style={baseStyles.tableHeaderCell}>{col.header}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Rows */}
      {data.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[
            baseStyles.tableRow,
            striped && rowIndex % 2 === 1 ? { backgroundColor: colors.surface } : {},
          ]}
        >
          {columns.map((col, colIndex) => (
            <View
              key={String(col.key)}
              style={{
                width: columnWidths[colIndex],
                alignItems: getAlignment(col.align),
              }}
            >
              <Text style={baseStyles.tableCell}>{getCellValue(row, col)}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
