import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { CollectionData } from "opds-web-client/lib/interfaces";
import { getMedium, getMediumSVG } from "opds-web-client/lib/utils/book";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Entry } from "../reducers/customListEditor";
import ApplyIcon from "./icons/ApplyIcon";
import TrashIcon from "./icons/TrashIcon";
import GrabIcon from "./icons/GrabIcon";
import AddIcon from "./icons/AddIcon";
import LoadButton from "./LoadButton";

export interface CustomListEntriesEditorProps {
  entries?: Entry[];
  searchResults?: CollectionData;
  loadMoreSearchResults: () => void;
  loadMoreEntries: () => void;
  isFetchingMoreSearchResults: boolean;
  isFetchingMoreCustomListEntries: boolean;
  opdsFeedUrl?: string;
  entryCount?: number;
  listId?: string | number;
  addEntry?: (id: string) => void;
  addAllEntries?: () => void;
  deleteEntry?: (id: string) => void;
  deleteAllEntries?: () => void;
}

export interface CustomListEntriesEditorState {
  draggingFrom: string | null;
}

export default class CustomListEntriesEditor extends React.Component<
  CustomListEntriesEditorProps,
  CustomListEntriesEditorState
> {
  constructor(props) {
    super(props);

    this.state = {
      draggingFrom: null,
    };

    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.listId !== nextProps.listId) {
      this.setState({
        draggingFrom: null,
      });
    }

    if (nextProps.entries && nextProps.entries !== this.props.entries) {
      this.setState({
        draggingFrom: null,
      });

      const droppableList = document.getElementById("custom-list-entries-droppable");

      if (droppableList) {
        droppableList.scrollTo(0, 0);
      }
    }
  }

  filterSearchResults(visibleEntries) {
    const {
      searchResults,
    } = this.props;

    if (!searchResults?.books?.length) {
      return [];
    }

    // TODO: Memoize
    const entryIds = visibleEntries.reduce((ids, entry) => {
      ids[entry.id] = true;

      return ids;
    }, {});

    return searchResults.books.filter((book) => !entryIds[book.id])
  }

  handleDragStart(event) {
    this.setState({
      draggingFrom: event.source.droppableId,
    });

    document.body.classList.add("dragging");
  }

  handleDragEnd(event) {
    const {
      draggableId,
      source,
      destination,
    } = event;

    const {
      addEntry,
      deleteEntry,
    } = this.props;

    if (
      source.droppableId === "search-results" &&
      destination?.droppableId === "custom-list-entries"
    ) {
      addEntry?.(draggableId);
    } else if (
      source.droppableId === "custom-list-entries" &&
      destination?.droppableId === "search-results"
    ) {
      deleteEntry?.(draggableId);
    } else {
      this.setState({
        draggingFrom: null,
      });
    }

    document.body.classList.remove("dragging");
  }

  renderCatalogLink(book) {
    const {
      title,
      url,
    } = book;

    if (!url) {
      return null;
    }

    return (
      <CatalogLink
        collectionUrl={this.props.opdsFeedUrl}
        bookUrl={url}
        title={title}
        target="_blank"
        className="btn inverted left-align small top-align"
      >
        View details
      </CatalogLink>
    );
  }

  render(): JSX.Element {
    const {
      draggingFrom,
    } = this.state;

    const {
      entries: visibleEntries,
      isFetchingMoreSearchResults,
      isFetchingMoreCustomListEntries,
      loadMoreEntries,
      loadMoreSearchResults,
      entryCount,
    } = this.props;

    const visibleEntryCount = visibleEntries.length;
    const startNum = visibleEntryCount > 0 ? 1 : 0;
    const endNum = visibleEntryCount;
    const booksText = entryCount === 1 ? "book" : "books";

    const entryListDisplay = (entryCount > 0)
      ?  `Displaying ${startNum} - ${endNum} of ${entryCount} ${booksText}`
      :  "No books in this list";

    const filteredSearchResults = this.filterSearchResults(visibleEntries);

    return (
      <DragDropContext
        onDragStart={this.handleDragStart}
        onDragEnd={this.handleDragEnd}
      >
        <div className="custom-list-drag-and-drop">
          <div className="custom-list-search-results">
            <div className="droppable-header">
              <h4>Search Results</h4>

              {filteredSearchResults.length > 0 && (
                <Button
                  key="addAll"
                  className="add-all-button"
                  callback={this.props.addAllEntries}
                  content={
                    <span>
                      Add all to list
                      <ApplyIcon />
                    </span>
                  }
                />
              )}
            </div>

            <Droppable
              droppableId="search-results"
              isDropDisabled={draggingFrom !== "custom-list-entries"}
            >
              {(provided, snapshot) => (
                <ul
                  ref={provided.innerRef}
                  className={
                    snapshot.isDraggingOver
                      ? "droppable dragging-over"
                      : "droppable"
                  }
                >
                  {draggingFrom === "custom-list-entries" && (
                    <p>Drag books here to remove them from the list.</p>
                  )}

                  {draggingFrom !== "custom-list-entries" && filteredSearchResults.map((book) => (
                    <Draggable key={book.id} draggableId={book.id}>
                      {(provided, snapshot) => (
                        <li>
                          <div
                            className={
                              "search-result" +
                              (snapshot.isDragging ? " dragging" : "")
                            }
                            ref={provided.innerRef}
                            style={provided.draggableStyle}
                            {...provided.dragHandleProps}
                          >
                            <GrabIcon />

                            <div>
                              <div className="title">{book.title}</div>

                              <div className="authors">
                                {book.authors.join(", ")}
                              </div>
                            </div>

                            {getMediumSVG(getMedium(book))}

                            <div className="links">
                              {this.renderCatalogLink(book)}

                              <Button
                                callback={() => this.props.addEntry?.(book.id)}
                                className="right-align"
                                content={
                                  <span>
                                    Add to list
                                    <AddIcon />
                                  </span>
                                }
                              />
                            </div>
                          </div>

                          {provided.placeholder}
                        </li>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </ul>
              )}
            </Droppable>

            {loadMoreSearchResults && (
              <LoadButton
                isFetching={isFetchingMoreSearchResults}
                loadMore={loadMoreSearchResults}
              />
            )}
          </div>

          <div className="custom-list-entries">
            <div className="droppable-header">
              <h4>{entryListDisplay}</h4>

              {visibleEntries?.length > 0 && (
                <div>
                  <span>Remove all currently visible items from list:</span>

                  <Button
                    className="danger delete-all-button top-align"
                    callback={this.props.deleteAllEntries}
                    content={
                      <span>
                        Delete
                        <TrashIcon />
                      </span>
                    }
                  />
                </div>
              )}
            </div>

            <p>Drag search results here to add them to the list.</p>

            <Droppable
              droppableId="custom-list-entries"
              isDropDisabled={draggingFrom !== "search-results"}
            >
              {(provided, snapshot) => (
                <ul
                  ref={provided.innerRef}
                  id="custom-list-entries-droppable"
                  className={
                    snapshot.isDraggingOver
                      ? " droppable dragging-over"
                      : "droppable"
                  }
                >
                  {visibleEntries?.map((book) => (
                    <Draggable key={book.id} draggableId={book.id}>
                      {(provided, snapshot) => (
                        <li>
                          <div
                            className={
                              "custom-list-entry" +
                              (snapshot.isDragging ? " dragging" : "")
                            }
                            ref={provided.innerRef}
                            style={provided.draggableStyle}
                            {...provided.dragHandleProps}
                          >
                            <GrabIcon />

                            <div>
                              <div className="title">{book.title}</div>

                              <div className="authors">
                                {book.authors.join(", ")}
                              </div>
                            </div>

                            {getMediumSVG(getMedium(book))}

                            <div className="links">
                              {this.renderCatalogLink(book)}

                              <Button
                                className="small right-align"
                                callback={() => this.props.deleteEntry?.(book.id)}
                                content={
                                  <span>
                                    Remove from list
                                    <TrashIcon />
                                  </span>
                                }
                              />
                            </div>
                          </div>

                          {provided.placeholder}
                        </li>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </ul>
              )}
            </Droppable>

            {loadMoreEntries && (
              <LoadButton
                isFetching={isFetchingMoreCustomListEntries}
                loadMore={loadMoreEntries}
              />
            )}
          </div>
        </div>
      </DragDropContext>
    );
  }
}
