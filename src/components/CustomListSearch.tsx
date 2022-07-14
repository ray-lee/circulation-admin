import * as React from "react";
import EditableInput from "./EditableInput";
import SearchIcon from "./icons/SearchIcon";
import { LanguagesData, LibraryData } from "../interfaces";
import { Button, Panel, Form } from "library-simplified-reusable-components";
import { CustomListEditorSearchParams } from "../reducers/customListEditor"

export interface CustomListSearchProps {
  searchParams: CustomListEditorSearchParams;
  updateSearchParam?: (name: string, value) => void;
  search: () => void;
  entryPoints?: string[];
  // getEntryPointsElms?: (entryPoints: string[]) => {};
  startingTitle?: string;
  library: LibraryData;
  languages: LanguagesData;
}

// export interface CustomListSearchState {
//   sortBy?: string;
// }

export default class CustomListSearch extends React.Component<
  CustomListSearchProps
  // CustomListSearchState
> {
  constructor(props: CustomListSearchProps) {
    super(props);

    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleTermsChange = this.handleTermsChange.bind(this);

    this.search = this.search.bind(this);
    // this.state = { sortBy: null };
  }

  componentDidMount() {
    const {
      startingTitle,
    } = this.props;

    if (startingTitle) {
      this.updateSearchParam("terms", startingTitle);
      this.search();
    }
  }

  search() {
    const {
      search,
    } = this.props;

    if (search) {
      search();
    }
  }

  updateSearchParam(name, value) {
    const {
      updateSearchParam,
    } = this.props;

    if (updateSearchParam) {
      updateSearchParam(name, value);
    }
  }

  handleEntryPointChange(value) {
    this.updateSearchParam("entryPoint", value);
  }

  handleLanguageChange(event) {
    const {
      value,
    } = event.target;

    this.updateSearchParam("language", value);
  }

  handleSortChange(value: string) {
    this.updateSearchParam("sort", value);
  }

  handleTermsChange(event) {
    const {
      value,
    } = event.target;

    this.updateSearchParam("terms", value);
  }

  renderEntryPoint(entryPoint) {
    const entryPointSelected = this.props.searchParams.entryPoint.toLowerCase();

    return (
      <EditableInput
        key={entryPoint}
        type="radio"
        name="entry-points-selection"
        checked={entryPoint.toLowerCase() === entryPointSelected}
        label={entryPoint}
        value={entryPoint}
        onChange={() => this.handleEntryPointChange(entryPoint)}
      />
    );
  }

  renderEntryPoints(entryPoints) {
    const entryPointsInputs = [];

    if (!entryPoints.includes("All")) {
      entryPointsInputs.push(this.renderEntryPoint("All"));
    }

    entryPoints.forEach((entryPoint) => {
      entryPointsInputs.push(this.renderEntryPoint(entryPoint));
    });

    return entryPointsInputs;
  }

  renderSearchBox(): JSX.Element {
    return (
      <fieldset key="search">
        <legend className="visuallyHidden">Search for titles</legend>
        {this.props.entryPoints?.length ? (
          <div className="entry-points">
            <span>Select the entry point to search for:</span>
            <div className="entry-points-selection">
              {this.renderEntryPoints(this.props.entryPoints)}
            </div>
          </div>
        ) : null}
        <input
          aria-label="Search for a book title"
          className="form-control"
          ref="searchTerms"
          type="text"
          placeholder="Enter a search term"
          value={this.props.startingTitle || this.props.searchParams.terms}
          onChange={this.handleTermsChange}
        />
      </fieldset>
    );
  }

  renderSearchOptions(): JSX.Element {
    const sortBy = {
      "Relevance (default)": null,
      Title: "title",
      Author: "author",
    };
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
              {Object.keys(sortBy).map((x) => this.renderInput(x, sortBy[x]))}
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
    const settings = this.props.library?.settings;
    const languageFields =
      settings &&
      Object.keys(this.props.library.settings).filter((x) =>
        x.match(/_collections/)
      );
    const languages = [].concat(...languageFields?.map((x) => settings[x]));
    const fieldset = (
      <fieldset key="languages" className="well search-options">
        <legend>Filter by language:</legend>
        <section>
          <select
            ref="languages"
            value={this.props.searchParams.language}
            onChange={this.handleLanguageChange}
          >
            <option value="all" aria-selected={false}>
              All
            </option>
            {languages.map((x) => (
              <option key={x} value={x} aria-selected={false}>
                {this.getLanguageName(x)}
              </option>
            ))}
          </select>
        </section>
      </fieldset>
    );
    return fieldset;
  }

  getLanguageName(languageAbbreviation: string): string {
    return (
      this.props.languages &&
      this.props.languages[languageAbbreviation].join("; ")
    );
  }

  renderInput(k: string, v: string): JSX.Element {
    return (
      <li key={v}>
        <EditableInput
          type="radio"
          name={v}
          value={v}
          label={k}
          ref={v}
          checked={v === this.props.searchParams.sort}
          onChange={() => this.handleSortChange(v)}
        />
      </li>
    );
  }

  render(): JSX.Element {
    const searchForm = (
      <Form
        onSubmit={this.search}
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
        onEnter={this.search}
        content={searchForm}
      />
    );
  }
}
