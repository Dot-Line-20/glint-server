// HttpException
export default class extends Error {
  public status: number
  public more: unknown

  constructor(status: number, message: string, more?: unknown) {
    super(message)
    this.status = status
    this.more = more
  }
}
