import type { Request, Response } from 'express';
import { allocationParamsSchema, createAllocationSchema, updateAllocationSchema } from './validation';
import * as allocationsService from './service';

export async function list(req: Request, res: Response): Promise<Response> {
  const { projectId } = allocationParamsSchema.parse(req.params);
  const allocations = await allocationsService.listAllocations(projectId);
  return res.status(200).json(allocations);
}

export async function create(req: Request, res: Response): Promise<Response> {
  const { projectId } = allocationParamsSchema.parse(req.params);
  const payload = createAllocationSchema.parse(req.body);
  const allocation = await allocationsService.createAllocation(projectId, payload);
  return res.status(201).json(allocation);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const { projectId, allocationId } = allocationParamsSchema.parse(req.params);
  const payload = updateAllocationSchema.parse(req.body);
  const allocation = await allocationsService.updateAllocation(projectId, allocationId!, payload);
  return res.status(200).json(allocation);
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const { projectId, allocationId } = allocationParamsSchema.parse(req.params);
  await allocationsService.deleteAllocation(projectId, allocationId!);
  return res.status(204).send();
}
