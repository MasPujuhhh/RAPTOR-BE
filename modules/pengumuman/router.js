import express from 'express';
import controller from './controller.js';

import auth from '../../middleware/auth.js'
const router = express.Router()


router.post('/add', auth.verifikasiToken, controller.add);
router.get('/list', controller.list)
router.get('/detail/:id', controller.detail)
router.put('/edit/:id', controller.edit)
router.delete('/delete/:id', controller.delete)

export default router