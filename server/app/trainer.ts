import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { Buffer, emptyBuffer } from './buffer';
import { Config, defaultConfig } from '../../training/learning/config';
import { Worker } from 'worker_threads';
import path from 'path';
import { WorkerResponse, message } from './message';

const app = express();
const port = 3000;

const buffers = new Map<string, Buffer>();
const workers = new Map<string, Worker>();

const parseIntOrDefault = (value: string, defaultValue: number): number => value ? Number.parseInt(value) : defaultValue;
const parseFloatOrDefault = (value: string, defaultValue: number): number => value ? Number.parseFloat(value) : defaultValue;
const parseBoolOrDefault = (value: string, defaultValue: boolean): boolean => value ? value === 'true' : defaultValue;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// GET endpoint

app.get('/start', (req: Request, res: Response) => {
  const id = uuidv4();
  const buffer = emptyBuffer(id);

  const boardSize = parseIntOrDefault(req.query.boardSize as string, defaultConfig.environmentConfig.boardSize);
  const episodes = parseIntOrDefault(req.query.episodes as string, defaultConfig.episodes);
  const epsilon = parseFloatOrDefault(req.query.epsilon as string, defaultConfig.epsilon);
  const discountFactor = parseFloatOrDefault(req.query.discountFactor as string, defaultConfig.discountFactor);
  const maxActionsPerIteration = parseIntOrDefault(req.query.maxActionsPerIteration as string, defaultConfig.maxActionsPerIteration);

  const hidderLayers = parseIntOrDefault(req.query.hidderLayers as string, defaultConfig.networkConfig.hidderLayers);
  const hiddenLayerUnits = parseIntOrDefault(req.query.hiddenLayerUnits as string, defaultConfig.networkConfig.hiddenLayerUnits);
  const inputLayerUnits = parseIntOrDefault(req.query.inputLayerUnits as string, defaultConfig.networkConfig.inputLayerUnits);

  const config = <Config>{
    ...defaultConfig,
    environmentConfig:{
      ...defaultConfig.environmentConfig,
      boardSize
    },
    episodes: episodes,
    epsilon,
    discountFactor,
    maxActionsPerIteration,
    networkConfig: {
      ...defaultConfig.networkConfig,
      hidderLayers,
      hiddenLayerUnits,
      inputLayerUnits
    }
  };

  buffer.config = config;


  const worker = new Worker(path.join(__dirname, 'worker.js'));
  workers.set(id,worker);

  worker.on(message, (message) => {
    const response = message as WorkerResponse;
    buffer.iteration = response.arg.episode + 1;
    buffer.maxLength = buffer.maxLength > response.arg.snakeLength ? buffer.maxLength : response.arg.snakeLength;
    buffer.endTime = new Date()
  });

  worker.postMessage({config, id});

  buffers.set(id, buffer);
  res.send(`${id}`);
});

app.get('/details/:id', (req: Request, res: Response) => {
  const id = req.params.id;

  const buffer = buffers.get(id);
  if (!buffer) {
    res.status(404).send(`Not found: ${id}`);
  } else {
    res.send(buffer);
  }
});

app.get('/details', (req: Request, res: Response) => {

  const includeConfig = parseBoolOrDefault(req.query.config as string, true);


  const result = [...buffers.values()].map(e=>({...e,config: includeConfig ? e.config : {} }));

  res.send(result);
});

app.get('/ids', (req: Request, res: Response) => {
  const ids = [...buffers.keys()];
    res.send(ids);
});

app.get('/clean', (req: Request, res: Response) => {
  buffers.clear();
  res.send();
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
