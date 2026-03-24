export interface SignupRequestDto {
  fullName: string
  university: string
  email: string
  whatsappPhone: string
  password: string
  campusId: string
}

export interface LoginRequestDto {
  email: string
  password: string
}

export interface AuthResponseDto {
  token: string
  user: {
    id: string
    fullName: string
    email: string
    university: string
    whatsappPhone: string
    campusId?: string | null
  }
}
