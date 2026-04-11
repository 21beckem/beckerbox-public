export interface Game {
  gameId: string
  titleId: number
  internalName: string
  region: string
  country: string
  images: {
    cover: {
      uri: string
      url: string
    }
    disc: {
      uri: string
      url: string
    }
  }
  gameFileName: string
  name: string
}
