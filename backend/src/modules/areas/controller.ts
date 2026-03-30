import type { Request, Response } from 'express';
import { areaIdParamsSchema, createAreaSchema, updateAreaSchema } from './validation';
import * as areasService from './service';

export async function list(req: Request, res: Response): Promise<Response> {
  const areas = await areasService.listAreas();
  return res.status(200).json(areas);
}

export async function getById(req: Request, res: Response): Promise<Response> {
  const { id } = areaIdParamsSchema.parse(req.params);
  const area = await areasService.getAreaById(id);
  return res.status(200).json(area);
}

export async function create(req: Request, res: Response): Promise<Response> {
  const payload = createAreaSchema.parse(req.body);
  const area = await areasService.createArea(payload);
  return res.status(201).json(area);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const { id } = areaIdParamsSchema.parse(req.params);
  const payload = updateAreaSchema.parse(req.body);
  const area = await areasService.updateArea(id, payload);
  return res.status(200).json(area);
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const { id } = areaIdParamsSchema.parse(req.params);
  await areasService.deleteArea(id);
  return res.status(204).send();
}
