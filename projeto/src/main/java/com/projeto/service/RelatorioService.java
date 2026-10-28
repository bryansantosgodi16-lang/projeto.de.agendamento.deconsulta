package com.projeto.service;

import com.projeto.dto.RelatorioResponse;
import com.projeto.repository.AgendamentoRepository;
import com.projeto.repository.PacienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RelatorioService {
    private final PacienteRepository pacientes;
    private final AgendamentoRepository agendamentos;

    public RelatorioService(PacienteRepository pacientes, AgendamentoRepository agendamentos) {
        this.pacientes = pacientes;
        this.agendamentos = agendamentos;
    }

    public RelatorioResponse obter() {
        var todos = agendamentos.findAll();
        return new RelatorioResponse(pacientes.count(),
                todos.stream().filter(a -> a.getStatus().equals("concluído")).count(),
                todos.stream().filter(a -> a.getTipo().equals("retorno") && !a.getStatus().equals("cancelado")).count(),
                todos.stream().filter(a -> a.getStatus().equals("cancelado")).count());
    }
}
