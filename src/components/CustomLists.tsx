/* eslint-disable react/no-deprecated */
import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import * as PropTypes from "prop-types";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import {
  CustomListData,
  CustomListsData,
  CollectionsData,
  CollectionData as AdminCollectionData,
  LibraryData,
  LaneData,
  LanesData,
  LanguagesData,
} from "../interfaces";
import {
  CustomListEditorProperties,
  CustomListEditorEntriesData,
  CustomListEditorSearchParams,
} from "../reducers/customListEditor"
import Admin from "../models/Admin";
import { FetchErrorData, CollectionData } from "opds-web-client/lib/interfaces";
import CustomListEditor from "./CustomListEditor";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import CustomListsSidebar from "./CustomListsSidebar";

export interface CustomListsStateProps {
  customListEditorProperties?: CustomListEditorProperties;
  customListEditorSearchParams?: CustomListEditorSearchParams;
  customListEditorEntries?: CustomListEditorEntriesData;
  customListEditorIsValid?: boolean;
  customListEditorIsModified?: boolean;
  lists: CustomListData[];
  listDetails?: CollectionData;
  collections: AdminCollectionData[];
  searchResults: CollectionData;
  fetchError?: FetchErrorData;
  isFetching: boolean;
  isFetchingMoreSearchResults: boolean;
  isFetchingMoreCustomListEntries: boolean;
  libraries?: LibraryData[];
  lanes?: LaneData[];
  languages?: LanguagesData;
}

export interface CustomListsDispatchProps {
  fetchLanes: () => Promise<LanesData>;
  fetchCustomLists: () => Promise<CustomListsData>;
  fetchCustomListDetails: (listId: string) => Promise<CollectionData>;
  saveCustomListEditor: () => Promise<void>;
  resetCustomListEditor?: () => void;
  executeCustomListEditorSearch?: () => Promise<CollectionData>;
  deleteCustomList: (listId: string) => Promise<void>;
  openCustomList: (listId: string) => void;
  search: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  fetchCollections: () => Promise<CollectionsData>;
  fetchLibraries: () => void;
  fetchLanguages: () => void;
  updateCustomListEditorProperty?: (name: string, value) => void;
  toggleCustomListEditorCollection?: (id: number) => void;
  updateCustomListEditorSearchParam?: (name: string, value) => void;
  addCustomListEditorEntry?: (id: string) => void;
  addAllCustomListEditorEntries?: () => void;
  deleteCustomListEditorEntry?: (id: string) => void;
  deleteAllCustomListEditorEntries?: () => void;
}

export interface CustomListsOwnProps {
  store?: Store<State>;
  library: string;
  editOrCreate?: string;
  identifier?: string;
  csrfToken: string;
  startingTitle?: string;
}

export interface CustomListsProps
  extends React.Props<CustomListsProps>,
    CustomListsStateProps,
    CustomListsDispatchProps,
    CustomListsOwnProps {}

export interface CustomListsState {
  sort: string;
}

/** Body of the custom lists page, with all a library's lists shown in a left sidebar and
    a list editor on the right. */
export class CustomLists extends React.Component<
  CustomListsProps,
  CustomListsState
