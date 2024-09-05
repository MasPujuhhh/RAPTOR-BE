import  enkrip  from '../../helper/enkrip.js';
import jwt from '../../helper/jwt.js';
import { nanoid } from 'nanoid'
import sequelize from '../../config/connection.js';
import { QueryTypes } from 'sequelize';
import { results, paginateArray } from '../../helper/api.js';
import { HttpStatusCode } from 'axios';

import Daily from './model.js';
import Tugas from '../tugas/model.js';
import Label from '../master_report_label/model.js';
import User from '../master_user/model.js';

class DailyReport{
    static async addDailyReport(req, res){
        try {
            let {tugas_id, label_id, deskripsi, jadwal} = req.body
            const me = req.user
            const user = await User.findByPk(me.id)
            if(!user){
                const err = new Error('User tidak ada')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            const tugas = await Tugas.findByPk(tugas_id)
            if(!tugas){
                const err = new Error('Tugas tidak ada')
                err.code = HttpStatusCode.NotFound
                throw err
            }
            const label = await Label.findByPk(label_id)
            if(!label){
                const err =  new Error('Label tidak ada')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            const daily = await Daily.create({id:nanoid(), user_id:user.id, tugas_id, label_id, deskripsi, jadwal })
            res
            .status(HttpStatusCode.Ok)
            .json(results(daily, HttpStatusCode.Ok))
        } catch (err) {
            console.log(err)
        err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }


    static async list(req, res){
        try {
            let me = req.user
            const tanggal_mulai = req.query.tanggal_mulai || null
            const tanggal_selesai = req.query.tanggal_selesai || null
            const user_id = req.query.user_id || null
            const judul_tugas = req.query.judul_tugas || null

            const per_page = req.query.per_page || 10
            const page = req.query.page || 1
            const offset = (page - 1) * per_page

            const user = await User.findByPk(me.id)
            if(!user){
                const err = new Error('User tidak ada')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            let filter = ''
            if (judul_tugas) {
                filter += `and t.judul ilike '%${judul_tugas}%'`
            }
            if (tanggal_mulai) {
                filter += `and date(dr.jadwal) >= '${tanggal_mulai}'`
            }
            if (tanggal_selesai) {
                filter += `and date(dr.jadwal) <= '${tanggal_selesai}'`
            }
            if (user_id) {
                filter += `and dr.user_id ilike '%${user_id}%'`
            }
            
            const count = await sequelize.query(`select dr.id as daily_report_id, dr.jadwal, mu.id as user_id, mu.nama_lengkap, mr.nama as nama_role, t.judul, mrl.nama as nama_label, dr.deskripsi from daily_report dr 
                join master_user mu on dr.user_id  = mu.id
                join master_role mr on mr.id = mu.role_id 
                join tugas t on dr.tugas_id = t.id
                join master_report_label mrl on mrl.id = dr.label_id 
                where dr."deletedAt" isnull
                ${filter}`, { type: QueryTypes.SELECT });

            const daily_report = await sequelize.query(`select dr.id as daily_report_id, dr.jadwal, mu.id as user_id, mu.nama_lengkap, mr.nama as nama_role, t.judul, mrl.nama as nama_label, dr.deskripsi from daily_report dr 
                join master_user mu on dr.user_id  = mu.id
                join master_role mr on mr.id = mu.role_id 
                join tugas t on dr.tugas_id = t.id
                join master_report_label mrl on mrl.id = dr.label_id 
                where dr."deletedAt" isnull
                ${filter} limit ${per_page} offset ${offset} order by dr.jadwal, mu.nama_lengkap`, { type: QueryTypes.SELECT });

            const result = {
                count: count.length,
                rows: daily_report
            }

            res
            .status(HttpStatusCode.Ok)
            .json(results(result, HttpStatusCode.Ok, {req}))
        } catch (err) {
            console.log(err)
        err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }

    static async all(req, res){
        try {
            let me = req.user
            const tanggal_mulai = req.query.tanggal_mulai || null
            const tanggal_selesai = req.query.tanggal_selesai || null
            const user_id = req.query.user_id || null
            const judul_tugas = req.query.judul_tugas || null

            const user = await User.findByPk(me.id)
            if(!user){
                const err = new Error('User tidak ada')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            let filter = ''
            if (judul_tugas) {
                filter += `and t.judul ilike '%${judul_tugas}%'`
            }
            if (tanggal_mulai) {
                filter += `and date(dr.jadwal) >= '${tanggal_mulai}'`
            }
            if (tanggal_selesai) {
                filter += `and date(dr.jadwal) <= '${tanggal_selesai}'`
            }
            if (user_id) {
                filter += `and dr.user_id ilike '%${user_id}%'`
            }
            
            const count = await sequelize.query(`select dr.id as daily_report_id, dr.jadwal, mu.id as user_id, mu.nama_lengkap, mr.nama as nama_role, t.judul, mrl.nama as nama_label, mrl.color, dr.deskripsi from daily_report dr 
                join master_user mu on dr.user_id  = mu.id
                join master_role mr on mr.id = mu.role_id 
                join tugas t on dr.tugas_id = t.id
                join master_report_label mrl on mrl.id = dr.label_id 
                where dr."deletedAt" isnull
                ${filter} order by dr.jadwal, mu.nama_lengkap`, { type: QueryTypes.SELECT });

            res
            .status(HttpStatusCode.Ok)
            .json(results(count, HttpStatusCode.Ok, {req}))
        } catch (err) {
            console.log(err)
        err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }

    static async allByDivision(req, res){
        try {
            let me = req.user
            const tanggal_mulai = req.query.tanggal_mulai || null
            const tanggal_selesai = req.query.tanggal_selesai || null
            const user_id = req.query.user_id || null
            const judul_tugas = req.query.judul_tugas || null
            const label_id = req.query.label_id || null

            const user = await User.findByPk(me.id)
            if(!user){
                const err = new Error('User tidak ada')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            let filter = ''
            if (judul_tugas) {
                filter += `and t.judul ilike '%${judul_tugas}%'`
            }
            if (tanggal_mulai) {
                filter += `and date(dr.jadwal) >= '${tanggal_mulai}'`
            }
            if (tanggal_selesai) {
                filter += `and date(dr.jadwal) <= '${tanggal_selesai}'`
            }
            if (user_id) {
                filter += `and dr.user_id ilike '%${user_id}%'`
            }

            let list = ['PDL','HDI','AAF']
            if (!list.includes(req.user.nama)) {
                me.nama = null
            }

            let head = me.nama

            if (head) {
                filter += `and (head = '${head}' or mu.id = '${me.id}')`
            }

            if (label_id) {
                filter += `and mrl.id = '${label_id}' ` 
            }
            
            const count = await sequelize.query(`select dr.id as daily_report_id, dr.jadwal, mu.id as user_id, mu.nama_lengkap, mr.nama as nama_role, t.judul, mrl.nama as nama_label, mrl.color, dr.deskripsi from daily_report dr 
                join master_user mu on dr.user_id  = mu.id
                join master_role mr on mr.id = mu.role_id 
                join tugas t on dr.tugas_id = t.id
                join master_report_label mrl on mrl.id = dr.label_id 
                where dr."deletedAt" isnull
                ${filter} order by dr.jadwal, mu.nama_lengkap`, { type: QueryTypes.SELECT });

            res
            .status(HttpStatusCode.Ok)
            .json(results(count, HttpStatusCode.Ok, {req}))
        } catch (err) {
            console.log(err)
        err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }


    static async allByToken(req, res){
        try {
            const me = req.user
            const jadwal = req.query.jadwal || null

            const user = await User.findByPk(me.id)
            if(!user){
                const err = new Error('User tidak ada')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            let filter = ''
            if (jadwal) {
                filter += `AND TO_CHAR(dr.jadwal, 'YYYY-MM-DD') ILIKE '%${jadwal}%' `
            }

            const daily_report = await sequelize.query(`select dr.*, t.id as tugas_id, t.judul, mrl.nama as nama_label, mrl.color, mu.nama_lengkap, mu.foto_profile  from daily_report dr
                join master_user mu on mu.id = dr.user_id
                join tugas t on t.id = dr.tugas_id 
                join master_report_label mrl on mrl.id = dr.label_id 
                where dr."deletedAt" isnull ${filter} and mu.id = '${user.id}' `, { type: QueryTypes.SELECT });

            res
            .status(HttpStatusCode.Ok)
            .json(results(daily_report, HttpStatusCode.Ok))
        } catch (err) {
            console.log(err)
        err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }


    static async listByToken(req, res){
        try {
            const me = req.user
            const jadwal = req.query.jadwal || null
            const per_page = req.query.per_page || 10
            const page = req.query.page || 1
            const offset = (page - 1) * per_page

            const user = await User.findByPk(me.id)
            if(!user){
                const err = new Error('User tidak ada')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            let filter = ''
            if (jadwal) {
                filter += `AND TO_CHAR(dr.jadwal, 'YYYY-MM-DD') ILIKE '%${jadwal}%' `
            }
            
            const count = await sequelize.query(`select dr.* from daily_report dr 
                join master_user mu on mu.id = dr.user_id 
                where dr."deletedAt" isnull ${filter} and mu.id = '${user.id}'`, { type: QueryTypes.SELECT });

            const daily_report = await sequelize.query(`select dr.* from daily_report dr 
                join master_user mu on mu.id = dr.user_id 
                where dr."deletedAt" isnull ${filter} and mu.id = '${user.id}' limit ${per_page} offset ${offset}`, { type: QueryTypes.SELECT });

            const result = {
                count: count.length,
                rows: daily_report
            }

            res
            .status(HttpStatusCode.Ok)
            .json(results(result, HttpStatusCode.Ok, {req}))
        } catch (err) {
            console.log(err)
        err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }

    static async edit(req, res){
        try {

            const id = req.params.id
            const user_id = req.user.id

            let { label_id, deskripsi, tugas_id } = req.body

            const daily = await Daily.findByPk(id)
            if(!daily){
                const err = new Error('Daily Report tidak ada!!')
                err.code = HttpStatusCode.BadRequest
                throw err
            }

            if (daily.dataValues.user_id != user_id) {
                const err = new Error('hanya bisa edit komentar milik sendiri!!')
                err.code = HttpStatusCode.BadRequest
                throw err
            }

            await daily.update({label_id, deskripsi, tugas_id})
            res
            .status(HttpStatusCode.Ok)
            .json(results(daily, HttpStatusCode.Ok))
        } catch (err) {
        err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }

    static async detail(req, res){
        try {

            const id = req.params.id

            const daily = await Daily.findByPk(id)
            if(!daily){
                const err = new Error('Daily Report tidak ada!!')
                err.code = HttpStatusCode.BadRequest
                throw err
            }
            
            res
            .status(HttpStatusCode.Ok)
            .json(results(daily, HttpStatusCode.Ok))
        } catch (err) {
        err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }

    static async delete(req, res){
        try {
            const id = req.params.id
            const user_id = req.user.id
            const daily = await Daily.findByPk(id)
            if(!daily){
                const err = new Error('Daily Report tidak ada!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            if (daily.dataValues.user_id != user_id) {
                const err = new Error('hanya bisa hapus komentar milik sendiri!!')
                err.code = HttpStatusCode.BadRequest
                throw err
            }

            const result = await Daily.destroy({where:{id}}) 
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

export default DailyReport;