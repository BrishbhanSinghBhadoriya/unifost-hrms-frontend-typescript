"use client";

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {SlidersHorizontal } from 'lucide-react';

import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
  sortAccessor?: (row: T) => any;
  sortType?: 'string' | 'number' | 'date';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  filters?: React.ReactNode;
  initialPageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (rows: T[]) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  onSearch,
  onRowClick,
  actions,
  filters,
  initialPageSize = 10,
  selectable = false,
  onSelectionChange,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
    setPage(1);
  };

  const rows = Array.isArray(data) ? data : [] as T[];
  const filteredRows = searchQuery
    ? rows.filter((row) => {
        const q = searchQuery.toLowerCase();
        return Object.values(row).some((v) =>
          String(v ?? '').toLowerCase().includes(q)
        );
      })
    : rows;
  const sortedData = [...filteredRows].sort((a, b) => {
    if (!sortColumn) return 0;
    const column = columns.find((c) => c.key === sortColumn);
    const accessor = column?.sortAccessor;
    const type = column?.sortType;

    const rawA = accessor ? accessor(a) : (a[sortColumn] as any);
    const rawB = accessor ? accessor(b) : (b[sortColumn] as any);

    let cmp = 0;
    if (type === 'number') {
      const na = Number(rawA ?? 0);
      const nb = Number(rawB ?? 0);
      cmp = na === nb ? 0 : na < nb ? -1 : 1;
    } else if (type === 'date') {
      const da = (rawA ? new Date(rawA).getTime() : 0) || 0;
      const db = (rawB ? new Date(rawB).getTime() : 0) || 0;
      cmp = da === db ? 0 : da < db ? -1 : 1;
    } else {
      const sa = String(rawA ?? '').toLowerCase();
      const sb = String(rawB ?? '').toLowerCase();
      cmp = sa.localeCompare(sb);
    }
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const totalRows = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedData = sortedData.slice(startIndex, endIndex);

  const toggleAll = (checked: boolean) => {
    const next = new Set<number>();
    if (checked) {
      for (let i = 0; i < pagedData.length; i++) next.add(i);
    }
    setSelected(next);
    onSelectionChange?.(checked ? pagedData : []);
  };

  const toggleOne = (index: number, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(index); else next.delete(index);
    setSelected(next);
    onSelectionChange?.(Array.from(next).map((i) => pagedData[i]).filter(Boolean));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {filters && (
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            {filters}
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-8">
                  <Checkbox
                    aria-label="Select all"
                    checked={selected.size === pagedData.length && pagedData.length > 0}
                    onCheckedChange={(v) => toggleAll(Boolean(v))}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.key as string} className={column.className}>
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.key)}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      {column.label}
                      {sortColumn === column.key && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        )
                      )}
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              {actions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.length > 0 ? (
              pagedData.map((row, index) => (
                <TableRow
                  key={index}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()} className="w-8">
                      <Checkbox
                        aria-label="Select row"
                        checked={selected.has(index)}
                        onCheckedChange={(v) => toggleOne(index, Boolean(v))}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key as string} className={column.className}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              const newSize = Number(v);
              setPageSize(newSize);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[84px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((s) => (
                <SelectItem key={s} value={String(s)}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>
            {totalRows === 0
              ? '0-0 of 0'
              : `${startIndex + 1}-${Math.min(endIndex, totalRows)} of ${totalRows}`}
          </span>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
                href="#"
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                href="#"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}