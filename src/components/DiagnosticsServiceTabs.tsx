import * as React from "react";
import { DiagnosticsServiceData, DiagnosticsCollectionData, TimestampData } from "../interfaces";

import { TabContainer, TabContainerProps, TabContainerContext } from "./TabContainer";
import Collapsible from "./Collapsible";
import Timestamp from "./Timestamp";

export interface DiagnosticsServiceTabsProps extends TabContainerProps {
  goToTab: (tabName: string) => void;
  content: DiagnosticsServiceData[];
}

export default class DiagnosticsServiceTabs extends TabContainer<DiagnosticsServiceTabsProps> {

  handleSelect(event) {
    let tab = event.currentTarget.dataset.tabkey;
    this.props.goToTab(tab);
  }

  tabs() {
    let tabs = {};
    let serviceNames = Object.keys(this.props.content);
    serviceNames.map((serviceName) => {
        tabs[serviceName] = this.renderCollections(this.props.content[serviceName]);
    });
    return tabs;
  }

  tabDisplayName(name) {
    let timestampArray = [].concat(...Object.values(this.props.content[name]));
    let hasException = timestampArray.some((ts) => ts.exception);
    let badge = hasException ? <span className="badge danger">!</span> : <span className="badge">{timestampArray.length}</span>;

    return <span>{super.tabDisplayName(name)}{badge}</span>;
  }

  renderCollections(collections: Array<DiagnosticsCollectionData>) {
    return Object.keys(collections).map((collectionName) =>
      <Collapsible
        title={collectionName}
        openByDefault={collections[collectionName].some((ts) => ts.exception)}
        body={this.renderTimestamps(collections[collectionName])}
      />
    );
  }

  renderTimestamps(timestamps: Array<TimestampData>): JSX.Element {
    let tsList = timestamps.map(timestamp =>
      <li><Timestamp timestamp={timestamp} /></li>
    );
    return <ul>{tsList}</ul>;
  }
}
