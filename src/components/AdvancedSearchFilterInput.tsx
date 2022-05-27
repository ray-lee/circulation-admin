import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import { AdvancedSearchQuery } from "../interfaces";
import { newId } from "./AdvancedSearch";
import EditableInput from "./EditableInput";

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
  private opSelect = React.createRef<EditableInput>();
  private valueInput = React.createRef<EditableInput>();

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

  handleKeyChange(key) {
    this.setState({
      key,
    });
  }

  handleOpChange() {
    this.setState({
      op: this.opSelect.current?.getValue(),
    });
  }

  handleValueChange() {
    this.setState({
      value: this.valueInput.current?.getValue(),
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

    // this.props.onAdd({
    //   id: newId(),
    //   key,
    //   op,
    //   value: value.trim(),
    // });

    const values = value.split("|").map((value) => value.trim());

    if (values.length === 1) {
      this.props.onAdd({
        id: newId(),
        key,
        op,
        value,
      });
    }
    else {
      this.props.onAdd({
        id: newId(),
        or: values.map((val) => ({
          id: newId(),
          key,
          op,
          value: val,
        })),
      });
    }

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
      <div className="advanced-search-filter-input">
        <div>
          <EditableInput
            type="radio"
            name="title"
            value="title"
            label="title"
            checked={key === "title"}
            onChange={this.handleKeyChange}
          />

          <EditableInput
            type="radio"
            name="subject"
            value="subject"
            label="subject"
            checked={key === "subject"}
            onChange={this.handleKeyChange}
          />

          <EditableInput
            type="radio"
            name="author"
            value="author"
            label="author"
            checked={key === "author"}
            onChange={this.handleKeyChange}
          />

          <EditableInput
            type="radio"
            name="genre"
            value="genre"
            label="genre"
            checked={key === "genre"}
            onChange={this.handleKeyChange}
          />

          <EditableInput
            type="radio"
            name="audience"
            value="audience"
            label="audience"
            checked={key === "audience"}
            onChange={this.handleKeyChange}
          />
        </div>

        <div>
          <EditableInput
            elementType="select"
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
          </EditableInput>

          <EditableInput
            elementType="input"
            type="text"
            name="filter_value"
            onChange={this.handleValueChange}
            optionalText={false}
            ref={this.valueInput}
            value={value}
          />

          <Button
            className="inverted inline"
            callback={this.handleAddClick}
            content="Add filter"
            disabled={!(key && op && value.trim())}
          />
        </div>
      </div>
    );
  }
}
