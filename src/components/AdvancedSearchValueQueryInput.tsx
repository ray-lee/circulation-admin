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
          onBlur={this.handleKeyChange}
          onChange={this.handleKeyChange}
          ref={this.keySelect}
          value={key}
        >
          <option aria-selected={key === "title"} value="title">title</option>
          <option aria-selected={key === "subject"} value="subject">subject</option>
          <option aria-selected={key === "author"} value="author">author</option>
          <option aria-selected={key === "genre"} value="genre">genre</option>
          <option aria-selected={key === "audience"} value="audience">audience</option>
        </select>

        {" "}

        <select
          onBlur={this.handleOpChange}
          onChange={this.handleOpChange}
          ref={this.opSelect}
          value={op}
        >
          <option aria-selected={op === "contains"} value="contains">contains</option>
          <option aria-selected={op === "eq"} value="eq">is</option>
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
