# Claude Instructions - API/Bruno Sync

## Objectif
A chaque modification de l'API backend NestJS, la collection Bruno doit etre mise a jour dans le meme changement.

## Portee API concernee
Tout changement dans `server/src/**` qui touche:
- controllers (routes, methodes, auth)
- DTO (schema d'entree)
- entites (champs et relations impactant les reponses)
- guards / auth JWT
- upload multipart, query params, path params

## Regle obligatoire
Si un endpoint est ajoute/modifie/supprime, alors mettre a jour immediatement:
- les fichiers `.bru` correspondants dans `server/bruno/**`
- `server/bruno/docs/API-DTO-Entities.md`

## Environnements Bruno
Ne jamais casser ces hosts:
- `server/bruno/environments/local.bru` -> `http://localhost:3000`
- `server/bruno/environments/vps.bru` -> `https://api-1kulte.maillet.bzh`

## JWT
Conserver le mecanisme d'injection auto JWT dans:
- `server/bruno/01-Users/04-Login.bru`
avec:
- `bru.setVar("jwt", token)`
- `bru.setEnvVar("jwt", token)`

## Checklist avant de terminer
1. Routes controllers = collection Bruno synchronisee.
2. DTO modifies = bodies Bruno mis a jour.
3. Auth guard/roles modifies = headers Authorization ajustes.
4. Upload/form-data modifies = champs multipart alignes.
5. Variables d'URL (`:id`, etc.) = placeholders Bruno alignes.
6. `API-DTO-Entities.md` mis a jour.
7. `git status` montre les fichiers Bruno impactes avec les modifs API.
