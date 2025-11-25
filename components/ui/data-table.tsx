"use client";

import { useEffect, useState } from 'react';
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
import { SlidersHorizontal } from 'lucide-react';

import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortAccessor?: (row: T) => any;
  sortType?: 'string' | 'number' | 'date';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  defaultSearchValue?: string;
  onSearch?: (query: string) => void;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  filters?: React.ReactNode;
  initialPageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (rows: T[]) => void;
  defaultSortColumn?: keyof T;
  defaultSortDirection?: 'asc' | 'desc';
  paginationEnabled?: boolean;
  manualPagination?: boolean;
  currentPage?: number;
  totalRows?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  defaultSearchValue = '',
  onSearch,
  onRowClick,
  actions,
  filters,
  initialPageSize = 10,
  selectable = false,
  onSelectionChange,
  defaultSortColumn,
  defaultSortDirection,
  paginationEnabled = true,
  manualPagination = false,
  currentPage,
  totalRows,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(defaultSortColumn ?? null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection ?? 'asc');
  const [searchQuery, setSearchQuery] = useState(defaultSearchValue ?? '');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    setSearchQuery(defaultSearchValue ?? '');
  }, [defaultSearchValue]);

  useEffect(() => {
    setPageSize(initialPageSize);
  }, [initialPageSize]);

  const manualModeActive = Boolean(
    paginationEnabled &&
      manualPagination &&
      typeof onPageChange === 'function' &&
      typeof currentPage === 'number'
  );

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
    if (manualModeActive) {
      onPageChange?.(1);
    } else {
      setPage(1);
    }
  };

  const rows = Array.isArray(data) ? data : ([] as T[]);
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

  const effectivePageSize = pageSize;
  const effectivePage = manualModeActive ? currentPage ?? 1 : page;
  const resolvedTotalRows = manualModeActive
    ? totalRows ?? sortedData.length
    : sortedData.length;

  let pagedData = sortedData;
  let totalPages = 1;
  let startIndex = 0;
  let endIndex = resolvedTotalRows;

  if (paginationEnabled) {
    totalPages = Math.max(1, Math.ceil(resolvedTotalRows / effectivePageSize));
    const currentPageClamped = Math.min(Math.max(1, effectivePage), totalPages);
    startIndex = (currentPageClamped - 1) * effectivePageSize;
    endIndex = startIndex + effectivePageSize;

    if (!manualModeActive) {
      pagedData = sortedData.slice(startIndex, endIndex);
    } else {
      // For manual pagination data already represents the current page
      endIndex = Math.min(startIndex + pagedData.length, resolvedTotalRows);
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    if (manualModeActive) {
      onPageSizeChange?.(newSize);
      onPageChange?.(1);
    } else {
      setPage(1);
    }
  };

  const goToPage = (nextPage: number) => {
    const clamped = Math.max(1, Math.min(nextPage, totalPages));
    if (manualModeActive) {
      if (clamped !== effectivePage) {
        onPageChange?.(clamped);
      }
    } else {
      setPage(clamped);
    }
  };

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
                <TableHead key={column.key as string}>
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
                    <TableCell key={column.key as string}>
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
              handlePageSizeChange(newSize);
            }}
          >
            <SelectTrigger className="w-[84px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((s) => (
                <SelectItem key={s} value={String(s)}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>
            {resolvedTotalRows === 0
              ? '0-0 of 0'
              : `${startIndex + 1}-${Math.min(startIndex + pagedData.length, resolvedTotalRows)} of ${resolvedTotalRows}`}
          </span>
        </div>
        {paginationEnabled && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(effectivePage - 1);
                }}
                href="#"
                aria-disabled={effectivePage <= 1}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(effectivePage + 1);
                }}
                href="#"
                aria-disabled={effectivePage >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      </div>
    </div>
  );
}