/**
 * @param {string} text
 */
const parseDate = (text) => {
  const parse = (/(..?)\/(..?)\/(....)/gi).exec(text);
  return (parse && parse.length >= 4) ? Date.parse(`${parse[3]}-${parse[2]}-${parse[1]}`) : NaN;
};

exports.parseDate = parseDate;
