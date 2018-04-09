import * as React from "react";
const dnd = require("react-beautiful-dnd");
const DragDropContext = dnd.DragDropContext;
const Droppable = dnd.Droppable;
const Draggable = dnd.Draggable;
import { CustomListEntryData } from "../interfaces";
import { CollectionData } from "opds-web-client/lib/interfaces";
import ApplyIcon from "./icons/ApplyIcon";
import TrashIcon from "./icons/TrashIcon";
import GrabIcon from "./icons/GrabIcon";
import AddIcon from "./icons/AddIcon";
import XCloseIcon from "./icons/XCloseIcon";
import MoreDotsIcon from "./icons/MoreDotsIcon";
import {
  AudioHeadphoneIcon,
  BookIcon,
} from "@nypl/dgx-svg-icons";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";

export interface CustomListEntriesEditorProps extends React.Props<CustomListEntriesEditor> {
  entries?: CustomListEntryData[];
  searchResults?: CollectionData;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  onUpdate?: (entries: CustomListEntryData[]) => void;
  isFetchingMoreSearchResults: boolean;
  library?: string;
}

export interface CustomListEntriesEditorState {
  draggingFrom: string | null;
  entries: CustomListEntryData[];
}

/** Drag and drop interface for adding books from search results to a custom list. */
export default class CustomListEntriesEditor extends React.Component<CustomListEntriesEditorProps, CustomListEntriesEditorState> {
  constructor(props) {
    super(props);
    this.state = {
      draggingFrom: null,
      entries: this.props.entries || []
    };

    this.reset = this.reset.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.addAll = this.addAll.bind(this);
    this.deleteAll = this.deleteAll.bind(this);
    this.loadMore = this.loadMore.bind(this);
  }

