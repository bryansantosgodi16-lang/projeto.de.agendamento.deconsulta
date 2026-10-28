# VidaSaúde — backend

API REST em Java 21, Spring Boot, Spring Data JPA e H2. Os dados locais são gravados em `projeto/data/clinica`.

## Executar

Na pasta `projeto`, com Maven instalado:

```sh
mvn spring-boot:run
```

A aplicação inicia em `http://localhost:8080` e serve o frontend integrado em `src/main/resources/static`. Não é necessário iniciar um servidor Node separado.

## API

- Autenticação: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- Pacientes: `GET /api/pacientes?busca=...`, `GET /api/pacientes/{id}`, `POST /api/pacientes`, `PUT /api/pacientes/{id}`, `GET /api/pacientes/{id}/agendamentos`
- Agenda: `GET /api/agendamentos?data=AAAA-MM-DD`, `GET /api/agendamentos/canceladas`, `POST /api/agendamentos`, `PATCH /api/agendamentos/{id}/status`
- Configurações e relatórios: `GET/PUT /api/configuracoes/agenda`, `GET /api/relatorios`

As rotas de negócio exigem uma sessão autenticada. As senhas são armazenadas com BCrypt; validações e conflitos são retornados como erros HTTP 4xx.
