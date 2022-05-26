import * as React from "react";
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchBooleanFilter from "./AdvancedSearchBooleanFilter";
import AdvancedSearchValueFilter from "./AdvancedSearchValueFilter";

export interface AdvancedSearchFilterProps {
  onChange: (query: AdvancedSearchQuery) => void;
  onSelect?: (query: AdvancedSearchQuery) => void;
  onRemove: (query: AdvancedSearchQuery) => void;
  query: AdvancedSearchQuery,
  selectedQueryId?: string,
};

export default (props: AdvancedSearchFilterProps): JSX.Element => {
  const {
    onChange,
    onSelect,
    onRemove,
    query,
    selectedQueryId,
  } = props;

  if (query && (query.and || query.or)) {
    return (
      <AdvancedSearchBooleanFilter
        onChange={onChange}
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
        onSelect={onSelect}
        onRemove={onRemove}
        query={query}
        selected={query.id === selectedQueryId}
      />
    );
  }

  return <span>No filters applied.</span>;
};
