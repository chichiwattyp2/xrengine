import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const resourceType = sequelizeClient.define('resource_type', {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      },
      beforeUpdate (instance: any, options: any) {
        throw new Error("Can't update a type!")
      }
    },
    timestamps: false
  });

  (resourceType as any).associate = (models: any): any => {
    (resourceType as any).hasMany(models.access_control, { foreignKey: 'resourceType' })
  }

  return resourceType
}
