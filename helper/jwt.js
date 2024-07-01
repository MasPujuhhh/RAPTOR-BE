import jwt from 'jsonwebtoken';
let key = process.env.JWT_KEY;
class Jwt{
    static enkrip(data){
        var token = jwt.sign(data, key);
        return token;
    }

    static verify(token){
        return new Promise((resolve, reject) => {
            jwt.verify(token, key, function(err, decoded) {
                if(err){
                    reject(err);
                }else{
                    resolve(decoded);
                }
              });
        })
    }

}

export default Jwt;