import Role from './model.js';
import enkrip  from '../../helper/enkrip.js';
import jwt from '../../helper/jwt.js';
import { nanoid } from 'nanoid'
import sequelize from '../../config/connection.js';
import { QueryTypes } from 'sequelize';
import { results, paginateArray } from '../../helper/api.js';
import { HttpStatusCode } from 'axios';

class Controller{
    static async add(req, res){
        try {
            let {nama, alias, head} = req.body;
            const hasil = await Role.create({id:nanoid(), nama, alias, head})
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

    static async all(req, res){
        try {
            let filter = ''
            let nama = req.query.nama || null

            if (nama) {
                filter += `and nama ilike '%${nama}%'`
            }
            const hasil = await sequelize.query(`SELECT id, nama, alias, head from master_role where "deletedAt" is null ${filter} order by nama`, { type: QueryTypes.SELECT });
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

            let filter = ''
            let alias = req.query.alias || null

            if (alias) {
                filter += `and alias ilike '%${alias}%'`
            }
            const hasil_count = await sequelize.query(`SELECT * from master_role where "deletedAt" is null ${filter};`, { type: QueryTypes.SELECT });
            const hasil = await sequelize.query(`SELECT * from master_role where "deletedAt" is null ${filter} order by alias limit ${per_page} offset ${offset};`, { type: QueryTypes.SELECT });

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
            const hasil = await Role.findOne({ where: { id: req.params.id } });
            if (!hasil) {
                const err = new Error('Role tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
              }
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
        try {
            const hasil = await Role.findOne({ where: { id: req.params.id } });
            if (!hasil) {
                const err = new Error('Role tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }
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

    static async edit(req, res){
        try {
            let {nama, alias, head } = req.body;
            let id = req.params.id


            const Category = await Role.findByPk(id)
            if (!Category) {
                const err = new Error('Tags tidak ditemukan!!')
                err.code = HttpStatusCode.NotFound
                throw err
            }

            await Category.update({nama, alias, head})

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