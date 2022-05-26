import * as React from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchFilterInput from "./AdvancedSearchFilterInput";
import AdvancedSearchFilterView from "./AdvancedSearchFilterView";

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
};

export default class AdvancedSearch extends React.Component<
  AdvancedSearchProps,
  AdvancedSearchState
> {
  constructor(props: AdvancedSearchProps) {
    super(props);

    this.state = {};

    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleQueryMove = this.handleQueryMove.bind(this);
    this.handleQueryRemove = this.handleQueryRemove.bind(this);
    this.handleQuerySelect = this.handleQuerySelect.bind(this);
    this.handleValueQueryAdd = this.handleValueQueryAdd.bind(this);
  }

  handleQueryChange(query: AdvancedSearchQuery) {
    this.setState({
      query,
    });
  }

  handleQueryMove(id: string, targetId: string) {
    console.log(`${id} -> ${targetId}`);

    const {
      query: currentQuery,
    } = this.state;

    const query = this.findDescendantQuery(currentQuery, id);

    const newQuery = {
      ...query,
      id: newId(),
    };

    const afterAddQuery = this.addDescendantQuery(currentQuery, targetId, newQuery);
    const afterRemoveQuery = this.removeDescendantQuery(afterAddQuery, id);

    this.setState({
      query: afterRemoveQuery,
      selectedQueryId: targetId,
    });
  }

  handleQueryRemove(id: string) {
    const {
      query: currentQuery,
    } = this.state;

    const afterRemoveQuery = this.removeDescendantQuery(currentQuery, id);

    this.setState({
      query: afterRemoveQuery,
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
        query: this.addDescendantQuery(currentQuery, selectedQueryId || currentQuery.id, query),
      });
    }
  }

  addDescendantQuery(
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

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const updatedChild = this.addDescendantQuery(child, targetId, newQuery, oppositeBool);

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
      };
    }

    return query;
  }

  findDescendantQuery(query: AdvancedSearchQuery, targetId: string): AdvancedSearchQuery {
    if (query.id === targetId) {
      return query;
    }

    if (query.and || query.or) {
      const bool = query.and ? "and" : "or";
      const children = query[bool];
      const targetQuery = children.find((child) => child.id === targetId);

      if (targetQuery) {
        return targetQuery;
      }

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const targetQuery = this.findDescendantQuery(child, targetId);

        if (targetQuery) {
          return targetQuery;
        }
      }
    }

    return null;
  }

  removeDescendantQuery(query: AdvancedSearchQuery, targetId: string): AdvancedSearchQuery {
    if (query.and || query.or) {
      const bool = query.and ? "and" : "or";
      const children = query[bool];
      const targetQuery = children.find((child) => child.id === targetId);

      if (targetQuery) {
        const updatedChildren = children.filter((child) => child.id !== targetId);

        if (updatedChildren.length === 1) {
          if (this.state.selectedQueryId === query.id || this.state.selectedQueryId === targetId) {
            this.setState({
              selectedQueryId: updatedChildren[0].id,
            });
          }

          return {
            ...updatedChildren[0],
          };
        }

        // When a query is removed, set the selection to the parent.

        // TODO: Maybe only set the selection to the parent if the current selection is a
        // descendant of the removed query?

        this.setState({
          selectedQueryId: query.id,
        });

        return {
          id: query.id,
          [bool]: updatedChildren,
        };
      }

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const updatedChild = this.removeDescendantQuery(child, targetId);

        if (updatedChild !== child) {
          const newChildren = [...children];

          newChildren[i] = updatedChild;

          const updatedQuery = {
            id: query.id,
            [bool]: newChildren,
          };

          return updatedQuery;
        }
      }
    }

    if (query.id === targetId) {
      if (this.state.selectedQueryId === query.id) {
        this.setState({
          selectedQueryId: undefined,
        });
      }

      return undefined;
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
      <DndProvider backend={HTML5Backend}>
        <div className="advanced-search">
          <AdvancedSearchFilterInput onAdd={this.handleValueQueryAdd} />

          <AdvancedSearchFilterView
            onChange={this.handleQueryChange}
            onMove={this.handleQueryMove}
            onRemove={this.handleQueryRemove}
            onSelect={this.handleQuerySelect}
            query={query}
            selectedQueryId={selectedQueryId}
          />
        </div>
      </DndProvider>
    );
  }
}
