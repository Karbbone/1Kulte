# 1Kulte API Reference (Routes, DTO, Entites)

## Base URL
- `{{host}}` (defini via environnement Bruno)

## Routes recensees

### App
- `GET /`

### Users
- `GET /users` (JWT)
- `GET /users/:id` (JWT)
- `POST /users`
- `POST /users/login`
- `PATCH /users/:id` (JWT)
- `PATCH /users/:id/profile-picture` (JWT, multipart field: `image`)
- `DELETE /users/:id` (JWT)

### Cultural Places
- `GET /cultural-places`
- `GET /cultural-places/popular`
- `GET /cultural-places/recommendations` (JWT)
- `GET /cultural-places/:id`
- `POST /cultural-places` (JWT)
- `PATCH /cultural-places/:id` (JWT)
- `DELETE /cultural-places/:id` (JWT)

### Cultural Place Pictures
- `GET /cultural-places/:culturalPlaceId/pictures`
- `POST /cultural-places/:culturalPlaceId/pictures` (JWT, multipart field: `file`, query: `mainPicture=true|false`)
- `PATCH /cultural-places/:culturalPlaceId/pictures/:id/main` (JWT)
- `DELETE /cultural-places/:culturalPlaceId/pictures/:id` (JWT)

### Favorites
- `GET /favorites/me` (JWT)
- `POST /favorites/:culturalPlaceId` (JWT)
- `DELETE /favorites/:culturalPlaceId` (JWT)

### Rewards
- `GET /rewards`
- `POST /rewards` (JWT)
- `PATCH /rewards/:id/image` (JWT, multipart field: `image`)
- `POST /rewards/:id/purchase` (JWT)
- `GET /rewards/me` (JWT)

### Trails
- `GET /trails`
- `GET /trails/cultural-place/:culturalPlaceId`
- `GET /trails/:id`
- `POST /trails` (JWT)
- `PATCH /trails/:id` (JWT)
- `DELETE /trails/:id` (JWT)
- `GET /trails/:id/qrcode?width=300`
- `GET /trails/:id/qrcode/image?width=300`

### QCM
- `GET /qcm/trail/:trailId`
- `GET /qcm/trail/:trailId/status` (JWT)
- `GET /qcm/question/:id`
- `POST /qcm/question` (JWT, multipart: `trailId`, `question`, `point`, `answers` (JSON string), `image`)
- `POST /qcm/question/:questionId/answer` (JWT)
- `DELETE /qcm/question/:id` (JWT)
- `DELETE /qcm/answer/:id` (JWT)
- `POST /qcm/question/:questionId/submit` (JWT)
- `GET /qcm/my-answers` (JWT)
- `GET /qcm/trail-history` (JWT)

## DTO recenses

### User DTO
- `CreateUserDto`: `firstName`, `lastName`, `email`, `password`, `birthDate?`, `newsletter?`
- `LoginUserDto`: `email`, `password`
- `UpdateUserDto`: `firstName?`, `lastName?`, `email?`, `birthDate?`, `isActive?`, `emailVerified?`

### Cultural Place DTO
- `CreateCulturalPlaceDto`: `name`, `description?`, `postCode`, `city`, `latitude?`, `longitude?`, `type`
- `UpdateCulturalPlaceDto`: `name?`, `description?`, `postCode?`, `city?`, `idCulturalType?`, `latitude?`, `longitude?`, `type?`

### Reward DTO
- `CreateRewardDto`: `title`, `description?`, `cost`

### Trail DTO
- `CreateTrailDto`: `culturalPlaceId`, `name`, `description?`, `durationMinute?`, `difficulty?`, `isActive?`
- `UpdateTrailDto`: `name?`, `description?`, `durationMinute?`, `difficulty?`, `isActive?`

### QCM DTO
- `CreateQcmQuestionDto`: `trailId`, `question`, `image?`, `point?`, `answers?`
- `AnswerQcmDto`: `answerId`

## Entites recensees
- `User`
- `CulturalPlace`
- `CulturalPlacePicture`
- `Favorite`
- `Reward`
- `UserReward`
- `Trail`
- `QcmQuestion`
- `QcmAnswer`
- `UserQcmAnswer`

## JWT auto-injection
- Le JWT est stocke automatiquement apres `01-Users/04-Login.bru` via:
  - `bru.setVar("jwt", token)`
  - `bru.setEnvVar("jwt", token)`
- Toutes les routes protegees utilisent `Authorization: Bearer {{jwt}}`
