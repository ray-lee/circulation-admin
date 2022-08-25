import * as React from "react";
import { connect } from "react-redux";
import { Alert } from "react-bootstrap";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import EditableConfigList, {
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import ActionCreator from "../actions";
import { SitewideAnnouncementsData, AnnouncementData } from "../interfaces";
import ErrorMessage from "./ErrorMessage";
import AnnouncementsSection from "./AnnouncementsSection";

/** Right panel for sitewide announcements on the system configuration page. */
export class SitewideAnnouncements extends EditableConfigList<
  SitewideAnnouncementsData,
  AnnouncementData
> {
  EditForm = null;
  listDataKey = "announcements";
  itemTypeName = "sitewide announcement";
  urlBase = "/admin/web/config/sitewideAnnouncements/";
  identifierKey = "id";
  labelKey = "content";

  render() {
    const headers = this.getHeaders();

    const canListAllData =
      !this.props.isFetching &&
      !this.props.editOrCreate &&
      this.props.data?.[this.listDataKey];

    return (
      <div className={this.getClassName()}>
        <h2>{headers["h2"]}</h2>
        {canListAllData && this.links?.["info"] && (
          <Alert bsStyle="info">{this.links["info"]}</Alert>
        )}
        {this.props.responseBody && (
          <Alert bsStyle="success">{this.successMessage()}</Alert>
        )}
        {this.props.fetchError && (
          <ErrorMessage error={this.props.fetchError} />
        )}
        {this.props.formError && (
          <ErrorMessage error={this.props.formError} />
        )}
        {this.props.isFetching && <LoadingIndicator />}

        {canListAllData && (
          <AnnouncementsSection
            setting={this.props.data.settings}
            value={this.props.data[this.listDataKey]}
          />
        )}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const data = {
    ...(state.editor.sitewideAnnouncements?.data || {})
  };

  return {
    data: data,
    responseBody: state.editor.sitewideAnnouncements?.successMessage,
    fetchError: state.editor.sitewideAnnouncements.fetchError,
    formError: state.editor.sitewideAnnouncements.formError,
    isFetching:
      state.editor.sitewideAnnouncements.isFetching ||
      state.editor.sitewideAnnouncements.isEditing,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchSitewideAnnouncements()),
  };
}

const ConnectedSitewideAnnouncements = connect<
  EditableConfigListStateProps<SitewideAnnouncementsData>,
  EditableConfigListDispatchProps<SitewideAnnouncementsData>,
  EditableConfigListOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(SitewideAnnouncements);

export default ConnectedSitewideAnnouncements;
