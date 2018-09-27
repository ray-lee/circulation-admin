import * as React from "react";
import { CollectionData as AdminCollectionData } from "../interfaces";
import { CollectionData, BookData } from "opds-web-client/lib/interfaces";
import TextWithEditMode from "./TextWithEditMode";
import EditableInput from "./EditableInput";
import CustomListEntriesEditor, { Entry } from "./CustomListEntriesEditor";
import XCloseIcon from "./icons/XCloseIcon";
import SearchIcon from "./icons/SearchIcon";

export interface CustomListEditorProps extends React.Props<CustomListEditor> {
  library: string;
  list?: CollectionData;
  listId?: string | number;
  listCollections?: AdminCollectionData[];
  collections?: AdminCollectionData[];
  responseBody?: string;
  searchResults?: CollectionData;
  editCustomList: (data: FormData, listId?: string) => Promise<void>;
  search: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  isFetchingMoreSearchResults: boolean;
  isFetchingMoreCustomListEntries: boolean;
  entryPoints?: string[];
  entryCount?: string;
}

export interface CustomListEditorState {
  name: string;
  entries: Entry[];
  collections?: AdminCollectionData[];
  entryPointSelected?: string;
}

/** Right panel of the lists page for editing a single list. */
export default class CustomListEditor extends React.Component<CustomListEditorProps, CustomListEditorState> {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.list && this.props.list.title,
      entries: (this.props.list && this.props.list.books) || [],
      collections: this.props.listCollections || [],
      entryPointSelected: "all",
    };

    this.changeName = this.changeName.bind(this);
    this.changeEntries = this.changeEntries.bind(this);
    this.save = this.save.bind(this);
    this.reset = this.reset.bind(this);
    this.search = this.search.bind(this);
    this.changeEntryPoint = this.changeEntryPoint.bind(this);
    this.getEntryPointsElms = this.getEntryPointsElms.bind(this);
  }

  render(): JSX.Element {
    const listId = this.props.listId;
    const listName = this.props.list && this.props.list.title ? this.props.list.title : "";
    const nextPageUrl = this.props.list && this.props.list.nextPageUrl;
    const opdsFeedUrl = `${this.props.library}/lists/${listName}/crawlable`;
    return (
      <div className="custom-list-editor">
        <div className="custom-list-editor-header">
          <div>
            <TextWithEditMode
              text={listName}
              placeholder="list name"
              onUpdate={this.changeName}
              ref="listName"
              />
            { listId &&
              <h4>ID-{listId}</h4>
            }
            { this.props.collections && this.props.collections.length > 0 &&
              <div className="custom-list-filters">
                <span>Automatically add new books from these collections to this list:</span>
                <div className="collections">
                  { this.props.collections.map(collection =>
                      <EditableInput
                        key={collection.id}
                        type="checkbox"
                        name="collection"
                        checked={this.hasCollection(collection)}
                        label={collection.name}
                        value={String(collection.id)}
                        onChange={() => {this.changeCollection(collection);}}
                        />
                    )
                  }
                </div>
                {
                  this.props.entryPoints.length ? (
                    <div className="entry-points">
                      <span>Select the entry point to search for:</span>
                      <div className="entry-points-selection">
                        {this.getEntryPointsElms(this.props.entryPoints)}
                      </div>
                    </div>
                  ) : null
                }
              </div>
            }
          </div>
          <span>
            <button
              className="btn btn-default save-list"
              onClick={this.save}
              disabled={!this.state.name && !this.hasChanges()}
              >Save this list</button>
            { this.hasChanges() &&
              <a
                href="#"
                className="cancel-changes"
                onClick={this.reset}
                >Cancel changes
                  <XCloseIcon />
              </a>
            }
          </span>
        </div>
        <div className="custom-list-editor-body">
          <h4>Search for titles</h4>
          <form className="form-inline" onSubmit={this.search}>
            <input
              className="form-control"
              ref="searchTerms"
              type="text"
              />&nbsp;
            <button
              className="btn btn-default"
              type="submit">Search
                <SearchIcon />
            </button>
          </form>

          <CustomListEntriesEditor
            searchResults={this.props.searchResults}
            entries={this.props.list && this.props.list.books}
            nextPageUrl={nextPageUrl}
            loadMoreSearchResults={this.props.loadMoreSearchResults}
            loadMoreEntries={this.props.loadMoreEntries}
            onUpdate={this.changeEntries}
            isFetchingMoreSearchResults={this.props.isFetchingMoreSearchResults}
            isFetchingMoreCustomListEntries={this.props.isFetchingMoreCustomListEntries}
            ref="listEntries"
            opdsFeedUrl={opdsFeedUrl}
            entryCount={this.props.entryCount}
            listId={this.props.listId}
          />
        </div>
      </div>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.list && (nextProps.listId !== this.props.listId)) {
      this.setState({
        name: nextProps.list && nextProps.list.title,
        entries: (nextProps.list && nextProps.list.books) || [],
        collections: (nextProps.list && nextProps.listCollections) || []
      });
    }
    else if ((!this.props.list || !this.props.listCollections) && nextProps.list && nextProps.listCollections) {
      let name = this.state.name;
      let entries = this.state.entries;
      let collections = this.state.collections;
      if (nextProps.list.title !== name) {
        name = nextProps.list.title;
      }
      if (nextProps.list && nextProps.list.books.length !== this.state.entries) {
        entries = nextProps.list.books;
      }
      if (nextProps.listCollections.length !== this.state.collections.length) {
        collections = nextProps.listCollections;
      }
      this.setState({
        name,
        entries: entries,
        collections: collections,
      });
    }
  }

  hasChanges(): boolean {
    const nameChanged = (this.props.list && this.props.list.title !== this.state.name);
    let entriesChanged = false;
    if (this.props.list && this.props.list.books.length !== this.state.entries.length) {
      entriesChanged = true;
    } else {
      let propsUrns = ((this.props.list && this.props.list.books) || []).map(entry => entry.id).sort();
      let stateUrns = this.state.entries.map(entry => entry.id).sort();
      for (let i = 0; i < propsUrns.length; i++) {
        if (propsUrns[i] !== stateUrns[i]) {
          entriesChanged = true;
          break;
        }
      }
    }
    let collectionsChanged = false;
    if (this.props.listCollections && this.props.listCollections.length !== this.state.collections.length) {
      collectionsChanged = true;
    } else {
      let propsIds = (this.props.listCollections || []).map(collection => collection.id).sort();
      let stateIds = this.state.collections.map(collection => collection.id).sort();
      for (let i = 0; i < propsIds.length; i++) {
        if (propsIds[i] !== stateIds[i]) {
          collectionsChanged = true;
          break;
        }
      }
    }
    return nameChanged || entriesChanged || collectionsChanged;
  }

  changeName(name: string) {
    this.setState({ name, entries: this.state.entries, collections: this.state.collections });
  }

  changeEntries(entries: Entry[]) {
    this.setState({ entries, name: this.state.name, collections: this.state.collections });
  }

  hasCollection(collection: AdminCollectionData) {
    for (const stateCollection of this.state.collections) {
      if (stateCollection.id === collection.id) {
        return true;
      }
    }
    return false;
  }

  changeCollection(collection: AdminCollectionData) {
    const hasCollection = this.hasCollection(collection);
    let newCollections;
    if (hasCollection) {
      newCollections = this.state.collections.filter(stateCollection => stateCollection.id !== collection.id);
    } else {
      newCollections = this.state.collections.slice(0);
      newCollections.push(collection);
    }
    this.setState({ name: this.state.name, entries: this.state.entries, collections: newCollections });
  }

  changeEntryPoint(entryPointSelected: string) {
    this.setState({
      name: this.state.name,
      entries: this.state.entries,
      collections: this.state.collections,
      entryPointSelected,
    });
  }

  save() {
    const data = new (window as any).FormData();
    if (this.props.list) {
      data.append("id", this.props.listId);
    }
    let name = (this.refs["listName"] as TextWithEditMode).getText();
    data.append("name", name);
    let entries = (this.refs["listEntries"] as CustomListEntriesEditor).getEntries();
    data.append("entries", JSON.stringify(entries));
    let deletedEntries = (this.refs["listEntries"] as CustomListEntriesEditor).getDeleted();
    data.append("deletedEntries", JSON.stringify(deletedEntries));
    let collections = this.state.collections.map(collection => collection.id);
    data.append("collections", JSON.stringify(collections));
    this.props.editCustomList(data, this.props.listId && String(this.props.listId)).then(() => {
      // If a new list was created, go to the new list's edit page.
      if (!this.props.list && this.props.responseBody) {
        window.location.href = "/admin/web/lists/" + this.props.library + "/edit/" + this.props.responseBody;
      }
    });
  }

  reset() {
    (this.refs["listName"] as TextWithEditMode).reset();
    (this.refs["listEntries"] as CustomListEntriesEditor).reset();
    this.setState({
      name: this.state.name,
      entries: this.state.entries,
      collections: (this.props.listCollections) || [],
      entryPointSelected: "all",
    });
  }

  getEntryPointQuery() {
    const entryPointSelected = this.state.entryPointSelected;
    let query = "";
    if (entryPointSelected && entryPointSelected !== "all") {
      query = `&entrypoint=${encodeURIComponent(entryPointSelected)}`;
    }

    return query;
  }

  getEntryPointsElms(entryPoints) {
    const entryPointsElms = [];
    entryPointsElms.push(
      <EditableInput
        key="all"
        type="radio"
        name="entry-points-selection"
        checked={"all" === this.state.entryPointSelected}
        label="All"
        value="all"
        onChange={() => this.changeEntryPoint("all")}
      />
    );

    entryPoints.forEach(entryPoint =>
      entryPointsElms.push(
        <EditableInput
          key={entryPoint}
          type="radio"
          name="entry-points-selection"
          checked={entryPoint === this.state.entryPointSelected}
          label={entryPoint}
          value={entryPoint}
          onChange={() => this.changeEntryPoint(entryPoint)}
        />
      )
    );

    return entryPointsElms;
  };

  search(event) {
    event.preventDefault();
    const searchTerms = encodeURIComponent((this.refs["searchTerms"] as HTMLInputElement).value);
    const entryPointQuery = this.getEntryPointQuery();
    const url = "/" + this.props.library + "/search?q=" + searchTerms + entryPointQuery;
    this.props.search(url);
  }
}
