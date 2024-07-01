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
    static async dashboard(req, res){
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

            // const users = await User.findAll({where:{is_active:false}})
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
            await DailyReport.bulkCreate(payload)            
            
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