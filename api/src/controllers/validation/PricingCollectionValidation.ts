import { check } from 'express-validator';

const update = [
  check('name')
    .optional()
    .isString()
    .withMessage('The name field must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('The name must have between 1 and 255 characters long')
    .trim(),
  check('description')
    .optional()
    .isString()
    .withMessage('The name field must be a string')
    .trim(),
  check('ownerId')
    .optional()
    .isString()
    .withMessage('The owner field must be a string')
    .isLength({ min: 24, max: 48 })
    .withMessage('The owner must be exactly 24 or 48 characters long')
    .trim(),
  check('private')
    .optional()
    .isBoolean()
    .withMessage('The private field must be boolean'),
  check('analytics')
    .optional()
    .isObject()
    .withMessage('analytics must be an object'),
  check('analytics.evolutionOfPlans')
    .optional()
    .isObject()
    .withMessage('evolutionOfPlans must be an object'),
  check('analytics.evolutionOfAddOns')
    .optional()
    .isObject()
    .withMessage('evolutionOfAddOns must be an object'),
  check('analytics.evolutionOfFeatures')
    .optional()
    .isObject()
    .withMessage('evolutionOfFeatures must be an object'),
  check('analytics.evolutionOfConfigurationSpaceSize')
    .optional()
    .isObject()
    .withMessage('evolutionOfConfigurationSpaceSize must be an object'),
];

export { update };