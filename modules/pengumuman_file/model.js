import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

import UserModel from "../master_user/model.js";
import Pengumuman from "../pengumuman/model.js";

// class User extends Model {}
const PengumumanFile = sequelize.define('pengumuman_file', {
        // Model attributes are defined here
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        pengumuman_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        file: {
          type: DataTypes.STRING,
          allowNull: false,
        }
      }, {
        freezeTableName:true,
        paranoid:true,
      }
)

PengumumanFile.belongsTo(Pengumuman, { foreignKey: 'pengumuman_id' });
Pengumuman.hasMany(PengumumanFile, { foreignKey: 'pengumuman_id' });

export default PengumumanFile