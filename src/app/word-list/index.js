import { arrayUniqueByKey } from '../util/array-unique'
// TODO add tests

export function getNonRareWordList(
  knownWordsList,
  lexiconData,
  rareWordsFrequency
) {
  const uniqueNonRareWords = arrayUniqueByKey(
    lexiconData
      .filter((w) => w.freq > rareWordsFrequency)
      .map((w) => ({
        lex: w.lex,
        strong: w.strong,
        gloss: w.gloss
      })),
    'strong'
  )

  return uniqueNonRareWords.filter(
    // Note: this can most likely be optimised if needed
    (word) => !isInCurrentWordList(knownWordsList, word.lex)
  )
}

export function isInCurrentWordList(knownWordList, lexeme) {
  const normalizedLexeme = lexeme.normalize('NFC')

  return knownWordList.some((w) => {
    const normalizedW = w.normalize('NFC')
    return normalizedW.includes(normalizedLexeme)
  })
}

export function wordsToCsv(words) {
  return words.map((w) => `"${w.lex}";"${w.gloss}"`).join('\n')
}
