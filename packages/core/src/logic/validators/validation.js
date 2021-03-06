import makePromise from "../../helpers/makePromise";
import { sanitizeValidationResult } from "./sanitization";

/**
 * Runs the validator on the given value.
 * This promise never fails. We promise!
 */
const runValidator = (validator, value, ...args) => {
  const promise = makePromise(() => validator ? validator(value, ...args) : { validated: "ok", message: null });
  return promise.then(sanitizeValidationResult).catch(res => sanitizeValidationResult(res, true));
};

export {
  runValidator
};