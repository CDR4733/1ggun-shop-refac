# 1ggun-shop-refac

1ggun-Shop : Express + AWS RDS + Prisma6

# 환경변수

- .env.example 파일의 이름을 .env로 변경하고 아래 내용을 채움

```sh
SERVER_PORT=서버 포트
HASH_SALT_ROUNDS=숫자

ACCESS_TOKEN_SECRET="JWT 생성을 위한 비밀키"
REFRESH_TOKEN_SECRET="JWT 생성을 위한 비밀키"

DATABASE_URL="mysql://[USER]:[DB비밀번호]@[DB엔드포인트]:[포트]/[DB명]"
```

# 실행 방법

- 필요한 패키지 설치

```sh
yarn
```

- 서버 실행 (배포용)

```sh
yarn start
```

- 서버 실행 (개발용)

```sh
yarn dev
```
