# Agent Workflow - Keep Bruno Up To Date

## Mission
Quand tu modifies l'API (`server/src`), tu dois aussi modifier Bruno (`server/bruno`) dans la meme tache.

## Workflow impose
1. Identifier les changements API dans les controllers/DTO/entites.
2. Mettre a jour les requetes `.bru` concernees (URL, method, headers, body, query, path).
3. Mettre a jour les environnements seulement si necessaire (host/vars).
4. Verifier que les endpoints proteges utilisent `Authorization: Bearer {{jwt}}`.
5. Verifier que le login continue de stocker le JWT.
6. Mettre a jour `server/bruno/docs/API-DTO-Entities.md`.
7. Faire un controle final avec `git diff`.

## Definition de Done
Une PR qui touche l'API n'est pas terminee tant que Bruno n'est pas synchronise.
