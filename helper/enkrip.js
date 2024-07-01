import bcrypt from 'bcrypt';

class Enkrip{
    static enkrip(password){
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, function(err, hash) {
                if(err){
                    reject(err);
                }else{
                    resolve(hash);
                }
            });
        })
      
    }

    static compare(passwordText, passwordHash){
        return new Promise((resolve, reject) => {
            bcrypt.compare(passwordText, passwordHash, function(err, result) {
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        })
    }
}

export default Enkrip;