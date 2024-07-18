import Pengumuman from './model.js';
import PoolPengumumansUser from '../pool_pengumuman_user/model.js';
import PengumumanFile from '../pengumuman_file/model.js';
import User from '../master_user/model.js';
import enkrip  from '../../helper/enkrip.js';
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
const upload = multer({ storage: storage }).array('files', 5); // Allow up to 5 files

const __dirname = path.resolve();

class Controller{
    static async add(req, res) {
        const storage = multer.memoryStorage();
        const upload = multer({ storage: storage }).array('files', 5); // Allow up to 5 files

        const __dirname = path.resolve();
        const t = await sequelize.transaction();
        try {
          await new Promise((resolve, reject) => {
            upload(req, res, (err) => {
              if (err instanceof multer.MulterError) {
                console.log(err)
                reject(new Error('Terjadi kesalahan saat mengunggah file.'));
              } else if (err) {
                reject(new Error(err.message));
              } else {
                resolve();
              }
            });
          });
      
          const id = req.user.id;
          const user = await User.findByPk(id);
          const { judul, deskripsi } = req.body;
      
          if (!user) {
            const error = new Error('Data user tidak ditemukan!!');
            error.code = HttpStatusCode.NotFound;
            throw error;
          }
      
          const files = req.files || [];
          const pengumuman = await Pengumuman.create({
            id: nanoid(),
            judul,
            deskripsi,
            created_by: user.nama_lengkap,
          }, { transaction: t });
      
          const payload_user = [];
          const users = await sequelize.query(`SELECT id FROM master_user WHERE "deletedAt" IS NULL AND is_active IS TRUE`, { type: QueryTypes.SELECT });
      
          users.forEach((user) => {
            payload_user.push({
              id: nanoid(),
              user_id: user.id,
              pengumuman_id: pengumuman.id,
              is_read: false,
            });
          });
      
          await PoolPengumumansUser.bulkCreate(payload_user, { transaction: t });
      
          const payload_file = [];
          const imgDir = path.resolve(__dirname, 'assets', 'img');
      
          if (!fs.existsSync(imgDir)) {
            fs.mkdirSync(imgDir, { recursive: true });
          }
      
          for (let i = 0; i < files.length; i++){
            const filename = `${Date.now()}XXX${pengumuman.judul.replace(/[^a-zA-Z0-9]/g, '_')}${i+1}.${files[i].mimetype.split('/')[1]}`;
            const filepath = `assets/img/${filename}`
      
            try {
              fs.writeFileSync(filepath, files[i].buffer);
              payload_file.push({
                id: nanoid(),
                file: `/assets/img/${filename}`,
                pengumuman_id: pengumuman.id,
              });
            } catch (fileErr) {
              const error = new Error(`Error writing file ${filepath}:`, fileErr);
              error.code = HttpStatusCode.BadRequest;
              throw error;
            }
          }
      
          await PengumumanFile.bulkCreate(payload_file, { transaction: t });
      
          await t.commit();
          res.status(HttpStatusCode.Ok).json(results(pengumuman, HttpStatusCode.Ok))
        } catch (err) {
          console.log(err);
          await t.rollback()
          err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
      };

    static async list(req, res){
        try {
            const per_page = req.query.per_page || 10
            const page = req.query.page || 1
            const offset = (page - 1) * per_page

            let filter = ''
            let judul = req.query.judul || null

            if (judul) {
                filter += `and judul ilike '%${judul}%'`
            }
            const hasil_count = await sequelize.query(`SELECT * from pengumuman where "deletedAt" is null ${filter};`, { type: QueryTypes.SELECT });
            const hasil = await sequelize.query(`SELECT * from pengumuman where "deletedAt" is null ${filter} order by "createdAt" desc limit ${per_page} offset ${offset};`, { type: QueryTypes.SELECT });

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
    
    static async allByToken(req, res){
        try {
          let me = req.user
            const hasil = await sequelize.query(`
              select p.*, ppu.user_id, ppu.is_read  from pengumuman p 
              join pool_pengumuman_user ppu on ppu.pengumuman_id = p.id
              where p."deletedAt" isnull and ppu.user_id = '${me.id}'
              order by p."createdAt" desc`, { type: QueryTypes.SELECT });
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

    static async readPengumuman(req, res){
        try {
          let me = req.user
          let id = req.params.id
          const pengumuman = await Pengumuman.findByPk(id)
          if (!pengumuman) {
              const err = new Error('Pengumuman tidak ditemukan!!')
              err.code = HttpStatusCode.NotFound
              throw err
          }

          const pengumuman_detail = await PoolPengumumansUser.findOne({where:{user_id:me.id, pengumuman_id:pengumuman.id}})
            // await pengumuman.update({is_read:true})
            console.log(pengumuman_detail)
            await pengumuman_detail.update({is_read:true})
            
            res
            .status(HttpStatusCode.Ok)
            .json(results(pengumuman_detail, HttpStatusCode.Ok, {req: req}))
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
            const hasil = await Pengumuman.findOne({ where: { id: req.params.id } });
            if (!hasil) {
                const err = new Error('Pengumuman tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            const files = await PengumumanFile.findAll({where :{pengumuman_id:hasil.id, deletedAt:null}})
            hasil.dataValues.files = files

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

    static async delete(req, res){
        const t = await sequelize.transaction()
        try {
            const hasil = await Pengumuman.findOne({ where: { id: req.params.id } });
            if (!hasil) {
                const err = new Error('Pengumuman tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }
            await PengumumanFile.destroy({where: {pengumuman_id: req.params.id}, transaction:t})
            await PoolPengumumansUser.destroy({where: {pengumuman_id: req.params.id}, transaction: t})
            await hasil.destroy({ where: { id: req.params.id }, transaction:t})

            await t.commit()
            res
            .status(HttpStatusCode.Ok)
            .json(results(hasil, HttpStatusCode.Ok))
        } catch (err) {
            await t.rollback()
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
            let {nama, alias } = req.body;
            let id = req.params.id

            if(!nama || nama=='' ){
                const err = new Error('nama harus diisi!!')
                err.code = HttpStatusCode.BadRequest
                throw err
            }

            const Category = await Pengumuman.findByPk(id)
            if (!Category) {
                const err = new Error('Tags tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            await Category.update({nama, alias})

            res
            .status(HttpStatusCode.Ok)
            .json(results(Category, HttpStatusCode.Ok))
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

export default Controller;