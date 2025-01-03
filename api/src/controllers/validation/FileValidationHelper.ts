const defaultMaxFileSize = 2000000

const checkFileExists = (req: any, fieldName: string) => {
  if (req.files && req.files[fieldName]) {
    return req.files[fieldName][0]
  } else if (req.file && req.file.fieldname === fieldName) {
    return req.file
  } else {
    return false
  }
}
const checkFileIsImage = (req: any, fieldName: string) => {
  const file = checkFileExists(req, fieldName)
  if (file) {
    return ['image/jpeg', 'image/png'].includes(file.mimetype)
  }
  return true
}
const checkFileMaxSize = (req: any, fieldName: string, maxFileSize = defaultMaxFileSize) => {
  const file = checkFileExists(req, fieldName)
  if (file) {
    return file.size < maxFileSize
  }
  return true
}

export { checkFileExists, checkFileIsImage, checkFileMaxSize }
