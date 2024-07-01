import express from 'express';
import controller from './controller.js';

import auth from '../../middleware/auth.js'
const router = express.Router()


router.get('/all-name', controller.allName);
router.get('/all-by-name', controller.allByName);
router.post('/add', controller.add);
router.get('/list', controller.list)
router.get('/detail/:id', controller.detail)
router.put('/edit/:id', controller.editUser)
router.delete('/delete/:id', controller.deleteUser)

export default router