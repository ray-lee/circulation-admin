import classNames from "classnames";
import * as React from "react";
import { ConnectDropTarget, useDrop } from "react-dnd";
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchFilter from "./AdvancedSearchFilter";

export interface AdvancedSearchBooleanFilterProps {
  onChange: (query: AdvancedSearchQuery) => void;
  onMove: (id: String, targetId: String) => void;
  onSelect?: (query: AdvancedSearchQuery) => void;
  onRemove: (id: String) => void;
  query: AdvancedSearchQuery;
  selectedQueryId?: string;
}

const renderSeparator = (query, index) => {
  if (index < 1) {
    return null;
  }

  return (
    <span>
      {query.and ? "and" : "or"}
    </span>
  );
};

export default function AdvancedSearchBooleanQuery({
  onChange,
  onMove,
  onSelect,
  onRemove,
  query,
  selectedQueryId,
}: AdvancedSearchBooleanFilterProps) {
  const children = query && (query.and || query.or);

  if (!children) {
    return null;
  }

  const boolSelect = React.useRef<HTMLSelectElement>(null);

  const handleBoolChange = () => {
    const bool = boolSelect.current?.value;

    if (bool) {
      onChange({
        id: query.id,
        [bool]: [
          ...(query.and || query.or)
        ]
      });
    }
  };

  const handleChildChange = (changedChild: AdvancedSearchQuery) => {
    const bool = query.and ? "and" : "or";
    const children = query[bool];
    const index = children.findIndex((child) => child.id === changedChild.id);
    const nextChildren = [...children];

    nextChildren[index] = changedChild;

    const nextQuery = {
      id: query.id,
      [bool]: nextChildren,
    };

    onChange(nextQuery);
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

    if (onRemove) {
      onRemove(query.id);
    }
  }

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
        isOver: !!monitor.isOver({ shallow: true }),
      })
    },
    [query.id, onMove],
  );

  const className = classNames({
    "advanced-search-boolean-filter": true,
    "drag-drop": dropProps.isOver && dropProps.canDrop,
    selected: selectedQueryId === query.id,
  });

  return (
    <div
      aria-selected={selectedQueryId === query.id}
      className={className}
      onClick={handleClick}
      ref={drop}
      role="treeitem"
    >
      <header>
        <div>
          <select
            ref={boolSelect}
            onBlur={handleBoolChange}
            onChange={handleBoolChange}
            value={query.and ? "and" : "or"}
          >
            <option aria-selected={!!query.and} value="and">All of the following filters must be matched:</option>
            <option aria-selected={!!query.or} value="or">Any of the following filters may be matched:</option>
          </select>
        </div>

        <button onClick={handleRemoveButtonClick}>×</button>
      </header>

      <ul>
        {
          children.map((child, index) => (
            <li key={child.id}>
              {renderSeparator(query, index)}
              {" "}
              <AdvancedSearchFilter
                onChange={handleChildChange}
                onMove={onMove}
                onSelect={onSelect}
                onRemove={onRemove}
                query={child}
                selectedQueryId={selectedQueryId}
              />
            </li>
          ))
        }
      </ul>
    </div>
  );
}
