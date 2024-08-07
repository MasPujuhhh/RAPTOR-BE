import express from 'express';
import controller from './controller.js';

import auth from '../../middleware/auth.js'
const router = express.Router()


router.post('/add', controller.add);
router.get('/all', controller.all);
router.get('/all_by_division', auth.verifikasiToken, controller.allByDivision);
router.get('/list', controller.list)
router.get('/detail/:id', controller.detail)
router.put('/edit/:id', controller.edit)
router.delete('/delete/:id', controller.delete)

export default router