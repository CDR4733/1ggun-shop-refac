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

# API 명세서
[API 명세서 링크](https://shocking-flavor-85b.notion.site/API-MVP-303bc055defd805ebef3c13a4be6301e)
https://shocking-flavor-85b.notion.site/API-MVP-303bc055defd805ebef3c13a4be6301e

# ERD 설계도
[ERD 설계도 링크](https://drawsql.app/teams/teamcdr/diagrams/1ggun-shop-refac)
https://drawsql.app/teams/teamcdr/diagrams/1ggun-shop-refac
