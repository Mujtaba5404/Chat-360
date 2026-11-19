const pluralize = (count, word, plural = `${word}s`) =>
  `${count} ${count === 1 ? word : plural}`;

export default pluralize;
