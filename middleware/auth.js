import jwt from '../helper/jwt.js'
import { results, paginateArray } from '../helper/api.js';
import { HttpStatusCode } from 'axios';
class Auth{
    static async verifikasiToken(req,res,next){
        try {
            let token = req.headers.authorization?.split(" ")
            if(!token){
                const err = new Error('Token diperlukan')
                err.code = HttpStatusCode.UnprocessableEntity
        
                throw err
            }
            let hasil = await jwt.verify(token[1]);
            if(!hasil){
                const err = new Error('Token tidak valid')
                err.code = HttpStatusCode.Unauthorized
        
                throw err
            }
            req.user = hasil;
            next()
        } catch (err) {
            err.code =
            typeof err.code !== 'undefined' && err.code !== null
            ? err.code
            : HttpStatusCode.InternalServerError
        res.status(err.code).json(results(null, err.code, { err }))
        }
       
    }

    static async verifikasiAdmin(req, res, next){
        try {
            let token = req.headers.authorization.split(" ")
            let hasil = await jwt.verify(token[1]);
            if(hasil.role == 1 || hasil.role == 2){
                // console.log('sd')
                req.user = hasil;
                next()
            } else{
                res.status(500).json({pesan:"anda tidak punya akses"})
            }
        } catch (error) {
            res.status(500).json({pesan:"token anda tidak valid 2"})
        }
    }

    static async verifikasiSuperAdmin(req, res, next){
        try {
            let token = req.headers.authorization.split(" ")
            let hasil = await jwt.verify(token[1]);
            if(hasil.role == 2){
                req.user = hasil;
                next()
            } else{
                res.status(500).json({pesan:"anda tidak punya akses"})
            }
        } catch (error) {
            res.status(500).json({pesan:"token anda tidak valid"})
        }
    }
}

export default Auth;