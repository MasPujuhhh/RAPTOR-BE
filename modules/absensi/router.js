import express from 'express';
import controller from './controller.js';
import auth from '../../middleware/auth.js'
const router = express.Router()

router.post('/add', auth.verifikasiToken, controller.addAbsensi)
router.get('/list', auth.verifikasiToken, controller.list)
// router.post('/add', auth.verifikasiToken, controller.addComment)
// router.put('/edit/:id', auth.verifikasiToken, controller.editComment);
// router.delete('/delete/:id', auth.verifikasiToken, controller.deleteComment);

export default router