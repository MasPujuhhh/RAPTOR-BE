import  enkrip  from '../../helper/enkrip.js';
import jwt from '../../helper/jwt.js';
import { nanoid } from 'nanoid'
import sequelize from '../../config/connection.js';
import { QueryTypes, where } from 'sequelize';
import { results, paginateArray } from '../../helper/api.js';
import { HttpStatusCode } from 'axios';
import sharp from 'sharp';
import multer from 'multer';
import path from 'path';
import fs, { stat } from 'fs';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

import Absensi from './model.js';
import Tugas from '../tugas/model.js';
import User from '../master_user/model.js';

class AbsensiController{

    static async addAbsensi(req, res){
        const storage = multer.memoryStorage();
        const upload = multer({ storage: storage });
        upload.single('foto')(req, res, async function (err) {
            try {
                if (err instanceof multer.MulterError) {
                    const error = new Error('Terjadi kesalahan saat mengunggah gambar.');
                    error.code = HttpStatusCode.BadRequest;
                    throw error;
                } else if (err) {
                    const error = new Error(err.message);
                    error.code = HttpStatusCode.BadRequest;
                    throw error;
                }
                try {
                    const id = req.user.id;
                    const status = req.body.status || null
                    const absensi_id = req.body.absensi_id || null
                    const check_in = req.body.check_in || null
                    const check_out = req.body.check_out || null
                    const koordinat = req.body.koordinat || null
                    const tipe = req.body.tipe || null
                    const absen = await Absensi.findByPk(absensi_id);
                    if (!absen) {
                        const error = new Error('Data Absen tidak ditemukan!!');
                        error.code = HttpStatusCode.NotFound;
                        throw error;
                    }

                    const foto = req.file ? req.file.buffer : null;
                    if ((status != 'izin' && status != 'sakit')) {
                        if (!foto) {
                            const error = new Error('Tidak ada gambar');
                            error.code = HttpStatusCode.BadRequest;
                            throw error;
                        }   
                    }

                    if (check_in) {
                        if (!foto) {
                            const error = new Error('Tidak ada gambar');
                            error.code = HttpStatusCode.BadRequest;
                            throw error;
                        }  
                    }
                    
                    let compressedImageBuffer = null
                    if (foto) {
                        compressedImageBuffer = await sharp(foto)
                        .resize(400, 400)
                        .toBuffer();
                    }
                    

                    const filename = absen.id + '-' + Date.now() + '.jpg';
                        
                    let payload = {}
                    if (check_in) {
                        payload.status = status
                        payload.check_in = check_in
                        if (status == 'masuk' || status == 'wfh') {
                            fs.writeFileSync(`assets/img/absen-pagi-${filename}`, compressedImageBuffer);
                            payload.foto_absen_pagi = `/assets/img/absen-pagi-${filename}`
                            payload.koordinat = koordinat
                        }
                        else if (status == 'izin') {
                            fs.writeFileSync(`assets/img/absen-izin-${filename}`, compressedImageBuffer);
                            payload.foto_dokumen = `/assets/img/absen-izin-${filename}`
                            payload.koordinat = koordinat
                        }
                        else {
                            fs.writeFileSync(`assets/img/absen-sakit-${filename}`, compressedImageBuffer);
                            payload.foto_dokumen = `/assets/img/absen-sakit-${filename}`
                            payload.koordinat = koordinat
                        }
                    }

                    if (check_out) {
                        payload.check_out = check_out
                        if (status == 'masuk' || status == 'wfh') {
                            fs.writeFileSync(`assets/img/absen-sore-${filename}`, compressedImageBuffer);
                            payload.foto_absen_sore = `/assets/img/absen-sore-${filename}`
                        }
                    }

                    await absen.update(payload)
                    res.status(HttpStatusCode.Ok).json(results(absen, HttpStatusCode.Ok));
                } catch (err) {
                    console.log(err)
                    err.code =
                    typeof err.code !== 'undefined' && err.code !== null
                    ? err.code
                    : HttpStatusCode.InternalServerError
                res.status(err.code).json(results(null, err.code, { err }))
                }
            } catch (err) {
                console.log(err)
                err.code =
                typeof err.code !== 'undefined' && err.code !== null
                ? err.code
                : HttpStatusCode.InternalServerError
            res.status(err.code).json(results(null, err.code, { err }))
            }
        });
    }


