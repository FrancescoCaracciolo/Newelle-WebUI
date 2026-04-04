import getClient from './client'

export function recognizeSpeech(audioBlob) {
  const formData = new FormData()
  formData.append('file', audioBlob, 'recording.wav')
  return getClient().post('/api/stt/recognize', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(r => r.data)
}
