import express from 'express';
import controller from './controller.js';

import auth from '../../middleware/auth.js'
const router = express.Router()


router.post('/add', auth.verifikasiToken, controller.add);
router.get('/list', auth.verifikasiToken, controller.list)
router.get('/all', auth.verifikasiToken, controller.all)
router.get('/all_by_division', auth.verifikasiToken, controller.allByDivision)
router.get('/list_by_token', auth.verifikasiToken, controller.listByToken)
router.get('/all_by_token', auth.verifikasiToken, controller.allByToken)
router.get('/detail/:id', auth.verifikasiToken, controller.detail)
router.put('/edit/:id', auth.verifikasiToken, controller.edit)
router.delete('/delete_tugas/:id', auth.verifikasiToken, controller.delete)

export default router