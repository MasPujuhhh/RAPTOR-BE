import express from 'express';
import controller from './controller.js';

import auth from '../../middleware/auth.js'
const router = express.Router()


router.post('/add',  auth.verifikasiToken, controller.add);
router.put('/edit/:sub_tugas_id',  auth.verifikasiToken, controller.edit)
router.delete('/delete/:sub_tugas_id',  auth.verifikasiToken, controller.delete)
router.put('/done/:sub_tugas_id', auth.verifikasiToken, controller.done)

export default router