import express from 'express';
import users from '../modules/master_user/router.js'
import tugas_category from '../modules/master_tugas_category/router.js'
import tugas_tags from '../modules/master_tugas_tags/router.js'
import report_label from '../modules/master_report_label/router.js'
import tugas from '../modules/tugas/router.js'
import sub_tugas from '../modules/sub_tugas/router.js'
import comment from '../modules/comment/router.js'
import dashboard from '../modules/dashboard/router.js'
import absensi from '../modules/absensi/router.js'
import roles from '../modules/master_role/router.js'
import pengumuman from '../modules/pengumuman/router.js'

// import schedule from '../modules/schedule/router.js'
// import todo from '../modules/todo/router.js'
// // import announcement from '../modules/announcement/router.js'
// import certificate from '../modules/certificate/router.js';
// import comment from '../modules/comment/router.js';
// import logbook from '../modules/logbook/router.js';
// import attendance from '../modules/attendance/router.js'
const router = express.Router()

router.use('/user', users)
router.use('/role', roles)
router.use('/tugas_category', tugas_category)
router.use('/tugas_tag', tugas_tags)
router.use('/report_label', report_label)
router.use('/tugas', tugas)
router.use('/sub_tugas', sub_tugas)
router.use('/comment', comment)
router.use('/pengumuman', pengumuman)
router.use('/absensi', absensi)


router.use('/dashboard', dashboard)

export default router
