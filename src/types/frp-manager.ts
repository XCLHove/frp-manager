declare module 'FrpManager' {
  type Frpc = {
    id: string
    name: string
    binaryFile: string
    startUpArgs: string
    followAppStart: boolean
  }

  type Frps = {
    id: string
    name: string
    binaryFile: string
    startUpArgs: string
    followAppStart: boolean
  }
}
