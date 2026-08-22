import type { ErrorRequestHandler, RequestHandler } from "express";

interface DatabaseError extends Error {
  code?: string;
  constraint?: string;
  status?: number;
}

export const notFound: RequestHandler = (request, response) => {
  response.status(404).json({ error: `Route ${request.method} ${request.path} was not found.` });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const databaseError = error as DatabaseError;
  const status = typeof databaseError?.status === "number"
    ? databaseError.status
    : databaseError.code === "23505"
      ? 409
      : databaseError.code === "23503" || databaseError.code === "23514" || databaseError.code === "22P02"
        ? 400
        : 500;
  const message = databaseError.code === "23505"
    ? "That record already exists."
    : databaseError.code === "23503"
      ? "A related record could not be found."
      : databaseError.code === "23514"
        ? "The submitted data does not meet a database constraint."
        : status < 500 && error instanceof Error
          ? error.message
          : "Unexpected server error.";

  if (status >= 500) {
    console.error(databaseError);
  }

  response.status(status).json({ error: message });
};
