import ReportLabel from './model.js';
import Tugas from '../tugas/model.js';
import TugasHistory from '../tugas_history/model.js';
import SubTugas from './model.js';
import enkrip  from '../../helper/enkrip.js';
import jwt from '../../helper/jwt.js';
import { nanoid } from 'nanoid'
import sequelize from '../../config/connection.js';
import { QueryTypes } from 'sequelize';
import { results, paginateArray } from '../../helper/api.js';
import { HttpStatusCode } from 'axios';

class Controller{
    static async add(req, res){
        const t = await sequelize.transaction()
        try {
            let {tugas_id,sub_tugas} = req.body

            const tugas = await Tugas.findByPk(tugas_id)
            if (!tugas) {
                const err = new Error('Tugas tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            const payload = []
            const payload_history = []

            for (let i = 0; i < sub_tugas.length; i++) {
                payload.push({
                    id:nanoid(),
                    tugas_id:tugas.id,
                    is_done:false,
                    ...sub_tugas[i]
                })
                payload_history.push({id:nanoid(), tugas_id:tugas.id, keterangan:`${req.user.nama_lengkap} menghapus sub-tugas ${sub_tugas[i].judul} pada ${req.moment(new Date()).format('LLL')}`})
                
            }
            const result = await SubTugas.bulkCreate(payload, {transaction:t})
            await TugasHistory.bulkCreate(payload_history, {transaction:t})

            await t.commit()

            res.status(HttpStatusCode.Ok).json(results(result, HttpStatusCode.Ok));
        } catch (err) {
            console.log(err)
            await t.rollback()
        err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }

    static async delete(req, res){
        const t = await sequelize.transaction();
        try {
            const id = req.params.sub_tugas_id
            console.log(id)
            const hasil = await SubTugas.findOne({ where: { id } });
            if (!hasil) {
                const err = new Error('Sub Tugas tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }
            const tugas = await Tugas.findByPk(hasil.tugas_id)
            if (!tugas) {
                const err = new Error('Tugas tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }


            await TugasHistory.create({id:nanoid(), tugas_id:tugas.id, keterangan:`${req.user.nama_lengkap} menghapus sub-tugas ${hasil.judul} pada ${req.moment(new Date()).format('LLL')}`}, {transaction:t})
            await hasil.destroy({ where: { id }, transaction:t})

            await t.commit()
            res
            .status(HttpStatusCode.Ok)
            .json(results(hasil, HttpStatusCode.Ok))
        } catch (err) {
            console.log(err)
            await t.rollback()
            err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        } 
    }

    static async edit(req, res){
        const t = await sequelize.transaction();
        try {
            let {user_id, category_id, judul, tanggal_selesai } = req.body;
            let id = req.params.sub_tugas_id

            const sub_tugas = await SubTugas.findByPk(id)
            if (!sub_tugas) {
                const err = new Error('Sub Tugas tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            let judul_history = judul ? judul : sub_tugas.judul

            const tugas = await Tugas.findByPk(sub_tugas.tugas_id)
            if (!tugas) {
                const err = new Error('Tugas tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            await TugasHistory.create({id:nanoid(), tugas_id:tugas.id, keterangan:`${req.user.nama_lengkap} mengubah sub-tugas ${judul_history} pada ${req.moment(new Date()).format('LLL')}`}, {transaction:t})
            await sub_tugas.update({user_id, category_id, judul, tanggal_selesai }, {transaction:t})

            await t.commit()
            res
            .status(HttpStatusCode.Ok)
            .json(results(sub_tugas, HttpStatusCode.Ok))
        } catch (err) {
            console.log(err)
            await t.rollback()
            err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }


    static async done(req, res){
        const t = await sequelize.transaction();
        try {
            let id = req.params.sub_tugas_id
            const { alasan } = req.body

            const sub_tugas = await SubTugas.findByPk(id)
            if (!sub_tugas) {
                const err = new Error('Sub Tugas tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            if (sub_tugas.user_id !== req.user.id) {
                const err = new Error('Hanya bisa menyelesaikan tugas miliknya sendiri!!')
                err.code = HttpStatusCode.Forbidden
                throw err
            }

            const tugas = await Tugas.findByPk(sub_tugas.tugas_id)
            if (!tugas) {
                const err = new Error('Tugas tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            let payload = {}
            if (alasan) {
                payload.status = 'terlambat',
                payload.is_done = true
                payload.alasan = alasan
            } else {
                payload.is_done = true
                payload.status = 'ok'
            }


            await sub_tugas.update(payload, {transaction:t})
            await TugasHistory.create({id:nanoid(), tugas_id:tugas.id, keterangan:`${req.user.nama_lengkap} menyelesaikan sub-tugas ${sub_tugas.judul} pada ${req.moment(new Date()).format('LLL')}`}, {transaction:t})

            await t.commit()

            const cek = await sequelize.query(`SELECT COUNT(*) AS total, COUNT(CASE WHEN status = 'ok' THEN 1 END) AS ok FROM sub_tugas WHERE "deletedAt" IS NULL and tugas_id = ?`, { replacements:[sub_tugas.tugas_id],type: QueryTypes.SELECT });
            console.log(cek)
            if (cek[0].total == cek[0].ok) {
                await tugas.update({is_done:true})
            }

            res
            .status(HttpStatusCode.Ok)
            .json(results(sub_tugas, HttpStatusCode.Ok))
        } catch (err) {
            console.log(err)
            await t.rollback()
            err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }
}

export default Controller;
