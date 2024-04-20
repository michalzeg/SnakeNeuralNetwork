import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Buffer } from './buffer';
import * as _ from 'lodash';
import { fetchWithRetry } from './utils';

const app = express();
const port = 3001;

const trainersCount = Number.parseInt(process.env.TRAINERS_COUNT || "1");
const trainerName = process.env.TRAINER_NAME || 'localhost'
const trainerPort = Number.parseInt(process.env.TRAINER_PORT || "3000");

const idTrainerMap = new Map<string, string>();

const getRandomTrainer = () => {
  if (trainersCount === 1) {
    return `http://${trainerName}:${trainerPort}`;
  }
  const randomValue = Math.floor(Math.random() * trainersCount) + 1;
  return `http://${trainerName}_${randomValue}:${trainerPort}`
}

// Middleware to parse JSON requests
app.use(bodyParser.json());

// GET endpoint

app.get('/config', (req: Request, res: Response) => {
  const result = [...idTrainerMap.entries()].map(e => ({ id: e[0], service: e[1] }));
  res.send(result);
});

app.get('/start', async (req: Request, res: Response) => {
  const trainerUrl = getRandomTrainer();

  const response = await fetchWithRetry(`${trainerUrl}${req.originalUrl}`);
  const text = await response.text();
  idTrainerMap.set(text, trainerUrl);

  res.send(text);
});

app.get('/details/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  const trainer = idTrainerMap.get(id);
  if (!trainer) {
    res.status(404).send(`Not found: ${id}`);
  } else {
    const response = await fetchWithRetry(`${trainer}/details/${id}`);
    const result = await response.json() as Buffer;
    res.send(result);
  }
});

app.get('/details', async (req: Request, res: Response) => {
  const trainers = _.uniq([...idTrainerMap.values()]);
  const requests = trainers.map(url => fetchWithRetry(`${url}${req.originalUrl}`).then(e=>e.json()));
  const results = await Promise.all(requests);

  const result = _.orderBy(results.map(e=>e as Buffer[]).reduce((p, n) => [...p, ...n], []), e => e.id);

  res.send(result);
});

app.get('/ids', (req: Request, res: Response) => {
  const ids = [...idTrainerMap.keys()];
  res.send(ids);
});

app.get('/clean', async (req: Request, res: Response) => {
  const trainers = _.uniq([...idTrainerMap.values()]);

  const requests = trainers.map(url => fetchWithRetry(`${url}/clean`));
  await Promise.all(requests);
  res.send();
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
