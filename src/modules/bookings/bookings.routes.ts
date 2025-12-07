import { Router } from 'express';
import { authGuard } from '../../middleware/auth';
import { createBooking, getBookings, updateBooking } from './bookings.controller';

const router = Router();

router.use(authGuard);

router.post('/', createBooking);
router.get('/', getBookings);
router.put('/:bookingId', updateBooking);

export default router;
