import React from 'react'
import { Button, Form } from 'react-bootstrap'
import { getNonRareWordList, wordsToCsv } from '../word-list'

const DEFAULT_RARE_WORDS_FREQUENCY = 10

export default function WordListGenerator({ frequency, lexiconData }) {
  const [interactionState, setInteractionState] = React.useState({
    state: 'initial'
  })

  const handleFileChange = (event) => {
    const file = event.target.files[0]

    const reader = new FileReader()

    reader.onload = (e) => {
      const knownWordsListRaw = e.target.result
      // FIXME: very naive csv parsing logic, need to use a library
      const separator = knownWordsListRaw.includes(';') ? ';' : ','
      const knownWordsList = knownWordsListRaw
        .split('\n')
        .flatMap((row) => row.split(separator)[0])

      setInteractionState({
        state: 'readyForDownload',
        knownWordsList,
        rareWordFrequency: DEFAULT_RARE_WORDS_FREQUENCY,
        wordsToLearnList: getNonRareWordList(
          knownWordsList,
          lexiconData,
          DEFAULT_RARE_WORDS_FREQUENCY
        )
      })
    }

    reader.onerror = (e) => {
      console.error('Error reading file:', e)
      setInteractionState({
        state: 'uploadFailed'
      })
    }

    // Read as text - change this based on your needs
    reader.readAsText(file)
  }

  const handleChangeFrequency = (e) => {
    setInteractionState({
      ...interactionState,
      rareWordFrequency: e.target.value,
      wordsToLearnList: getNonRareWordList(
        interactionState.knownWordsList,
        lexiconData,
        e.target.value
      )
    })
  }

  // TODO add feature documentation
  // TODO filter words in knownWordList

  return (
    <div className='d-flex justify-content-end'>
      {interactionState.state === 'initial' && (
        <Button
          variant='outline-dark'
          size='sm'
          onClick={() =>
            setInteractionState({
              state: 'proposingListUpload'
            })
          }
        >
          <i className='bi bi-list' /> Générer une liste de mots
        </Button>
      )}
      {interactionState.state === 'proposingListUpload' && (
        <>
          <div>
            <p>
              Téléverser sa liste de mots déjà appris (format csv, une seule
              colonne) :{' '}
            </p>
            <input id='fileInput' type='file' onChange={handleFileChange} />
            <Button
              variant='outline-dark'
              size='sm'
              onClick={() =>
                setInteractionState({
                  state: 'readyForDownload',
                  knownWordsList: [],
                  rareWordFrequency: DEFAULT_RARE_WORDS_FREQUENCY,
                  wordsToLearnList: getNonRareWordList(
                    [],
                    lexiconData,
                    DEFAULT_RARE_WORDS_FREQUENCY
                  )
                })
              }
            >
              Je n'ai pas de liste de mots déjà appris
            </Button>
          </div>
        </>
      )}
      {interactionState.state === 'uploadFailed' && (
        <>
          <span className='text-red'>Le fichier n'a pas pu être lu</span>
          <input id='fileInput' type='file' onChange={handleFileChange} />
        </>
      )}
      {interactionState.state === 'readyForDownload' && (
        <div className='flex column'>
          <div>
            <Form.Label>Palier des mots rares</Form.Label>
            <Form.Select
              aria-label='Frequency selection'
              value={interactionState.rareWordFrequency}
              onChange={handleChangeFrequency}
            >
              {[
                { text: 'Intermédiaire (<50×)', value: 50 },
                { text: 'Connaisseur (<30×)', value: 30 },
                { text: 'Expert (<10×)', value: 10 }
              ]
                .filter(({ value }) => value < frequency)
                .map((option, id) => (
                  <option value={option.value} key={id}>
                    {option.text}
                  </option>
                ))}
            </Form.Select>
          </div>

          <p>{interactionState.wordsToLearnList.length} mots à apprendre</p>
          <a
            href={URL.createObjectURL(
              new Blob([wordsToCsv(interactionState.wordsToLearnList)], {
                type: 'text/csv'
              })
            )}
            download={
              lexiconData[0].book +
              ' (<' +
              frequency +
              ') - Liste de mots à apprendre.csv'
            }
            className='text-decoration-none'
          >
            <Button variant='outline-dark' size='sm'>
              <i className='bi bi-list' /> Télécharger la liste des mots à
              apprendre
            </Button>
          </a>
        </div>
      )}
    </div>
  )
}
