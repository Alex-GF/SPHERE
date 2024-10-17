import express from 'express';
import UserController from '../controllers/UserController.ts';

const loadFileRoutes = function (app: express.Application) {
    const userController = new UserController();

    app.route('/users')
        .get(userController.getAll);
}

export default loadFileRoutes