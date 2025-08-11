import { HTTPError } from 'ky';
import { toast } from 'sonner';

export function handleServerError(error: unknown) {
  console.log(error);

  let errMsg = 'Something went wrong!';

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'Content not found.';
  }

  if (error instanceof HTTPError) {
    try {
      // Try to extract error message from response
      errMsg = error.response.statusText || `HTTP ${error.response.status}`;
    } catch {
      errMsg = `HTTP ${error.response.status}`;
    }
  }

  toast.error(errMsg);
}
