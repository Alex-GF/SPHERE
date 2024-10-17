import express from 'express';
import UserController from '../controllers/UserController.ts';

const loadFileRoutes = async function (app: express.Application): Promise<void> {
    const userController = new UserController();

    app.route('/users')
        .get(userController.getAll);
}

export default loadFileRoutes