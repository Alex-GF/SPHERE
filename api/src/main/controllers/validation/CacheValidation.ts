import { check } from 'express-validator';

const set = [
  check('key')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('The key field is required')
    .isString()
    .withMessage('The key field must be a string')
    .trim(),
  check('value')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('The value field is required')
];

export { set };
