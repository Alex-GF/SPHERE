import express from 'express';

const loadFileRoutes = function (app: express.Application) {
  const baseUrl = (process.env.BASE_URL_PATH ?? "") + '/api/v1';

  // Public route for authentication (does not require API Key)
  app
    .route(`${baseUrl}/healthcheck`)
    .get(
      (req: any, res: any) => {
        res.status(200).json({
          message: 'Service is up and running!',
        });
      }
    );
};

export default loadFileRoutes;
