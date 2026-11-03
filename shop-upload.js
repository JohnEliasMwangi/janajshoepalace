document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('[data-upload-form]')
  const status = document.querySelector('[data-upload-status]')
  const grid = document.querySelector('[data-photo-grid]')
  const refresh = document.querySelector('[data-refresh]')
  const keyInput = form.querySelector('[name="apiKey"]')
  const fileInput = form.querySelector('[name="photo"]')
  let accessKey = ''

  const setStatus = (message, tone = '') => {
    status.textContent = message
    status.dataset.tone = tone
  }

  const renderPhotos = (photos) => {
    grid.innerHTML = photos.length ? photos.map((photo) => `<a class="photo-tile" href="${photo.url}" target="_blank" rel="noreferrer"><img src="${photo.url}" alt="Recently uploaded shop photo"><span>${new Date(photo.uploadedAt).toLocaleDateString()}</span></a>`).join('') : '<p class="empty-library">No shop photos uploaded yet.</p>'
  }

  const loadPhotos = async () => {
    if (!accessKey) return
    grid.innerHTML = '<p class="empty-library">Loading your library…</p>'
    try {
      const response = await fetch('/api/shop-photos', { headers: { Authorization: `Bearer ${accessKey}` } })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to load photos.')
      renderPhotos(result.photos)
    } catch (error) {
      grid.innerHTML = `<p class="empty-library">${error instanceof Error ? error.message : 'Unable to load photos.'}</p>`
    }
  }

  keyInput.addEventListener('change', () => { accessKey = keyInput.value.trim(); loadPhotos() })
  refresh.addEventListener('click', loadPhotos)
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    accessKey = keyInput.value.trim()
    if (!accessKey || !fileInput.files[0]) return setStatus('Add your access key and choose a photo.', 'error')
    const formData = new FormData()
    formData.append('photo', fileInput.files[0])
    setStatus('Uploading…')
    try {
      const response = await fetch('/api/shop-photos', { method: 'POST', headers: { Authorization: `Bearer ${accessKey}` }, body: formData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Upload failed.')
      setStatus('Uploaded. The photo is ready to use in the storefront.', 'success')
      form.reset()
      keyInput.value = accessKey
      await loadPhotos()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload failed.', 'error')
    }
  })
})
