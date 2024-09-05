import express from 'express';
import controller from './controller.js';
import auth from '../../middleware/auth.js'
const router = express.Router()

router.post('/add', auth.verifikasiToken, controller.addComment)
router.post('/upload_image', auth.verifikasiToken, controller.uploadImage)
router.put('/edit/:comment_id', auth.verifikasiToken, controller.editComment);
router.delete('/delete/:comment_id', auth.verifikasiToken, controller.deleteComment);


// router.get('/:id', controller.commentById);
// router.post('/createComment', controller.craeteComment);
// router.put('/:id', controller.updateComment);
// router.delete('/:id', controller.deleteComment);

export default router