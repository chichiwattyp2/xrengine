import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import { Sequelize } from 'sequelize'
import crypto from 'crypto'

interface Data {
  userId: string
}

export class IdentityProvider extends Service {
  public app: Application

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async create (data: any, params: any): Promise<any> {
    const {
      token,
      githubId,
      googleId,
      facebookId,
      identityProviderType,
      password
    } = data

    // if userId is in data, the we add this identity provider to the user with userId
    // if not, we create a new user
    let userId = data.userId
    let identityProvider: any

    let hashData = ''
    switch (identityProviderType) {
      case 'email':
        hashData = token
        identityProvider = {
          token,
          identityProviderType
        }
        break
      case 'sms':
        hashData = token
        identityProvider = {
          token,
          identityProviderType
        }
        break
      case 'password':
        hashData = token
        identityProvider = {
          token,
          password,
          identityProviderType
        }
        break
      case 'github':
        hashData = githubId
        identityProvider = {
          token: githubId,
          identityProviderType
        }
        break
      case 'facebook':
        hashData = facebookId
        identityProvider = {
          token: facebookId,
          identityProviderType
        }
        break
      case 'google':
        hashData = googleId
        identityProvider = {
          token: googleId,
          identityProviderType
        }
        break
      case 'auth0':
        break
    }

    // if userId is not defined, then generate userId
    if (!userId) {
      userId = crypto.createHash('md5').update(hashData).digest('hex')
    }

    const sequelizeClient: Sequelize = this.app.get('sequelizeClient')
    const userService = this.app.service('user')
    const User = sequelizeClient.model('user')

    // check if there is a user with userId
    const foundUser = ((await userService.find({
      query: {
        id: userId
      }
    }))).data

    if (foundUser.length > 0) {
      // if there is the user with userId, then we add the identity provider to the user
      return await super.create({
        ...data,
        ...identityProvider,
        userId
      }, params)
    }

    // create with user association
    params.sequelize = {
      include: [User]
    }

    // if there is no user with userId, then we create a user and a identity provider.
    const result = await super.create({
      ...data,
      ...identityProvider,
      user: {
        id: userId
      }
    }, params)

    return result
  }
}
