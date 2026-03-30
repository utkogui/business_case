import type { Request, Response } from 'express';
import { createProjectSchema, projectIdParamsSchema, updateProjectSchema } from './validation';
import * as projectsService from './service';

export async function list(req: Request, res: Response): Promise<Response> {
  const projects = await projectsService.listProjects();
  return res.status(200).json(projects);
}

export async function getById(req: Request, res: Response): Promise<Response> {
  const { id } = projectIdParamsSchema.parse(req.params);
  const project = await projectsService.getProjectById(id);
  return res.status(200).json(project);
}

export async function create(req: Request, res: Response): Promise<Response> {
  const payload = createProjectSchema.parse(req.body);
  const project = await projectsService.createProject(payload);
  return res.status(201).json(project);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const { id } = projectIdParamsSchema.parse(req.params);
  const payload = updateProjectSchema.parse(req.body);
  const project = await projectsService.updateProject(id, payload);
  return res.status(200).json(project);
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const { id } = projectIdParamsSchema.parse(req.params);
  await projectsService.deleteProject(id);
  return res.status(204).send();
}

export async function businessCase(req: Request, res: Response): Promise<Response> {
  const { id } = projectIdParamsSchema.parse(req.params);
  const data = await projectsService.getProjectBusinessCase(id);
  return res.status(200).json(data);
}
