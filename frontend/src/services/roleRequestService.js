import api from "./api";

const roleRequestService = {
  sendRequest: () =>
    api.post("/role-requests/request-teacher"),

  getMyRequest: () =>
    api.get("/role-requests/my-request"),
};

export default roleRequestService;