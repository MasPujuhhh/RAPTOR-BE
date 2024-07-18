import ReportLabel from './model.js';
import Tugas from './model.js';
import SubTugas from '../sub_tugas/model.js';
import TugasHistory from '../tugas_history/model.js';
import PoolTugasUser from '../pool_tugas_user/model.js';
import PoolTugasTags from '../pool_tugas_tags/model.js';
import Comment from '../comment/model.js';


import enkrip  from '../../helper/enkrip.js';
import jwt from '../../helper/jwt.js';
import { nanoid } from 'nanoid'
import sequelize from '../../config/connection.js';
import Sequelize, { where } from 'sequelize';
import { QueryTypes } from 'sequelize';
import { results, paginateArray } from '../../helper/api.js';
import { HttpStatusCode } from 'axios';

class Controller{
    static async add(req, res) {
        const t = await sequelize.transaction();
        try {    
            let { judul, kategori, tanggal_mulai, tanggal_selesai, tags, prioritas, users, sub_tugas } = req.body;

            if (sub_tugas.length < 1) {
                const err = new Error('Minimal isi dengan 1 sub tugas!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }
    
            const tugas = await Tugas.create({
                id: nanoid(),
                judul,
                kategori,
                tanggal_mulai,
                tanggal_selesai,
                prioritas,
                is_done: false
            }, { transaction: t });
    
            const payload_tags = tags.map(tag => ({ tugas_id: tugas.dataValues.id, tag_id: tag }));
            await PoolTugasTags.bulkCreate(payload_tags, { transaction: t });

            
            const payload_users = users.map(user => ({ tugas_id: tugas.dataValues.id, user_id: user }));
            await PoolTugasUser.bulkCreate(payload_users, { transaction: t });

            const payload_sub_tugas = sub_tugas?.map((sub, index) => ({
                id: nanoid(),
                tugas_id:tugas.id,
                category_id: sub.category_id,
                user_id: sub.user_id,
                status:"dikerjkan",
                judul: sub.judul,
                tanggal_selesai: sub.tanggal_selesai,
                status: sub.status,
                is_done: false
            }));
            const payload_history = []

            payload_history.push({id:nanoid(), tugas_id:tugas.id, keterangan:`${req.user.nama_lengkap} membuat tugas ${judul} pada ${req.moment(new Date()).format('LLL')}`})
            for (let i = 0; i < sub_tugas?.length; i++) {
                payload_history.push({id:nanoid(), tugas_id:tugas.id, keterangan:`${req.user.nama_lengkap} membuat sub-tugas ${sub_tugas[i].judul} pada ${req.moment(new Date()).format('LLL')}`}) 
            }
    
            await SubTugas.bulkCreate(payload_sub_tugas, { transaction: t });
            await TugasHistory.bulkCreate(payload_history, {transaction:t})

            
            await t.commit();
    
            res.status(HttpStatusCode.Ok).json(results(tugas, HttpStatusCode.Ok));
        } catch (err) {
            if (t) await t.rollback();
            console.log(err);
            err.code = err.code || HttpStatusCode.InternalServerError;
            res.status(err.code).json(results(null, err.code, { err }));
        }
    }

    static async all(req, res){
        try {            
            const hasil = await sequelize.query(
                `select t.* from tugas t 
                where t."deletedAt" isnull
                group by t.id`, { type: QueryTypes.SELECT });
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

    static async allByToken(req, res){
        try {
            const me = req.user

            const hasil = await sequelize.query(
                `select t.*, st.user_id from tugas t 
                join sub_tugas st on st.tugas_id = t.id 
                where t."deletedAt" isnull and st.user_id = '${me.id}'
                group by t.id, st.user_id`, { type: QueryTypes.SELECT });
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
    static async allByDivision(req, res){
        try {
            const user = req.user

            let filter = ''

            let list = ['PDL','HDI','AAF']
            if (!list.includes(req.user.nama)) {
                user.nama = null
            }

            let head = user.nama

            console.log(head)
            if (head) {
                filter += `and (head = '${head}' or mu.id = '${user.id}')`
            }

            const hasil = await sequelize.query(
                `select t.* from tugas t 
                join sub_tugas st ON st.tugas_id = t.id 
                join master_user mu on mu.id = st.user_id 
                join master_role mr on mr.id = mu.role_id 
                where t."deletedAt" isnull ${filter}
                group by t.id`, { type: QueryTypes.SELECT });
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

    static async listByToken(req, res){
        try {
            const per_page = req.query.per_page || 10
            const page = req.query.page || 1
            const judul = req.query.judul || null
            const tanggal_mulai = req.query.tanggal_mulai || null
            const tanggal_selesai = req.query.tanggal_selesai || null
            const offset = (page - 1) * per_page
            let me = req.user

            let filter = ''

            if (judul) {
                filter += `and t.judul ilike '%${judul}%'`
            }
            if (tanggal_mulai) {
                filter += `and date(t.tanggal_mulai) >= '${tanggal_mulai}'`
            }
            if (tanggal_selesai) {
                filter += `and date(t.tanggal_selesai) <= '${tanggal_selesai}'`
            }

            const count = await sequelize.query(
                `select t.*, st.user_id from tugas t 
                join sub_tugas st on st.tugas_id = t.id 
                where t."deletedAt" isnull and st.user_id = '${me.id}'
                ${filter}
                group by t.id, st.user_id`, { type: QueryTypes.SELECT });

            const hasil = await sequelize.query(
                `select t.*, st.user_id from tugas t 
                join sub_tugas st on st.tugas_id = t.id 
                where t."deletedAt" isnull and st.user_id = '${me.id}'
                ${filter}
                group by t.id, st.user_id
                limit ${per_page} offset ${offset}`, { type: QueryTypes.SELECT });

            const hasils = {
                count:count.length,
                rows:hasil
            }

            res
            .status(HttpStatusCode.Ok)
            .json(results(hasils, HttpStatusCode.Ok, {req}))
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
            const per_page = req.query.per_page || 10
            const page = req.query.page || 1
            const judul = req.query.judul || null
            const tanggal_mulai = req.query.tanggal_mulai || null
            const tanggal_selesai = req.query.tanggal_selesai || null
            const offset = (page - 1) * per_page

            let user = req.user

            let list = ['PDL','HDI','AAF']
            if (!list.includes(req.user.nama)) {
                user.nama = null
            }

            let heads = ''
            let filter = ''
            let head = user.nama

            if (head) {
                heads += `and (mr.head = '${head}' or mu.id = '${user.id}')`
            }
            if (judul) {
                filter += `and t.judul ilike '%${judul}%'`
            }
            if (tanggal_mulai) {
                filter += `and date(t.tanggal_mulai) >= '${tanggal_mulai}'`
            }
            if (tanggal_selesai) {
                filter += `and date(t.tanggal_selesai) <= '${tanggal_selesai}'`
            }

            const hasil_count = await sequelize.query(
                `select t.* from tugas t 
                join pool_tugas_user ptu on ptu.tugas_id = t.id 
                join master_user mu on mu.id = ptu.user_id
                join master_role mr on mr.id = mu.role_id 
                where t."deletedAt" isnull ${heads} ${filter} group by t.id`, { type: QueryTypes.SELECT });
            
            const hasil = await sequelize.query(
                `select t.* from tugas t 
                join pool_tugas_user ptu on ptu.tugas_id = t.id 
                join master_user mu on mu.id = ptu.user_id
                join master_role mr on mr.id = mu.role_id 
                where t."deletedAt" isnull ${heads} ${filter} group by t.id order by t."createdAt" desc limit ${per_page} offset ${offset}`, { type: QueryTypes.SELECT });

            // const hasil_count = await sequelize.query(
            //     `SELECT t.id, t.judul, t.kategori, COALESCE(st.jumlah_tugas, 0) AS jumlah_tugas, t.tanggal_mulai, t.tanggal_selesai, t.prioritas, COALESCE(c.jumlah_comment, 0) AS jumlah_comment, case when t.is_done is false then 'on-going' else 'done' end as status FROM tugas t
            //     LEFT JOIN (SELECT tugas_id, COUNT(id) AS jumlah_tugas FROM sub_tugas where "deletedAt" isnull GROUP BY tugas_id) st ON t.id = st.tugas_id
            //     LEFT JOIN (SELECT tugas_id, COUNT(id) AS jumlah_comment FROM "comment" where "deletedAt" isnull GROUP BY tugas_id) c ON t.id = c.tugas_id
            //     where t."deletedAt" isnull ${filter}`, { type: QueryTypes.SELECT });
            
            const count = await sequelize.query(
                `SELECT t.id, COALESCE(st.jumlah_tugas, 0) AS jumlah_tugas, date(t.tanggal_mulai) as tanggal_mulai, date(t.tanggal_selesai) as tanggal_selesai, t.prioritas, COALESCE(c.jumlah_comment, 0) AS jumlah_comment,  COALESCE(ptu.jumlah_user, 0) AS jumlah_user,  case when t.is_done is false then 'on-going' else 'done' end as status FROM tugas t
                LEFT JOIN (SELECT tugas_id, COUNT(id) AS jumlah_tugas FROM sub_tugas where "deletedAt" isnull GROUP BY tugas_id) st ON t.id = st.tugas_id
                LEFT JOIN (SELECT tugas_id, COUNT(id) AS jumlah_comment FROM "comment" where "deletedAt" isnull GROUP BY tugas_id) c ON t.id = c.tugas_id
                LEFT JOIN (Select tugas_id, count(id) as jumlah_user from pool_tugas_user where "deletedAt" isnull GROUP BY tugas_id) ptu ON t.id = ptu.tugas_id
                where t."deletedAt" isnull ${filter} order by t."createdAt" desc limit ${per_page} offset ${offset};`, { type: QueryTypes.SELECT });

            for (let i = 0; i < hasil.length; i++) {
                for (let j = 0; j < count.length; j++) {
                    if (hasil[i].id == count[j].id) {
                        hasil[i].tanggal_mulai = count[j].tanggal_mulai
                        hasil[i].tanggal_selesai = count[j].tanggal_selesai
                        hasil[i].jumlah_tugas = count[j].jumlah_tugas
                        hasil[i].jumlah_comment = count[j].jumlah_comment
                        hasil[i].jumlah_user = count[j].jumlah_user
                        hasil[i].status = count[j].status
                        break
                    }
                }
            }

            const hasils = {
                count:hasil_count.length,
                rows:hasil
            }

            res
            .status(HttpStatusCode.Ok)
            .json(results(hasils, HttpStatusCode.Ok, {req: req}))
        } catch (err) {
            console.log(err)
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
            const tugases = await sequelize.query(
                `select t.id, t.judul, t.kategori, date(t.tanggal_mulai) as tanggal_mulai, date(t.tanggal_selesai) as tanggal_selesai, t.prioritas, 
                case when t.is_done is false then 'on-going' else 'done' end as status  from tugas t 
                where t.id = ?`, { replacements:[id],type: QueryTypes.SELECT });
            const tugas = tugases[0] || null
            if (!tugas) {
                const err = new Error('Tugas tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }
            tugas.tags = await sequelize.query(
                `select mtt.id, mtt.nama, mtt.color  from master_tugas_tags mtt 
                join pool_tugas_tags ptt on ptt.tag_id = mtt.id
                join tugas t on t.id  = ptt.tugas_id 
                where t.id = ? and mtt."deletedAt" isnull
                `, { replacements:[id],type: QueryTypes.SELECT });
            tugas.users = await sequelize.query(
                `select mu.id, mu.nama_lengkap, mr.nama as nama_role, mu.foto_profile  from master_user mu 
                join pool_tugas_user ptu on ptu.user_id = mu.id 
                join tugas t on t.id  = ptu.tugas_id 
                join master_role mr on mr.id = mu.role_id 
                where t.id = ? and mu."deletedAt" isnull
                `, { replacements:[id],type: QueryTypes.SELECT });
            tugas.sub_tugas = await sequelize.query(
                `select st.id as sub_tugas_id, st.category_id, mk.nama as nama_kategori, mk.deskripsi as deskripsi_kategori, st.judul, date(st.tanggal_selesai) as tanggal_selesai, coalesce(st.status,'') as status, st.user_id, mu.nama_lengkap, mu.foto_profile, st.is_done, st.alasan  from sub_tugas st 
                join master_user mu on mu.id = st.user_id
                join master_tugas_category mk on mk.id = st.category_id
                where st.tugas_id = ? and st."deletedAt" isnull
                order by st."createdAt" `, { replacements:[id],type: QueryTypes.SELECT });
            
            let count = 0
            for (let i = 0; i < tugas.sub_tugas.length; i++) {
                if (tugas.sub_tugas[i].is_done) {
                    count ++
                }
            }
            tugas.sub_tugas_progress = `${((count / tugas.sub_tugas.length) * 100).toFixed(2)}%`

            tugas.daily_reports = []
            // tugas.daily_reports = await sequelize.query(
            //     `select st.judul, st.tanggal_selesai, st.status, st.is_done, st.alasan  from sub_tugas st 
            //     where st.tugas_id = ? and st."deletedAt" isnull
            //     order by st.count `, { replacements:[id],type: QueryTypes.SELECT });   

            tugas.comments = await sequelize.query(
                `select c.id as comment_id, mu.nama_lengkap, mu.foto_profile, mr.nama as nama_role, c."comment", c."createdAt" from "comment" c 
                join master_user mu ON mu.id = c.user_id 
                join master_role mr on mr.id = mu.role_id 
                where c."deletedAt" is null and c.tugas_id = ?
                order by c."createdAt" `, { replacements:[id],type: QueryTypes.SELECT });

            tugas.histories = await sequelize.query(
                `select th.keterangan from tugas_history th
                where th."deletedAt" is null and th.tugas_id = ?
                order by th."createdAt" `, { replacements:[id],type: QueryTypes.SELECT });
            res
            .status(HttpStatusCode.Ok)
            .json(results(tugas, HttpStatusCode.Ok))
        } catch (err) {
            console.log(err)
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
            const tugas = await Tugas.findOne({ where: { id: req.params.id } });
            if (!tugas) {
                const err = new Error('Tugas tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }
            await TugasHistory.destroy({where:{tugas_id: tugas.id}, transaction:t})
            await Comment.destroy({where:{tugas_id: tugas.id}, transaction:t})
            await PoolTugasTags.destroy({where:{tugas_id: tugas.id}, transaction:t})
            await PoolTugasTags.destroy({where:{tugas_id: tugas.id}, transaction:t})
            await SubTugas.destroy({where:{tugas_id: tugas.id}, transaction:t})
            await tugas.destroy({ where: { id: req.params.id }})

            await t.commit()
            res
            .status(HttpStatusCode.Ok)
            .json(results(tugas, HttpStatusCode.Ok))
        } catch (err) {
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
            let id = req.params.id
            let { judul, kategori, tanggal_mulai, tanggal_selesai, prioritas } = req.body

            const tugas = await Tugas.findByPk(id)
            if (!tugas) {
                const err = new Error('Tugas tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            await tugas.update({ judul, kategori, tanggal_mulai, tanggal_selesai, prioritas })
            
            await t.commit();
    
            res.status(HttpStatusCode.Ok).json(results(tugas, HttpStatusCode.Ok));
        } catch (err) {
            if (t) await t.rollback();
            console.log(err);
            err.code = err.code || HttpStatusCode.InternalServerError;
            res.status(err.code).json(results(null, err.code, { err }));
        }
    }
}

export default Controller;