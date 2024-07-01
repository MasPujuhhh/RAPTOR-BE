import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

import UserModel from "../master_user/model.js";

// class User extends Model {}
const Pengumuman = sequelize.define('pengumuman', {
        // Model attributes are defined here
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        judul: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        deskripsi: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        created_by: {
          type: DataTypes.STRING,
          allowNull: false,
        },

      }, {
        freezeTableName:true,
        paranoid:true,
      }
)

export default Pengumuman