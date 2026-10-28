package com.projeto.controller;

import com.projeto.dto.AgendamentoRequest;
import com.projeto.dto.AgendamentoResponse;
import com.projeto.dto.StatusRequest;
import com.projeto.service.AgendamentoService;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {
    private final AgendamentoService agendamentos;

    public AgendamentoController(AgendamentoService agendamentos) { this.agendamentos = agendamentos; }

    @GetMapping
    public List<AgendamentoResponse> listar(@RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return agendamentos.listar(data);
    }

    @GetMapping("/canceladas")
    public List<AgendamentoResponse> canceladas() { return agendamentos.cancelados(); }

    @PostMapping
    public ResponseEntity<AgendamentoResponse> criar(@Valid @RequestBody AgendamentoRequest dados) {
        AgendamentoResponse agendamento = agendamentos.criar(dados);
        return ResponseEntity.created(URI.create("/api/agendamentos/" + agendamento.id())).body(agendamento);
    }

    @PatchMapping("/{id}/status")
    public AgendamentoResponse atualizarStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest dados) {
        return agendamentos.atualizarStatus(id, dados);
    }
}
