import express from 'express';
import { authRouter } from './auth';
import { apiV1Router } from './v1';


const apiRouter = express.Router();

apiRouter.use('/api/auth/', authRouter);
apiRouter.use('/api/v1/', apiV1Router);

export { apiRouter };
