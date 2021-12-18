let chunks = []
let mediaRecorder = null
let audioBlob = null

document.querySelector('footer').textContent += new Date().getFullYear()

const createEl = ({ tag = 'div', children, ...attrs }) => {
  const el = document.createElement(tag)

  if (Object.keys(attrs).length > 0) {
    Object.entries(attrs).forEach(([attr, val]) => {
      el[attr] = val
    })
  }

  if (children) {
    children.forEach((_el) => {
      el.append(createEl(_el))
    })
  }

  return el
}

const toggleClass = (el, oldC, newC) => {
  el.classList.remove(oldC)
  el.classList.add(newC)
}

async function startRecord() {
  if (!navigator.mediaDevices && !navigator.mediaDevices.getUserMedia) {
    return console.warn('Not supported')
  }

  record_img.src = `img/${
    mediaRecorder && mediaRecorder.state === 'recording' ? 'microphone' : 'stop'
  }.png`

  if (!mediaRecorder) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      })
      mediaRecorder = new MediaRecorder(stream)
      mediaRecorder.start()
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }
      mediaRecorder.onstop = mediaRecorderStop
    } catch (e) {
      console.error(e)
      record_img.src = ' img/microphone.png'
    }
  } else {
    mediaRecorder.stop()
  }
}

function mediaRecorderStop() {
  if (audio_box.children[0]?.localName === 'audio') {
    audio_box.children[0].remove()
  }

  audioBlob = new Blob(chunks, { type: 'audio/mp3' })
  const src = URL.createObjectURL(audioBlob)

  const audioEl = createEl({ tag: 'audio', src, controls: true })

  audio_box.append(audioEl)
  toggleClass(record_box, 'hide', 'show')

  mediaRecorder = null
  chunks = []
}

async function saveRecord() {
  const formData = new FormData()
  let audioName = prompt('Name?')
  audioName = audioName ? Date.now() + '-' + audioName : Date.now()
  formData.append('audio', audioBlob, audioName)

  try {
    await fetch('/save', {
      method: 'POST',
      body: formData
    })
    console.log('Saved')
    resetRecord()
    fetchRecords()
  } catch (e) {
    console.error(e)
  }
}

function resetRecord() {
  toggleClass(record_box, 'show', 'hide')
  audioBlob = null
}

function removeRecord() {
  if (confirm('Sure?')) {
    resetRecord()
  }
}

const createRecordEl = (src) => {
  const [date, audioName] = src.replace('.mp3', '').split('-')
  const audioDate = new Date(+date).toLocaleString()

  return createEl({
    className: 'audio_item',
    children: [
      {
        tag: 'audio',
        src,
        onended: ({ currentTarget }) => {
          currentTarget.parentElement.querySelector('img').src = 'img/play.png'
        }
      },
      {
        tag: 'button',
        className: 'btn',
        onclick: playRecord,
        children: [
          {
            tag: 'img',
            src: 'img/play.png'
          }
        ]
      },
      {
        tag: 'p',
        textContent: `${audioDate}${audioName ? ` - ${audioName}` : ''}`
      }
    ]
  })
}

async function fetchRecords() {
  try {
    const files = await (await fetch('/records')).json()
    records_box.innerHTML = ''
    if (files.length > 0) {
      files.forEach((file) => {
        records_box.append(createRecordEl(file))
      })
    } else {
      records_box.append(
        createEl({
          tag: 'p',
          textContent: 'No records. Create one'
        })
      )
    }
  } catch (e) {
    console.error(e)
  }
}

function playRecord({ currentTarget: playBtn }) {
  const audioEl = playBtn.previousElementSibling

  if (audioEl.paused) {
    audioEl.play()
    playBtn.firstElementChild.src = 'img/pause.png'
  } else {
    audioEl.pause()
    playBtn.firstElementChild.src = 'img/play.png'
  }
}

record_btn.onclick = startRecord
save_btn.onclick = saveRecord
remove_btn.onclick = removeRecord

fetchRecords()
