import * as React from "react";
import classNames from "classnames";
import { AdvancedSearchQuery } from "../interfaces";

export interface AdvancedSearchValueFilterProps {
  onRemove: (query: AdvancedSearchQuery) => void;
  onSelect?: (query: AdvancedSearchQuery) => void;
  query: AdvancedSearchQuery;
  selected?: boolean;
}

export interface AdvancedSearchValueFilterState {

}

export default class AdvancedSearchValueFilter extends React.Component<
  AdvancedSearchValueFilterProps,
  AdvancedSearchValueFilterState
> {
  constructor(props: AdvancedSearchValueFilterProps,
    ) {
    super(props);

    this.state = {};

    this.handleClick = this.handleClick.bind(this);
    this.handleRemoveButtonClick = this.handleRemoveButtonClick.bind(this);
  }

  getOpSymbol(op) {
    switch (op) {
      case "contains": return ":";
      case "eq": return "=";
    }

    return op;
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

  render(): JSX.Element {
    const {
      query,
      selected,
    } = this.props;

    if (!query) {
      return null;
    }

    const {
      key,
      op,
      value,
    } = query;

    const className = classNames({
      "advanced-search-value-filter": true,
      selected
    });

    return (
      <div
        aria-selected={selected}
        className={className}
        onClick={this.handleClick}
        role="treeitem"
      >
        <span>{key} {this.getOpSymbol(op)} {value}</span>
        <button onClick={this.handleRemoveButtonClick}>×</button>
      </div>
    );
  }
}
