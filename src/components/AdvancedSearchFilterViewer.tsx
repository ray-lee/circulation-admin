import * as React from "react";
import { useState } from "react";
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchFilter from "./AdvancedSearchFilter";

export interface AdvancedSearchFilterViewerProps {
  query: AdvancedSearchQuery;
  selectedQueryId?: string;
  showCodeViewer?: boolean;
  onChange: (query: AdvancedSearchQuery) => void;
  onMove: (id: string, targetId: string) => void;
  onSelect?: (id: string) => void;
  onRemove: (id: string) => void;
}

export default ({
  query,
  selectedQueryId,
  showCodeViewer = false,
  onChange,
  onMove,
  onSelect,
  onRemove,
}: AdvancedSearchFilterViewerProps): JSX.Element => {
  const [codeOpen, setCodeOpen] = useState(false);

  const handleToggleCodeButtonClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();

    setCodeOpen(!codeOpen);
  };

  return (
    <div className="advanced-search-filter-viewer">
      <div className="advanced-search-filter-tree" role="tree">
        <AdvancedSearchFilter
          onChange={onChange}
          onMove={onMove}
          onRemove={onRemove}
          onSelect={onSelect}
          query={query}
          selectedQueryId={selectedQueryId}
        />
      </div>

      {
        showCodeViewer && (
          <div className="advanced-search-filter-code">
            <button
              type="button"
              onClick={handleToggleCodeButtonClick}
            >
              {codeOpen ? "-" : "{}"}
            </button>

            {codeOpen &&
              <pre>
                {JSON.stringify({ query }, (key, value) => (key === "id" ? undefined : value), 2)}
              </pre>
            }
          </div>
        )
      }
    </div>
  );
};
