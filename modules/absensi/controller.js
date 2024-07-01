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
import fs from 'fs';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

import Absensi from './model.js';
import Tugas from '../tugas/model.js';
import User from '../master_user/model.js';

class AbsensiController{

    static async addAbsensi(req, res){
        const storage = multer.memoryStorage();
        const upload = multer({ storage: storage });
        upload.single('foto_absensi')(req, res, async function (err) {
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
                    const keterangan = req.body.keterangan || null
                    const absensi_id = req.body.absensi_id || null
                    const absen = await Absensi.findByPk(absensi_id);
                    if (!absen) {
                        const error = new Error('Data user tidak ditemukan!!');
                        error.code = HttpStatusCode.NotFound;
                        throw error;
                    }
                    const foto_profil = req.file ? req.file.buffer : null;
                    if (!foto_profil) {
                        const error = new Error('Tidak ada gambar');
                        error.code = HttpStatusCode.BadRequest;
                        throw error;
                    }

                    const compressedImageBuffer = await sharp(foto_profil)
                        .resize(400, 400)
                        .toBuffer();

                    const filename = absen.id + '-' + Date.now() + '.jpg';
                    fs.writeFileSync(`assets/img/absensi-${filename}`, compressedImageBuffer);
                    await absen.update({foto_absen:`/assets/img/absensi-${filename}`, keterangan})
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
            const per_page = req.query.per_page || 10
            const page = req.query.page || 1
            const offset = (page - 1) * per_page

            let filter = ''
            let user_id = req.query.user_id || null
            let tanggal_mulai = req.query.tanggal_mulai || null
            let tanggal_selesai = req.query.tanggal_selesai || null

            if (user_id) {
                filter += `and user_id ilike '%${user_id}%'`
            }
            if (tanggal_mulai) {
                filter += `and jadwal >= '${tanggal_mulai}'`
            }
            if (tanggal_selesai) {
                filter += `and jadwal <= '${tanggal_selesai}'`
            }

            const hasil_count = await sequelize.query(`SELECT * from absensi where "deletedAt" isnull ${filter};`, { type: QueryTypes.SELECT });
            const hasil = await sequelize.query(`SELECT * from absensi where "deletedAt" isnull ${filter} limit ${per_page} offset ${offset};`, { type: QueryTypes.SELECT });

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
}

export default AbsensiController;