/*
    Implementation of the API controller.
    This controller responds to requests to the /api uri prefix.
*/

import callApi from "../services/wmapi";

export default async function get(req, res) {
  let response = {};
  let status;

  if (req.query) {
    try {
      // Build parameter list

      // Get response from repository
      status = 200;
      response = await callApi(req.params.service, req);
    } catch (err) {
      if (err.message.startsWith("Unknown API")) {
        // An error has occured. Report that.
        status = 404;
        response = {
          error: "Not found",
          reason: err.message
        };
      } else {
        // An error has occured. Report that.
        status = 500;
        response = {
          error: "Internal Server Error",
          reason: err.message
        };
      }
    }
  } else {
    status = 400;
    response = {
      error: "Invalid Request",
      reason: "Missing required parameter"
    };
  }
  res.status(status);
  res.json(response);
}
