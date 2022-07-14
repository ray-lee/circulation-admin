import * as React from "react";
import {
  LanguagesData,
  LibraryData,
  CollectionData as AdminCollectionData,
} from "../interfaces";
import { CollectionData, BookData } from "opds-web-client/lib/interfaces";
import TextWithEditMode from "./TextWithEditMode";
import EditableInput from "./EditableInput";
import CustomListEntriesEditor from "./CustomListEntriesEditor";
import CustomListSearch from "./CustomListSearch";
import SearchIcon from "./icons/SearchIcon";
import {
  CustomListEditorProperties,
  CustomListEditorEntriesData,
  CustomListEditorSearchParams,
  Entry,
} from "../reducers/customListEditor"
import { Button, Panel, Form } from "library-simplified-reusable-components";
import { browserHistory } from "react-router";

export interface CustomListEditorProps {
  properties?: CustomListEditorProperties;
  entries?: CustomListEditorEntriesData;
  searchParams?: CustomListEditorSearchParams;
  isValid?: boolean;
  isModified?: boolean;
  languages: LanguagesData;
  library: LibraryData;
  list?: CollectionData;
  listId?: string | number;
  listCollections?: AdminCollectionData[];
  collections?: AdminCollectionData[];
  responseBody?: string;
  searchResults?: CollectionData;
  save: () => Promise<void>;
  reset?: () => void;
  search: () => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  isFetchingMoreSearchResults: boolean;
  isFetchingMoreCustomListEntries: boolean;
  entryPoints?: string[];
  entryCount?: string;
  startingTitle?: string;
  updateProperty?: (name: string, value) => void;
  updateSearchParam?: (name: string, value) => void;
  addEntry?: (id: string) => void;
  addAllEntries?: () => void;
  deleteEntry?: (id: string) => void;
  deleteAllEntries?: () => void;
}

export interface CustomListEditorState {
  // title: string;
  // entries: Entry[];
  // collections?: AdminCollectionData[];
  entryPointSelected?: string;
}

/** Right panel of the lists page for editing a single list. */
export default class CustomListEditor extends React.Component<
  CustomListEditorProps,
  CustomListEditorState
