import type { Request, Response } from 'express';
import { createProfessionalSchema, professionalIdParamsSchema, updateProfessionalSchema } from './validation';
import * as professionalsService from './service';

export async function list(req: Request, res: Response): Promise<Response> {
  const professionals = await professionalsService.listProfessionals();
  return res.status(200).json(professionals);
}

export async function getById(req: Request, res: Response): Promise<Response> {
  const { id } = professionalIdParamsSchema.parse(req.params);
  const professional = await professionalsService.getProfessionalById(id);
  return res.status(200).json(professional);
}

export async function create(req: Request, res: Response): Promise<Response> {
  const payload = createProfessionalSchema.parse(req.body);
  const professional = await professionalsService.createProfessional(payload);
  return res.status(201).json(professional);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const { id } = professionalIdParamsSchema.parse(req.params);
  const payload = updateProfessionalSchema.parse(req.body);
  const professional = await professionalsService.updateProfessional(id, payload);
  return res.status(200).json(professional);
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const { id } = professionalIdParamsSchema.parse(req.params);
  await professionalsService.deleteProfessional(id);
  return res.status(204).send();
}
