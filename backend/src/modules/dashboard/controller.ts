import type { Request, Response } from 'express';
import * as dashboardService from './service';

export async function overview(_req: Request, res: Response): Promise<Response> {
  const data = await dashboardService.getOverview();
  return res.status(200).json(data);
}
