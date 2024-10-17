// deno-lint-ignore-file require-await no-unused-vars no-explicit-any

class RepositoryBase {
  async findById (id: string, ...args: any[]): Promise<any> {
    throw new Error('Not Implemented Exception')
  }

  async findAll (...args: any[]): Promise<any> {
    throw new Error('Not Implemented Exception')
  }

  async create (data: any, ...args: any[]): Promise<any> {
    throw new Error('Not Implemented Exception')
  }

  async update (data: any, ...args: any[]): Promise<any> {
    throw new Error('Not Implemented Exception')
  }

  async destroy (id: any, ...args: any[]): Promise<any> {
    throw new Error('Not Implemented Exception')
  }
}

export default RepositoryBase
