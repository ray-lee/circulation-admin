import * as React from "react";
import { AdvancedSearchQuery } from "../interfaces";
import { newId } from "./AdvancedSearch";

export interface AdvancedSearchFilterInputProps {
  onAdd: (query: AdvancedSearchQuery) => void;
}

export interface AdvancedSearchFilterInputState {
  key?: string;
  op?: string;
  value?: string;
}

export default class AdvancedSearchFilterInput extends React.Component<
  AdvancedSearchFilterInputProps,
  AdvancedSearchFilterInputState
> {
  private opSelect = React.createRef<HTMLSelectElement>();
  private valueInput = React.createRef<HTMLInputElement>();

  constructor(props: AdvancedSearchFilterInputProps) {
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

  handleKeyChange(event: React.SyntheticEvent) {
    const radio: HTMLInputElement = event.currentTarget as HTMLInputElement;

    if (radio.checked) {
      this.setState({
        key: radio.value,
      });
    }
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
      value: value.trim(),
    });

    // const values = value.trim().split(" or ");

    // if (values.length === 1) {
    //   this.props.onAdd({
    //     id: newId(),
    //     key,
    //     op,
    //     value,
    //   });
    // }
    // else {
    //   this.props.onAdd({
    //     id: newId(),
    //     or: values.map((val) => ({
    //       id: newId(),
    //       key,
    //       op,
    //       value: val,
    //     })),
    //   });
    // }

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
        <div>
          <label><input name="key" type="radio" value="title" checked={key === "title"} onChange={this.handleKeyChange} /> title</label>
          <label><input name="key" type="radio" value="subject" checked={key === "subject"} onChange={this.handleKeyChange} /> subject</label>
          <label><input name="key" type="radio" value="author" checked={key === "author"} onChange={this.handleKeyChange} /> author</label>
          <label><input name="key" type="radio" value="genre" checked={key === "genre"} onChange={this.handleKeyChange} /> genre</label>
          <label><input name="key" type="radio" value="audience" checked={key === "audience"} onChange={this.handleKeyChange} /> audience</label>
        </div>

        <select
          onBlur={this.handleOpChange}
          onChange={this.handleOpChange}
          ref={this.opSelect}
          value={op}
        >
          <option aria-selected={op === "contains"} value="contains">contains</option>
          <option aria-selected={op === "eq"} value="eq">is</option>
          <option aria-selected={op === "neq"} value="neq">is not</option>
          <option aria-selected={op === "gt"} value="gt">is greater than</option>
          <option aria-selected={op === "lt"} value="lt">is less than</option>
        </select>

        {" "}

        <input
          onChange={this.handleValueChange}
          ref={this.valueInput}
          size={50}
          type="text"
          value={value}
        />

        {" "}

        <button
          disabled={!(key && op && value.trim())}
          onClick={this.handleAddClick}
        >
          Add filter
        </button>
      </div>
    );
  }
}
