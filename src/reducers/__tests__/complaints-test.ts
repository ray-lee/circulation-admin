jest.dontMock("../complaints");

import complaints from "../complaints";

describe("complaints reducer", () => {
  let initState = {
    url: null,
    data: null,
    isFetching: false,
    fetchError: null
  };

  let errorState = {
    url: "test url",
    data: null,
    isFetching: false,
    fetchError: { status: 401, response: "test error", url: "test url" }
  };

  it("returns initial state for unrecognized action", () => {
    expect(complaints(undefined, {})).toEqual(initState);
  });

  it("handles FETCH_COMPLAINTS_REQUEST", () => {
    let action = { type: "FETCH_COMPLAINTS_REQUEST", url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      url: "test url",
      isFetching: true
    });
    expect(complaints(initState, action)).toEqual(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetching: true,
      fetchError: null
    });
    expect(complaints(errorState, action)).toEqual(newState);
  });

  it("handles FETCH_COMPLAINTS_FAILURE", () => {
    let action = { type: "FETCH_COMPLAINTS_FAILURE", error: "test error" };
    let oldState = {
      url: "test url",
      data: null,
      isFetching: true,
      fetchError: null
    };
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false
    });
    expect(complaints(oldState, action)).toEqual(newState)
  });

  it("handles LOAD_COMPLAINTS", () => {
    let action = { type: "LOAD_COMPLAINTS", data: "test data" };
    let oldState = {
      url: "test url",
      data: null,
      isFetching: true,
      fetchError: null
    };
    let newState = Object.assign({}, oldState, {
      data: "test data",
      isFetching: false
    });
    expect(complaints(oldState, action)).toEqual(newState);
  });
});