export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400, // 사용자가 잘못했을 때 (ex: 입력값 누락)
  UNAUTHORIZED: 401, // 인증 실패 (비인증) unauthenticated (ex: 비밀번호 틀림)
  FORBIDDEN: 403, // 인가 실패 (미승인) unauthorized (ex: 접근 권한이 없음)
  NOT_FOUND: 404, // 데이터가 없는 경우 (ex: 존재하지 않는 게시글)
  CONFLICT: 409, // 충돌이 발생했을 때 (ex: 이메일 중복)
  INTERNAL_SERVER_ERROR: 500, // 서버 내부 오류. 예상치 못한 에러가 발생했을 때
};
