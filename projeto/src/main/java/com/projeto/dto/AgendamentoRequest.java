package com.projeto.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record AgendamentoRequest(
        @NotNull Long pacienteId,
        @NotNull LocalDate data,
        @NotNull LocalTime hora) {}