  render(): JSX.Element {
    return (
      <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
        <div className="custom-list-drag-and-drop">
          <div className="custom-list-search-results">
            <div className="droppable-header">
              <h4>Search Results</h4>
              { this.props.searchResults && (this.searchResultsNotInEntries().length > 0) &&
                <button
                  className="btn btn-default add-all-button"
                  onClick={this.addAll}
                  >Add all to list
                    <ApplyIcon />
                </button>
              }
            </div>
            <Droppable
              droppableId="search-results"
              isDropDisabled={this.state.draggingFrom !== "custom-list-entries"}
            >
              {(provided, snapshot) => (
                <ul
                  ref={provided.innerRef}
                  className={snapshot.isDraggingOver ? "droppable dragging-over" : "droppable"}
                  >
                  { this.state.draggingFrom === "custom-list-entries" &&
                    <p>Drag books here to remove them from the list.</p>
                  }
                  { (this.state.draggingFrom !== "custom-list-entries") && this.props.searchResults && this.searchResultsNotInEntries().map((book, i) =>
                    <Draggable key={this.getPwid(book)} draggableId={this.getPwid(book)}>
                      {(provided, snapshot) => (
                        <li>
                          <div
                            className={"search-result" + (snapshot.isDragging ? " dragging" : "")}
                            ref={provided.innerRef}
                            style={provided.draggableStyle}
                            {...provided.dragHandleProps}
                          >
                            <GrabIcon />
                            <div>
                              <div className="title">{ book.title }</div>
                              <div className="authors">{ book.authors.join(", ") }</div>
                            </div>
                            {this.getMediumSVG(this.getMedium(book))}
                            {this.getCatalogLink(book)}
                            <div className="links">
                              <a
                                href="#"
                                onClick={() => { this.add(this.getPwid(book)); }}
                                >Add to list
                                  <AddIcon />
                              </a>
                            </div>
                          </div>
                          { provided.placeholder }
                        </li>
                      )}
                    </Draggable>
                  )}
                  { provided.placeholder }
                </ul>
              )}
              </Droppable>
              { this.props.searchResults && this.props.searchResults.nextPageUrl &&
                <button
                  className="btn btn-default load-more-button"
                  disabled={this.props.isFetchingMoreSearchResults}
                  onClick={this.loadMore}
                  >
                    { this.props.isFetchingMoreSearchResults ?
                      <MoreDotsIcon /> :
                      "Load more"
                    }
                </button>
              }
          </div>

          <div className="custom-list-entries">
            <div className="droppable-header">
              <h4>Books in this List ({ this.state.entries.length })</h4>
              { (this.state.entries.length > 0) &&
                <button
                  className="btn btn-default delete-all-button"
                  onClick={this.deleteAll}
                  >Delete all from list
                    <TrashIcon />
                </button>
              }
            </div>
            <Droppable
              droppableId="custom-list-entries"
              isDropDisabled={this.state.draggingFrom !== "search-results"}
              >
              {(provided, snapshot) => (
                <ul
                  ref={provided.innerRef}
                  className={snapshot.isDraggingOver ? " droppable dragging-over" : "droppable"}
                  >
                  <p>Drag search results here to add them to the list.</p>
                  { this.state.entries && this.state.entries.map((book, i) => (
                      <Draggable key={book.pwid} draggableId={book.pwid}>
                        {(provided, snapshot) => (
                          <li>
                            <div
                              className={"custom-list-entry" + (snapshot.isDragging ? " dragging" : "")}
                              ref={provided.innerRef}
                              style={provided.draggableStyle}
                              {...provided.dragHandleProps}
                            >
                              <GrabIcon />
                              <div>
                                <div className="title">{ book.title }</div>
                                <div className="authors">{ book.authors.join(", ") }</div>
                              </div>
                              {this.getMediumSVG(book.medium)}
                              {this.getCatalogLink(book, "entry")}
                              <div className="links">
                                <a
                                  href="#"
                                  onClick={() => { this.delete(book.pwid); }}
                                  >Remove from list
                                    <TrashIcon />
                                </a>
                              </div>
                            </div>
                            { provided.placeholder }
                          </li>
                        )}
                      </Draggable>
                    ))}
                  { provided.placeholder }
                </ul>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.entries && nextProps.entries !== this.props.entries) {
      this.setState({ draggingFrom: null, entries: nextProps.entries || [] });
    }
  }

  getPwid(book) {
    return book.raw["simplified:pwid"][0]["_"];
  }

  getCatalogLink(book, type = "") {
    if (!book) {
      return null;
    }
    let bookUrl = book.url;

    if (type === "entry") {
      bookUrl = (this.props.library ? this.props.library : "") + encodeURIComponent(`/URI/${book.url}`);
    }

    return <CatalogLink bookUrl={bookUrl} title={book.title}>View details</CatalogLink>;
  }

  getMedium(book) {
    return book.raw["$"]["schema:additionalType"].value;
  }

  getMediumSVG(medium) {
    if (!medium) {
      return null;
    }

    const svgMediumTypes = {
      "http://bib.schema.org/Audiobook": <AudioHeadphoneIcon ariaHidden className="draggable-item-icon" />,
      "http://schema.org/EBook": <BookIcon ariaHidden className="draggable-item-icon" />,
    };

    return svgMediumTypes[medium] || null;
  }

  getEntries(): CustomListEntryData[] {
    return this.state.entries;
  }

  reset() {
    this.setState({
      draggingFrom: null,
      entries: this.props.entries || []
    });
    if (this.props.onUpdate) {
      this.props.onUpdate(this.props.entries || []);
    }
  }

  searchResultsNotInEntries() {
    let entryPwids = this.state.entries.map(entry => entry.pwid);
    return this.props.searchResults.books.filter(book => {
      const pwid = this.getPwid(book);
      for (const entryPwid of entryPwids) {
        if (entryPwid === pwid) {
          return false;
        }
      }
      return true;
    });
  }

  onDragStart(initial) {
    document.body.classList.add("dragging");
    const draggableId = initial.draggableId;
    const type = initial.type;
    const source = initial.source;

    this.setState({ draggingFrom: source.droppableId, entries: this.state.entries });
  }

  onDragEnd(result) {
    const draggableId = result.draggableId;
    const type = result.type;
    const source = result.source;
    const destination = result.destination;

    if (source.droppableId === "search-results" && destination && destination.droppableId === "custom-list-entries") {
      this.add(draggableId);
    }
    else if (source.droppableId === "custom-list-entries" && destination && destination.droppableId === "search-results") {
      this.delete(draggableId);
    } else {
      this.setState({ draggingFrom: null, entries: this.state.entries });
    }

    document.body.classList.remove("dragging");
  }

  add(pwid: string) {
    let entries = this.state.entries.slice(0);
    for (const result of this.props.searchResults.books) {
      if (this.getPwid(result) === pwid) {
        const medium = this.getMedium(result);
        entries.unshift({ pwid: pwid, title: result.title, authors: result.authors, medium });
      }
    }
    this.setState({ draggingFrom: null, entries });
    if (this.props.onUpdate) {
      this.props.onUpdate(entries);
    }
  }

  delete(pwid: string) {
    let entries = this.state.entries.slice(0);
    entries = entries.filter(entry => entry.pwid !== pwid);
    this.setState({ draggingFrom: null, entries });
    if (this.props.onUpdate) {
      this.props.onUpdate(entries);
    }
  }

  addAll() {
    let entries = [];

    for (const result of this.searchResultsNotInEntries()) {
      const medium = this.getMedium(result);
      entries.push({ pwid: this.getPwid(result), title: result.title, authors: result.authors, medium });
    }

    for (const entry of this.state.entries) {
      entries.push(entry);
    }

    this.setState({ draggingFrom: null, entries });
    if (this.props.onUpdate) {
      this.props.onUpdate(entries);
    }
  }

  deleteAll() {
    this.setState({ draggingFrom: null, entries: [] });
    if (this.props.onUpdate) {
      this.props.onUpdate([]);
    }
  }

  loadMore() {
    if (this.props.searchResults && !this.props.isFetchingMoreSearchResults) {
      let nextPageUrl = this.props.searchResults.nextPageUrl;
      this.props.loadMoreSearchResults(nextPageUrl);
    }
  }
}
