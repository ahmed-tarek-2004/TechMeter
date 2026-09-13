/**
 * Extracts a user-friendly error message from various API error structures
 * (Custom Response<T>, ASP.NET ValidationProblemDetails, Identity errors, Axios errors, etc.)
 */
export function getApiErrorMessage(error: any, fallback: string = 'An unexpected error occurred'): string {
  if (!error) return fallback;

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  const responseData = error.response?.data;
  if (responseData) {
    // Plain string error response
    if (typeof responseData === 'string' && responseData.trim().length > 0) {
      return responseData;
    }

    // Custom Response<T> message: { message: "Email is already registered" }
    if (typeof responseData.message === 'string' && responseData.message.trim().length > 0) {
      return responseData.message;
    }

    // Custom Response<T> errors array: { errors: ["Error 1", "Error 2"] }
    if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
      return responseData.errors.filter(Boolean).join(', ');
    }

    // ASP.NET ValidationProblemDetails: { errors: { field: ["Error 1", "Error 2"] } }
    if (responseData.errors && typeof responseData.errors === 'object') {
      const messages: string[] = [];
      Object.values(responseData.errors).forEach((val) => {
        if (Array.isArray(val)) {
          messages.push(...val.filter(Boolean));
        } else if (typeof val === 'string' && val.trim().length > 0) {
          messages.push(val);
        }
      });
      if (messages.length > 0) {
        return messages.join(', ');
      }
    }

    // ProblemDetails detail or title
    if (typeof responseData.detail === 'string' && responseData.detail.trim().length > 0) {
      return responseData.detail;
    }
    if (
      typeof responseData.title === 'string' &&
      responseData.title.trim().length > 0 &&
      responseData.title !== 'One or more validation errors occurred.'
    ) {
      return responseData.title;
    }
  }

  // Check error.message, but ignore generic Axios HTTP status code messages
  if (typeof error.message === 'string' && error.message.trim().length > 0) {
    const isGenericAxiosCode = /^Request failed with status code \d+/i.test(error.message.trim());
    if (!isGenericAxiosCode) {
      return error.message;
    }
  }

  return fallback;
}
