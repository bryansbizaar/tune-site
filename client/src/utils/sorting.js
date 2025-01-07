// allows for alphabetical sorting, ignoring the common words at the beginning of titles
export const removeCommonWords = (title) => {
  return title
    .toLowerCase()
    .replace(/^(the|a|an|la|le|da|el|los|las|les|de|das|l')\s+/i, "");
};

export const startsWithNumber = (title) => {
  return /^\d/.test(title);
};

export const sortTunes = (tunes) => {
  return tunes.slice().sort((a, b) => {
    const titleA = removeCommonWords(a.title);
    const titleB = removeCommonWords(b.title);

    if (startsWithNumber(titleA) && !startsWithNumber(titleB)) {
      return -1;
    }
    if (!startsWithNumber(titleA) && startsWithNumber(titleB)) {
      return 1;
    }

    return titleA.localeCompare(titleB);
  });
};
