// text to speech
// https://wicg.github.io/speech-api/#tts-section
let voiceFromGoogle
let speakingStarted

export function startSpeechSynthesis() {
  if (voiceFromGoogle) return speak()

  speechSynthesis.getVoices()

  speechSynthesis.onvoiceschanged = () => {
    const voices = speechSynthesis.getVoices()
    console.log('@voices', voices)

    voiceFromGoogle = voices.find((voice) => voice.name === 'Google русский')

    speak()
  }
}

function speak() {
  const trimmedText = textarea.value.trim()
  if (!trimmedText) return

  const utterance = new SpeechSynthesisUtterance(trimmedText)
  utterance.lang = 'ru-RU'
  utterance.voice = voiceFromGoogle
  console.log('@utterance', utterance)

  speechSynthesis.speak(utterance)
  speakingStarted = true

  utterance.onend = () => {
    speakingStarted = false
  }
}

export const pauseOrResumeSpeaking = (function () {
  let paused = false

  return function () {
    if (!speakingStarted) return

    paused ? speechSynthesis.resume() : speechSynthesis.pause()
    paused = !paused

    return paused
  }
})()

export function stopSpeaking() {
  speechSynthesis.cancel()
}

// speech to text
// https://wicg.github.io/speech-api/#speechreco-section
const speechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition

let recognition
let recognitionStarted
let finalTranscript

const DICTIONARY = {
  точка: '.',
  запятая: ',',
  вопрос: '?',
  восклицание: '!',
  двоеточие: ':',
  тире: '-',
  абзац: '\n',
  отступ: '\t'
}

const editInterim = (s) =>
  s
    .split(' ')
    .map((word) => {
      word = word.trim()
      return DICTIONARY[word.toLowerCase()]
        ? DICTIONARY[word.toLowerCase()]
        : word
    })
    .join(' ')

const editFinal = (s) => s.replace(/\s{1,}([\.+,?!:-])/g, '$1')

function resetRecognition() {
  recognition = null
  recognitionStarted = false
  finalTranscript = ''
  interimTranscriptBox.value = ''
  finalTranscriptBox.value = ''
}

export function startSpeechRecognition() {
  resetRecognition()

  recognition = new speechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.maxAlternatives = 3
  recognition.lang = 'ru-RU'
  console.log('@recognition', recognition)

  recognition.start()
  recognitionStarted = true

  recognition.onend = () => {
    if (!recognitionStarted) return
    recognition.start()
  }

  recognition.onresult = (e) => {
    let interimTranscript = ''

    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) {
        const interimResult = editInterim(e.results[i][0].transcript)

        finalTranscript += interimResult
      } else {
        interimTranscript += e.results[i][0].transcript
      }
    }
    interimTranscriptBox.value = interimTranscript

    finalTranscript = editFinal(finalTranscript)

    finalTranscriptBox.value = finalTranscript
  }
}

export function stopRecognition() {
  if (!recognition) return
  recognition.stop()
  recognitionStarted = false
}

export function abortRecognition() {
  if (!recognition) return
  recognition.abort()
  resetRecognition()
}
