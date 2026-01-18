import { ZodError } from 'zod'

type ZodValidateResult<Data = any> = {
  valid: boolean
  data: Data
  message: string
  messages: string[]
}

export function zodValidate<R = any>(parser: () => R): ZodValidateResult<R> {
  try {
    const data = parser()
    return {
      valid: true,
      data: data,
      message: 'success',
      messages: [],
    }
  } catch (error) {
    if (!(error instanceof ZodError)) throw error

    const zodError = error as ZodError
    const list = JSON.parse(zodError.message) as any[]
    return {
      valid: false,
      data: null as any,
      message: list[0].message,
      messages: list.map((item) => item.message),
    }
  }
}
