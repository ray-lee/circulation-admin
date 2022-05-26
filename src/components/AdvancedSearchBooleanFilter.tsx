import classNames from "classnames";
import * as React from "react";
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchFilter from "./AdvancedSearchFilter";

export interface AdvancedSearchBooleanFilterProps {
  onChange: (query: AdvancedSearchQuery) => void;
  onSelect?: (query: AdvancedSearchQuery) => void;
  onRemove: (query: AdvancedSearchQuery) => void;
  query: AdvancedSearchQuery;
  selectedQueryId?: string;
}

export interface AdvancedSearchBooleanFilterState {

}

export default class AdvancedSearchBooleanQuery extends React.Component<
  AdvancedSearchBooleanFilterProps,
  AdvancedSearchBooleanFilterState
> {
  private boolSelect = React.createRef<HTMLSelectElement>();

  constructor(props: AdvancedSearchBooleanFilterProps) {
    super(props);

    this.state = {};

    this.handleBoolChange = this.handleBoolChange.bind(this);
    this.handleChildChange = this.handleChildChange.bind(this);
    this.handleChildRemove = this.handleChildRemove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleRemoveButtonClick = this.handleRemoveButtonClick.bind(this);
  }

  handleBoolChange() {
    const bool = this.boolSelect.current?.value;

    if (bool) {
      const {
        onChange,
        query,
      } = this.props;

      onChange({
        id: query.id,
        [bool]: [
          ...(query.and || query.or)
        ]
      });
    }
  }

  handleChildChange(changedChild: AdvancedSearchQuery) {
    const {
      onChange,
      query,
    } = this.props;

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

  handleChildRemove(removedChild: AdvancedSearchQuery) {
    const {
      onChange,
      onSelect,
      query,
    } = this.props;

    const bool = query.and ? "and" : "or";
    const children = query[bool];
    const nextChildren = children.filter((child) => child.id !== removedChild.id);

    let nextQuery;

    if (nextChildren.length === 1) {
      nextQuery = {
        ...nextChildren[0],
        id: query.id,
      };
    } else {
      nextQuery = {
        id: query.id,
        [bool]: nextChildren,
      };
    }

    if (onSelect) {
      onSelect(nextQuery);
    }

    onChange(nextQuery);
  }

  handleClick(event: React.SyntheticEvent) {
    event.stopPropagation();
    event.preventDefault();

    const {
      onSelect,
      query,
    } = this.props;

    if (onSelect) {
      onSelect(query);
    }
  }

  handleRemoveButtonClick(event: React.SyntheticEvent) {
    event.stopPropagation();
    event.preventDefault();

    const {
      onRemove,
      query,
    } = this.props;

    onRemove(query);
  }

  renderSeparator(index) {
    const {
      query
    } = this.props;

    if (index < 1) {
      return null;
    }

    return (
      <span>
        {query.and ? "and" : "or"}
      </span>
    );
  }

  render(): JSX.Element {
    const {
      onSelect,
      query,
      selectedQueryId,
    } = this.props;

    const children = query && (query.and || query.or);

    if (!children) {
      return null;
    }

    const className = classNames({
      "advanced-search-boolean-filter": true,
      selected: selectedQueryId === query.id,
    });

    return (
      <div
        aria-selected={selectedQueryId === query.id}
        className={className}
        onClick={this.handleClick}
        role="treeitem"
      >
        <header>
          <div>
            <select
              ref={this.boolSelect}
              onBlur={this.handleBoolChange}
              onChange={this.handleBoolChange}
              value={query.and ? "and" : "or"}
            >
              <option aria-selected={!!query.and} value="and">All</option>
              <option aria-selected={!!query.or} value="or">Any</option>
            </select>
            {" "}
            of the following filters {query.and ? "must" : "may"} be matched:
          </div>

          <button onClick={this.handleRemoveButtonClick}>×</button>
        </header>

        <ul>
          {
            children.map((child, index) => (
              <li key={child.id}>
                {this.renderSeparator(index)}
                {" "}
                <AdvancedSearchFilter
                  onChange={this.handleChildChange}
                  onSelect={onSelect}
                  onRemove={this.handleChildRemove}
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
}
