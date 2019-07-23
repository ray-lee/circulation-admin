import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { ServiceData, SelfTestsData } from "../interfaces";
import ErrorMessage from "./ErrorMessage";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import SelfTestResult from "./SelfTestResult";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { Button } from "library-simplified-reusable-components";

import {
  CheckSoloIcon,
  XIcon,
} from "@nypl/dgx-svg-icons";

export interface SelfTestsStateProps {
  item?: ServiceData;
  isFetching?: boolean;
}

export interface SelfTestsDispatchProps {
  runSelfTests?: () => Promise<void>;
  getSelfTests?: () => Promise<SelfTestsData>;
}

export interface SelfTestsOwnProps {
  store?: Store<State>;
  type: string;
}

export interface SelfTestsProps extends React.Props<SelfTestsProps>, SelfTestsStateProps, SelfTestsDispatchProps, SelfTestsOwnProps {}

export interface SelfTestsState {
  expand: boolean;
  runTests: boolean;
  error: FetchErrorData;
}

export class SelfTests extends React.Component<SelfTestsProps, SelfTestsState> {
  constructor(props) {
    super(props);

    this.state = {
      expand: false,
      runTests: false,
      error: null,
    };
    this.toggleView = this.toggleView.bind(this);
    this.runSelfTests = this.runSelfTests.bind(this);
  }

  render() {
    const integration = this.props.item;
    const expand = this.state.expand;
    const selfTestException = integration.self_test_results && integration.self_test_results.exception;
    let date;
    let startDate;
    let hours;
    let minutes;
    let seconds;
    let startTime;
    let results = [];
    let duration;
    let disableToggleView = false;

    if (integration.self_test_results && !selfTestException) {
      date = new Date(integration.self_test_results.start);
      startDate = date.toDateString();
      hours = ("0" + date.getHours()).slice(-2);
      minutes = ("0" + date.getMinutes()).slice(-2);
      seconds = ("0" + date.getSeconds()).slice(-2);
      startTime = `${hours}:${minutes}:${seconds}`;
      results = integration.self_test_results.results || [];
      duration = integration.self_test_results.duration && integration.self_test_results.duration.toFixed(2);
    }

    const expandResultClass = expand ? "active" : "";
    const resultsLabel = expand ? "Collapse" : "Expand";
    const findFailures = (result) => !result.success;
    const oneFailedResult = results.some(findFailures);
    const resultIcon = oneFailedResult ? <XIcon className="failure" /> : <CheckSoloIcon className="success" />;
    const isFetching = !!(this.props.isFetching && this.state.runTests);

    let testDescription = integration.self_test_results && integration.self_test_results.start ?
      `Tests last ran on ${startDate} ${startTime} and lasted ${duration}s.` :
      "No self test results found.";

    const failedSelfTest = selfTestException ? selfTestException : "";
    const disableToggle = integration.self_test_results && integration.self_test_results.disabled;

    const toggleButton = (
      <Button
        callback={this.toggleView}
        disabled={disableToggle}
        content={`${resultsLabel} Results`}
      />
    );

    const runButton = (
      <Button
        callback={(e) => this.runSelfTests(e)}
        disabled={this.props.isFetching}
        content="Run tests"
      />
    );

    let resultList = integration.self_test_results ? results.map((result, idx) => <SelfTestResult key={idx} result={result} isFetching={isFetching} />) : null;

    return (
      <div className="integration-selftests">
        <div>
          {results.length ? resultIcon : null}
          <p className="description">{failedSelfTest ? failedSelfTest : testDescription}</p>
          { toggleButton }
        </div>
        <div className={`results collapse ${expandResultClass}`}>
          <h4>Self Test Results</h4>
          {isFetching &&
            <span>Running new self tests</span>
          }
          { runButton }
          {
            this.state.error &&
              <ErrorMessage error={this.state.error} />
          }
          {
            resultList && <ul>{resultList}</ul>
          }
        </div>
      </div>
    );
  }

  toggleView() {
    this.setState({
      expand: !this.state.expand,
      runTests: this.state.runTests,
      error: null,
    });
  }

  async runSelfTests(e) {
    e.preventDefault();
    this.setState({
      expand: this.state.expand,
      runTests: true,
      error: null,
    });

    try {
      await this.props.runSelfTests();
      this.props.getSelfTests();
      this.setState({
        expand: this.state.expand,
        runTests: false,
        error: null,
      });
    } catch (error) {
      this.setState({
        expand: this.state.expand,
        runTests: false,
        error: error,
      });
    }
  }
}

function mapStateToProps(state, ownProps) {
  const selfTests = state.editor.selfTests;
  return {
    isFetching: selfTests.isFetching,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let fetcher = new DataFetcher();
  let actions = new ActionCreator(fetcher, ownProps.csrfToken);
  const integrationId = ownProps.item.id;
  const url = `/admin/${ownProps.type.replace(/ /g, "_")}_self_tests/${integrationId}`;

  return {
    getSelfTests: () => dispatch(actions.getSelfTests(url)),
    runSelfTests: () => dispatch(actions.runSelfTests(url))
  };
}

const ConnectedSelfTests = connect<SelfTestsStateProps, SelfTestsDispatchProps, SelfTestsOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(SelfTests);

export default ConnectedSelfTests;
