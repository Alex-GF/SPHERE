import fs from 'fs';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import {v4 as uuidv4} from 'uuid';

const addFilenameToBody = (...fieldNames: string[]) => (req: any, res: any, next: NextFunction) => {
  fieldNames.forEach(fieldName => {
    if (req.files && req.files[fieldName]) {
      req.body[fieldName] = req.files[fieldName][0].destination + '/' + req.files[fieldName][0].filename
    } else if (req.file && req.file.fieldname === fieldName) {
      req.body[fieldName] = req.file.destination + '/' + req.file.filename
    }
  })
  return next()
}

const handleFileUpload = (imageFieldNames: string[], folder: string) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      fs.mkdirSync(folder, { recursive: true })
      cb(null, folder)
    },
    filename: function (req, file, cb) {
      cb(null, Math.random().toString(36).substring(7) + '-' + Date.now() + '.' + file.originalname.split('.').pop())
    }
  })

  if (imageFieldNames.length === 1) {
    return multer({ storage }).single(imageFieldNames[0])
  } else {
    const fields = imageFieldNames.map(imageFieldName => { return { name: imageFieldName, maxCount: 1 } })
    return multer({ storage }).fields(fields)
  }
}

const handlePricingUpload = (pricingFieldNames: string[], folder: string) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      fs.mkdirSync(folder + `/${req.body.saasName}`, { recursive: true })
      cb(null, folder)
    },
    filename: function (req, file, cb) {
      if (file) {
        cb(null, req.body.saasName + "/" + req.body.version + '.' + file.originalname.split('.').pop())
      } else {
        cb(new Error('File does not exist'), "fail.yml")
      }
    }
  })

  if (pricingFieldNames.length === 1) {
    return multer({ storage }).single(pricingFieldNames[0])
  } else {
    const fields = pricingFieldNames.map(pricingFieldNames => { return { name: pricingFieldNames, maxCount: 1 } })
    return multer({ storage }).fields(fields)
  }
}

const handleCollectionUpload = (collectionFieldNames: string[], folder: string) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      fs.mkdirSync(folder + `/`, { recursive: true })
      cb(null, folder)
    },
    filename: function (req, file, cb) {
      cb(null, uuidv4() + '.' + file.originalname.split('.').pop())
    },
  })

  if (collectionFieldNames.length === 1) {
    return multer({ storage: storage, limits: {fileSize: 2 * 1024 * 1024} }).single(collectionFieldNames[0])
  } else {
    const fields = collectionFieldNames.map(collectionFieldNames => { return { name: collectionFieldNames, maxCount: 1 } })
    return multer({ storage }).fields(fields)
  }
}
export { handleFileUpload, addFilenameToBody, handlePricingUpload, handleCollectionUpload }
