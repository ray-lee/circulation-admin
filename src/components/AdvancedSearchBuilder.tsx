import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchFilterInput from "./AdvancedSearchFilterInput";
import AdvancedSearchFilterViewer from "./AdvancedSearchFilterViewer";

export interface AdvancedSearchBuilderProps {
  name: string;
  query: AdvancedSearchQuery;
  selectedQueryId: string;
  addQuery?: (builderName: string, query: AdvancedSearchQuery) => void;
  updateQuery?: (builderName: string, query: AdvancedSearchQuery) => void;
  moveQuery?: (builderName: string, id: string, targetId: string) => void;
  removeQuery?: (builderName: string, id: string) => void;
  selectQuery?: (builderName: string, id: string) => void;
}

export const fields = [
  { name: "genre", label: "genre" },
  // { name: "subject", label: "subject" },
  // { name: "publication date", label: "publication date" },
  { name: "language", label: "language" },
  { name: "audience", label: "audience" },
  { name: "author", label: "author" },
  { name: "title", label: "title" },
];

export const operators = [
  { name: "eq", label: "equals", symbol: "=" },
  { name: "contains", label: "contains", symbol: ":" },
  { name: "neq", label: "does not equal", symbol: "≠" },
  { name: "gt", label: "is greater than", symbol: ">" },
  { name: "gte", label: "is greater than or equals", symbol: "≥" },
  { name: "lt", label: "is less than", symbol: "<" },
  { name: "lte", label: "is less than or equals", symbol: "≤" },
];

export default ({
  name,
  query,
  selectedQueryId,
  addQuery,
  updateQuery,
  moveQuery,
  removeQuery,
  selectQuery,
}: AdvancedSearchBuilderProps) => (
  <DndProvider backend={HTML5Backend}>
    <div className="advanced-search">
      <AdvancedSearchFilterInput onAdd={(query) => addQuery?.(name, query)} />

      <AdvancedSearchFilterViewer
        query={query}
        selectedQueryId={selectedQueryId}
        onChange={(query) => updateQuery?.(name, query)}
        onMove={(id, targetId) => moveQuery?.(name, id, targetId)}
        onRemove={(id) => removeQuery?.(name, id)}
        onSelect={(id) => selectQuery?.(name, id)}
      />
    </div>
  </DndProvider>
);
