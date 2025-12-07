import { Router } from 'express';
import { authGuard, requireAdmin } from '../../middleware/auth';
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from './vehicles.controller';

const router = Router();

router.get('/', getAllVehicles);
router.get('/:vehicleId', getVehicleById);

router.post('/', authGuard, requireAdmin, createVehicle);
router.put('/:vehicleId', authGuard, requireAdmin, updateVehicle);
router.delete('/:vehicleId', authGuard, requireAdmin, deleteVehicle);

export default router;
