export const MESSAGES = {
  COMMON: {
    EMAIL: {
      REQUIRED: "이메일을 입력해 주세요.",
    },
    PASSWORD: {
      REQUIRED: "비밀번호를 입력해 주세요.",
    },
    PASSWORD_CONFIRM: {
      REQUIRED: "비밀번호 확인을 입력해 주세요.",
    },
    NAME: {
      REQUIRED: "이름을 입력해 주세요.",
    },
  },
  AUTH: {
    SIGN_UP: {
      SUCCEED: "회원 가입에 성공했습니다.",
      FAIL: {
        EMAIL: {
          INVALID_FORMAT: "이메일 형식이 올바르지 않습니다.",
          DUPLICATED: "이미 가입된 사용자입니다.",
        },
        PASSWORD: {
          MIN_LENGTH: "비밀번호는 6자리 이상이어야 합니다.",
          NOT_MATCHED: "입력한 두 비밀번호가 일치하지 않습니다.",
        },
      },
    },
    LOG_IN: {
      SUCCEED: "로그인에 성공했습니다.",
      FAIL: {
        UNAUTHORIZED: "인증 정보가 유효하지 않습니다.",
      },
    },
  },
};
