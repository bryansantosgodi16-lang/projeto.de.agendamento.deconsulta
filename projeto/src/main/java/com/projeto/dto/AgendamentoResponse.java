package com.projeto.dto;

import com.projeto.model.Agendamento;
import java.time.LocalDate;
import java.time.LocalTime;

public record AgendamentoResponse(Long id, Long pacienteId, String pacienteNome, LocalDate data,
        LocalTime hora, String status, String tipo, String motivoCancelamento) {
    public static AgendamentoResponse from(Agendamento agendamento) {
        return new AgendamentoResponse(agendamento.getId(), agendamento.getPaciente().getId(),
                agendamento.getPaciente().getNomeCompleto(), agendamento.getData(), agendamento.getHora(),
                agendamento.getStatus(), agendamento.getTipo(), agendamento.getMotivoCancelamento());
    }
}
