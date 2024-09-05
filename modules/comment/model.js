import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

import UserModel from "../master_user/model.js";
import Tugas from "../tugas/model.js";

// class User extends Model {}
const Comment = sequelize.define('comment', {
        // Model attributes are defined here
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        tugas_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        comment: {
          type: DataTypes.TEXT
        },
        file: {
          type: DataTypes.STRING
        }
      }, {
        freezeTableName:true,
        paranoid:true,
      }
)

Comment.belongsTo(UserModel, { foreignKey: 'user_id' });
UserModel.hasMany(Comment, { foreignKey: 'user_id' });

Comment.belongsTo(Tugas, { foreignKey: 'tugas_id' });
Tugas.hasMany(Comment, { foreignKey: 'tugas_id' });

export default Comment