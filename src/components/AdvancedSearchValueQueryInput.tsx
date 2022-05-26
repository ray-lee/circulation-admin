import * as React from "react";
import { AdvancedSearchQuery } from "../interfaces";
import { newId } from "./AdvancedSearch";

export interface AdvancedSearchValueQueryInputProps {
  onAdd: (query: AdvancedSearchQuery) => void;
}

export interface AdvancedSearchValueQueryInputState {
  key?: string;
  op?: string;
  value?: string;
}

export default class AdvancedSearchValueQueryInput extends React.Component<
  AdvancedSearchValueQueryInputProps,
  AdvancedSearchValueQueryInputState
> {
  private keySelect = React.createRef<HTMLSelectElement>();
  private opSelect = React.createRef<HTMLSelectElement>();
  private valueInput = React.createRef<HTMLInputElement>();

  constructor(props: AdvancedSearchValueQueryInputProps) {
    super(props);

    this.state = {
      key: "title",
      op: "contains",
      value: "",
    };

    this.handleKeyChange = this.handleKeyChange.bind(this);
    this.handleOpChange = this.handleOpChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleAddClick = this.handleAddClick.bind(this);
  }

  handleKeyChange() {
    this.setState({
      key: this.keySelect.current?.value,
    });
  }

  handleOpChange() {
    this.setState({
      op: this.opSelect.current?.value,
    });
  }

  handleValueChange() {
    this.setState({
      value: this.valueInput.current?.value,
    });
  }

  handleAddClick(event: React.SyntheticEvent) {
    event.stopPropagation();
    event.preventDefault();

    const {
      key,
      op,
      value,
    } = this.state;

    this.props.onAdd({
      id: newId(),
      key,
      op,
      value,
    });

    this.setState({
      value: ""
    });
  }

  render(): JSX.Element {
    const {
      key,
      op,
      value,
    } = this.state;

    return (
      <div className="advanced-search-param-entry">
        <select
          onChange={this.handleKeyChange}
          ref={this.keySelect}
          value={key}
        >
          <option value="title">title</option>
          <option value="subject">subject</option>
          <option value="author">author</option>
          <option value="genre">genre</option>
          <option value="audience">audience</option>
        </select>

        {" "}

        <select
          onChange={this.handleOpChange}
          ref={this.opSelect}
          value={op}
        >
          <option value="contains">contains</option>
        </select>

        {" "}

        <input
          onChange={this.handleValueChange}
          ref={this.valueInput}
          type="text"
          value={value}
        />

        {" "}

        <button
          disabled={!(key && op && value)}
          onClick={this.handleAddClick}
        >
          Add filter
        </button>
      </div>
    );
  }
}
