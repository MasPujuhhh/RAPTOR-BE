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
        foto_dokumen: {
          type: DataTypes.STRING,
        },
        foto_absen_pagi: {
          type: DataTypes.STRING,
        },
        foto_absen_sore: {
          type: DataTypes.STRING,
        },
        check_in: {
          type: DataTypes.DATE,
        },
        check_out: {
          type: DataTypes.DATE,
        },
        koordinat: {
          type: DataTypes.JSON,
        },
        jadwal: {
          type: DataTypes.DATE,
        },
        status: {
          type: DataTypes.ENUM('masuk','wfh','izin','sakit')
        }
      }, {
        freezeTableName:true,
        paranoid:true,
      }
)

Absensi.belongsTo(UserModel, { foreignKey: 'user_id' });
UserModel.hasMany(Absensi, { foreignKey: 'user_id' });

export default Absensi