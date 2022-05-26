import * as React from "react";
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchValueQueryInput from "./AdvancedSearchValueQueryInput";
import AdvancedSearchFilter from "./AdvancedSearchFilter";

export interface AdvancedSearchProps {

}

export interface AdvancedSearchState {
  query?: AdvancedSearchQuery;
  selectedQueryId?: string;
}

let idCounter = 0;

export const newId = (): string => {
  const id = idCounter.toString();

  idCounter += 1;

  return id;
}

export default class AdvancedSearch extends React.Component<
  AdvancedSearchProps,
  AdvancedSearchState
> {
  constructor(props: AdvancedSearchProps) {
    super(props);

    this.state = {};

    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleQueryRemove = this.handleQueryRemove.bind(this);
    this.handleQuerySelect = this.handleQuerySelect.bind(this);
    this.handleValueQueryAdd = this.handleValueQueryAdd.bind(this);
  }

  handleQueryChange(query: AdvancedSearchQuery) {
    this.setState({
      query,
    });
  }

  handleQueryRemove() {
    this.setState({
      query: undefined,
      selectedQueryId: undefined,
    });
  }

  handleQuerySelect(query: AdvancedSearchQuery) {
    this.setState({
      selectedQueryId: query.id,
    });
  }

  handleValueQueryAdd(query: AdvancedSearchQuery) {
    const {
      query: currentQuery,
      selectedQueryId,
    } = this.state;

    if (!currentQuery) {
      this.setState({
        query,
        selectedQueryId: query.id,
      });
    } else {
      this.setState({
        query: this.addQuery(currentQuery, selectedQueryId || currentQuery.id, query),
      });
    }
    // else if (targetQuery.and) {
    //   this.setState({
    //     query: {
    //       id: targetQuery.id,
    //       and: [...targetQuery.and, query],
    //     },
    //   });
    // }
    // else if (targetQuery.or) {
    //   this.setState({
    //     query: {
    //       id: targetQuery.id,
    //       or: [...targetQuery.or, query],
    //     },
    //   });
    // }
    // else {
    //   this.setState({
    //     query: {
    //       id: targetQuery.id,
    //       and: [
    //         {
    //           ...targetQuery,
    //           id: newId(),
    //         },
    //         query,
    //       ],
    //     },
    //   });
    // }
  }

  addQuery(
    query: AdvancedSearchQuery,
    targetId: string,
    newQuery: AdvancedSearchQuery,
    preferredBool: string = "and",
  ): AdvancedSearchQuery {
    if (query.and || query.or) {
      const bool = query.and ? "and" : "or";
      const children = query[bool];

      if (query.id === targetId) {
        return {
          id: query.id,
          [bool]: [...children, newQuery],
        };
      }

      const oppositeBool = (bool === "and") ? "or" : "and";

      for (let i=0; i<children.length; i++) {
        const child = children[i];
        const updatedChild = this.addQuery(child, targetId, newQuery, oppositeBool);

        if (updatedChild !== child) {
          const newChildren = [...children];

          newChildren[i] = updatedChild;

          return {
            id: query.id,
            [bool]: newChildren,
          };
        }
      }

      return query;
    }

    if (query.id === targetId) {
      return {
        id: query.id,
        [preferredBool]: [
          {
            ...query,
            id: newId(),
          },
          newQuery,
        ],
      }
    }

    return query;
  }

  render(): JSX.Element {
    const {
      query,
      selectedQueryId,
    } = this.state;

    console.log(query);

    return (
      <div className="advanced-search">
        <AdvancedSearchValueQueryInput onAdd={this.handleValueQueryAdd} />

        <div className="advanced-search-filters">
          <AdvancedSearchFilter
            onChange={this.handleQueryChange}
            onRemove={this.handleQueryRemove}
            onSelect={this.handleQuerySelect}
            query={query}
            selectedQueryId={selectedQueryId}
          />
        </div>
      </div>
    );
  }
}
