import app from './app';
import { autoSeedDatabase } from './utils/autoSeed';

const PORT = process.env.PORT || 5000;

async function startServer() {
  await autoSeedDatabase();
  app.listen(PORT, () => {
    console.log(`CloudForge Academy API server running on port ${PORT}`);
  });
}

startServer();
