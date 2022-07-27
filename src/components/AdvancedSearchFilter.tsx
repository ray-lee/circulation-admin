import * as React from "react";
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchBooleanFilter from "./AdvancedSearchBooleanFilter";
import AdvancedSearchValueFilter from "./AdvancedSearchValueFilter";

export interface AdvancedSearchFilterProps {
  onChange: (query: AdvancedSearchQuery) => void;
  onMove: (id: string, targetId: string) => void;
  onSelect?: (id: string) => void;
  onRemove: (id: string) => void;
  query: AdvancedSearchQuery;
  selectedQueryId?: string;
}

export default ({
  onChange,
  onMove,
  onSelect,
  onRemove,
  query,
  selectedQueryId,
}: AdvancedSearchFilterProps): JSX.Element => {
  if (query && (query.and || query.or)) {
    return (
      <AdvancedSearchBooleanFilter
        onChange={onChange}
        onMove={onMove}
        onSelect={onSelect}
        onRemove={onRemove}
        query={query}
        selectedQueryId={selectedQueryId}
      />
    );
  }

  if (query) {
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
};
