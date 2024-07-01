import { HttpStatusCode } from 'axios';
import dotenv from 'dotenv';

dotenv.config({});

/**
 * This function formats the response from the API.
 *
 * @param {object} res - The response from the query
 * @param {number} code - The HTTP status code
 * @param {object} options - The options object containing error and request
 * @param {object} options.err - The error object
 * @param {object} options.req - The request object
 *
 * @returns {object} - The formatted response
 */
export const results = (res, code, { err = null, req = null } = {}) => {
  let error = null;
  let metadata = {};

  if (err !== null && code !== HttpStatusCode.Ok) {
    let message = null;

    // Handling Axios error
    if (err.isAxiosError) {
      message = err.message;
    }

    if (err.response) {
      if (code === HttpStatusCode.ExpectationFailed) {
        message = `${err.response.data.exc_type} - ${err.response.data.exception}`;
      }
    }

    if (err.name) {
      // console.log(err)

      if (err.message) {
        message = err.message;
      }

      if (err.name === 'SequelizeDatabaseError') {
        const debugMode = ['local', 'development', 'staging'];
        message = (debugMode.includes(process.env.NODE_ENV)) ? err.parent : "INTERNAL ERROR";
      }

      if (err.name === 'schema-validator') {
        message = err.array()[0].msg;
      }

      if (err.name === 'SequelizeUniqueConstraintError') {
        message = err.errors[0].message;
      }
    }

    error = {
      code: code,
      message: message,
    };
  } else {
    if (res !== null) {
      if (typeof res.rows !== 'undefined' && typeof res.count !== 'undefined') {

        const meta = {
          per_page: parseInt(req.query.per_page) || 10,
          page: parseInt(req.query.page) || 1,
        };

        metadata = {
          per_page: meta.per_page,
          current_page: meta.page,
          total_row: res.count,
          total_page: Math.ceil(res.count / meta.per_page),
        };

        res = res.rows;
      }
    }
  }

  return {
    success: code === HttpStatusCode.Ok,
    message: code === HttpStatusCode.Ok ? "Sukses" : "Error",
    errors: error,
    metadata: metadata,
    data: res,
  };
};

/**
 * This function paginates an array.
 *
 * @param {Array} array - The array to paginate
 * @param {number} page_size - The number of items per page
 * @param {number} page_number - The current page number
 *
 * @returns {Array} - The paginated array
 */
export const paginateArray = (array, page_size, page_number) => (
  array.slice((page_number - 1) * page_size, page_number * page_size)
);