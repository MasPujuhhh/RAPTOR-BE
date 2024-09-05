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


import Comment from './model.js';
import Tugas from '../tugas/model.js';
import User from '../master_user/model.js';


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


class CommentContreller{

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

    static async uploadImage(req, res){
        const storage = multer.memoryStorage();
        const upload = multer({ storage: storage });

        upload.single('file')(req, res, async function (err) {
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
                    const user_id = req.user.id;
                    const user = await User.findByPk(user_id);
                    if (!user) {
                        const error = new Error('Data user tidak ditemukan!!');
                        error.code = HttpStatusCode.NotFound;
                        throw error;
                    }

                    const {tugas_id, comment} = req.body
                    const tugas = await Tugas.findByPk(tugas_id);
                    if (!tugas) {
                        const error = new Error('Data tugas tidak ditemukan!!');
                        error.code = HttpStatusCode.NotFound;
                        throw error;
                    }
                    const file = req.file ? req.file.buffer : null;
                    if (!file) {
                        const error = new Error('Tidak ada file');
                        error.code = HttpStatusCode.BadRequest;
                        throw error;
                    }

                    const compressedImageBuffer = await sharp(file)
                        .resize(400, 400)
                        .toBuffer();

                    const filename = user.id + '-' + Date.now() + '.jpg';
                    fs.writeFileSync(`assets/img/doc-comment-${filename}`, compressedImageBuffer);

                    // await user.update({file:`/assets/img/doc-comment-${filename}`})

                    let comments = await Comment.create({id:nanoid(), user_id, tugas_id, file : `/assets/img/doc-comment-${filename}`, comment})


                    res.status(HttpStatusCode.Ok).json(results(comments, HttpStatusCode.Ok));
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

    static async editComment(req, res){
        try {

            const id = req.params.comment_id
            const user_id = req.user.id
            const comment = req.body.comment

            // console.log(id)
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
        const id = req.params.comment_id
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