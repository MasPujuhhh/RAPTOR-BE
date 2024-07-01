import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

import Role from "../master_role/model.js";

// class User extends Model {}
const User = sequelize.define('master_user', {
        // Model attributes are defined here
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          // unique: true
        },
        password: {
          type: DataTypes.STRING,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
        },
        nama_lengkap: {
          type: DataTypes.STRING,
        },
        telepon: {
            type: DataTypes.STRING,
        },
        foto_profile: {
          type: DataTypes.STRING,
        },
        jenis_bank: {
          type: DataTypes.STRING,
        },
        no_rek: {
          type: DataTypes.STRING,
        },
        role_id: {
          type: DataTypes.STRING,
        },
        // role_perusahaan: {
        //   type: DataTypes.ENUM('SPR','CEO','PDL','HDI','AAF','BA','SA','UIX', 'FE', 'BE','STF','CRT'),
        // },
        // role_perusahaan_alias: {
        //   type: DataTypes.ENUM('Superadmin','Chief Executive Office','Product Development Leader','Head Division It','Accounting And Finance','Business Analyst','System Analyst', 'UI UX', 'Frontend Developer', 'Backend Developer', 'Staff Admin', 'Creative'),
        // },
        // role_perusahaan_parent: {
        //   type: DataTypes.ENUM('CEO','PDL','HDI','AAF'),
        // },
        tipe: {
          type: DataTypes.ENUM('Rapier Team', 'Magang',''),
        },
        lokasi: {
          type: DataTypes.ENUM('Semarang','Tangerang','Bali',''),
        },
      }, {
        freezeTableName:true,
        paranoid:true,
      }
)

User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });


export default User