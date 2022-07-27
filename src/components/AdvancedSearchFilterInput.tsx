import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import { AdvancedSearchQuery } from "../interfaces";
import { fields, operators } from "./AdvancedSearchBuilder";
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
      key: "genre",
      op: "eq",
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

    this.props.onAdd({
      id: null,
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
      <div className="advanced-search-filter-input">
        <div>
          {
            fields.map(({ name, label }) => (
              <EditableInput
                checked={key === name}
                key={name}
                label={label}
                name={name}
                onChange={this.handleKeyChange}
                type="radio"
                value={name}
              />
            ))
          }
        </div>

        <div>
          <EditableInput
            elementType="select"
            onBlur={this.handleOpChange}
            onChange={this.handleOpChange}
            ref={this.opSelect}
            value={op}
          >
            {
              operators.map(({name, label}) => (
                <option
                aria-selected={op === name}
                key={name}
                value={name}
                >
                  {label}
                </option>
              ))
            }
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
