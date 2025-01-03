import { NextFunction } from "express"

const checkEntityExists = (entityService: any, idPathParamName: string) => async (req: any, res: any, next: NextFunction) => {
  try {
    const entity = await entityService.exists(req.params[idPathParamName])
    if (!entity) { return res.status(404).send('Not found') }
    return next()
  } catch (err: any) {
    if (err.kind === 'ObjectId') {
      return res.status(404).send(err)
    }
    return res.status(500).send(err.message)
  }
}

export { checkEntityExists }
