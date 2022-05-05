export const shortenNumber = (number, numberAfterDecimal) => {
  return parseFloat(number.toFixed(numberAfterDecimal));
};
