package com.projeto.dto;

public record RelatorioResponse(long pacientesCadastrados, long consultasRealizadas,
        long retornos, long cancelamentos) {}
