import * as React from "react";
import { useState } from "react";
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchFilter from "./AdvancedSearchFilter";

export interface AdvancedSearchFilterViewProps {
  onChange: (query: AdvancedSearchQuery) => void;
  onMove: (id: String, targetId: String) => void;
  onSelect?: (query: AdvancedSearchQuery) => void;
  onRemove: (id: String) => void;
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
}: AdvancedSearchFilterViewProps): JSX.Element => {
  const [codeViewOpen, setCodeViewOpen] = useState(false);

  const handleToggleCodeViewButtonClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();

    setCodeViewOpen(!codeViewOpen);
  };

  return (
    <div className="advanced-search-filter-view">
      <div className="advanced-search-filter-tree-view" role="tree">
        <AdvancedSearchFilter
          onChange={onChange}
          onMove={onMove}
          onRemove={onRemove}
          onSelect={onSelect}
          query={query}
          selectedQueryId={selectedQueryId}
        />
      </div>

      <div className="advanced-search-filter-code-view">
        <button onClick={handleToggleCodeViewButtonClick}>{codeViewOpen ? "-" : "{}"}</button>

        {codeViewOpen &&
          <pre>
            {JSON.stringify({ query }, (key, value) => (key === "id" ? undefined : value), 2)}
          </pre>
        }
      </div>
    </div>
  );
};
