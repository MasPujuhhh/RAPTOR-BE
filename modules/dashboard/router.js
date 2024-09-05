import express from 'express';
import controller from './controller.js';
import auth from '../../middleware/auth.js'
const router = express.Router()


router.get('/', auth.verifikasiToken, controller.dashboardAdmin)
router.get('/change_label', auth.verifikasiToken, controller.changeLabel)
router.post('/open_schedule', auth.verifikasiToken, controller.openSchedule)

// router.post('/add', auth.verifikasiToken, controller.addComment)
// router.put('/edit/:id', auth.verifikasiToken, controller.editComment);
// router.delete('/delete/:id', auth.verifikasiToken, controller.deleteComment);


// router.get('/:id', controller.commentById);
// router.post('/createComment', controller.craeteComment);
// router.put('/:id', controller.updateComment);
// router.delete('/:id', controller.deleteComment);

export default router