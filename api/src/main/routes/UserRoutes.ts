import express from 'express';
import UserController from '../controllers/UserController';
import container from '../config/container';
import { addFilenameToBody, handleFileUpload } from '../middlewares/FileHandlerMiddleware';
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware';
import * as UserValidation from '../controllers/validation/UserValidation';
import { checkEntityExists } from '../middlewares/EntityMiddleware';

const loadFileRoutes = function (app: express.Application) {
  const userController = new UserController();
  const userService = container.resolve('userService');
  const upload = handleFileUpload(['avatar'], process.env.AVATARS_FOLDER!);
  const baseUrl = (process.env.BASE_URL_PATH ?? "") + '/api/v1';

  app
    .route(baseUrl + '/users/register')
    .post(
      upload,
      addFilenameToBody('avatar'),
      UserValidation.create,
      handleValidation,
      userController.register
    );

  app
    .route(baseUrl + '/users/login')
    .post(UserValidation.login, handleValidation, userController.login);

  app
    .route(baseUrl + '/users/:username')
    .get(checkEntityExists(userService, 'username'), userController.show)
    .put(
      checkEntityExists(userService, 'username'),
      upload,
      addFilenameToBody('avatar'),
      UserValidation.update,
      handleValidation,
      userController.update
    )
    .delete(checkEntityExists(userService, 'username'), userController.destroy);

  app.route(baseUrl + '/users/:username/updateToken').put(userController.updateToken);
};

export default loadFileRoutes;
