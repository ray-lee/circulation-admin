import * as React from "react";
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchBooleanFilter from "./AdvancedSearchBooleanFilter";
import AdvancedSearchValueFilter from "./AdvancedSearchValueFilter";

export interface AdvancedSearchFilterProps {
  onBooleanChange: (id: string, bool: string) => void;
  onMove: (id: string, targetId: string) => void;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  query: AdvancedSearchQuery;
  selectedQueryId?: string;
}

export default function AdvancedSearchFilter({
  onBooleanChange,
  onMove,
  onSelect,
  onRemove,
  query,
  selectedQueryId,
}: AdvancedSearchFilterProps): JSX.Element {
  if (query) {
    if (query.and || query.or) {
      return (
        <AdvancedSearchBooleanFilter
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
          query={query}
          selectedQueryId={selectedQueryId}
        />
      );
    }

    return (
      <AdvancedSearchValueFilter
        onMove={onMove}
        onSelect={onSelect}
        onRemove={onRemove}
        query={query}
        selected={query.id === selectedQueryId}
      />
    );
  }

  return <span>No filters configured.</span>;
}
