// It accepts a function as a parameter and returns a new function that wraps the original function in a try-catch block.
// It will deal with error as a promise and code will not crash
export const catchAsyncErrors = (func) => {
  return (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch(next);
  };
};
