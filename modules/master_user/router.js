import express from 'express';
import controller from './controller.js';

import auth from '../../middleware/auth.js'
const router = express.Router()


router.post('/login', controller.login);
router.post('/create_user', controller.createUser);
router.get('/all', auth.verifikasiToken, controller.all)
router.get('/all-role', auth.verifikasiToken, controller.allRole)
router.get('/list', auth.verifikasiToken, controller.list)
router.get('/detail_by_id/:id', controller.detailById)
router.get('/detail_by_token', auth.verifikasiToken, controller.detailByToken)
router.delete('/delete_user/:id', controller.deleteUser)
router.put('/edit_user/:id', auth.verifikasiToken, controller.editUser)
router.put('/change_password', auth.verifikasiToken, controller.changePassword)
router.put('/change_picture', auth.verifikasiToken, controller.changePicture)
router.put('/delete_picture', auth.verifikasiToken, controller.hapusGambar)

export default router