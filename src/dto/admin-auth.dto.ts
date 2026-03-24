export interface AdminLoginRequestDto {
  email: string
  password: string
  otp?: string
}

export type AdminLoginResponseDto =
  | {
      token: string
      mfaSetupRequired: false
    }
  | {
      mfaSetupRequired: true
      preAuthToken: string
      secret: string
      otpauthUrl: string
    }

export interface AdminMfaConfirmRequestDto {
  preAuthToken: string
  otp: string
}

