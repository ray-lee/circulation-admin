import * as React from "react";
import classNames from "classnames";
import { AdvancedSearchQuery } from "../interfaces";
import { ConnectDragPreview, ConnectDragSource, ConnectDropTarget, useDrag, useDrop } from "react-dnd";

export interface AdvancedSearchValueFilterProps {
  onMove: (id: String, targetId: String) => void;
  onRemove: (id: String) => void;
  onSelect?: (query: AdvancedSearchQuery) => void;
  query: AdvancedSearchQuery;
  selected?: boolean;
}

function getOpSymbol(op) {
  switch (op) {
    case "contains": return ":";
    case "eq": return "=";
    case "neq": return "≠";
    case "gt": return ">";
    case "gte": return "≥";
    case "lt": return "<";
    case "lte": return "≤";
  }

  return op;
}

export default function AdvancedSearchValueFilter({
  onMove,
  onRemove,
  onSelect,
  query,
  selected,
}: AdvancedSearchValueFilterProps) {
  if (!query) {
    return null;
  }

  const handleClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (onSelect) {
      onSelect(query);
    }
  }

  const handleRemoveButtonClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();

    onRemove(query.id);
  }

  const [, drag]: [{}, ConnectDragSource, ConnectDragPreview] = useDrag(
    {
      type: "filter",
      item: {
        id: query.id,
      }
    },
    [query.id],
  );

  const [dropProps, drop]: [{ canDrop: boolean; isOver: boolean; }, ConnectDropTarget] = useDrop(
    {
      accept: "filter",
      canDrop: (item: any) => item.id !== query.id,
      drop: (item: any, monitor) => {
        if (!monitor.didDrop()) {
          onMove(item.id, query.id);

          return {
            id: query.id,
          };
        }
      },
      collect: (monitor) => ({
        canDrop: !!monitor.canDrop(),
        isOver: !!monitor.isOver(),
      })
    },
    [query.id, onMove],
  );

  const {
    key,
    op,
    value,
  } = query;

  const className = classNames({
    "advanced-search-value-filter": true,
    "drag-drop": dropProps.isOver && dropProps.canDrop,
    selected,
  });

  return (
    <div
      aria-selected={selected}
      className={className}
      onClick={handleClick}
      ref={(node) => drag(drop(node))}
      role="treeitem"
    >
      <span>{key} {getOpSymbol(op)} {value}</span>
      <button onClick={handleRemoveButtonClick}>×</button>
    </div>
  );
}