> {
  context: { admin: Admin };

  static contextTypes = {
    admin: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.saveCustomListEditor = this.saveCustomListEditor.bind(this);
    this.deleteCustomList = this.deleteCustomList.bind(this);
    this.changeSort = this.changeSort.bind(this);
    this.getEnabledEntryPoints = this.getEnabledEntryPoints.bind(this);
    this.state = {
      sort: "asc",
    };
  }

  render(): JSX.Element {
    let listCollections = [];
    let entryCount;

    if (this.props.lists) {
      this.props.lists.forEach((list) => {
        if (list.id === parseInt(this.props.identifier, 10)) {
          entryCount = list.entry_count;
          listCollections = list.collections;
        }
      });
    }

    return (
      <main className="custom-lists-container">
        {this.props.fetchError && (
          <ErrorMessage error={this.props.fetchError} />
        )}
        {this.props.isFetching && <LoadingIndicator />}
        <div className="custom-lists">
          {this.renderSidebar()}
          {this.props.editOrCreate &&
            this.renderEditor(entryCount, listCollections)}
        </div>
      </main>
    );
  }

  renderSidebar(): JSX.Element {
    return (
      <CustomListsSidebar
        lists={this.sortedLists()}
        library={this.props.library}
        identifier={this.props.identifier}
        isLibraryManager={this.context.admin.isLibraryManager(
          this.props.library
        )}
        deleteCustomList={this.deleteCustomList}
        changeSort={this.changeSort}
        sortOrder={this.state.sort}
      />
    );
  }

  renderEditor(entryCount, listCollections): JSX.Element {
    const editorProps = {
      collections: this.collectionsForLibrary(),
      properties: this.props.customListEditorProperties,
      searchParams: this.props.customListEditorSearchParams,
      isValid: this.props.customListEditorIsValid,
      isModified: this.props.customListEditorIsModified,
      entries: this.props.customListEditorEntries,
      save: this.saveCustomListEditor,
      reset: this.props.resetCustomListEditor,
      entryPoints: this.getEnabledEntryPoints(this.props.libraries),
      isFetchingMoreCustomListEntries: this.props
        .isFetchingMoreCustomListEntries,
      isFetchingMoreSearchResults: this.props.isFetchingMoreSearchResults,
      languages: this.props.languages,
      library: this.props.libraries?.find(
        (l) => l.short_name === this.props.library
      ),
      loadMoreEntries: this.props.loadMoreEntries,
      loadMoreSearchResults: this.props.loadMoreSearchResults,
      search: this.props.executeCustomListEditorSearch,
      searchResults: this.props.searchResults,
      updateProperty: this.props.updateCustomListEditorProperty,
      toggleCollection: this.props.toggleCustomListEditorCollection,
      updateSearchParam: this.props.updateCustomListEditorSearchParam,
      addEntry: this.props.addCustomListEditorEntry,
      addAllEntries: this.props.addAllCustomListEditorEntries,
      deleteEntry: this.props.deleteCustomListEditorEntry,
      deleteAllEntries: this.props.deleteAllCustomListEditorEntries,
    };
    const extraProps =
      this.props.editOrCreate === "create"
        ? {
            startingTitle: this.props.startingTitle,
          }
        : {
            entryCount: entryCount,
            list: this.props.listDetails,
            listCollections: listCollections,
            listId: this.props.identifier,
          };
    return <CustomListEditor {...{ ...editorProps, ...extraProps }} />;
  }

  UNSAFE_componentWillMount() {
    const {
      editOrCreate,
      fetchCollections,
      fetchCustomListDetails,
      fetchCustomLists,
      fetchLibraries,
      fetchLanguages,
      identifier,
      openCustomList,
    } = this.props;

    if (fetchCustomLists) {
     fetchCustomLists();
    }

    if (openCustomList) {
      openCustomList(identifier);
    }

    if (editOrCreate === "edit") {
      if (fetchCustomListDetails) {
        fetchCustomListDetails(identifier);
      }
    }

    if (fetchCollections) {
     fetchCollections();
    }

    fetchLibraries();
    fetchLanguages();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // If we've fetched lists but we're not on the edit or create page,
    // redirect to the edit page for the first list, or the create page
    // if there are no lists.

    const {
      editOrCreate,
      fetchError,
      lists,
    } = nextProps;

    if (!editOrCreate && lists && !fetchError) {
      if (lists.length === 0) {
        window.location.href += "/create";
      } else {
        const firstList = this.sortedLists(lists)[0];
        window.location.href += "/edit/" + firstList.id;
      }
    }

    const {
      identifier,
      fetchCustomListDetails,
      openCustomList,
    } = nextProps;

    // If we switched lists, fetch the details for the new list.
    if (
      identifier !== this.props.identifier
    ) {
      if (openCustomList) {
        openCustomList(identifier);
      }

      if (identifier && fetchCustomListDetails) {
        fetchCustomListDetails(identifier);
      }
    }
  }

  changeSort() {
    const oldSort = this.state.sort;
    if (oldSort === "asc") {
      this.setState({ sort: "desc" });
    } else {
      this.setState({ sort: "asc" });
    }
  }

  sortedLists(lists?: CustomListData[]) {
    lists = lists || this.props.lists || [];
    return lists.sort((a, b) => {
      let first = a;
      let second = b;
      if (this.state.sort === "desc") {
        first = b;
        second = a;
      }

      if (first.name < second.name) {
        return -1;
      } else if (first.name === second.name) {
        return 0;
      } else {
        return 1;
      }
    });
  }

  getEnabledEntryPoints(libraries: LibraryData[]) {
    if (!libraries) {
      return [];
    }
    let library;

    libraries.forEach((lib) => {
      if (lib.short_name === this.props.library) {
        library = lib;
      }
    });

    return library.settings.enabled_entry_points || [];
  }


  async saveCustomListEditor(): Promise<void> {
    const {
      identifier: listId,
    } = this.props;

    await this.props.saveCustomListEditor();

    this.props.fetchCustomLists();

    if (listId) {
      this.props.fetchCustomListDetails(listId);
    }
  }

  async deleteCustomList(list: CustomListData): Promise<void> {
    const lanes = await this.getDeletedLanes(list.id);
    let deletedLanesText = "";
    if (lanes && lanes.length) {
      deletedLanesText = this.deletedLaneNames(lanes);
    }

    const confirmationText = `Delete list "${list.name}"? ${deletedLanesText}`;
    if (window.confirm(confirmationText)) {
      await this.props.deleteCustomList(String(list.id));
      this.props.fetchCustomLists();
    }
  }

  /**
   * getDeletedLanes
   * For any list id, fetch all the lanes where this list is the _only_ custom
   * list in that lane. The server will deal with deleting those lanes. Only fetch
   * the lanes data here since they are not needed for the page until a list
   * is going to be deleted.
   * @param {string | number} listId The id of the list to get associated lanes.
   */
  async getDeletedLanes(listId: string | number): Promise<LaneData[]> {
    const deletedLanes = [];
    let lanes = this.props.lanes;
    if (!lanes) {
      await this.props.fetchLanes();
      lanes = this.props.lanes;
    }

    if (lanes && lanes.length) {
      lanes.forEach((lane) => {
        const customListId = lane.custom_list_ids;
        if (customListId.length === 1 && customListId[0] === listId) {
          deletedLanes.push(lane);
        }
      });
    }
    return deletedLanes;
  }

  /**
   * deletedLaneNames
   * Display text that lists what lanes will be deleted. Currently used
   * to warn users when a list is deleted that those lanes will be deleted.
   * @param {LaneData[]} lanes Array of lanes that will be deleted.
   */
  deletedLaneNames(lanes: LaneData[]): string {
    let deleteText = "Deleting this list will delete the following lanes:\n";
    lanes.forEach(
      (lane) => (deleteText += `\nLane name: ${lane.display_name}`)
    );
    return deleteText;
  }

  collectionsForLibrary(): AdminCollectionData[] {
    const collections: AdminCollectionData[] = [];
    for (const collection of this.props.collections || []) {
      for (const library of collection.libraries || []) {
        if (library.short_name === this.props.library) {
          collections.push(collection);
          break;
        }
      }
    }
    return collections;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    customListEditorProperties:
      state.editor.customListEditor.properties.current,
    customListEditorSearchParams:
      state.editor.customListEditor.searchParams,
    customListEditorEntries:
      state.editor.customListEditor.entries,
    customListEditorIsValid:
      state.editor.customListEditor.isValid,
    customListEditorIsModified:
      state.editor.customListEditor.isModified,
    lists:
      state.editor.customLists &&
      state.editor.customLists.data &&
      state.editor.customLists.data.custom_lists,
    listDetails:
      state.editor.customListDetails && state.editor.customListDetails.data,
    isFetchingMoreCustomListEntries:
      state.editor.customListDetails &&
      state.editor.customListDetails.isFetchingMoreEntries,
    fetchError:
      state.editor.customLists.fetchError ||
      state.editor.collections.fetchError,
    isFetching:
      state.editor.customLists.isFetching ||
      state.editor.customLists.isEditing ||
      state.editor.customListDetails.isFetching ||
      state.editor.customListDetails.isEditing ||
      !ownProps.editOrCreate ||
      (state.editor.collection && state.editor.collection.isFetching) ||
      state.editor.collections.isFetching,
    searchResults: state.editor.collection && state.editor.collection.data,
    isFetchingMoreSearchResults:
      state.editor.collection && state.editor.collection.isFetchingPage,
    collections:
      state.editor.collections &&
      state.editor.collections.data &&
      state.editor.collections.data.collections,
    languages: state.editor.languages && state.editor.languages.data,
    libraries:
      state.editor.libraries.data && state.editor.libraries.data.libraries,
    lanes: state.editor.lanes.data && state.editor.lanes.data.lanes,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const fetcher = new DataFetcher({ adapter });
  const actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    fetchCustomLists: () =>
      dispatch(actions.fetchCustomLists(ownProps.library)),
    fetchCustomListDetails: (listId: string) =>
      dispatch(actions.fetchCustomListDetails(ownProps.library, listId)),
    saveCustomListEditor: () =>
      dispatch(actions.saveCustomListEditor(ownProps.library)),
    resetCustomListEditor: () =>
      dispatch(actions.resetCustomListEditor()),
    executeCustomListEditorSearch: () =>
      dispatch(actions.executeCustomListEditorSearch(ownProps.library)),
    deleteCustomList: (listId: string) =>
      dispatch(actions.deleteCustomList(ownProps.library, listId)),
    openCustomList: (listId: string) =>
      dispatch(actions.openCustomList(listId)),
    search: (url: string) => dispatch(actions.fetchCollection(url)),
    loadMoreSearchResults: (url: string) => dispatch(actions.fetchPage(url)),
    loadMoreEntries: (url: string) =>
      dispatch(actions.fetchMoreCustomListEntries(url)),
    fetchCollections: () => dispatch(actions.fetchCollections()),
    fetchLibraries: () => dispatch(actions.fetchLibraries()),
    fetchLanes: () => dispatch(actions.fetchLanes(ownProps.library)),
    fetchLanguages: () => dispatch(actions.fetchLanguages()),
    updateCustomListEditorProperty: (name: string, value) =>
      dispatch(actions.updateCustomListEditorProperty(name, value)),
    toggleCustomListEditorCollection: (id: number) =>
      dispatch(actions.toggleCustomListEditorCollection(id)),
    updateCustomListEditorSearchParam: (name: string, value) =>
      dispatch(actions.updateCustomListEditorSearchParam(name, value)),
    addCustomListEditorEntry: (id: string) =>
      dispatch(actions.addCustomListEditorEntry(id)),
    addAllCustomListEditorEntries: () =>
      dispatch(actions.addAllCustomListEditorEntries()),
    deleteCustomListEditorEntry: (id: string) =>
      dispatch(actions.deleteCustomListEditorEntry(id)),
    deleteAllCustomListEditorEntries: () =>
      dispatch(actions.deleteAllCustomListEditorEntries())
  };
}

const ConnectedCustomLists = connect<
  CustomListsStateProps,
  CustomListsDispatchProps,
  CustomListsOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(CustomLists as any);

export default ConnectedCustomLists;
