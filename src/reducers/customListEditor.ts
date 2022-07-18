import produce from "immer";
import { BookData } from "opds-web-client/lib/interfaces";
import { getMedium } from "opds-web-client/lib/utils/book";
import ActionCreator from "../actions";

export interface Entry extends BookData {
  medium?: string;
}

export interface CustomListEditorEntriesData {
  baseline: Entry[];
  baselineTotalCount: number;
  added: Record<string, Entry>;
  removed: Record<string, true>;
  current: Entry[];
  currentTotalCount: number;
}

export interface CustomListEditorProperties {
  name: string;
  collections: (string | number)[];
}

export interface CustomListEditorTrackedProperties {
  baseline: CustomListEditorProperties;
  current: CustomListEditorProperties;
}

export interface CustomListEditorSearchParams {
  entryPoint: string;
  terms: string;
  sort: string;
  language: string;
}

export interface CustomListEditorState {
  id: number;
  properties: CustomListEditorTrackedProperties;
  searchParams: CustomListEditorSearchParams;
  entries: CustomListEditorEntriesData;
  isValid: boolean;
  isModified: boolean;
  error: string;
}

const initialState: CustomListEditorState = {
  id: null,
  properties: {
    baseline: {
      name: "",
      collections: [],
    },
    current: {
      name: "",
      collections: [],
    },
  },
  searchParams: {
    entryPoint: "All",
    terms: "",
    sort: null,
    language: "all",
  },
  entries: {
    baseline: [],
    baselineTotalCount: 0,
    added: {},
    removed: {},
    current: [],
    currentTotalCount: 0,
  },
  isValid: false,
  isModified: false,
  error: null,
};

const isValid = (state: CustomListEditorState): boolean => {
  const { properties, entries } = state;
  const { name, collections } = properties.current;
  const { currentTotalCount } = entries;

  return !!name && (collections.length > 0 || currentTotalCount > 0);
};

const isModified = (state: CustomListEditorState): boolean => {
  const { properties, entries } = state;
  const { added, removed } = entries;
  const { baseline, current } = properties;

  return (
    Object.keys(added).length > 0 ||
    Object.keys(removed).length > 0 ||
    baseline.name !== current.name ||
    baseline.collections.length !== current.collections.length ||
    !baseline.collections.every((id) => current.collections.includes(id))
  );
};

const validateAndCheckModified = (
  state: CustomListEditorState
): CustomListEditorState => {
  return produce(state, (draftState) => {
    draftState.isValid = isValid(draftState);
    draftState.isModified = isModified(draftState);
  });
};

const validatedHandler = (handler) => (state: CustomListEditorState, action?) =>
  validateAndCheckModified(handler(state, action));

const initialStateForList = (id: number, data): CustomListEditorState => {
  let customList = null;
  let error = null;

  if (data && id !== null) {
    customList = data.custom_lists.find((list) => list.id === id);

    if (!customList) {
      error = `Custom list not found for ID: ${id}`;
    }
  }

  return produce(initialState, (draftState) => {
    draftState.id = id;

    if (customList) {
      const initialProperties = {
        name: customList.name,
        collections: customList.collections.map((collection) => collection.id),
      };

      draftState.properties.baseline = initialProperties;
      draftState.properties.current = initialProperties;

      draftState.entries.baselineTotalCount = customList.entry_count;
    }

    draftState.error = error;
  });
};

const handleCustomListEditorOpen = (
  state: CustomListEditorState,
  action
): CustomListEditorState => {
  const { id, data } = action;

  return initialStateForList(id ? parseInt(id, 10) : null, data);
};

const handleCustomListsLoad = (
  state: CustomListEditorState,
  action
): CustomListEditorState => {
  const { id } = state;
  const { data } = action;

  return initialStateForList(id, data);
};

const applyEntriesDelta = (entries: CustomListEditorEntriesData) => {
  const { baseline, baselineTotalCount, added, removed } = entries;

  const addedEntries = Object.values(added);

  // Show the most recently added entries at the top.
  addedEntries.reverse();

  entries.current = addedEntries.concat(
    baseline.filter((entry) => !removed[entry.id])
  );

  const addedCount = addedEntries.length;
  const removedCount = Object.keys(removed).length;
  const currentCount = entries.current.length;

  entries.currentTotalCount = Math.max(
    baselineTotalCount + addedCount - removedCount,
    currentCount
  );
};

const handleCustomListDetailsLoad = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    return produce(state, (draftState) => {
      const { entries } = draftState;

      entries.baseline = action.data.books;

      applyEntriesDelta(entries);
    });
  }
);

const handleCustomListDetailsMoreLoad = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    return produce(state, (draftState) => {
      const { entries } = draftState;

      entries.baseline = entries.baseline.concat(action.data.books);

      applyEntriesDelta(entries);
    });
  }
);

const handleUpdateCustomListEditorProperty = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    const { name, value } = action;

    return produce(state, (draftState) => {
      draftState.properties.current[name] = value;
    });
  }
);

const handleToggleCustomListEditorCollection = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    const { id } = action;

    return produce(state, (draftState) => {
      const { collections } = draftState.properties.current;
      const index = collections.indexOf(id);

      if (index < 0) {
        collections.push(id);
      } else {
        collections.splice(index, 1);
      }
    });
  }
);

const handleUpdateCustomListEditorSearchParam = (
  state: CustomListEditorState,
  action
): CustomListEditorState => {
  const { name, value } = action;

  return produce(state, (draftState) => {
    draftState.searchParams[name] = value;
  });
};

