import  enkrip  from '../../helper/enkrip.js';
import jwt from '../../helper/jwt.js';
import { nanoid } from 'nanoid'
import sequelize from '../../config/connection.js';
import { QueryTypes } from 'sequelize';
import { results, paginateArray } from '../../helper/api.js';
import { HttpStatusCode } from 'axios';

import Tugas from '../tugas/model.js';
import DailyReport from '../daily_report/model.js';
import Absensi from '../absensi/model.js';
import User from '../master_user/model.js';

class CommentContreller{
    static async dashboardAdmin(req, res){
        try {

            let me = req.user

            let list = ['PDL','HDI','AAF']
            if (!list.includes(me.nama)) {
                me.nama = null
            }

            let heads = ''
            let absensi = ''
            let daily = ''
            let head = me.nama
            let jadwal = req.query.jadwal || null

            if (head) {
                heads += `and (mr.head = '${head}' or mu.id = '${me.id}')`
            }
            if (jadwal) {
                absensi += `and TO_CHAR(a.jadwal, 'YYYY-MM-DD') ILIKE '%${jadwal}%'`
            }
            if (jadwal) {
                daily += `and TO_CHAR(dr.jadwal, 'YYYY-MM-DD') ILIKE '%${jadwal}%'`
            }

            let result = {}

            const jmlh_user = await sequelize.query(`select count(*) as jml_user from master_user mu
                join master_role mr  on mu.role_id = mr.id
                where mu."deletedAt" isnull ${heads}`, { type: QueryTypes.SELECT });

            const jml_tugas = await sequelize.query(`select count(t.id) as jumlah_sub_tugas, t.id from tugas t 
                join pool_tugas_user ptu on ptu.tugas_id = t.id
                join master_user mu on mu.id = ptu.user_id 
                join master_role mr on mr.id  = mu.role_id 
                where t."deletedAt" isnull ${heads}
                group by t.id`, { type: QueryTypes.SELECT });
            
            const jml_tugas_done = await sequelize.query(`select count(t.id) as jumlah_sub_tugas, t.id from tugas t 
                join pool_tugas_user ptu on ptu.tugas_id = t.id
                join master_user mu on mu.id = ptu.user_id 
                join master_role mr on mr.id  = mu.role_id 
                where t."deletedAt" isnull and t.is_done is true ${heads}
                group by t.id`, { type: QueryTypes.SELECT });

            const jml_daily_report = await sequelize.query(`select * from daily_report dr
                join master_user mu on mu.id = dr.user_id 
                join master_role mr on mr.id  = mu.role_id 
                where dr."deletedAt" isnull is true ${heads}`, { type: QueryTypes.SELECT });
                
            const data_jadwal = await sequelize.query(`select a.* from absensi a 
                join master_user mu on mu.id = a.user_id 
                join master_role mr on mr.id  = mu.role_id 
                where a."deletedAt" is null ${absensi} ${heads}`, { type: QueryTypes.SELECT });
                    
                    
            const daily_report = await sequelize.query(`select dr.id, t.judul, mu.nama_lengkap, mr.alias, dr.deskripsi, dr."createdAt" from daily_report dr 
                join master_user mu on mu.id = dr.user_id 
                join master_role mr on mr.id = mu.role_id 
                join tugas t on t.id = dr.tugas_id 
                where dr."deletedAt" isnull ${daily} ${heads}
                order by dr."createdAt" desc limit 7`, { type: QueryTypes.SELECT });
            
            const data_absensi = await sequelize.query(`select sum(case when status = 'masuk' and check_in notnull then 1 else 0 end) as masuk, 
                sum(case when status = 'wfh' and check_in notnull then 1 else 0 end) as wfh ,
                sum(case when status = 'izin' and check_in notnull  then 1 else 0 end) as izin,
                sum(case when status = 'sakit' and check_in notnull  then 1 else 0 end) as sakit,
                sum(case when status isnull and check_in isnull then 1 else 0 end) as tanpa_keterangan
                from absensi a join master_user mu on mu.id = a.user_id 
                join master_role mr on mr.id  = mu.role_id
                where a."deletedAt" isnull ${absensi} ${heads}`, { type: QueryTypes.SELECT });

            result.jml_user = jmlh_user[0].jml_user
            result.jml_tugas = jml_tugas.length
            result.jml_tugas_done = jml_tugas_done.length
            result.jml_daily_report = jml_daily_report.length
            result.jadwal = data_jadwal.length
            result.daily_report = daily_report
            result.absensi = data_absensi[0]

            res
            .status(HttpStatusCode.Ok)
            .json(results(result, HttpStatusCode.Ok))
        } catch (err) {
            console.log(err)
        err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }

    static async openSchedule(req, res){
        try {
            let {jadwal} = req.body

            const absensi = await Absensi.findOne({where:{jadwal}})
            if(absensi){
                const err = new Error('Jadwal sudah dibuat')
                err.code = HttpStatusCode.NotFound
                throw err
            }
            const daily = await DailyReport.findOne({where:{jadwal}})
            if(daily){
                const err = new Error('Jadwal sudah dibuat')
                err.code = HttpStatusCode.NotFound
                throw err
            }
        
            console.log(jadwal)
            const users = await sequelize.query(`SELECT id from master_user mu where "deletedAt" isnull and is_active is true`, { type: QueryTypes.SELECT });

            let payload = []
            let payload_absensi = []
            let payload_daily_report = []

            for (let i = 0; i < users.length; i++) {
                payload_absensi.push({
                    id:nanoid(),
                    user_id:users[i].id,
                    jadwal
                })

                payload_daily_report.push({
                    id:nanoid(),
                    user_id:users[i].id,
                    jadwal
                })

                payload.push({
                    id:nanoid(),
                    user_id:users[i].id,
                    jadwal
                })
            }

            const result = await Absensi.bulkCreate(payload)            
            // await DailyReport.bulkCreate(payload)            
            
            res
            .status(HttpStatusCode.Ok)
            .json(results(result, HttpStatusCode.Ok))
        } catch (err) {
            console.log(err)
        err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }



    static async addComment(req, res){
        try {
            let {tugas_id, comment} = req.body
            const user_id = req.user.id

            const tugas = await Tugas.findByPk(tugas_id)
            if(!tugas){
                const err = new Error('Tugas tidak ada')
                err.code = HttpStatusCode.NotFound
                throw err
            }
            if(!comment){
                const err = new Error('Komentar tidak boleh kosong/ harus diisi')
                err.code = HttpStatusCode.BadRequest
                throw err
            }
            const hasil = await Comment.create({id:nanoid(), user_id, tugas_id, comment})
            res
            .status(HttpStatusCode.Ok)
            .json(results(hasil, HttpStatusCode.Ok))
        } catch (err) {
            console.log(err)
        err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }

    static async editComment(req, res){
        try {

            const id = req.params.id
            const user_id = req.user.id
            const comment = req.body.comment
            const comments = await Comment.findByPk(id)
            if(!comments){
                const err = new Error('data comment tidak ada!!')
                err.code = HttpStatusCode.BadRequest
                throw err
            }

            if (comments.dataValues.user_id != user_id) {
                const err = new Error('hanya bisa edit komentar milik sendiri!!')
                err.code = HttpStatusCode.BadRequest
                throw err
            }

            await comments.update({comment})
            res
            .status(HttpStatusCode.Ok)
            .json(results(comments, HttpStatusCode.Ok))
        } catch (err) {
        err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }

    static async deleteComment(req, res){
        try {
        const id = req.params.id
            const user_id = req.user.id
            const comments = await Comment.findByPk(id)
            if(!comments){
                const err = new Error('data comment tidak ada!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            if (comments.dataValues.user_id != user_id) {
                const err = new Error('hanya bisa hapus komentar milik sendiri!!')
                err.code = HttpStatusCode.BadRequest
                throw err
            }

            const result = await Comment.destroy({where:{id}}) 
            res
            .status(HttpStatusCode.Ok)
            .json(results(result, HttpStatusCode.Ok))
        } catch (err) {
            err.code = typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
    }
    }
}

export default CommentContreller;