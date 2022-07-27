import * as React from "react";
import { Panel, Form } from "library-simplified-reusable-components";
import { AdvancedSearchQuery, LanguagesData, LibraryData } from "../interfaces";
import { CustomListEditorSearchParams } from "../reducers/customListEditor";
import SearchIcon from "./icons/SearchIcon";
import AdvancedSearchBuilder from "./AdvancedSearchBuilder";
import EditableInput from "./EditableInput";

export interface CustomListSearchProps {
  entryPoints: string[];
  languages: LanguagesData;
  library: LibraryData;
  searchParams: CustomListEditorSearchParams;
  startingTitle?: string;
  search: () => void;
  updateSearchParam?: (name: string, value) => void;
  addAdvSearchQuery?: (builderName: string, query: AdvancedSearchQuery) => void;
  updateAdvSearchQuery?: (builderName: string, query: AdvancedSearchQuery) => void;
  moveAdvSearchQuery?: (builderName: string, id: string, targetId: string) => void;
  removeAdvSearchQuery?: (builderName: string, id: string) => void;
  selectAdvSearchQuery?: (builderName: string, id: string) => void;
}

const CustomListSearch = ({
  entryPoints,
  languages,
  library,
  searchParams,
  startingTitle,
  updateSearchParam,
  search,
  addAdvSearchQuery,
  updateAdvSearchQuery,
  moveAdvSearchQuery,
  removeAdvSearchQuery,
  selectAdvSearchQuery,
}: CustomListSearchProps) => {
  React.useEffect(() => {
    if (startingTitle) {
      updateSearchParam?.("terms", startingTitle);
      search?.();
    }
  }, []);

  const entryPointsWithAll = entryPoints.includes("All")
    ? entryPoints
    : ["All", ...entryPoints];

  const selectedEntryPoint = searchParams.entryPoint.toLowerCase();

  const entryPointOptions = entryPointsWithAll.length > 0 && (
    <div className="entry-points" key="entry-point-options">
      <span>Search for:</span>

      <div className="entry-points-selection">
        {entryPointsWithAll.map((entryPoint) => (
          <EditableInput
            key={entryPoint}
            type="radio"
            name="entry-points-selection"
            checked={entryPoint.toLowerCase() === selectedEntryPoint}
            label={entryPoint}
            value={entryPoint}
            onChange={() => updateSearchParam?.("entryPoint", entryPoint)}
          />
        ))}
      </div>
    </div>
  );

  const sorts = [
    ["Relevance", null],
    ["Title", "title"],
    ["Author", "author"],
  ];

  const sortOptions = (
    <div className="search-options" key="sort-options">
      <span>Sort by:</span>

      <div className="search-options-selection">
        {sorts.map(([label, value]) => (
          <EditableInput
            key={value}
            type="radio"
            name="sort-selection"
            value={value}
            label={label}
            checked={value === searchParams.sort}
            onChange={() => updateSearchParam?.("sort", value)}
          />
        ))}
      </div>

      <aside>
        Note: Results can be sorted by attributes that are enabled in this library's Lanes &amp;
        Filters configuration. Selecting "Title" or "Author" will automatically filter out less
        relevant results.
      </aside>
    </div>
  );

  const renderAdvancedSearchBuilder = (name: string) => {
    const builder = searchParams.advanced[name];

    return (
      <AdvancedSearchBuilder
        name={name}
        query={builder.query}
        selectedQueryId={builder.selectedQueryId}
        addQuery={addAdvSearchQuery}
        updateQuery={updateAdvSearchQuery}
        moveQuery={moveAdvSearchQuery}
        removeQuery={removeAdvSearchQuery}
        selectQuery={selectAdvSearchQuery}
      />
    );
  };

  const advancedSearchBuilders = (
    <div className="search-builders" key="search-builders">
      <Panel
        headerText="Works to include"
        id="search-filters-include"
        openByDefault={true}
        content={renderAdvancedSearchBuilder("include")}
      />

      <Panel
        headerText="Works to exclude"
        id="search-filters-exclude"
        openByDefault={false}
        content={renderAdvancedSearchBuilder("exclude")}
      />
    </div>
  );

  const searchForm = (
    <Form
      onSubmit={search}
      content={[
        entryPointOptions,
        sortOptions,
        advancedSearchBuilders,
      ]}
      buttonClass="left-align"
      buttonContent={
        <span>
          Update results
          <SearchIcon />
        </span>
      }
      className="search-titles"
    />
  );

  return (
    <Panel
      headerText="Search for titles"
      id="search-titles"
      openByDefault={true}
      onEnter={search}
      content={searchForm}
    />
  );
};

export default CustomListSearch;