const bookToEntry = (book) => ({
  id: book.id,
  title: book.title,
  authors: book.authors,
  url: book.url,
  medium: getMedium(book),
  language: book.language || "",
});

const handleAddCustomListEditorEntry = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    const { id, data } = action;

    return produce(state, (draftState) => {
      const { entries } = draftState;
      const { baseline, added, removed } = entries;

      const inList = baseline.find((book) => book.id === id);

      if (!inList) {
        const bookToAdd = data.books.find((book) => book.id === id);
        const isAdded = !!added[id];

        if (bookToAdd && !isAdded) {
          added[id] = bookToEntry(bookToAdd);
        }
      }

      delete removed[id];

      applyEntriesDelta(entries);
    });
  }
);

const handleAddAllCustomListEditorEntries = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    const { books } = action.data;

    // Add the books in reverse order, so that they appear in the entry list in the same order as
    // they appear in the search results.

    books.reverse();

    return produce(state, (draftState) => {
      const { entries } = draftState;
      const { baseline, added, removed } = entries;

      const listIds = baseline.reduce((ids, book) => {
        ids[book.id] = true;

        return ids;
      }, {});

      books
        .forEach((book) => delete removed[book.id])
        .filter((book) => !listIds[book.id] && !added[book.id])
        .map((book) => bookToEntry(book))
        .forEach((entry) => (added[entry.id] = entry));

      applyEntriesDelta(entries);
    });
  }
);

const handleDeleteCustomListEditorEntry = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    const { id } = action;

    return produce(state, (draftState) => {
      const { entries } = draftState;
      const { added, removed } = entries;

      if (added[id]) {
        delete added[id];
      } else {
        removed[id] = true;
      }

      applyEntriesDelta(entries);
    });
  }
);

const handleDeleteAllCustomListEditorEntries = validatedHandler(
  (state: CustomListEditorState): CustomListEditorState => {
    return produce(state, (draftState) => {
      const { entries } = draftState;
      const { baseline, added, removed } = entries;

      baseline.forEach((book) => {
        if (!added[book.id]) {
          removed[book.id] = true;
        }
      });

      entries.added = {};

      applyEntriesDelta(entries);
    });
  }
);

const handleResetCustomListEditor = validatedHandler(
  (state: CustomListEditorState): CustomListEditorState => {
    return produce(state, (draftState) => {
      const { properties, entries } = draftState;

      properties.current = properties.baseline;

      entries.added = {};
      entries.removed = {};

      applyEntriesDelta(entries);
    });
  }
);

export default (
  state: CustomListEditorState = initialState,
  action
): CustomListEditorState => {
  switch (action.type) {
    case ActionCreator.OPEN_CUSTOM_LIST_EDITOR:
      return handleCustomListEditorOpen(state, action);
    case `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`:
      return handleCustomListsLoad(state, action);
    case `${ActionCreator.CUSTOM_LIST_DETAILS}_${ActionCreator.LOAD}`:
      return handleCustomListDetailsLoad(state, action);
    case `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.LOAD}`:
      return handleCustomListDetailsMoreLoad(state, action);
    case ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_PROPERTY:
      return handleUpdateCustomListEditorProperty(state, action);
    case ActionCreator.TOGGLE_CUSTOM_LIST_EDITOR_COLLECTION:
      return handleToggleCustomListEditorCollection(state, action);
    case ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM:
      return handleUpdateCustomListEditorSearchParam(state, action);
    case ActionCreator.ADD_CUSTOM_LIST_EDITOR_ENTRY:
      return handleAddCustomListEditorEntry(state, action);
    case ActionCreator.ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES:
      return handleAddAllCustomListEditorEntries(state, action);
    case ActionCreator.DELETE_CUSTOM_LIST_EDITOR_ENTRY:
      return handleDeleteCustomListEditorEntry(state, action);
    case ActionCreator.DELETE_ALL_CUSTOM_LIST_EDITOR_ENTRIES:
      return handleDeleteAllCustomListEditorEntries(state, action);
    case ActionCreator.RESET_CUSTOM_LIST_EDITOR:
      return handleResetCustomListEditor(state, action);
    default:
      return state;
  }
};

export const getCustomListEditorFormData = (
  state: CustomListEditorState
): FormData => {
  const data = new (window as any).FormData();

  const { id, properties, entries } = state;

  if (id) {
    data.append("id", id);
  }

  const { name, collections } = properties.current;

  data.append("name", name);
  data.append("collections", JSON.stringify(collections));

  const { baseline, current, removed } = entries;

  data.append("entries", JSON.stringify(current));

  const entriesById = baseline.reduce((ids, entry) => {
    ids[entry.id] = entry;

    return ids;
  }, {});

  const deletedEntries = Object.keys(removed).map((id) => entriesById[id]);

  data.append("deletedEntries", JSON.stringify(deletedEntries));

  return data;
};

export const getCustomListEditorSearchUrl = (
  state: CustomListEditorState,
  library: string
): string => {
  const { entryPoint, terms, sort, language } = state.searchParams;

  const queryParams = [`q=${encodeURIComponent(terms)}`];

  if (entryPoint !== "All") {
    queryParams.push(`entrypoint=${encodeURIComponent(entryPoint)}`);
  }

  if (sort) {
    queryParams.push(`order=${encodeURIComponent(sort)}`);
  }

  if (language) {
    queryParams.push(`language=${encodeURIComponent(language)}`);
  }

  return `/${library}/search?${queryParams.join("&")}`;
};
