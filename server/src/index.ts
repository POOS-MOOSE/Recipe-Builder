import dotenv from 'dotenv';
dotenv.config();

import app from './utils/app';         // Express application setup
import mongo from './utils/mongo';       // MongoDB connection helper
import { PORT } from './constants';       // Port constant
import authRoutes from './routes/auth';   // Existing authentication routes
import bluecart_routes from './routes/bluecart_routes'; // New BlueCart routes

const bootstrap = async () => {

  await mongo.connect();

  // Basic endpoints
  app.get('/', (req, res) => {
    res.status(200).send('Hello, world!');
  });

  app.get('/healthz', (req, res) => {
    res.status(204).end();
  });

  // Auth routes
  app.use('/auth', authRoutes);

  // BlueCart routes
  app.use('/bluecart', bluecart_routes);

  // Start the Express server
  app.listen(PORT, () => {
    console.log(`✅ Server is listening on port: ${PORT}`);
  });
};

bootstrap();
