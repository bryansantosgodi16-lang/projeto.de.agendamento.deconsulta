package com.projeto.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalTime;

public record ConfiguracaoAgendaRequest(
        @NotNull LocalTime horarioInicio,
        @NotNull LocalTime horarioFim,
        @NotNull @Positive Integer intervaloMinutos) {}
