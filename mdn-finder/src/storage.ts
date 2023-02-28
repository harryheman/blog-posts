import { Storage } from '@plasmohq/storage'

export const OPTIONS_KEY = 'mdn_finder_options'

export const defaultOptions = {
  backgroundColor: '#282c34',
  textColor: '#f7f7f7',
  selectionBackground: '#5cb85c',
  selectionColor: '#282c34',
  showUrl: true
}

const storage = new Storage()

export default storage
