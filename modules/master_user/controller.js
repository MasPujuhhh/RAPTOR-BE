import User from './model.js';
import  enkrip  from '../../helper/enkrip.js';
import jwt from '../../helper/jwt.js';
import { nanoid } from 'nanoid'
import sequelize from '../../config/connection.js';
import { QueryTypes } from 'sequelize';
import { results, paginateArray } from '../../helper/api.js';
import { HttpStatusCode } from 'axios';
import sharp from 'sharp';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Controller{
    static async login(req, res){
        try {
            let {email, password} = req.body;
            let user = await User.findOne({
                where:{
                    email
                }
            });
            if(!user){
                const err = new Error('Email tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }
            let cekPass = await enkrip.compare(password, user.dataValues.password)
            if(!cekPass){
                const err = new Error('Password tidak sesuai!!')
                err.code = HttpStatusCode.BadRequest
                throw err
            }
            const hasil = await sequelize.query(`select mu.*, mr.nama , mr.alias, mr.head  from master_user mu 
                join master_role mr on mr.id  = mu.role_id
                where mu."deletedAt" isnull and mu.id = '${user.id}'`, { type: QueryTypes.SELECT });
            hasil[0].token = jwt.enkrip(hasil[0])
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

    static async createUser(req, res){
        try {
            let {email, password, nama_lengkap, is_active, telepon, alamat, jenis_bank, no_rek, lokasi, tipe, role_id } = req.body;
            let user = await User.findOne({where:{email}})
            if (user) {
                const err = new Error('Data user sudah ada!!')
                err.code = HttpStatusCode.NotFound
        
                throw err
            }
            password = await enkrip.enkrip(password);
            let hasil = await User.create({id:nanoid(), email, password, nama_lengkap, is_active, telepon, alamat, jenis_bank, no_rek, foto_profile:`/assets/img/pp-kosong.jpg`, lokasi, tipe, role_id } );
            res
            .status(HttpStatusCode.Ok)
            .json(results(hasil, HttpStatusCode.Ok))
        } catch (err) {
            err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }

    static async all(req, res){
        try {
        let user = req.user

            let list = ['PDL','HDI','AAF']
            if (!list.includes(req.user.nama)) {
                user.nama = null
            }

            let filter = ''
            let head = user.nama

            if (head) {
                filter += `and head = '${head}'`
            }
            const hasil = await sequelize.query(`select mu.*, mr.nama , mr.alias, mr.head  from master_user mu 
                join master_role mr on mr.id  = mu.role_id
                where mu."deletedAt" isnull ${filter} order by mu.nama_lengkap`, { type: QueryTypes.SELECT });
            res
            .status(HttpStatusCode.Ok)
            .json(results(hasil, HttpStatusCode.Ok, {req: req}))
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

            let list = ['PDL','HDI','AAF']
            if (!list.includes(req.user.nama)) {
                user.nama = null
            }

            let filter = ''
            let head = user.nama

            console.log(head)
            if (head) {
                filter += `and (head = '${head}' or mu.id = '${user.id}')`
            }
            const hasil = await sequelize.query(`select mu.*, mr.nama , mr.alias, mr.head from master_user mu 
                join master_role mr on mr.id  = mu.role_id
                where mu."deletedAt" isnull ${filter} order by mu.nama_lengkap`, { type: QueryTypes.SELECT });
            res
            .status(HttpStatusCode.Ok)
            .json(results(hasil, HttpStatusCode.Ok, {req: req}))
        } catch (err) {
            console.log(err)
            err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        } 
    }

    static async allRole(req, res){
        try {
            let user = req.user

            let list = ['PDL','HDI','AAF']
            if (!list.includes(req.user.role_perusahaan)) {
                user.role_perusahaan = null
            }

            let filter = ''
            let role_perusahaan_parent = user.role_perusahaan

            if (role_perusahaan_parent) {
                filter += `and role_perusahaan_parent = '${role_perusahaan_parent}'`
            }
            const hasil = await sequelize.query(`SELECT role_perusahaan, role_perusahaan_alias from master_user where "deletedAt" is null and is_active 
                is true ${filter} group by role_perusahaan, role_perusahaan_alias order by role_perusahaan_alias;`, { type: QueryTypes.SELECT });
            res
            .status(HttpStatusCode.Ok)
            .json(results(hasil, HttpStatusCode.Ok, {req: req}))
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
            const offset = (page - 1) * per_page

            let user = req.user

            let list = ['PDL','HDI','AAF']
            if (!list.includes(user.role_perusahaan)) {
                user.role_perusahaan = null
            }

            let filter = ''
            let nama_lengkap = req.query.nama_lengkap || null
            let lokasi = req.query.lokasi || null
            let alias =  req.query.alias || null
            let tipe =  req.query.tipe || null

            if (nama_lengkap) {
                filter += `and nama_lengkap ilike '%${nama_lengkap}%'`
            }
            if (lokasi) {
                filter += `and lokasi = '${lokasi}'`
            }
            if (alias) {
                filter += `and mr.alias ilike '%${alias}%'`
            }
            if (tipe) {
                filter += `and mu.tipe = '${tipe}'`
            }
            let role_perusahaan_parent = user.role_perusahaan
            if (role_perusahaan_parent) {
                filter += `and role_perusahaan_parent = '${role_perusahaan_parent}'`
            }
            const hasil_count = await sequelize.query(`select mu.*, mr.nama , mr.alias, mr.head  from master_user mu 
            join master_role mr on mr.id  = mu.role_id
            where mu."deletedAt" isnull ${filter}`, { type: QueryTypes.SELECT });
            const hasil = await sequelize.query(`select mu.*, mr.nama , mr.alias, mr.head  from master_user mu 
            join master_role mr on mr.id  = mu.role_id
            where mu."deletedAt" isnull ${filter}  order by mu.nama_lengkap limit ${per_page} offset ${offset};`, { type: QueryTypes.SELECT });
            // const hasil = await sequelize.query(`SELECT * from master_user where "deletedAt" is null ${filter} order by nama_lengkap limit ${per_page} offset ${offset};`, { type: QueryTypes.SELECT });

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

    static async detailByToken(req, res){
        try {
            const hasil = await User.findOne({ where: { id: req.user.id } });
            if (!hasil) {
                const err = new Error('Data user tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
        
                throw err
              }

              const user = await sequelize.query(`select mu.*, mr.nama , mr.alias, mr.head from master_user mu 
                join master_role mr on mr.id  = mu.role_id
                where mu."deletedAt" isnull and mu.id = '${hasil.id}'`, { type: QueryTypes.SELECT });
            res
            .status(HttpStatusCode.Ok)
            .json(results(user[0], HttpStatusCode.Ok))
        } catch (err) {
            console.log(err)
            err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        } 
    }

    static async detailById(req, res){
        try {
            const hasil = await User.findOne({ where: { id: req.params.id } });
            if (!hasil) {
                const err = new Error('Data user tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
        
                throw err
              }
              const user = await sequelize.query(`select mu.*, mr.nama , mr.alias, mr.head from master_user mu 
                join master_role mr on mr.id  = mu.role_id
                where mu."deletedAt" isnull and mu.id = '${hasil.id}'`, { type: QueryTypes.SELECT });
            res
            .status(HttpStatusCode.Ok)
            .json(results(user[0], HttpStatusCode.Ok))
        } catch (err) {
            err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        } 
    }

    static async deleteUser(req, res){
        try {
            const hasil = await User.findOne({ where: { id: req.params.id } });
            if (!hasil) {
                const err = new Error('Data user tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }
            console.log(hasil)
            await hasil.destroy({ where: { id: req.params.id }})
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

    static async editUser(req, res){
        try {
            let {email, password, nama_lengkap, is_active, telepon, alamat, jenis_bank, no_rek, lokasi, tipe, role_id } = req.body;
            let payload = {email, nama_lengkap, is_active, telepon, alamat, jenis_bank, no_rek, lokasi, tipe, role_id }

            let access = ['SPR','CEO','HDI','AAF','PDL']

            let id = null
            if (req.user) {
                id = req.user.id
            }
            if (req.params.id !== ':id' && (access.includes(req.user.nama))) {
                id = req.params.id
                if (password) {
                    payload.password = await enkrip.enkrip(password)
                }
            }

            let cek_data = await sequelize.query(`SELECT * from master_user where "deletedAt" is null;`, { type: QueryTypes.SELECT })
            const user = await User.findByPk(id)
            if (!user) {
                const err = new Error('Data user tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            for (let i = 0; i < cek_data.length; i++) {
                if (cek_data[i].email == email && cek_data[i].email != user.email) {
                    const err = new Error('Email sudah digunakan!!')
                    err.code = HttpStatusCode.BadRequest
                    throw err
                }
            }

            await user.update(payload)

            res
            .status(HttpStatusCode.Ok)
            .json(results(user, HttpStatusCode.Ok))
        } catch (err) {
            console.log(err)
            err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
    }

    static async changePassword(req, res){
        try {
            const {old_pass, new_pass, validate} = req.body
            const id = req.user.id

            const hasil = await User.findOne({ where: { id } });
            if (!hasil) {
                const err = new Error('Data user tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                
                throw err
            }

            if (!await enkrip.compare(old_pass, hasil.dataValues.password)) {
                const err = new Error('Password lama salah!!')
                err.code = HttpStatusCode.BadRequest         
                throw err
            }

            if (new_pass !== validate) {
                const err = new Error('Validasi Password salah')
                err.code = HttpStatusCode.BadRequest         
                throw err
            }

            await hasil.update({password:await enkrip.enkrip(new_pass)})

            res
            .status(HttpStatusCode.Ok)
            .json(results(hasil, HttpStatusCode.Ok))
        } catch (err) {
            err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        } 
    }

    static async changePicture(req, res){
        const storage = multer.memoryStorage();
        const upload = multer({ storage: storage });

        upload.single('foto_profil')(req, res, async function (err) {
            try {
                if (err instanceof multer.MulterError) {
                    console.log(err)
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
                    const user = await User.findByPk(id);
                    if (!user) {
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

                    const filename = user.id + '-' + Date.now() + '.jpg';
                    fs.writeFileSync(`assets/img/pp-${filename}`, compressedImageBuffer);

                    await user.update({foto_profile:`/assets/img/pp-${filename}`})

                    res.status(HttpStatusCode.Ok).json(results(user, HttpStatusCode.Ok));
                } catch (err) {
                    console.log(err)
                    err.code =
                    typeof err.code !== 'undefined' && err.code !== null
                    ? err.code
                    : HttpStatusCode.InternalServerError
                res.status(err.code).json(results(null, err.code, { err }))
                }
            } catch (err) {
                console.error(err);
                err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
            }
        });
    }

    static async hapusGambar(req, res){
        try {
            const user = req.user
            const hasil = await User.findByPk(user.id)
            if (!hasil) {
                const err = new Error('Data user tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }
            await hasil.update({ foto_profile:'/assets/img/pp-kosong.jpg'})
            res
            .status(HttpStatusCode.Ok)
            .json(results(hasil, HttpStatusCode.Ok))
        } catch (err) {
            err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        } 
    }
}

export default Controller;