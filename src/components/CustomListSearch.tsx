import * as React from "react";
import { Panel, Form } from "library-simplified-reusable-components";
import { LanguagesData, LibraryData } from "../interfaces";
import { CustomListEditorSearchParams } from "../reducers/customListEditor"
import SearchIcon from "./icons/SearchIcon";
import EditableInput from "./EditableInput";

export interface CustomListSearchProps {
  entryPoints?: string[];
  languages: LanguagesData;
  library: LibraryData;
  searchParams: CustomListEditorSearchParams;
  startingTitle?: string;
  updateSearchParam?: (name: string, value) => void;
  search: () => void;
}

export default class CustomListSearch extends React.Component<CustomListSearchProps> {
  constructor(props: CustomListSearchProps) {
    super(props);
  }

  componentDidMount() {
    const {
      startingTitle,
      updateSearchParam,
      search,
    } = this.props;

    if (startingTitle) {
      updateSearchParam?.("terms", startingTitle);
      search?.();
    }
  }

  renderEntryPointInput(entryPoint) {
    const selectedEntryPoint = this.props.searchParams.entryPoint.toLowerCase();

    return (
      <EditableInput
        key={entryPoint}
        type="radio"
        name="entry-points-selection"
        checked={entryPoint.toLowerCase() === selectedEntryPoint}
        label={entryPoint}
        value={entryPoint}
        onChange={() => this.props.updateSearchParam?.("entryPoint", entryPoint)}
      />
    );
  }

  renderEntryPoints(entryPoints) {
    const entryPointsInputs = [];

    if (!entryPoints.includes("All")) {
      entryPointsInputs.push(this.renderEntryPointInput("All"));
    }

    entryPoints.forEach((entryPoint) => {
      entryPointsInputs.push(this.renderEntryPointInput(entryPoint));
    });

    return entryPointsInputs;
  }

  renderSearchBox() {
    return (
      <fieldset key="search">
        <legend className="visuallyHidden">Search for titles</legend>

        {this.props.entryPoints?.length > 0 && (
          <div className="entry-points">
            <span>Select the entry point to search for:</span>

            <div className="entry-points-selection">
              {this.renderEntryPoints(this.props.entryPoints)}
            </div>
          </div>
        )}

        <input
          aria-label="Search for a book title"
          className="form-control"
          ref="searchTerms"
          type="text"
          placeholder="Enter a search term"
          value={this.props.startingTitle || this.props.searchParams.terms}
          onChange={(event) => this.props.updateSearchParam?.("terms", event.target.value)}
        />
      </fieldset>
    );
  }

  renderSortInput(label: string, value: string): JSX.Element {
    return (
      <li key={value}>
        <EditableInput
          type="radio"
          name={value}
          value={value}
          label={label}
          ref={value}
          checked={value === this.props.searchParams.sort}
          onChange={() => this.props.updateSearchParam?.("sort", value)}
        />
      </li>
    );
  }

  renderSearchOptions(): JSX.Element {
    const sorts = [
      ["Relevance (default)", null],
      ["Title", "title"],
      ["Author", "author"],
    ];

    return (
      <Panel
        id="advanced-search-options"
        key="advanced-search-options"
        style="instruction"
        headerText="Advanced search options"
        content={[
          <fieldset key="sortBy" className="well search-options">
            <legend>Sort by:</legend>

            <ul>
              {sorts.map(([label, value]) => this.renderSortInput(label, value))}
            </ul>

            <p>
              <i>
                Note: currently, you can sort only by attributes which you have
                enabled in this library's Lanes & Filters configuration.
              </i>
            </p>

            <p>
              <i>
                Selecting "Title" or "Author" will automatically filter out less
                relevant results.
              </i>
            </p>
          </fieldset>,
          this.renderLanguageFilter(),
        ]}
      />
    );
  }

  renderLanguageFilter() {
    const {
      languages,
      library,
      searchParams,
      updateSearchParam,
    } = this.props;

    const settings = library?.settings || {};

    const languageCodes =
      Object.entries(settings)
        .filter(([key]) => key.match(/_collections/))
        .flatMap(([key, value]) => value as string[])
console.log(languageCodes);
    return (
      <fieldset key="languages" className="well search-options">
        <legend>Filter by language:</legend>

        <section>
          <select
            ref="languages"
            value={searchParams.language}
            onChange={(event) => updateSearchParam?.("language", event.target.value)}
          >
            <option value="all" aria-selected={false}>All</option>

            {languageCodes.map((code) => (
              <option key={code} value={code} aria-selected={false}>
                {languages?.[code].join("; ")}
              </option>
            ))}
          </select>
        </section>
      </fieldset>
    );
  }

  render() {
    const searchForm = (
      <Form
        onSubmit={this.props.search}
        content={[this.renderSearchBox(), this.renderSearchOptions()]}
        buttonClass="left-align"
        buttonContent={
          <span>
            Search
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
        onEnter={this.props.search}
        content={searchForm}
      />
    );
  }
}
