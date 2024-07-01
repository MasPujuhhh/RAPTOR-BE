import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

import UserModel from "../master_user/model.js";

// class User extends Model {}
const Absensi = sequelize.define('absensi', {
        // Model attributes are defined here
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.STRING,
        },
        foto_absen: {
          type: DataTypes.STRING,
        },
        jadwal: {
          type: DataTypes.DATE,
        },
        keterangan: {
          type: DataTypes.ENUM('masuk','wfh','izin/sakit')
        }
      }, {
        freezeTableName:true,
        paranoid:true,
      }
)

Absensi.belongsTo(UserModel, { foreignKey: 'user_id' });
UserModel.hasMany(Absensi, { foreignKey: 'user_id' });

export default Absensi