import express from 'express';
import { handler } from './server';

const app = express();
app.use(handler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});