import express from 'express';
import UserController from '../controllers/UserController';
import container from '../config/container';
import { addFilenameToBody, handleFileUpload } from '../middlewares/FileHandlerMiddleware';
import { isLoggedIn } from '../middlewares/AuthMiddleware';
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware';
import * as UserValidation from '../controllers/validation/UserValidation';
import { checkEntityExists } from '../middlewares/EntityMiddleware';

const loadFileRoutes = function (app: express.Application) {
  const userController = new UserController();
  const userService = container.resolve('userService');
  const upload = handleFileUpload(['avatar'], process.env.AVATARS_FOLDER!);
  const baseUrl = process.env.BASE_URL_PATH;

  app
    .route(baseUrl + '/users/register')
    .post(
      upload,
      addFilenameToBody('avatar'),
      UserValidation.create,
      handleValidation,
      userController.register
    );

  app.route(baseUrl + '/users/login').post(
    UserValidation.login, 
    handleValidation, 
    userController.login);
  
  app.route(baseUrl + '/users/updateToken').put(isLoggedIn, userController.updateToken);
  
  app
    .route(baseUrl + '/users/:username')
    .get(checkEntityExists(userService, 'username'), isLoggedIn, userController.show)
    .put(
      isLoggedIn,
      checkEntityExists(userService, 'username'),
      upload,
      addFilenameToBody('avatar'),
      UserValidation.update,
      handleValidation,
      userController.update
    )
    .delete(isLoggedIn, checkEntityExists(userService, 'username'), userController.destroy);
};

export default loadFileRoutes;
