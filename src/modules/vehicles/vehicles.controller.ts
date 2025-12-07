import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { VehicleService } from './vehicles.service';
import { sendSuccess } from '../../utils/response';

export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
  const vehicle = await VehicleService.createVehicle(req.body);
  return sendSuccess(res, 201, 'Vehicle created successfully', vehicle);
});

export const getAllVehicles = asyncHandler(async (req: Request, res: Response) => {
  const { message, data } = await VehicleService.getAllVehicles();
  return sendSuccess(res, 200, message, data);
});

export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.vehicleId, 10);
  const vehicle = await VehicleService.getVehicleById(id);
  return sendSuccess(res, 200, 'Vehicle retrieved successfully', vehicle);
});

export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.vehicleId, 10);
  const vehicle = await VehicleService.updateVehicle(id, req.body);
  return sendSuccess(res, 200, 'Vehicle updated successfully', vehicle);
});

export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.vehicleId, 10);
  await VehicleService.deleteVehicle(id);
  return sendSuccess(res, 200, 'Vehicle deleted successfully');
});