    static async list(req, res){
        try {
            const per_page = req.query.per_page || 25
            const page = req.query.page || 1
            const offset = (page - 1) * per_page

            let filter = ''
            let user_id = req.query.user_id || null
            let tanggal_mulai = req.query.tanggal_mulai || null
            let tanggal_selesai = req.query.tanggal_selesai || null

            if (user_id) {
                filter += `and a.user_id ilike '%${user_id}%'`
            }
            if (tanggal_mulai) {
                filter += `and date(a.jadwal) >= '${tanggal_mulai}'`
            }
            if (tanggal_selesai) {
                filter += `and date(a.jadwal) <= '${tanggal_selesai}'`
            }

            const hasil_count = await sequelize.query(`SELECT * from absensi a where "deletedAt" isnull ${filter};`, { type: QueryTypes.SELECT });
            const hasil = await sequelize.query(`select a.*, mu.nama_lengkap, case when date(a."createdAt") = date(a."updatedAt") then 'tepat-waktu' else 'terlambat' end as ketepatan
            from absensi a 
            join master_user mu on mu.id = a.user_id where a."deletedAt" isnull ${filter} order by a."createdAt" desc limit ${per_page} offset ${offset};`, { type: QueryTypes.SELECT });

            const hasils = {
                count:hasil_count.length,
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

    static async all(req, res){
        try {
            let filter = ''
            let user_id = req.query.user_id || null
            let tanggal_mulai = req.query.tanggal_mulai || null
            let tanggal_selesai = req.query.tanggal_selesai || null

            if (user_id) {
                filter += `and a.user_id ilike '%${user_id}%'`
            }
            if (tanggal_mulai) {
                filter += `and date(a.jadwal) >= '${tanggal_mulai}'`
            }
            if (tanggal_selesai) {
                filter += `and date(a.jadwal) <= '${tanggal_selesai}'`
            }

            const hasil = await sequelize.query(`select a.*, mu.nama_lengkap, case when date(a."createdAt") = date(a."updatedAt") then 'tepat-waktu' else 'terlambat' end as ketepatan
            from absensi a 
            join master_user mu on mu.id = a.user_id 
            where a."deletedAt" isnull and mu.is_active = true
             ${filter} order by a.jadwal asc, mu.nama_lengkap asc`, { type: QueryTypes.SELECT });

            res
            .status(HttpStatusCode.Ok)
            .json(results(hasil, HttpStatusCode.Ok, {req}))
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
            let user = req.user
            let filter = ''
            let user_id = req.query.user_id || null
            let tanggal_mulai = req.query.tanggal_mulai || null
            let tanggal_selesai = req.query.tanggal_selesai || null

            if (user_id) {
                filter += `and a.user_id ilike '%${user_id}%'`
            }
            if (tanggal_mulai) {
                filter += `and date(a.jadwal) >= '${tanggal_mulai}'`
            }
            if (tanggal_selesai) {
                filter += `and date(a.jadwal) <= '${tanggal_selesai}'`
            }

            let list = ['PDL','HDI','AAF']
            if (!list.includes(req.user.nama)) {
                user.nama = null
            }

            let head = user.nama

            console.log(head)
            if (head) {
                filter += `and (head = '${head}' or mu.id = '${user.id}')`
            }

            const hasil = await sequelize.query(`select a.*, mu.nama_lengkap, case when date(a."createdAt") = date(a."updatedAt") then 'tepat-waktu' else 'terlambat' end as ketepatan
            from absensi a 
            join master_user mu on mu.id = a.user_id 
            join master_role mr on mr.id = mu.role_id
            where a."deletedAt" isnull and mu.is_active = true
             ${filter} order by a.jadwal asc, mu.nama_lengkap asc`, { type: QueryTypes.SELECT });

            res
            .status(HttpStatusCode.Ok)
            .json(results(hasil, HttpStatusCode.Ok, {req}))
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
            const hasil = await Absensi.findByPk(id)

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

    static async checkAbesensiByDate(req, res){
        try {
            const jadwal = req.query.jadwal
            const me = req.user


            let filter = ''
            if (jadwal) {
                filter += `and date(jadwal) = '${jadwal}'`
            }
            let hasil = await sequelize.query(`SELECT * from absensi where "deletedAt" isnull and user_id = '${me.id}' ${filter};`, { type: QueryTypes.SELECT });
            if (!hasil.length) {
                hasil = [null]            
            }

            res
            .status(HttpStatusCode.Ok)
            .json(results(hasil[0], HttpStatusCode.Ok))
        } catch (err) {
            console.log(err)
        err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }
}

export default AbsensiController;