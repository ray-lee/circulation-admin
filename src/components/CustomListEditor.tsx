import * as React from "react";
import { Button, Panel } from "library-simplified-reusable-components";
import { CollectionData } from "opds-web-client/lib/interfaces";

import {
  LanguagesData,
  LibraryData,
  CollectionData as AdminCollectionData,
} from "../interfaces";

import {
  CustomListEditorProperties,
  CustomListEditorEntriesData,
  CustomListEditorSearchParams,
} from "../reducers/customListEditor"

import CustomListEntriesEditor from "./CustomListEntriesEditor";
import CustomListSearch from "./CustomListSearch";
import EditableInput from "./EditableInput";
import TextWithEditMode from "./TextWithEditMode";

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
  toggleCollection?: (id: number) => void;
  updateSearchParam?: (name: string, value) => void;
  addEntry?: (id: string) => void;
  addAllEntries?: () => void;
  deleteEntry?: (id: string) => void;
  deleteAllEntries?: () => void;
}

/** Right panel of the lists page for editing a single list. */
export default class CustomListEditor extends React.Component<
  CustomListEditorProps
> {
  constructor(props) {
    super(props);

    this.toggleCollection = this.toggleCollection.bind(this);
    this.updateTitle = this.updateTitle.bind(this);
  }

  toggleCollection(value: string) {
    const {
      toggleCollection,
    } = this.props;

    if (toggleCollection) {
      toggleCollection(parseInt(value, 10));
    }
  }

  updateTitle(title: string) {
    const {
      updateProperty,
    } = this.props;

    if (updateProperty) {
      updateProperty("name", title);
    }
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
      collections: listCollections,
      name,
    } = properties;

    const nextPageUrl = this.props.list && this.props.list.nextPageUrl;
    const crawlable = `${name ? `lists/${name}/` : ""}crawlable`;
    const opdsFeedUrl = `${this.props.library?.short_name}/${crawlable}`;

    return (
      <div className="custom-list-editor">
        <div className="custom-list-editor-header">
          <div className="edit-custom-list-title">
            <fieldset className="save-or-edit">
              <legend className="visuallyHidden">List name</legend>

              <TextWithEditMode
                text={name}
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
              callback={this.props.save}
              disabled={!isModified || !isValid}
              content="Save this list"
            />

            {isModified && (
              <Button
                className="inverted"
                callback={this.props.reset}
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
                          checked={listCollections.includes(collection.id)}
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
              search={this.props.search}
              entryPoints={this.props.entryPoints}
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
}
