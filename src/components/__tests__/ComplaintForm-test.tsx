jest.autoMockOff();

import * as React from "react";
import { shallow, mount } from "enzyme";

import ComplaintForm from "../ComplaintForm";
import EditableSelect from "../EditableSelect";

describe("ComplaintForm", () => {
  describe("rendering", () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(
        <ComplaintForm
          disabled={false}
          complaintUrl="complaint url"
          postComplaint={jest.genMockFunction()}
          refreshComplaints={jest.genMockFunction()}
          />
      );
    });

    it("shows a select field with default value", () => {
      let select = wrapper.find(EditableSelect);
      expect(select.length).toBe(1);
      expect(select.prop("disabled")).toBe(false);
      let option = select.childAt(0);
      expect(option.text()).toBe("complaint type");
    });

    it("shows complaint type options", () => {
      let options = wrapper.find("option");
      let types = options.map(option => option.prop("value"));
      expect(types).toEqual([
        "",
        "cannot-issue-loan",
        "cannot-render",
        "wrong-title",
        "wrong-author",
        "wrong-audience",
        "cannot-fulfill-loan",
        "bad-description",
        "cannot-return",
        "bad-cover-image",
        "wrong-medium",
        "wrong-age-range",
        "wrong-genre"
      ]);
    });

    it("shows a submit button", () => {
      let button = wrapper.find("input[type='submit']");
      expect(button.length).toBe(1);
    });

    it("disables", () => {
      wrapper = shallow(
        <ComplaintForm
          disabled={true}
          complaintUrl="complaint url"
          postComplaint={jest.genMockFunction()}
          refreshComplaints={jest.genMockFunction()}
          />
      );
      let button = wrapper.find("input[type='submit']");
      expect(button.prop("disabled")).toBe(true);
      let select = wrapper.find(EditableSelect);
      expect(select.prop("disabled")).toBe(true);
    });
  });

  describe("behavior", () => {
    let wrapper;
    let postComplaint;

    beforeEach(() => {
      postComplaint = jest.genMockFunction();
      postComplaint.mockReturnValue(new Promise((resolve, reject) => {
        resolve();
      }));
      wrapper = mount(
        <ComplaintForm
          disabled={false}
          complaintUrl="complaint url"
          postComplaint={postComplaint}
          refreshComplaints={jest.genMockFunction()}
          />
      );
    });

    it("posts complaints", () => {
      let form = wrapper.find("form");
      let select = wrapper.find("select").get(0);
      select.value = "bad-description";
      form.simulate("submit");
      expect(postComplaint.mock.calls.length).toBe(1);
      expect(postComplaint.mock.calls[0][0]).toBe("complaint url");
      expect(postComplaint.mock.calls[0][1].type).toBe("http://librarysimplified.org/terms/problem/bad-description");
    });

    it("refreshes complaints after post", (done) => {
      wrapper = mount(
        <ComplaintForm
          disabled={false}
          complaintUrl="complaint url"
          postComplaint={postComplaint}
          refreshComplaints={done}
          />
      );
      let form = wrapper.find("form");
      let select = wrapper.find("select").get(0);
      select.value = "bad-description";
      form.simulate("submit");
    });

    it("resets form after post", (done) => {
      wrapper.instance().resetForm = done;
      let form = wrapper.find("form");
      let select = wrapper.find("select").get(0);
      select.value = "bad-description";
      form.simulate("submit");
    });

    it("displays error if no type is selected", () => {
      let form = wrapper.find("form");
      form.simulate("submit");
      let errors = wrapper.find(".complaintFormError");
      expect(errors.length).toBe(1);
      expect(errors.at(0).text()).toBe("You must select a complaint type!");
    });

    it("calls showPostError() if post fails", (done) => {
      postComplaint = jest.genMockFunction();
      postComplaint.mockReturnValue(new Promise((resolve, reject) => {
        reject();
      }));
      wrapper = mount(
        <ComplaintForm
          disabled={false}
          complaintUrl="complaint url"
          postComplaint={postComplaint}
          refreshComplaints={jest.genMockFunction()}
          />
      );
      wrapper.instance().showPostError = done;
      let form = wrapper.find("form");
      let select = wrapper.find("select").get(0);
      select.value = "bad-description";
      form.simulate("submit");
    });

    it("resets complaint type", () => {
      let select = wrapper.find("select").get(0);
      select.value = "bad-description";
      wrapper.instance().resetForm();
      select = wrapper.find("select").get(0);
      expect(select.value).toBe("");
    });

    it("shows post error", () => {
      wrapper.setState({ errors: ["test error"] });
      wrapper.update();
      let errors = wrapper.find(".complaintFormError");
      expect(errors.length).toBe(1);
      expect(errors.at(0).text()).toBe("test error");
    });
  });
});