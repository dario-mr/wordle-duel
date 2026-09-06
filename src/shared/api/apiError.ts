export const UNAUTHENTICATED_CODE = 'UNAUTHENTICATED';
export const UNEXPECTED_RESPONSE_CODE = 'UNEXPECTED_RESPONSE';

export interface ErrorResponseDto {
  code: string;
}

export class WdsApiError extends Error {
  status: number;
  code: string;

  constructor(args: { status: number; code: string }) {
    super(args.code);
    this.name = 'WdsApiError';
    this.status = args.status;
    this.code = args.code;
  }
}
