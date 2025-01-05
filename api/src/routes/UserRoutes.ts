import express from 'express';
import UserController from '../controllers/UserController';
import container from '../config/container';
import { addFilenameToBody, handleFileUpload } from '../middlewares/FileHandlerMiddleware';
import { hasRole, isLoggedIn } from '../middlewares/AuthMiddleware';
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware';
import * as UserValidation from '../controllers/validation/UserValidation';
import { checkEntityExists } from '../middlewares/EntityMiddleware';

const loadFileRoutes = function (app: express.Application) {
  const userController = new UserController();
  const userService = container.resolve('userService');
  const upload = handleFileUpload(['avatar'], process.env.AVATARS_FOLDER!);
  const baseUrl = process.env.BASE_URL_PATH;

  app
    .route(baseUrl + '/users')
    .put(
      isLoggedIn,
      upload,
      addFilenameToBody('avatar'),
      UserValidation.update,
      handleValidation,
      userController.update
    )
    .delete(isLoggedIn, userController.destroy);
  app
    .route(baseUrl + '/users/register')
    .post(
      upload,
      addFilenameToBody('avatar'),
      UserValidation.create,
      handleValidation,
      userController.registerUser
    );
  app
    .route(baseUrl + '/users/registerAdmin')
    .post(
      isLoggedIn,
      hasRole('admin'),
      upload,
      addFilenameToBody('avatar'),
      UserValidation.create,
      handleValidation,
      userController.registerAdmin
    );
  app.route(baseUrl + '/users/login').post(
    UserValidation.login, 
    handleValidation, 
    userController.loginUser);
  app
    .route(baseUrl + '/users/loginAdmin')
    .post(UserValidation.login, handleValidation, userController.loginAdmin);
  app.route(baseUrl + '/users/isTokenValid').put(userController.loginByToken);
  app
    .route('/users/:userId')
    .get(checkEntityExists(userService, 'userId'), isLoggedIn, userController.show);
};

export default loadFileRoutes;
