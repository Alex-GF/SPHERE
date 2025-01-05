import { check } from 'express-validator';
import { checkFileIsImage, checkFileMaxSize } from './FileValidationHelper';

const maxFileSize = 2000000; // around 2Mb

const create = [
  check('firstName')
    .exists()
    .withMessage('A first name must be provided in order to create the user')
    .isString()
    .withMessage('The firstName field must be a string')
    .isLength({ min: 3, max: 255 })
    .withMessage('The first name must have between 3 and 255 characters long')
    .trim(),
  check('lastName')
    .exists()
    .withMessage('A last name must be provided in order to create the user')
    .isString()
    .withMessage('The lastName field must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('The last name must have between 3 and 255 characters long')
    .trim(),
  check('email')
    .exists()
    .withMessage('An email must be provided in order to create the user')
    .isString()
    .withMessage('The email field must be a string')
    .isEmail()
    .withMessage('Invalid email format. Please, provide a valid email'),
  check('password')
    .exists()
    .withMessage('A password must be specified in order to create the user')
    .isString()
    .withMessage('The field password must be a string')
    .isStrongPassword({
      minLength: 3,
      minLowercase: 0,
      minUppercase: 0,
      minNumbers: 0,
      minSymbols: 0,
    })
    .withMessage("The password must have at least 3 characters"),
  check('password')
    .custom(value => !/\s/.test(value))
    .withMessage('No spaces are allowed in the password'),
  check('phone')
    .exists()
    .withMessage('A phone must be specified in order to create the user')
    .isString()
    .withMessage('The field phone must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('The phone must have between 1 and 255 characters long')
    .trim(),
  check('address')
    .exists()
    .withMessage('A address must be specified in order to create the user')
    .isString()
    .withMessage('The field address must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('The address must have between 1 and 255 characters long')
    .trim(),
  check('postalCode')
    .exists()
    .withMessage('A postalCode must be specified in order to create the user')
    .isString()
    .withMessage('The field postalCode must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('The postalCode must have between 1 and 255 characters long')
    .trim()
];
const update = [
  check('firstName')
    .optional()
    .isString()
    .withMessage('The firstName field must be a string')
    .isLength({ min: 3, max: 255 })
    .withMessage('The first name must have between 3 and 255 characters long')
    .trim(),
  check('lastName')
    .optional()
    .isString()
    .withMessage('The lastName field must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('The last name must have between 3 and 255 characters long')
    .trim(),
  check('email')
    .optional()
    .isString()
    .withMessage('The email field must be a string')
    .isEmail()
    .withMessage('Invalid email format. Please, provide a valid email'),
  check('phone')
    .optional()
    .isString()
    .withMessage('The field phone must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('The phone must have between 1 and 255 characters long')
    .trim(),
  check('address')
    .optional()
    .isString()
    .withMessage('The field address must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('The address must have between 1 and 255 characters long')
    .trim(),
  check('postalCode')
    .optional()
    .isString()
    .withMessage('The field postalCode must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('The postalCode must have between 1 and 255 characters long')
    .trim(),
  check('avatar')
    .optional()
    .custom((value, { req }) => {
      return checkFileIsImage(req, 'avatar');
    })
    .withMessage('Please upload an image with format (jpeg, png).'),
  check('avatar')
    .custom((value, { req }) => {
      return checkFileMaxSize(req, 'avatar', maxFileSize);
    })
    .withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
];
const login = [
  check('email').exists().isString().isEmail().normalizeEmail().withMessage('Invalid email'),
  check('password').exists().isString(),
];

export { create, update, login };
