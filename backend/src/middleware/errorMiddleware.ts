import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFound: RequestHandler = (request, response) => {
  response.status(404).json({ error: `Route ${request.method} ${request.path} was not found.` });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const status = typeof error?.status === "number" ? error.status : 500;
  const message = error instanceof Error ? error.message : "Unexpected server error.";

  if (status >= 500) {
    console.error(error);
  }

  response.status(status).json({ error: message });
};
