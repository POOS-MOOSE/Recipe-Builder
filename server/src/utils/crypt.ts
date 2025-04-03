import bcrypt from 'bcrypt'

class Crypt {
  instance: typeof bcrypt = bcrypt

  constructor() {}

  async hash(value: string) {
    const salt = await this.instance.genSalt(10)
    const hash = await this.instance.hash(value, salt)

    return hash
  }

  async validate(value: string, hash: string) {
    const isOk = await bcrypt.compare(value, hash)

    return isOk
  }
}

export default new Crypt()