> {
  static listener;
  constructor(props) {
    super(props);
    this.state = {
      // title: this.props.list && this.props.list.title,
      // entries: (this.props.list && this.props.list.books) || [],
      // collections: this.props.listCollections || [],
      entryPointSelected: "all",
    };

    this.toggleCollection = this.toggleCollection.bind(this);
    this.updateTitle = this.updateTitle.bind(this);
    this.updateEntries = this.updateEntries.bind(this);
    this.save = this.save.bind(this);
    this.reset = this.reset.bind(this);
    this.search = this.search.bind(this);
    // this.changeEntryPoint = this.changeEntryPoint.bind(this);
    // this.getEntryPointsElms = this.getEntryPointsElms.bind(this);
  }

  render(): JSX.Element {
    const {
      collections,
      isModified,
      isValid,
      properties,
      listId,
    } = this.props;

    const {
      name,
    } = properties || {};

    const listTitle = name;
    const nextPageUrl = this.props.list && this.props.list.nextPageUrl;
    const crawlable = `${listTitle ? `lists/${listTitle}/` : ""}crawlable`;
    const opdsFeedUrl = `${this.props.library?.short_name}/${crawlable}`;
    const disableSave = !isModified || !isValid;

    return (
      <div className="custom-list-editor">
        <div className="custom-list-editor-header">
          <div className="edit-custom-list-title">
            <fieldset className="save-or-edit">
              <legend className="visuallyHidden">List name</legend>
              <TextWithEditMode
                text={listTitle}
                placeholder="list title"
                onUpdate={this.updateTitle}
                ref="listTitle"
                aria-label="Enter a title for this list"
                disableIfBlank={true}
              />
            </fieldset>
            {listId && <h4>ID-{listId}</h4>}
          </div>
          <div className="save-or-cancel-list">
            <Button
              callback={this.save}
              disabled={disableSave}
              content="Save this list"
            />
            {isModified && (
              <Button
                className="inverted"
                callback={this.reset}
                content="Cancel Changes"
              />
            )}
          </div>
        </div>
        <div className="custom-list-editor-body">
          <section>
            {collections && collections.length > 0 && (
              <div className="custom-list-filters">
                <Panel
                  headerText="Add from collections"
                  id="add-from-collections"
                  content={
                    <div className="collections">
                      <div>
                        Automatically add new books from these collections to
                        this list:
                      </div>

                      {collections.map((collection) => (
                        <EditableInput
                          key={collection.id}
                          type="checkbox"
                          name="collection"
                          checked={this.hasCollection(collection.id)}
                          label={collection.name}
                          value={String(collection.id)}
                          onChange={this.toggleCollection}
                        />
                      ))}
                    </div>
                  }
                />
              </div>
            )}
            <CustomListSearch
              searchParams={this.props.searchParams}
              updateSearchParam={this.props.updateSearchParam}
              search={this.search}
              entryPoints={this.props.entryPoints}
              // getEntryPointsElms={this.getEntryPointsElms}
              startingTitle={this.props.startingTitle}
              library={this.props.library}
              languages={this.props.languages}
            />
          </section>
          <CustomListEntriesEditor
            searchResults={this.props.searchResults}
            entries={this.props.entries.current}
            nextPageUrl={nextPageUrl}
            loadMoreSearchResults={this.props.loadMoreSearchResults}
            loadMoreEntries={this.props.loadMoreEntries}
            isFetchingMoreSearchResults={this.props.isFetchingMoreSearchResults}
            isFetchingMoreCustomListEntries={
              this.props.isFetchingMoreCustomListEntries
            }
            ref="listEntries"
            opdsFeedUrl={opdsFeedUrl}
            entryCount={this.props.entries.currentTotalCount}
            listId={this.props.listId}
            addEntry={this.props.addEntry}
            addAllEntries={this.props.addAllEntries}
            deleteEntry={this.props.deleteEntry}
            deleteAllEntries={this.props.deleteAllEntries}
          />
        </div>
      </div>
    );
  }

  componentDidMount() {
    // CustomListEditor.listener = browserHistory.listen((location) => {
    //   this.setState({ title: "", entries: [], collections: [] });
    // });
  }

  componentWillUnmount() {
    // CustomListEditor.listener();
  }

  // UNSAFE_componentWillReceiveProps(nextProps) {
  //   // Note: This gets called after performing a search, at which point the
  //   // state of the component can already have updates that need to be taken
  //   // into account.
  //   if (!nextProps.list && !this.props.list) {
  //     this.setState({ entries: [], collections: [] });
  //   } else if (nextProps.list && nextProps.listId !== this.props.listId) {
  //     // Update the state with the next list to edit.
  //     this.setState({
  //       title: nextProps.list && nextProps.list.title,
  //       entries: (nextProps.list && nextProps.list.books) || [],
  //       collections: (nextProps.list && nextProps.listCollections) || [],
  //     });
  //   } else if (
  //     nextProps.list &&
  //     nextProps.list.books &&
  //     nextProps.list.books.length !== this.state.entries.length
  //   ) {
  //     let collections = this.state.collections;
  //     if (
  //       (!this.props.list || !this.props.listCollections) &&
  //       nextProps.list &&
  //       nextProps.listCollections
  //     ) {
  //       collections = nextProps.listCollections;
  //     }
  //     const title = this.state.title ? this.state.title : nextProps.list.title;
  //     this.setState({
  //       title,
  //       entries: nextProps.list.books,
  //       collections: collections,
  //     });
  //   } else if (
  //     (!this.props.list || !this.props.listCollections) &&
  //     nextProps.list &&
  //     nextProps.listCollections
  //   ) {
  //     this.setState({
  //       title: this.state.title,
  //       entries: this.state.entries,
  //       collections: nextProps.listCollections,
  //     });
  //   }
  // }

  updateTitle(title: string) {
    const {
      updateProperty,
    } = this.props;

    if (updateProperty) {
      updateProperty("name", title);
    }
  }

  updateEntries(entries: Entry[]) {
    // this.setState({
    //   entries,
    //   title: this.state.title,
    //   collections: this.state.collections,
    // });
  }

  hasCollection(id: string | number): boolean {
    return !!(this.props.properties?.collections?.includes(id));
  }

  toggleCollection(value: string) {
    const {
      properties,
      updateProperty,
    } = this.props;

    const {
      collections,
    } = properties;

    const id = parseInt(value, 10);

    const newCollections = this.hasCollection(id)
      ? collections.filter((candidate) => candidate !== id)
      : [...collections, id]

      updateProperty("collections", newCollections);
  }

  // changeEntryPoint(entryPointSelected: string) {
  //   this.setState({
  //     // title: this.state.title,
  //     // entries: this.state.entries,
  //     // collections: this.state.collections,
  //     entryPointSelected,
  //   });
  // }

  save() {
    const {
      save,
    } = this.props;

    if (save) {
      save()
        .then(() => {
          const {
            list,
            library,
            responseBody,
          } = this.props;

          // If a new list was created, go to the new list's edit page.

          if (!list && responseBody) {
            window.location.href = `/admin/web/lists/${library.short_name}/edit/${responseBody}`;
          }
        });
    }
  }

  reset() {
    const {
      reset,
    } = this.props;

    if (reset) {
      reset();
    }
  }

  getSearchQueries(sortBy: string, language: string) {
    const entryPointSelected = this.state.entryPointSelected;
    let query = "";
    if (entryPointSelected && entryPointSelected !== "all") {
      query += `&entrypoint=${encodeURIComponent(entryPointSelected)}`;
    }
    sortBy && (query += `&order=${encodeURIComponent(sortBy)}`);
    language && (query += `&language=${[language]}`);
    return query;
  }

  // getEntryPointsElms(entryPoints) {
  //   const entryPointsElms = [];
  //   !entryPoints.includes("All") &&
  //     entryPointsElms.push(
  //       <EditableInput
  //         key="all"
  //         type="radio"
  //         name="entry-points-selection"
  //         checked={"all" === this.state.entryPointSelected}
  //         label="All"
  //         value="all"
  //         onChange={() => this.changeEntryPoint("all")}
  //       />
  //     );
  //   entryPoints.forEach((entryPoint) =>
  //     entryPointsElms.push(
  //       <EditableInput
  //         key={entryPoint}
  //         type="radio"
  //         name="entry-points-selection"
  //         checked={
  //           entryPoint === this.state.entryPointSelected ||
  //           entryPoint.toLowerCase() === this.state.entryPointSelected
  //         }
  //         label={entryPoint}
  //         value={entryPoint}
  //         onChange={() => this.changeEntryPoint(entryPoint)}
  //       />
  //     )
  //   );

  //   return entryPointsElms;
  // }

  search() {
    const {
      search,
    } = this.props;

    if (search) {
      search();
    }
  }
}
