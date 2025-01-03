import { NextFunction } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';

const handleValidation = async (req: any, res: any, next: NextFunction) => {
  const err = validationResult(req) as Result<ValidationError>
  if (err.array.length > 0) {
    res.status(422).send(err)
  } else {
    next()
  }
}

export { handleValidation }
